// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'student_enrolled',
      'course_created',
      'course_completed',
      'lecture_completed',
      'review_added',
      'course_updated'
    ]
  },
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    role: String
  },
  target: {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseTitle: String,
    lectureId: String,
    lectureTitle: String
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The instructor who should see this activity
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    rating: Number,
    progress: Number,
    completionPercentage: Number
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
activitySchema.index({ instructor: 1, createdAt: -1 });
activitySchema.index({ isRead: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
