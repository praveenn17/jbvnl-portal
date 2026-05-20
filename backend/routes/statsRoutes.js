const express = require('express');
const router = express.Router();
const { getManagerStats, getDashboardStats } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/manager', protect, admin, getManagerStats);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
