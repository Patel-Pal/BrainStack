const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const professorController = require('../controllers/professorController');

// Middleware to ensure user is a professor
const isProfessor = async (req, res, next) => {
  try {
    const User = require('../models/userModel');
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'professor') {
      return res.status(403).json({ message: 'Access denied: Not a professor' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Routes
router.get('/courses', authMiddleware, isProfessor, professorController.getProfessorCourses);

module.exports = router;





