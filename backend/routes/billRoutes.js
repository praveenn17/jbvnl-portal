const express = require('express');
const router = express.Router();
const {
  getBills,
  getBillById,
  payBill,
  createBill,
} = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createBill);

router.route('/:consumerNumber')
  .get(protect, getBills);

router.route('/detail/:id')
  .get(protect, getBillById);

router.route('/pay/:id')
  .post(protect, payBill);

module.exports = router;
