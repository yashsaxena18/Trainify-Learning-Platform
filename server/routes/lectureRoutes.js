// routes/lectureRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getCourseLectures, 
  updateLecture, 
  deleteLecture 
} = require('../controllers/lectureController');

// Instructor middleware
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied. Only instructors allowed.' });
  }
  next();
};

// Lecture management routes
router.get('/course/:courseId', protect, isInstructor, getCourseLectures);
router.put('/course/:courseId/lecture/:lectureId', protect, isInstructor, updateLecture);
router.delete('/course/:courseId/lecture/:lectureId', protect, isInstructor, deleteLecture);

module.exports = router;
