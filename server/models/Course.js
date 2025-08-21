// models/Course.js  (UPDATED with full view-tracking – still NO category field)
const mongoose = require('mongoose');

/* ------------------------------------------------------------------ */
/* Lecture Sub-schema – now contains its own views counter            */
/* ------------------------------------------------------------------ */
const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,            // minutes
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    /*  individual lecture views */
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/* Review Sub-schema                                                  */
/* ------------------------------------------------------------------ */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/* View-history Sub-schema                                            */
/* ------------------------------------------------------------------ */
const viewHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // may be null for guest
    viewedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
  },
  { _id: false }
);

/* ------------------------------------------------------------------ */
/* Main Course Schema                                                 */
/* ------------------------------------------------------------------ */
const courseSchema = new mongoose.Schema(
  {
    /* ---------- BASIC FIELDS ---------- */
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // (category intentionally left out)
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },

    /* ---------- LECTURES / CREATOR ---------- */
    lectures: [lectureSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    /* ---------- ENROLMENT / REVIEWS ---------- */
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    /* ---------- VIEW-TRACKING ---------- */
    views: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
    },
    viewHistory: [viewHistorySchema],
    lastViewed: {
      type: Date,
      default: Date.now,
    },

    /* ---------- COURSE EXTRAS ---------- */
    requirements: [String],
    objectives: [String],
    tags: [String],

    /* ---------- ANALYTICS ---------- */
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalWatchTime: {
      type: Number, // minutes watched by all students
      default: 0,
    },
    completionRate: {
      type: Number, // %
      default: 0,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/* Pre-save middleware                                                */
/* ------------------------------------------------------------------ */
courseSchema.pre('save', function (next) {
  /* Average rating + review count */
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Number((sum / this.reviews.length).toFixed(1));
    this.totalReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }

  /* Revenue = enrolled students * price */
  this.totalRevenue = (this.studentsEnrolled?.length || 0) * this.price;
  next();
});

/* ------------------------------------------------------------------ */
/* Helpful Indexes                                                    */
/* ------------------------------------------------------------------ */
courseSchema.index({ createdBy: 1 });
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ views: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ isApproved: 1 });

/* ------------------------------------------------------------------ */
/* Export Model                                                       */
/* ------------------------------------------------------------------ */
module.exports = mongoose.model('Course', courseSchema);
