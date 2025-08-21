// routes/adminRoutes.js - CORRECTED
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ✅ Inline checkAdmin middleware (no separate file needed)
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const {
  getAllStudents,
  getAllInstructors,
  deleteUserById,
  BlockUser,
  unblockUser,
  getAdminDashboardStats,
  getAdminStats,
  getAllUsers,
  getAllInstructorsWithStats,
  getAllCourses,
  getRecentActivity,
  blockUser,
  unblockUserNew,
  deleteUser,
  approveCourse
} = require('../controllers/adminController');

// Legacy routes
router.get('/users', protect, checkAdmin, getAllStudents);
router.get('/instructors', protect, checkAdmin, getAllInstructors);
router.delete('/users/:id', protect, checkAdmin, deleteUserById);
router.put('/users/:id/block', protect, checkAdmin, BlockUser);
router.put('/users/:id/unblock', protect, checkAdmin, unblockUser);
router.get('/dashboard', protect, checkAdmin, getAdminDashboardStats);

// New dashboard routes
router.get('/stats', protect, checkAdmin, getAdminStats);
router.get('/all-users', protect, checkAdmin, getAllUsers);
router.get('/all-instructors', protect, checkAdmin, getAllInstructorsWithStats);
router.get('/courses', protect, checkAdmin, getAllCourses);
router.get('/activity', protect, checkAdmin, getRecentActivity);

// User management routes
router.put('/users/:userId/block', protect, checkAdmin, blockUser);
router.put('/users/:userId/unblock', protect, checkAdmin, unblockUserNew);
router.delete('/users/:userId', protect, checkAdmin, deleteUser);
router.put('/courses/:courseId/approve', protect, checkAdmin, approveCourse);

module.exports = router;
