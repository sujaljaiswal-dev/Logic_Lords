const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // stored in DB only, never disclosed in app UI
  },
  password: {
    type: String,
    required: true,
  },
  languagePreference: {
    type: String,
    enum: ['english', 'hindi'],
    default: 'english',
  },
  locality: {
    type: String,
    enum: ['urban', 'rural'],
    default: 'urban',
  },
  stressLevel: {
    type: Number,
    default: 0, // 0-10 scale
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
