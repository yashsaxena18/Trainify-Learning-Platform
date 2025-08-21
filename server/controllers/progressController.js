// controllers/progressController.js
const User = require('../models/User');
const Course = require('../models/Course');
const ActivityService = require('../services/activityService');

// Mark a lecture as completed
const markLectureCompleted = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lectureId } = req.params;

    // Validate input
    if (!courseId || !lectureId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID and Lecture ID are required' 
      });
    }

    console.log('Marking lecture complete:', { userId, courseId, lectureId });

    // Find user and course with instructor details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('createdBy', 'name');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check if user is enrolled in the course
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this course' 
      });
    }

    // Find the specific lecture
    const lecture = course.lectures.find(lec => lec._id.toString() === lectureId);
    if (!lecture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lecture not found' 
      });
    }

    // Find or create course progress entry
    let courseProgress = user.completedLectures.find(
      entry => entry.courseId && entry.courseId.toString() === courseId
    );

    if (!courseProgress) {
      // Create new course progress entry
      user.completedLectures.push({
        courseId: courseId,
        lectureIds: [lectureId]
      });
      courseProgress = user.completedLectures[user.completedLectures.length - 1];
    } else {
      // Add lecture if not already completed
      if (!courseProgress.lectureIds.includes(lectureId)) {
        courseProgress.lectureIds.push(lectureId);
      } else {
        return res.status(200).json({ 
          success: true, 
          message: 'Lecture already marked as completed',
          alreadyCompleted: true
        });
      }
    }

    // Save user progress
    await user.save();

    console.log('User progress saved successfully');

    // ✅ Track lecture completion activity for instructor dashboard
    try {
      await ActivityService.trackLectureCompletion(
        user._id,
        user.name,
        course._id,
        course.title,
        lecture._id,
        lecture.title,
        course.createdBy._id
      );
      console.log('Lecture completion activity tracked');
    } catch (activityError) {
      console.error('Failed to track lecture completion activity:', activityError);
      // Don't fail the main request if activity tracking fails
    }

    // Check if course is now fully completed
    const totalLectures = course.lectures.length;
    const completedLectures = courseProgress.lectureIds.length;
    const isFullyCompleted = completedLectures === totalLectures;

    // If course is fully completed, add to completed courses
    if (isFullyCompleted && !user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId);
      await user.save();
      console.log('Course marked as fully completed');
      
      // ✅ Track course completion activity for instructor dashboard
      try {
        await ActivityService.trackCourseCompletion(
          user._id,
          user.name,
          course._id,
          course.title,
          course.createdBy._id
        );
        console.log('Course completion activity tracked');
      } catch (activityError) {
        console.error('Failed to track course completion activity:', activityError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Lecture marked as completed successfully',
      data: {
        courseId,
        lectureId,
        lectureTitle: lecture.title,
        completedLectures,
        totalLectures,
        progressPercentage: ((completedLectures / totalLectures) * 100).toFixed(2),
        isFullyCompleted
      }
    });

  } catch (error) {
    console.error('Mark lecture complete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark lecture as completed',
      error: error.message 
    });
  }
};

// Get course progress for a user
const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // Validate input
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID is required' 
      });
    }

    console.log('Getting progress for:', { userId, courseId });

    // Find user and course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Get course progress
    const courseProgress = user.completedLectures.find(
      entry => entry.courseId && entry.courseId.toString() === courseId
    );

    const completedLectures = courseProgress ? courseProgress.lectureIds.length : 0;
    const totalLectures = course.lectures.length;
    const percentage = totalLectures > 0 ? ((completedLectures / totalLectures) * 100).toFixed(2) + "%" : "0%";

    // Check if course is fully completed
    const isFullyCompleted = user.completedCourses.includes(courseId);

    res.status(200).json({
      success: true,
      data: {
        courseId,
        courseTitle: course.title,
        completedLectures,
        totalLectures,
        percentage,
        completedLectureIds: courseProgress ? courseProgress.lectureIds : [],
        isFullyCompleted,
        isEnrolled: user.enrolledCourses.includes(courseId),
        lectures: course.lectures.map(lecture => ({
          _id: lecture._id,
          title: lecture.title,
          duration: lecture.duration,
          order: lecture.order,
          isCompleted: courseProgress ? courseProgress.lectureIds.includes(lecture._id.toString()) : false
        }))
      }
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get course progress',
      error: error.message 
    });
  }
};

