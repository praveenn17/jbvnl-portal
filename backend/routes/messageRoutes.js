const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  // Legacy one-way message functions
  sendMessage,
  getAdminMessages,
  markMessageRead,
  closeMessage,
  // New two-way conversation functions
  createConversation,
  getConversations,
  getConversationById,
  replyToConversation,
  markConversationRead,
  closeConversation,
} = require('../controllers/messageController');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect);

// ── Legacy one-way message routes (UNCHANGED) ──────────────────────────
router.post('/', requireRole('manager'), sendMessage);
router.get('/admin', requireRole('admin'), getAdminMessages);
router.patch('/:id/read', requireRole('admin'), markMessageRead);
router.patch('/:id/close', requireRole('admin'), closeMessage);

// ── New two-way conversation routes ─────────────────────────────────────
router.post('/conversations', requireRole('manager'), createConversation);
router.get('/conversations', requireRole('admin', 'manager'), getConversations);
router.get('/conversations/:id', requireRole('admin', 'manager'), getConversationById);
router.post('/conversations/:id/reply', requireRole('admin', 'manager'), replyToConversation);
router.patch('/conversations/:id/read', requireRole('admin', 'manager'), markConversationRead);
router.patch('/conversations/:id/close', requireRole('admin'), closeConversation);

module.exports = router;
