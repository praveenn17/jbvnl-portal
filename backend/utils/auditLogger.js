const AuditLog = require('../models/AuditLog');

/**
 * Logs an audit event asynchronously without blocking the main thread.
 * 
 * @param {Object} param0 
 * @param {String} param0.action - Action identifier (e.g. USER_APPROVED, LOGIN_SUCCESS)
 * @param {String} param0.message - Human readable message
 * @param {Object} [param0.actor] - User ObjectId
 * @param {String} [param0.actorName] - Name of actor
 * @param {String} [param0.actorEmail] - Email of actor
 * @param {String} [param0.actorRole] - Role of actor (admin, manager, consumer, system)
 * @param {String} [param0.targetType] - Type of target (user, complaint, bill, setting, auth)
 * @param {String|Object} [param0.targetId] - ID of target
 * @param {String} [param0.targetLabel] - Human readable label of target
 * @param {Object} [param0.metadata] - Extra data (JSON)
 * @param {String} [param0.severity] - info, warning, critical
 */
const logAudit = ({
  action,
  message,
  actor,
  actorName,
  actorEmail,
  actorRole = 'system',
  targetType,
  targetId,
  targetLabel,
  metadata,
  severity = 'info',
}) => {
  // Fire and forget, don't return promise
  AuditLog.create({
    action,
    message,
    actor,
    actorName,
    actorEmail,
    actorRole,
    targetType,
    targetId,
    targetLabel,
    metadata,
    severity,
  }).catch((err) => {
    console.warn('[AUDIT_LOG_FAILED]', err.message);
  });
};

module.exports = { logAudit };
