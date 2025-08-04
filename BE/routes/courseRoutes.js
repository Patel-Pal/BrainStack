const express = require('express');
const router = express.Router();
const { addCourse, getCourses,toggleCourseStatus } = require('../controllers/courseController');

router.post('/add', addCourse);
router.get('/', getCourses);
router.patch('/:courseId/toggle-status', toggleCourseStatus);


module.exports = router;