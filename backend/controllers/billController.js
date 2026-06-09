const Bill    = require('../models/Bill');
const User    = require('../models/User');
const { logAudit }      = require('../utils/auditLogger');
const { generateBillPdf } = require('../utils/pdfService');
const { generateMonthlyBills } = require('../utils/billGenerator');

// ── Get all bills for a consumer ──────────────────────────────────────────
// @route GET /api/bills/:consumerNumber
const getBills = async (req, res) => {
  try {
    if (req.user.role === 'consumer' && req.user.consumerNumber !== req.params.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view these bills' });
    }
    const bills = await Bill.find({ consumerNumber: req.params.consumerNumber }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get all bills (Admin/Manager with filters) ────────────────────────────
// @route GET /api/bills
const getAllBills = async (req, res) => {
  try {
    const { consumerNumber, status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (consumerNumber) filter.consumerNumber = consumerNumber;
    if (status)         filter.status = status;
    if (search) {
      filter.$or = [
        { consumerNumber: { $regex: search, $options: 'i' } },
        { billNumber:     { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Bill.countDocuments(filter);
    const bills = await Bill.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ bills, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get bill by ID ────────────────────────────────────────────────────────
// @route GET /api/bills/detail/:id
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (req.user.role === 'consumer' && req.user.consumerNumber !== bill.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }

    logAudit({
      action: 'BILL_VIEWED',
      message: `Bill ${bill.billNumber} viewed`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      severity: 'info',
    });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create a bill manually (Admin/Manager) ────────────────────────────────
// @route POST /api/bills
const createBill = async (req, res) => {
  try {
    const { consumerNumber, billNumber, billingPeriod, dueDate, amount, units } = req.body;

    const bill = await Bill.create({
      consumerNumber, billNumber, billingPeriod, dueDate, amount,
      units: units || 0,
      unitsConsumed: units || 0,
    });

    logAudit({
      action: 'BILL_CREATED',
      message: `Manual bill ${bill.billNumber} created`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      metadata: { amount, units },
      severity: 'info',
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Update a bill (Admin/Manager) ─────────────────────────────────────────
// @route PUT /api/bills/:id
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Delete a bill (Admin only) ────────────────────────────────────────────
// @route DELETE /api/bills/:id
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    logAudit({
      action: 'BILL_DELETED',
      message: `Bill ${bill.billNumber} deleted`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      severity: 'warning',
    });
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Download PDF bill ─────────────────────────────────────────────────────
// @route GET /api/bills/:id/download
const downloadBillPdf = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (req.user.role === 'consumer' && req.user.consumerNumber !== bill.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const consumer = await User.findOne({ consumerNumber: bill.consumerNumber });

    logAudit({
      action: 'BILL_PDF_DOWNLOADED',
      message: `PDF downloaded for bill ${bill.billNumber}`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      severity: 'info',
    });

    generateBillPdf(bill, consumer || {}, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Mark bill as paid (Admin/Manager offline override) ────────────────────
// @route PUT /api/bills/:id/pay
const markBillPaid = async (req, res) => {
  try {
    const { paymentMethod, transactionRef } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.status === 'paid') return res.status(400).json({ message: 'Bill is already paid' });

    bill.status        = 'paid';
    bill.paidAt        = new Date();
    bill.paymentMethod = paymentMethod || 'cash';
    bill.transactionRef = transactionRef || `OFFLINE-${Date.now()}`;
    await bill.save();

    logAudit({
      action: 'BILL_MARKED_PAID',
      message: `Bill ${bill.billNumber} marked paid offline by ${req.user.name}`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'bill', targetId: bill._id, targetLabel: bill.billNumber,
      metadata: { paymentMethod, transactionRef },
      severity: 'info',
    });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Trigger manual bill generation ────────────────────────────────────────
// @route POST /api/bills/generate
const triggerBillGeneration = async (req, res) => {
  try {
    const result = await generateMonthlyBills();
    res.json({
      message: `Bill generation complete. Generated: ${result.generated}, Skipped: ${result.skipped}, Simulated: ${result.simulated}`,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getBills, getAllBills, getBillById,
  createBill, updateBill, deleteBill,
  downloadBillPdf, markBillPaid, triggerBillGeneration,
};
