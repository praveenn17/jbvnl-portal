const express = require('express');
const router  = express.Router();
const { getTariff, updateTariff } = require('../controllers/tariffController');
const { protect, admin }          = require('../middleware/authMiddleware');

router.get('/',  protect, getTariff);
router.put('/',  protect, admin, updateTariff);

module.exports = router;
