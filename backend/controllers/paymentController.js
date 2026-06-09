const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Payment  = require('../models/Payment');
const Bill     = require('../models/Bill');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc   Create Razorpay order
// @route  POST /api/payments/create-order
// @access Private/Consumer
const createOrder = async (req, res) => {
  try {
    const { billId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ message: 'Invalid bill ID. Only real bills from MongoDB can be paid online.' });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.status === 'paid') return res.status(400).json({ message: 'Bill is already paid' });

    // Security: consumer can only pay their own bill
    if (req.user.role === 'consumer' && bill.consumerNumber !== req.user.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to pay this bill' });
    }

    const razorpay = getRazorpay();
    const order    = await razorpay.orders.create({
      amount:   bill.amount * 100,  // paise
      currency: 'INR',
      receipt:  `rcpt_${bill.billNumber}`.substring(0, 40),
      notes:    { billId: billId.toString(), consumerNumber: bill.consumerNumber },
    });

    // Save payment record
    await Payment.create({
      razorpayOrderId: order.id,
      billId:          bill._id,
      consumerNumber:  bill.consumerNumber,
      amount:          bill.amount,
      status:          'created',
    });

    res.json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
      billId:    bill._id,
      billNumber: bill.billNumber,
    });
  } catch (err) {
    console.error('[PAYMENT] createOrder error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Verify Razorpay payment signature
// @route  POST /api/payments/verify
// @access Private/Consumer
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, billId } = req.body;

    // Signature verification
    const body      = razorpayOrderId + '|' + razorpayPaymentId;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'paid', paidAt: new Date() }
    );

    // Update bill status
    const bill = await Bill.findByIdAndUpdate(
      billId,
      {
        status:            'paid',
        paidAt:            new Date(),
        paymentMethod:     'razorpay',
        transactionRef:    razorpayPaymentId,
        razorpayOrderId,
        razorpayPaymentId,
      },
      { new: true }
    );

    logAudit({
      action: 'BILL_PAID_ONLINE',
      message: `Bill ${bill.billNumber} paid online via Razorpay (${razorpayPaymentId})`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      metadata: { razorpayPaymentId, razorpayOrderId, amount: bill.amount },
      severity: 'info',
    });

    res.json({ message: 'Payment successful', bill });
  } catch (err) {
    console.error('[PAYMENT] verifyPayment error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get payment status for a bill
// @route  GET /api/payments/bill/:billId
// @access Private
const getPaymentByBill = async (req, res) => {
  try {
    const payment = await Payment.findOne({ billId: req.params.billId }).sort({ createdAt: -1 });
    res.json(payment || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentByBill };
