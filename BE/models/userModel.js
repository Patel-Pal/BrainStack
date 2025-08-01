const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  course: { type: String, required: true },
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: '' } // URL or file path
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
