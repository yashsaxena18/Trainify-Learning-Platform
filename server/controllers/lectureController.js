// controllers/lectureController.js
const Course = require('../models/Course');

// Get all lectures for a specific course (for instructor)
const getCourseLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;
    
    const course = await Course.findOne({ 
      _id: courseId, 
      createdBy: instructorId 
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or you are not the instructor' 
      });
    }
    
    res.json({
      success: true,
      lectures: course.lectures || [],
      courseTitle: course.title,
      totalLectures: course.lectures.length
    });
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lectures' });
  }
};

// Update a specific lecture
const updateLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const instructorId = req.user._id;
    const { title, videoUrl, duration, order } = req.body;
    
    const course = await Course.findOne({ 
      _id: courseId, 
      createdBy: instructorId 
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or you are not the instructor' 
      });
    }
    
    const lectureIndex = course.lectures.findIndex(
      lecture => lecture._id.toString() === lectureId
    );
    
    if (lectureIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lecture not found' 
      });
    }
    
    // Update lecture
    course.lectures[lectureIndex].title = title || course.lectures[lectureIndex].title;
    course.lectures[lectureIndex].videoUrl = videoUrl || course.lectures[lectureIndex].videoUrl;
    course.lectures[lectureIndex].duration = duration || course.lectures[lectureIndex].duration;
    course.lectures[lectureIndex].order = order || course.lectures[lectureIndex].order;
    
    await course.save();
    
    res.json({
      success: true,
      message: 'Lecture updated successfully',
      lecture: course.lectures[lectureIndex]
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({ success: false, message: 'Failed to update lecture' });
  }
};

// Delete a specific lecture
const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const instructorId = req.user._id;
    
    const course = await Course.findOne({ 
      _id: courseId, 
      createdBy: instructorId 
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found or you are not the instructor' 
      });
    }
    
    course.lectures = course.lectures.filter(
      lecture => lecture._id.toString() !== lectureId
    );
    
    await course.save();
    
    res.json({
      success: true,
      message: 'Lecture deleted successfully',
      remainingLectures: course.lectures.length
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lecture' });
  }
};

module.exports = {
  getCourseLectures,
  updateLecture,
  deleteLecture
};
