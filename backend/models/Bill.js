const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  consumerNumber: { type: String, required: true },
  billNumber: { type: String, required: true, unique: true },
  billingPeriod: { type: String, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  },
  units: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
