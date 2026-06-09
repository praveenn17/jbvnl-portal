const Tariff = require('../models/Tariff');
const { logAudit } = require('../utils/auditLogger');

const DEFAULT_TARIFF = {
  domestic:   { ratePerUnit: 6.5,  fixedCharge: 80,  taxRate: 5 },
  commercial: { ratePerUnit: 9.0,  fixedCharge: 150, taxRate: 5 },
  industrial: { ratePerUnit: 7.5,  fixedCharge: 250, taxRate: 5 },
};

const getTariff = async (req, res) => {
  try {
    let tariff = await Tariff.findOne({ isActive: true });
    if (!tariff) {
      // Seed default tariff on first request
      tariff = await Tariff.create({ ...DEFAULT_TARIFF, isActive: true });
    }
    res.json(tariff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTariff = async (req, res) => {
  try {
    const { domestic, commercial, industrial } = req.body;
    let tariff = await Tariff.findOne({ isActive: true });

    if (!tariff) {
      tariff = new Tariff({ isActive: true });
    }

    if (domestic)   tariff.domestic   = { ...tariff.domestic,   ...domestic };
    if (commercial) tariff.commercial = { ...tariff.commercial, ...commercial };
    if (industrial) tariff.industrial = { ...tariff.industrial, ...industrial };

    tariff.effectiveFrom = new Date();
    tariff.updatedBy     = req.user._id;
    await tariff.save();

    logAudit({
      action: 'TARIFF_UPDATED',
      message: `Tariff rates updated by ${req.user.name}`,
      actor: req.user._id, actorName: req.user.name, actorEmail: req.user.email, actorRole: req.user.role,
      targetType: 'tariff', targetId: tariff._id, targetLabel: 'Active Tariff',
      metadata: { domestic, commercial, industrial },
      severity: 'warning',
    });

    res.json(tariff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getTariff, updateTariff };