// Get all progress for a user (for dashboard)
const getAllUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('Getting all progress for user:', userId);

    const user = await User.findById(userId)
      .populate('enrolledCourses', 'title description lectures createdBy')
      .populate('completedCourses', 'title description');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Calculate progress for each enrolled course
    const courseProgress = user.enrolledCourses.map(course => {
      const progress = user.completedLectures.find(
        entry => entry.courseId && entry.courseId.toString() === course._id.toString()
      );

      const completedLectures = progress ? progress.lectureIds.length : 0;
      const totalLectures = course.lectures.length;
      const percentage = totalLectures > 0 ? ((completedLectures / totalLectures) * 100).toFixed(2) + "%" : "0%";
      const isCompleted = user.completedCourses.some(
        completedCourseId => completedCourseId.toString() === course._id.toString()
      );

      return {
        courseId: course._id,
        courseTitle: course.title,
        courseDescription: course.description,
        completedLectures,
        totalLectures,
        percentage,
        isCompleted,
        lastActivity: progress ? new Date() : course.createdAt // Placeholder for last activity
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEnrolledCourses: user.enrolledCourses.length,
        totalCompletedCourses: user.completedCourses.length,
        overallCompletionRate: courseProgress.length > 0 
          ? (user.completedCourses.length / user.enrolledCourses.length * 100).toFixed(2) + "%" 
          : "0%",
        courseProgress
      }
    });

  } catch (error) {
    console.error('Get all user progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user progress',
      error: error.message 
    });
  }
};

// Reset course progress (for testing/admin)
const resetCourseProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    console.log('Resetting progress for:', { userId, courseId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove course progress
    user.completedLectures = user.completedLectures.filter(
      entry => entry.courseId.toString() !== courseId
    );

    // Remove from completed courses
    user.completedCourses = user.completedCourses.filter(
      completedCourseId => completedCourseId.toString() !== courseId
    );

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Course progress reset successfully',
      data: {
        courseId,
        resetAt: new Date()
      }
    });

  } catch (error) {
    console.error('Reset course progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset course progress',
      error: error.message 
    });
  }
};

// Get instructor's student progress summary
const getInstructorStudentProgress = async (req, res) => {
  try {
    const instructorId = req.user._id;

    console.log('Getting student progress for instructor:', instructorId);

    // Find all courses created by this instructor
    const instructorCourses = await Course.find({ createdBy: instructorId })
      .populate('studentsEnrolled', 'name email completedLectures completedCourses');

    const progressSummary = instructorCourses.map(course => {
      const studentsProgress = course.studentsEnrolled.map(student => {
        const courseProgress = student.completedLectures.find(
          entry => entry.courseId && entry.courseId.toString() === course._id.toString()
        );

        const completedLectures = courseProgress ? courseProgress.lectureIds.length : 0;
        const totalLectures = course.lectures.length;
        const progressPercentage = totalLectures > 0 ? (completedLectures / totalLectures * 100).toFixed(2) : 0;
        const isCompleted = student.completedCourses.includes(course._id);

        return {
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          completedLectures,
          totalLectures,
          progressPercentage: progressPercentage + "%",
          isCompleted
        };
      });

      return {
        courseId: course._id,
        courseTitle: course.title,
        totalStudents: course.studentsEnrolled.length,
        studentsProgress
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalCourses: instructorCourses.length,
        progressSummary
      }
    });

  } catch (error) {
    console.error('Get instructor student progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get student progress',
      error: error.message 
    });
  }
};

module.exports = {
  markLectureCompleted,
  getCourseProgress,
  getAllUserProgress,
  resetCourseProgress,
  getInstructorStudentProgress
};
