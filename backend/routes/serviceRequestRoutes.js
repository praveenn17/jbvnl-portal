const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById
} = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createServiceRequest);

router.route('/my')
  .get(protect, getMyServiceRequests);

router.route('/:id')
  .get(protect, getServiceRequestById);

module.exports = router;
