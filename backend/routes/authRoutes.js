const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  sendOtp,
  verifyEmail,
  resendOtp,
  getPendingUsers,
  updateUserStatus,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/verify-email', verifyEmail);   // New: verify OTP stored in DB
router.post('/resend-otp', resendOtp);        // New: resend with cooldown

// ── Protected routes ──────────────────────────────────────────────────────────
router.get('/profile', protect, getUserProfile);
router.get('/users/pending', protect, admin, getPendingUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);

module.exports = router;
