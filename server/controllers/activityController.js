// controllers/activityController.js
const Activity = require('../models/Activity');

// Get instructor's activity feed
const getInstructorActivity = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    
    const activities = await Activity.find({ instructor: instructorId })
      .populate('actor.userId', 'name email')
      .populate('target.courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalActivities = await Activity.countDocuments({ instructor: instructorId });
    const unreadCount = await Activity.countDocuments({ 
      instructor: instructorId, 
      isRead: false 
    });
    
    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalActivities / limit),
        totalActivities,
        hasNext: page * limit < totalActivities
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get instructor activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};

// Mark activities as read
const markActivitiesAsRead = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { activityIds } = req.body;
    
    if (activityIds && activityIds.length > 0) {
      await Activity.updateMany(
        { 
          _id: { $in: activityIds },
          instructor: instructorId 
        },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Activity.updateMany(
        { instructor: instructorId },
        { isRead: true }
      );
    }
    
    res.json({
      success: true,
      message: 'Activities marked as read'
    });
  } catch (error) {
    console.error('Mark activities read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark activities as read' });
  }
};

module.exports = {
  getInstructorActivity,
  markActivitiesAsRead
};
