const express = require('express');
const router  = express.Router();
const {
  getMeters, getSimulatedCount, getMyMeter,
  createMeter, updateMeterReading, deleteMeter,
} = require('../controllers/meterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/simulated-count', protect, admin, getSimulatedCount);
router.get('/my',              protect, getMyMeter);
router.get('/',                protect, admin, getMeters);
router.post('/',               protect, admin, createMeter);
router.put('/:id',             protect, admin, updateMeterReading);
router.delete('/:id',          protect, admin, deleteMeter);

module.exports = router;
