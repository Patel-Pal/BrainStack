const Course = require('../models/courseSchema');

// Get all courses for the logged-in professor
exports.getProfessorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ professors: req.user._id })
      .select('name description isActive createdAt')
      .lean();
    
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this professor' });
    }
    
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching professor courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};