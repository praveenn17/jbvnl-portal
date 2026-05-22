const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consumerNumber: { type: String, required: true },
  requestType: {
    type: String,
    enum: [
      'NEW_CONNECTION',
      'DISABLE_CONNECTION',
      'POWER_QUALITY',
      'SMS_ALERT_SERVICE',
      'ONLINE_BILL_SERVICE',
      'ACCOUNT_UPDATE',
      'OTHER'
    ],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

serviceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
