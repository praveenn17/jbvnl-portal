const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  recipientRole: {
    type: String,
    enum: ['admin', 'manager', 'consumer', 'system']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'USER_REGISTRATION',
      'USER_APPROVAL',
      'USER_DEACTIVATION',
      'USER_DELETION',
      'COMPLAINT_ASSIGNED',
      'COMPLAINT_STATUS_UPDATED',
      'COMPLAINT_PRIORITY_CHANGED',
      'BILL_UPDATED',
      'SECURITY',
      'SESSION_TERMINATED',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  targetType: {
    type: String,
    enum: ['user', 'complaint', 'bill', 'system'],
    default: 'system'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
