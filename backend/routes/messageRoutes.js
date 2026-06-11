const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getAdminMessages,
  markMessageRead,
  closeMessage,
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

// ── Two-way conversation routes (SPECIFIC — must come first) ─────────────
router.post('/conversations', requireRole('manager'), createConversation);
router.get('/conversations', requireRole('admin', 'manager'), getConversations);
router.get('/conversations/:id', requireRole('admin', 'manager'), getConversationById);
router.post('/conversations/:id/reply', requireRole('admin', 'manager'), replyToConversation);
router.patch('/conversations/:id/read', requireRole('admin', 'manager'), markConversationRead);
router.patch('/conversations/:id/close', requireRole('admin'), closeConversation);

// ── Legacy one-way routes (WILDCARD — must come after) ───────────────────
router.post('/', requireRole('manager'), sendMessage);
router.get('/admin', requireRole('admin'), getAdminMessages);
router.patch('/:id/read', requireRole('admin'), markMessageRead);
router.patch('/:id/close', requireRole('admin'), closeMessage);

module.exports = router;