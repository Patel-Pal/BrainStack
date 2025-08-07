const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [500, 'Course description cannot exceed 500 characters']
  },
  professors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
courseSchema.pre('save', function (next) {
  if (this.professors === null || this.professors === undefined) {
    this.professors = [];
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);