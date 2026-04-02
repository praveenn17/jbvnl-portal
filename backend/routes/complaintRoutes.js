const express = require('express');
const router = express.Router();
const {
  getComplaints,
  fileComplaint,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getComplaints)
  .post(protect, fileComplaint);

router.route('/:id')
  .patch(protect, admin, updateComplaintStatus);

module.exports = router;
