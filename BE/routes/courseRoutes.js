const express = require('express');
const router = express.Router();
const { addCourse, getCourses,toggleCourseStatus, addProfessorToCourse } = require('../controllers/courseController');

router.post('/add', addCourse);
router.get('/', getCourses);
router.patch('/:courseId/toggle-status', toggleCourseStatus);
router.post('/add-professor', addProfessorToCourse);


module.exports = router;