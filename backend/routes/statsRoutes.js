const express = require('express');
const router = express.Router();
const { getManagerStats } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/manager', protect, admin, getManagerStats);

module.exports = router;
