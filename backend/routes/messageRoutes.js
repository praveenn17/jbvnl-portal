const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getAdminMessages,
  markMessageRead,
  closeMessage
} = require('../controllers/messageController');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect);

router.post('/', requireRole('manager'), sendMessage);
router.get('/admin', requireRole('admin'), getAdminMessages);
router.patch('/:id/read', requireRole('admin'), markMessageRead);
router.patch('/:id/close', requireRole('admin'), closeMessage);

module.exports = router;
