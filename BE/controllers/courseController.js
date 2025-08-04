const Course = require('../models/courseSchema');

exports.addCourse = async (req, res) => {
  try {
    const { name, description, professorId } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Create new course
    const course = new Course({
      name,
      description,
      professor: professorId || null,
      isActive: true
    });

    // Save course to database
    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      data: savedCourse,
      message: 'Course created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('professor', 'name');
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.toggleCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Find course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Toggle isActive status
    course.isActive = !course.isActive;
    const updatedCourse = await course.save();

    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};