const express = require('express');
const router  = express.Router();
const {
  getBills, getAllBills, getBillById,
  createBill, updateBill, deleteBill,
  downloadBillPdf, markBillPaid, triggerBillGeneration,
} = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');

// Manual bill generation trigger (Admin/Manager)
router.post('/generate',   protect, admin, triggerBillGeneration);

// Admin: list all bills with filters
router.get('/all',         protect, admin, getAllBills);

// CRUD
router.route('/')
  .post(protect, admin, createBill);

// Mark paid (Admin/Manager offline override)
router.put('/:id/pay',     protect, admin, markBillPaid);

// PDF download
router.get('/:id/download', protect, downloadBillPdf);

// By consumer number
router.get('/:consumerNumber', protect, getBills);

// Detail by ID
router.get('/detail/:id',  protect, getBillById);

// Update / Delete
router.put('/:id',         protect, admin, updateBill);
router.delete('/:id',      protect, admin, deleteBill);

module.exports = router;
