const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  meterNumber:      { type: String, required: true, unique: true },
  consumerNumber:   { type: String, required: true, unique: true },
  meterType:        { type: String, enum: ['domestic', 'commercial', 'industrial'], default: 'domestic' },
  previousReading:  { type: Number, default: 0 },
  currentReading:   { type: Number, default: 0 },
  installationDate: { type: Date, default: Date.now },
  status:           { type: String, enum: ['active', 'faulty', 'replaced', 'simulated'], default: 'active' },
  isSimulated:      { type: Boolean, default: false },
  lastUpdated:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Meter', meterSchema);
