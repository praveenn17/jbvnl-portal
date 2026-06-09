const AdminSettings = require('../models/AdminSettings');
const { logAudit } = require('../utils/auditLogger');
const notificationService = require('../utils/notificationService');

const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    // Auto-create if doesn't exist
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    const updatableFields = [
      'autoApprovalThreshold', 'emailNotifications', 'smsAlerts', 
      'notificationPrefs', 'securitySettings', 'securityLevel'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    settings.updatedAt = Date.now();
    await settings.save();

    logAudit({
      action: 'ADMIN_SETTINGS_UPDATED',
      message: 'Admin updated system settings',
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'system',
      severity: 'warning'
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runBackup = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    settings.backupSettings.lastBackupAt = new Date();
    settings.updatedAt = Date.now();
    await settings.save();

    logAudit({
      action: 'MANUAL_BACKUP_TRIGGERED',
      message: 'Admin triggered a manual database backup',
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'system',
      severity: 'info'
    });

    notificationService.createNotificationForRole('admin', {
      title: 'Manual Backup Complete',
      message: 'Database backup completed successfully.',
      type: 'SYSTEM',
      priority: 'normal'
    });

    res.json({ message: 'Backup completed successfully', lastBackupAt: settings.backupSettings.lastBackupAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  runBackup
};
