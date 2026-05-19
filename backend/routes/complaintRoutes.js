const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  fileComplaint,
  assignComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  addComplaintNote
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getComplaints)
  .post(protect, fileComplaint);

router.route('/:id')
  .get(protect, getComplaintById);

router.route('/:id/status')
  .patch(protect, updateComplaintStatus); // both admin and manager can access, controller checks logic

router.route('/:id/assign')
  .patch(protect, admin, assignComplaint);

router.route('/:id/priority')
  .patch(protect, admin, updateComplaintPriority);

router.route('/:id/notes')
  .post(protect, addComplaintNote); // admin and manager

module.exports = router;
