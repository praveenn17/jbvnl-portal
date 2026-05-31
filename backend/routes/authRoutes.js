const express = require('express');
const rateLimit = require('express-rate-limit');
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
  updateProfile,
  changePassword,
  logoutAllDevices,
  updatePreferences,
  deactivateAccount,
  deleteAccountRequest,
  getConsumers,
  forgotPassword,
  resetPassword,
  takeoverSession,
  getSessionStatus,
  logoutUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const { logAudit } = require('../utils/auditLogger');

// ── Rate Limiter: Per-IP — max 10 forgot-password requests per hour ───────────
const forgotPasswordIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use real IP from proxy headers if available, fallback to socket IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const email = req.body?.email || 'unknown';

    console.warn(`[RATE-LIMIT] IP limit reached: ip=${clientIp} email=${email}`);

    // Fire-and-forget audit log
    logAudit({
      action: 'PASSWORD_RESET_RATE_LIMITED',
      message: `Rate limit exceeded (IP) for password reset: ip=${clientIp}`,
      actorRole: 'system',
      targetType: 'auth',
      metadata: { ip: clientIp, email, limitType: 'ip' },
      severity: 'warning',
    });

    return res.status(429).json({
      message: 'Too many password reset requests. Please try again later.',
    });
  },
  skip: () => false,
});

// ── Rate Limiter: Per-Email — max 3 forgot-password requests per hour ─────────
// We track per-email by using a custom key generator reading req.body.email.
// NOTE: This limiter MUST be applied AFTER express.json() so req.body is available.
const forgotPasswordEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Normalise email so attackers can't bypass by changing case/whitespace
    const email = (req.body?.email || '').toLowerCase().trim();
    return `email:${email}`;
  },
  handler: (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const email = (req.body?.email || 'unknown').toLowerCase().trim();

    console.warn(`[RATE-LIMIT] Email limit reached: email=${email} ip=${clientIp}`);

    logAudit({
      action: 'PASSWORD_RESET_RATE_LIMITED',
      message: `Rate limit exceeded (email) for password reset: email=${email}`,
      actorRole: 'system',
      targetType: 'auth',
      metadata: { ip: clientIp, email, limitType: 'email' },
      severity: 'warning',
    });

    return res.status(429).json({
      message: 'Too many password reset requests. Please try again later.',
    });
  },
  skip: () => false,
});

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/verify-email', verifyEmail);   // verify OTP stored in DB
router.post('/resend-otp', resendOtp);        // resend with cooldown

// Forgot / reset password (rate limited — IP limiter first, then email limiter)
router.post(
  '/forgot-password',
  forgotPasswordIpLimiter,
  forgotPasswordEmailLimiter,
  forgotPassword
);
router.post('/reset-password/:token', resetPassword);

// Session takeover flow (public because credentials are re-verified inside)
router.post('/takeover-session', takeoverSession);

// ── Protected routes ──────────────────────────────────────────────────────────
// Polling endpoint for Single Active Session (every 5 seconds)
router.get('/session-status', protect, getSessionStatus);

// Explicit logout
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.patch('/logout-all', protect, logoutAllDevices);

router.patch('/preferences', protect, updatePreferences);
router.post('/deactivate', protect, deactivateAccount);
router.post('/delete-request', protect, deleteAccountRequest);

router.get('/users/pending', protect, admin, getPendingUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.get('/users/consumers', protect, getConsumers); // Allows manager and admin

module.exports = router;
