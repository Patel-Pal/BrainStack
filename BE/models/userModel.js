const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: false, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  course: { type: String, required: false },
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: '' },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
