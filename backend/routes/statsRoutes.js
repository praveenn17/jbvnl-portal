const express = require('express');
const router  = express.Router();
const { getManagerStats, getDashboardStats, getRevenueStats } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/manager',   protect, admin, getManagerStats);
router.get('/dashboard', protect, getDashboardStats);
router.get('/revenue',   protect, admin, getRevenueStats);

module.exports = router;
