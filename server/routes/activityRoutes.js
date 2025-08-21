// routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getInstructorActivity, 
  markActivitiesAsRead 
} = require('../controllers/activityController');

// Instructor middleware
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied. Only instructors allowed.' });
  }
  next();
};

// Activity routes
router.get('/instructor', protect, isInstructor, getInstructorActivity);
router.put('/mark-read', protect, isInstructor, markActivitiesAsRead);

module.exports = router;
