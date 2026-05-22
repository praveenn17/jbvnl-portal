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
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTeam: { type: String },
  adminNotes: [{
    note: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedByRole: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    changedByRole: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  sla: {
    slaHours: { type: Number },
    dueAt: { type: Date },
    resolvedAt: { type: Date },
    status: { 
      type: String, 
      enum: ['on_track', 'at_risk', 'breached', 'completed'],
      default: 'on_track'
    }
  },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  preferredTime: { type: String },
  contactNumber: { type: String },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

complaintSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Complaint', complaintSchema);
