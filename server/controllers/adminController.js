// controllers/adminController.js
const User = require("../models/User");
const Course = require("../models/Course");

// ===============================
// LEGACY FUNCTIONS (Keep for compatibility)
// ===============================

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json({
      success: true,
      requestedBy: req.user.name,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
};

const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select("-password");
    res.status(200).json({
      success: true,
      requestedBy: req.user.name,
      count: instructors.length,
      instructors,
    });
  } catch (error) {
    console.error("Get instructors error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch instructors" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: "Admins cannot delete themselves" });
    }
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `User '${user.name}' deleted successfully` 
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

const BlockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: "Admins can't block themselves" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.isBlocked = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been blocked.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.isBlocked = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been unblocked.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments();
    
    const allCourses = await Course.find({}, "studentsEnrolled");
    const totalEnrollments = allCourses.reduce(
      (acc, course) => acc + (course.studentsEnrolled?.length || 0),
      0
    );
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalInstructors,
        totalCourses,
        totalEnrollments,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard stats",
      error: error.message,
    });
  }
};

// ===============================
// NEW DASHBOARD FUNCTIONS
// ===============================

const getAdminStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    
    // Course approval stats
    const approvedCourses = await Course.countDocuments({ 
      $or: [{ isApproved: true }, { isApproved: { $exists: false } }] 
    });
    
    // Revenue and enrollment calculations
    const courses = await Course.find({}, 'studentsEnrolled price').lean();
    const totalEnrollments = courses.reduce((sum, course) => 
      sum + (course.studentsEnrolled?.length || 0), 0
    );
    const totalRevenue = courses.reduce((sum, course) => 
      sum + ((course.studentsEnrolled?.length || 0) * (course.price || 0)), 0
    );
    
    // Platform growth (simple calculation)
    const platformGrowth = Math.round(Math.min(totalUsers / 10, 100));
    
    res.json({
      success: true,
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      platformGrowth,
      approvedCourses,
      pendingCourses: Math.max(0, totalCourses - approvedCourses)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin statistics',
      error: error.message 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({role : 'student'})
      .select('name email role isBlocked createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ 
      success: true, 
      users: users || [],
      count: users.length 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};
// controllers/adminController.js - Add this function
const getAllInstructorsWithStats = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('name email isBlocked createdAt')
      .lean();
    
    const instructorStats = await Promise.all(
      instructors.map(async (instructor) => {
        try {
          // Get courses created by this instructor
          const courses = await Course.find({ createdBy: instructor._id }).lean();
          const coursesCreated = courses.length;
          
          // Calculate total students across all instructor's courses
          const totalStudents = courses.reduce((sum, course) => 
            sum + (course.studentsEnrolled?.length || 0), 0
          );
          
          // Calculate total revenue
          const totalRevenue = courses.reduce((sum, course) => 
            sum + ((course.studentsEnrolled?.length || 0) * (course.price || 0)), 0
          );
          
          return {
            ...instructor,
            coursesCreated,
            totalStudents,
            totalRevenue
          };
        } catch (err) {
          console.error(`Error calculating stats for instructor ${instructor._id}:`, err);
          return {
            ...instructor,
            coursesCreated: 0,
            totalStudents: 0,
            totalRevenue: 0
          };
        }
      })
    );
    
    res.json({ 
      success: true, 
      instructors: instructorStats,
      count: instructorStats.length 
    });
  } catch (error) {
    console.error('Get instructors with stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch instructors',
      error: error.message 
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('createdBy', 'name email')
      .populate('studentsEnrolled', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    const pendingCourses = await Course.find({ isApproved: false })
      .populate('createdBy', 'name email')
      .lean();
    
    res.json({ 
      success: true,
      courses: courses || [],
      pendingCourses: pendingCourses || [],
      totalCourses: courses.length,
      pendingCount: pendingCourses.length
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses',
      error: error.message 
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    // Get recent users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt role')
      .lean();
    
    // Get recent courses
    const recentCourses = await Course.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .select('title createdAt createdBy')
      .lean();
    
    // Format activities
    const activities = [];
    
    // Add user activities
    recentUsers.forEach(user => {
      if (user && user.name) {
        activities.push({
          type: 'user_registered',
          description: `New ${user.role} registered: ${user.name}`,
          user: user.name,
          timestamp: user.createdAt || new Date()
        });
      }
    });
    
    // Add course activities
    recentCourses.forEach(course => {
      if (course && course.title && course.createdBy) {
        activities.push({
          type: 'course_created',
          description: `New course created: ${course.title}`,
          user: course.createdBy.name || 'Unknown',
          timestamp: course.createdAt || new Date()
        });
      }
    });
    
    // Sort and limit activities
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ 
      success: true, 
      activities: activities.slice(0, 10) 
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activity',
      error: error.message 
    });
  }
};

// ===============================
// USER MANAGEMENT FUNCTIONS
// ===============================

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: "Admins can't block themselves" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.isBlocked = true;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User blocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to block user',
      error: error.message 
    });
  }
};

const unblockUserNew = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.isBlocked = false;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User unblocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unblock user',
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: "Admins cannot delete themselves" });
    }
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      deletedUser: {
        _id: user._id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
};

const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }
    
    const course = await Course.findByIdAndUpdate(
      courseId, 
      { isApproved: true }, 
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    res.json({ 
      success: true, 
      message: 'Course approved successfully',
      course: {
        _id: course._id,
        title: course.title,
        isApproved: course.isApproved
      }
    });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve course',
      error: error.message 
    });
  }
};

// ===============================
// EXPORTS - ALL FUNCTIONS
// ===============================

module.exports = {
  // Legacy functions (for backward compatibility)
  getAllStudents,
  getAllInstructors,
  deleteUserById,
  BlockUser,
  unblockUser,
  getAdminDashboardStats,
  
  // New dashboard functions
  getAdminStats,
  getAllUsers,
  getAllInstructorsWithStats,
  getAllCourses,
  getRecentActivity,
  
  // User management functions
  blockUser,
  unblockUserNew,
  deleteUser,
  approveCourse
};
