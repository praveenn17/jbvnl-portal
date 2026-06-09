const mongoose = require('mongoose');

const rateSchema = {
  ratePerUnit: { type: Number, required: true },
  fixedCharge: { type: Number, required: true },
  taxRate:     { type: Number, default: 5 }, // GST % applied on energy charges
};

const tariffSchema = new mongoose.Schema({
  domestic:    { ...rateSchema },
  commercial:  { ...rateSchema },
  industrial:  { ...rateSchema },
  effectiveFrom: { type: Date, default: Date.now },
  isActive:    { type: Boolean, default: true },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Tariff', tariffSchema);
