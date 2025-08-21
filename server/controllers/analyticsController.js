// controllers/analyticsController.js
const Course = require("../models/Course");
const User = require("../models/User");

const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    // Get all instructor courses
    const courses = await Course.find({ createdBy: instructorId })
      .populate('studentsEnrolled', 'name email')
      .populate('reviews.user', 'name');
    
    // Calculate analytics
    const totalViews = courses.reduce((sum, course) => sum + (course.views || 0), 0);
    const allReviews = courses.flatMap(course => course.reviews || []);
    const avgRating = allReviews.length > 0 
      ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
      : 0;
    
    const allStudentIds = courses.flatMap(course => course.studentsEnrolled.map(s => s._id.toString()));
    const uniqueStudents = [...new Set(allStudentIds)];
    
    const coursePerformance = courses.map(course => ({
      id: course._id,
      title: course.title,
      studentsCount: course.studentsEnrolled.length,
      views: course.views || 0,
      rating: course.averageRating || 0,
      reviewsCount: course.reviews?.length || 0,
      revenue: course.studentsEnrolled.length * course.price
    }));
    
    res.json({
      totalCourses: courses.length,
      totalStudents: uniqueStudents.length,
      totalViews,
      avgRating: parseFloat(avgRating),
      totalRevenue: coursePerformance.reduce((sum, course) => sum + course.revenue, 0),
      coursePerformance
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

module.exports = { getInstructorAnalytics };
