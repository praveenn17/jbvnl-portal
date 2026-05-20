const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogById } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAuditLogs);
router.get('/:id', protect, admin, getAuditLogById);

module.exports = router;
