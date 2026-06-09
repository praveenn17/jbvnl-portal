const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  // ── Core ────────────────────────────────────────────────────────────────────
  consumerNumber: { type: String, required: true },
  billNumber:     { type: String, required: true, unique: true },
  billingPeriod:  { type: String, required: true },
  dueDate:        { type: Date,   required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },

  // ── Meter & Readings (Phase 3 — may be null for legacy bills) ────────────
  meterNumber:     { type: String, default: null },
  meterType:       { type: String, enum: ['domestic', 'commercial', 'industrial', null], default: null },
  previousReading: { type: Number, default: null },
  currentReading:  { type: Number, default: null },
  unitsConsumed:   { type: Number, default: null },  // alias: units (kept for compat)

  // Backward compat — used when meterData not available
  units: { type: Number, default: 0 },

  // ── Tariff Breakdown ──────────────────────────────────────────────────────
  ratePerUnit:  { type: Number, default: null },
  fixedCharge:  { type: Number, default: null },
  energyCharge: { type: Number, default: null },
  taxRate:      { type: Number, default: null },
  tax:          { type: Number, default: null },
  amount:       { type: Number, required: true },

  // ── Payment ───────────────────────────────────────────────────────────────
  paidAt:            { type: Date,   default: null },
  paymentMethod:     { type: String, default: null }, // 'razorpay'|'cash'|'bank_transfer'|'cheque'|'other'
  transactionRef:    { type: String, default: null },
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },

}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
