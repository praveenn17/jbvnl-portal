const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['consumer', 'admin', 'manager'],
    default: 'consumer',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hold'],
    default: 'pending',
  },

  // ── Email Verification ──────────────────────────────────────────────────────
  // Whether the user has successfully verified their email via OTP.
  isEmailVerified: { type: Boolean, default: false },

  // Hashed OTP (bcrypt). We never store plain OTPs.
  emailOtpHash: { type: String, default: null },

  // Expiry timestamp for the OTP (Date object).
  emailOtpExpires: { type: Date, default: null },

  // Number of failed OTP attempts for this OTP cycle.
  emailOtpAttempts: { type: Number, default: 0 },

  // Timestamp of the last OTP send — used to enforce resend cooldown.
  emailOtpLastSent: { type: Date, default: null },

  // ── Consumer-specific fields ────────────────────────────────────────────────
  consumerNumber: { type: String },
  address: { type: String },
  phone: { type: String },

  // For managers
  employeeId: { type: String },
  department: { type: String },

  // ── Consumer Preferences & Privacy ──────────────────────────────────────────
  preferences: {
    smsAlertsEnabled: { type: Boolean, default: false },
    emailBillEnabled: { type: Boolean, default: true },
    outageNotificationsEnabled: { type: Boolean, default: true },
    marketingOptIn: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
  },

  // Account management requests
  deactivationRequested: { type: Boolean, default: false },
  deleteRequested: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },

  // ── Security ────────────────────────────────────────────────────────────────
  tokenVersion: { type: Number, default: 0 },
});

// ── Password hashing pre-save hook ───────────────────────────────────────────
// Automatically hashes the password whenever it is set or changed.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance method: compare plain password with stored hash ─────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
