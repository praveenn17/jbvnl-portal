const Meter = require('../models/Meter');
const User  = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @desc   Get all meters (Admin/Manager)
// @route  GET /api/meters
const getMeters = async (req, res) => {
  try {
    const { consumerNumber, status, isSimulated } = req.query;
    const filter = {};
    if (consumerNumber)  filter.consumerNumber = consumerNumber;
    if (status)          filter.status = status;
    if (isSimulated !== undefined) filter.isSimulated = isSimulated === 'true';

    const meters = await Meter.find(filter).sort({ createdAt: -1 });
    res.json(meters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get simulated meter count (Admin dashboard warning)
// @route  GET /api/meters/simulated-count
const getSimulatedCount = async (req, res) => {
  try {
    const count = await Meter.countDocuments({ isSimulated: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get meter for own consumer number
// @route  GET /api/meters/my
const getMyMeter = async (req, res) => {
  try {
    const meter = await Meter.findOne({ consumerNumber: req.user.consumerNumber });
    if (!meter) return res.status(404).json({ message: 'No meter assigned to your account' });
    res.json(meter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Create / assign a meter (Admin)
// @route  POST /api/meters
const createMeter = async (req, res) => {
  try {
    const { consumerNumber, meterType, meterNumber, installationDate, previousReading, currentReading } = req.body;

    if (!consumerNumber || !meterNumber) {
      return res.status(400).json({ message: 'consumerNumber and meterNumber are required' });
    }

    // Check consumer exists
    const consumer = await User.findOne({ consumerNumber, role: 'consumer' });
    if (!consumer) return res.status(404).json({ message: `Consumer ${consumerNumber} not found` });

    // Overwrite existing meter if any (one meter per consumer)
    const existing = await Meter.findOne({ consumerNumber });
    if (existing) {
      await Meter.deleteOne({ consumerNumber });
    }

    const meter = await Meter.create({
      meterNumber,
      consumerNumber,
      meterType: meterType || 'domestic',
      previousReading: previousReading ?? 0,
      currentReading:  currentReading  ?? 0,
      installationDate: installationDate || new Date(),
      status: 'active',
      isSimulated: false,
    });

    logAudit({
      action: 'METER_CREATED',
      message: `Meter ${meterNumber} assigned to consumer ${consumerNumber}`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'meter', targetId: meter._id, targetLabel: meterNumber,
      metadata: { consumerNumber, meterType },
      severity: 'info',
    });

    res.status(201).json(meter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc   Update meter readings (Admin/Manager)
// @route  PUT /api/meters/:id
const updateMeterReading = async (req, res) => {
  try {
    const { currentReading, status } = req.body;
    const meter = await Meter.findById(req.params.id);
    if (!meter) return res.status(404).json({ message: 'Meter not found' });

    if (currentReading !== undefined) {
      if (currentReading < meter.currentReading) {
        return res.status(400).json({ message: 'New reading cannot be less than current reading' });
      }
      meter.currentReading = currentReading;
    }
    if (status) meter.status = status;
    meter.lastUpdated = new Date();
    // Real meters are no longer simulated once manually updated
    if (!meter.isSimulated === false) meter.isSimulated = false;

    await meter.save();

    logAudit({
      action: 'METER_READING_UPDATED',
      message: `Meter ${meter.meterNumber} reading updated to ${currentReading}`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'meter', targetId: meter._id, targetLabel: meter.meterNumber,
      metadata: { currentReading, consumerNumber: meter.consumerNumber },
      severity: 'info',
    });

    res.json(meter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc   Delete meter (Admin only)
// @route  DELETE /api/meters/:id
const deleteMeter = async (req, res) => {
  try {
    const meter = await Meter.findByIdAndDelete(req.params.id);
    if (!meter) return res.status(404).json({ message: 'Meter not found' });
    res.json({ message: 'Meter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMeters, getSimulatedCount, getMyMeter, createMeter, updateMeterReading, deleteMeter };
