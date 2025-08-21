const User = require("../models/User");
// controllers/userController.js - Fix the getUserProfile function

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'title description category price lectures studentsEnrolled views')
      .populate('completedCourses', 'title')
      .select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: user.enrolledCourses || [],
        completedCourses: user.completedCourses || [],
        completedLectures: user.completedLectures || []
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user profile',
      error: error.message 
    });
  }
};


// Logic for Student Enrolled courses
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - No user in request" });
    }
    
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("enrolledCourses");
      
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ GetMe Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getUserProfile, getMe };