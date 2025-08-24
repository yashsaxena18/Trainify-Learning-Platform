const express = require('express');
const router = express.Router();
const {
  createCourse, 
  getAllCourses, 
  getInstructorCourses,
  getInstructorAnalytics,
  enrollInCourse, 
  addLecture,
  getAllLectures,
  getCourseProgress, 
  addCourseReview, 
  trackCourseView, 
  trackCoursePageView,
  trackCourseLectureView,
  getCourseViewAnalytics,
  getCourseReviews,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');
const checkStudent = require("../middleware/checkStudent");

// Mini middleware to check if user is an instructor
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ 
      message: "Access Denied. Only Instructors can perform this action" 
    });
  }
  next();
}

// ✅ Instructor-specific routes
router.get('/instructor/courses', protect, isInstructor, getInstructorCourses);
router.get('/instructor/analytics', protect, isInstructor, getInstructorAnalytics);

// ✅ Course management routes
router.post('/create', protect, isInstructor, createCourse);
router.get('/', getAllCourses);
router.put('/:id/manage', protect, isInstructor, updateCourse);
router.delete('/:id/manage', protect, isInstructor, deleteCourse);

// ✅ Course content routes
router.post('/:id/lectures', protect, isInstructor, addLecture);
router.get('/:id/lectures', protect, getAllLectures);

// ✅ Student interaction routes
router.post('/:id/enroll', protect, checkStudent, enrollInCourse);
router.get('/progress/:courseId', protect, getCourseProgress);

// ✅ Review system routes
router.post('/:id/review', protect, checkStudent, addCourseReview);
router.get('/:id/reviews', getCourseReviews);

// ✅ View tracking routes (FIXED - removed duplicate and fixed comment)
router.post('/:id/view', trackCourseView);                           // General view tracking
router.post('/:id/page-view', trackCoursePageView);                  // Course page view
router.post('/:id/lectures/:lectureId/view', trackCourseLectureView); // Lecture view tracking
router.get('/:id/analytics', protect, isInstructor, getCourseViewAnalytics); // Analytics

module.exports = router;