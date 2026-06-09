const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  billId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  consumerNumber:    { type: String, required: true },
  amount:            { type: Number, required: true },  // in paise
  status:            { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  paidAt:            { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
