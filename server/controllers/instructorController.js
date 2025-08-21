// controllers/instructorController.js
const Course = require('../models/Course');
const User = require('../models/User');

// Get instructor courses
const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    const courses = await Course.find({ createdBy: instructorId })
      .populate('studentsEnrolled', 'name email')
      .populate('reviews.user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      courses: courses.map(course => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        studentsEnrolled: course.studentsEnrolled || [],
        lectures: course.lectures || [],
        reviews: course.reviews || [],
        views: course.views || 0,
        averageRating: course.averageRating || 0,
        totalReviews: course.totalReviews || 0,
        createdAt: course.createdAt
      }))
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch instructor courses' 
    });
  }
};

// Get instructor analytics
const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    const courses = await Course.find({ createdBy: instructorId });
    
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => 
      sum + (course.studentsEnrolled?.length || 0), 0
    );
    const totalViews = courses.reduce((sum, course) => 
      sum + (course.views || 0), 0
    );
    const totalRevenue = courses.reduce((sum, course) => 
      sum + ((course.studentsEnrolled?.length || 0) * (course.price || 0)), 0
    );
    const avgRating = courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length
      : 0;

    res.json({
      success: true,
      totalCourses,
      totalStudents,
      totalViews,
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalRevenue,
      coursePerformance: courses.map(course => ({
        id: course._id,
        title: course.title,
        views: course.views || 0,
        reviewsCount: course.reviews?.length || 0,
        messagesCount: 0, // Placeholder
        studentsCount: course.studentsEnrolled?.length || 0,
        revenue: (course.studentsEnrolled?.length || 0) * (course.price || 0),
        rating: course.averageRating || 0
      }))
    });
  } catch (error) {
    console.error('Get instructor analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    });
  }
};

// Get instructor dashboard data
const getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    const courses = await Course.find({ createdBy: instructorId });
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => 
      sum + (course.studentsEnrolled?.length || 0), 0
    );

    res.json({
      success: true,
      totalCourses,
      totalStudents,
      recentCourses: courses.slice(0, 5)
    });
  } catch (error) {
    console.error('Get instructor dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data' 
    });
  }
};
// Add this function to instructorController.js
const getInstructorCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user._id;
    
    console.log('Fetching course:', courseId, 'for instructor:', instructorId);
    
    // Find course that belongs to this instructor
    const course = await Course.findOne({ 
      _id: courseId, 
      createdBy: instructorId 
    })
    .populate('studentsEnrolled', 'name email')
    .populate('reviews.user', 'name');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to access it'
      });
    }
    
    console.log('Course found:', course.title);
    
    res.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        lectures: course.lectures || [],
        studentsEnrolled: course.studentsEnrolled || [],
        reviews: course.reviews || [],
        views: course.views || 0,
        averageRating: course.averageRating || 0,
        totalReviews: course.totalReviews || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }
    });
  } catch (error) {
    console.error('Get instructor course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// Update your module.exports to include the new function
module.exports = {
  getInstructorCourses,
  getInstructorDashboard,
  getInstructorAnalytics,
  getInstructorCourse  // ✅ ADD THIS LINE
};
  