const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['consumer', 'admin', 'manager'], 
    default: 'consumer' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'hold'], 
    default: 'pending' 
  },
  consumerNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  connectionType: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
