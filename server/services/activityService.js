// services/activityService.js
const Activity = require('../models/Activity');
const Course = require('../models/Course');

class ActivityService {
  
  // Track student enrollment
  static async trackEnrollment(studentId, studentName, courseId, courseTitle, instructorId) {
    try {
      await Activity.create({
        type: 'student_enrolled',
        actor: {
          userId: studentId,
          name: studentName,
          role: 'student'
        },
        target: {
          courseId,
          courseTitle
        },
        instructor: instructorId,
        description: `${studentName} enrolled in your course "${courseTitle}"`
      });
    } catch (error) {
      console.error('Track enrollment activity error:', error);
    }
  }
  
  // Track course creation
  static async trackCourseCreation(instructorId, instructorName, courseId, courseTitle) {
    try {
      await Activity.create({
        type: 'course_created',
        actor: {
          userId: instructorId,
          name: instructorName,
          role: 'instructor'
        },
        target: {
          courseId,
          courseTitle
        },
        instructor: instructorId,
        description: `You created a new course "${courseTitle}"`
      });
    } catch (error) {
      console.error('Track course creation activity error:', error);
    }
  }
  
  // Track course completion
  static async trackCourseCompletion(studentId, studentName, courseId, courseTitle, instructorId) {
    try {
      await Activity.create({
        type: 'course_completed',
        actor: {
          userId: studentId,
          name: studentName,
          role: 'student'
        },
        target: {
          courseId,
          courseTitle
        },
        instructor: instructorId,
        description: `${studentName} completed your course "${courseTitle}"`,
        metadata: {
          completionPercentage: 100
        }
      });
    } catch (error) {
      console.error('Track course completion activity error:', error);
    }
  }
  
  // Track lecture completion
  static async trackLectureCompletion(studentId, studentName, courseId, courseTitle, lectureId, lectureTitle, instructorId) {
    try {
      await Activity.create({
        type: 'lecture_completed',
        actor: {
          userId: studentId,
          name: studentName,
          role: 'student'
        },
        target: {
          courseId,
          courseTitle,
          lectureId,
          lectureTitle
        },
        instructor: instructorId,
        description: `${studentName} completed lecture "${lectureTitle}" in "${courseTitle}"`
      });
    } catch (error) {
      console.error('Track lecture completion activity error:', error);
    }
  }
  
  // Track review addition
  static async trackReviewAdded(studentId, studentName, courseId, courseTitle, rating, instructorId) {
    try {
      await Activity.create({
        type: 'review_added',
        actor: {
          userId: studentId,
          name: studentName,
          role: 'student'
        },
        target: {
          courseId,
          courseTitle
        },
        instructor: instructorId,
        description: `${studentName} left a ${rating}-star review on "${courseTitle}"`,
        metadata: {
          rating
        }
      });
    } catch (error) {
      console.error('Track review activity error:', error);
    }
  }
}

module.exports = ActivityService;
