const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      actorRole,
      targetType,
      severity,
      search,
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (actorRole) query.actorRole = actorRole;
    if (targetType) query.targetType = targetType;
    if (severity) query.severity = severity;

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { actorName: { $regex: search, $options: 'i' } },
        { targetLabel: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('actor', 'name email role');

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('actor', 'name email role');
    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
};
