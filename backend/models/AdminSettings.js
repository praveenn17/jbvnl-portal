const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  autoApprovalThreshold: { type: Number, default: 5 },
  emailNotifications: {
    registration: { type: Boolean, default: true },
    complaints: { type: Boolean, default: true },
    billing: { type: Boolean, default: false },
    summary: { type: Boolean, default: true },
  },
  smsAlerts: {
    escalation: { type: Boolean, default: true },
    payment: { type: Boolean, default: false },
    outage: { type: Boolean, default: true },
  },
  notificationPrefs: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    weeklyReport: { type: Boolean, default: true },
  },
  securitySettings: {
    passwordPolicy: { type: Boolean, default: true },
    otpVerification: { type: Boolean, default: true },
    adminProtection: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30 },
  },
  securityLevel: {
    type: String,
    enum: ['standard', 'high', 'strict'],
    default: 'standard'
  },
  backupSettings: {
    schedule: { type: String, default: 'Daily 2:00 AM' },
    lastBackupAt: { type: Date },
    status: { type: String, default: 'Healthy' },
    frequency: { type: String, default: 'daily' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
