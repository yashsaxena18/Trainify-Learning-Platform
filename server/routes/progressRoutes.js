// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const checkStudent = require('../middleware/checkStudent');
const { 
  markLectureCompleted, 
  getCourseProgress,
  getAllUserProgress,
  resetCourseProgress,
  getInstructorStudentProgress 
} = require('../controllers/progressController');

// Middleware to check if user is an instructor
const isInstructor = (req, res, next) => {
  if (req.user && req.user.role === 'instructor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only instructors allowed.' });
  }
};

// ✅ STUDENT PROGRESS ROUTES

// Static routes first
router.get('/instructor/students', protect, isInstructor, getInstructorStudentProgress);

// Dynamic routes after
router.post('/:courseId/lectures/:lectureId/complete', protect, checkStudent, markLectureCompleted);
router.get('/:courseId', protect, getCourseProgress);
router.delete('/:courseId/reset', protect, resetCourseProgress);

// User dashboard
router.get('/', protect, getAllUserProgress);

module.exports = router;
