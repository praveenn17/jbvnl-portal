const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  sendOtp,
  verifyOtp,
  getPendingUsers,
  updateUserStatus,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/users/pending', protect, admin, getPendingUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);

module.exports = router;
