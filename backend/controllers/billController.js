const Bill = require('../models/Bill');

// @desc    Get all bills for a consumer
// @route   GET /api/bills/:consumerNumber
// @access  Private
const getBills = async (req, res) => {
  try {
    // Security check: Consumer can only view their own bills
    if (req.user.role === 'consumer' && req.user.consumerNumber !== req.params.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view these bills' });
    }

    const bills = await Bill.find({ consumerNumber: req.params.consumerNumber });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill by ID
// @route   GET /api/bills/detail/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Security check: Consumer can only view their own bill
    if (req.user.role === 'consumer' && req.user.consumerNumber !== bill.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay a bill
// @route   POST /api/bills/pay/:id
// @access  Private
const payBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (bill) {
      bill.status = 'paid';
      const updatedBill = await bill.save();
      res.json(updatedBill);
    } else {
      res.status(404).json({ message: 'Bill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bill (Admin/Manager only)
// @route   POST /api/bills
// @access  Private/Admin
const createBill = async (req, res) => {
  const { consumerNumber, billNumber, billingPeriod, dueDate, amount, units } = req.body;

  try {
    const bill = new Bill({
      consumerNumber,
      billNumber,
      billingPeriod,
      dueDate,
      amount,
      units,
    });

    const createdBill = await bill.save();
    res.status(201).json(createdBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBills,
  getBillById,
  payBill,
  createBill,
};
