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

// Mark a specific lecture as completed
router.post('/:courseId/lectures/:lectureId/complete', protect, checkStudent, markLectureCompleted);

// Get progress for a specific course
router.get('/:courseId', protect, getCourseProgress);

// Get all progress for the logged-in user (for student dashboard)
router.get('/', protect, getAllUserProgress);

// Reset progress for a specific course (for testing/admin)
router.delete('/:courseId/reset', protect, resetCourseProgress);

// ✅ INSTRUCTOR PROGRESS ROUTES

// Get student progress summary for instructor's courses
router.get('/instructor/students', protect, isInstructor, getInstructorStudentProgress);

module.exports = router;
