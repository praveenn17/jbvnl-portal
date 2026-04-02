const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  consumerNumber: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['billing', 'power_outage', 'connection', 'other', 'technical', 'meter'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed', 'pending', 'assigned'],
    default: 'open'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
