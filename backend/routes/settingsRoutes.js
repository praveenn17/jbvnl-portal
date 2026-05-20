const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings,
  runBackup
} = require('../controllers/settingsController');

// All settings routes are strictly for Admins
router.use(protect);
router.use(admin);

router.get('/', getSettings);
router.patch('/', updateSettings);
router.post('/backup/run', runBackup);

module.exports = router;
