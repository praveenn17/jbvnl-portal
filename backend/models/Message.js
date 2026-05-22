const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['manager', 'admin'],
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['complaint', 'system', 'billing', 'consumer', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'responded', 'closed'],
      default: 'unread',
    },
    readAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    metadata: {
      type: Object,
      default: {},
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
