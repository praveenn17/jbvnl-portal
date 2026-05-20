const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actorName: {
    type: String,
  },
  actorEmail: {
    type: String,
  },
  actorRole: {
    type: String,
    enum: ['admin', 'manager', 'consumer', 'system'],
    default: 'system',
  },
  targetType: {
    type: String,
  },
  targetId: {
    type: String,
  },
  targetLabel: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
