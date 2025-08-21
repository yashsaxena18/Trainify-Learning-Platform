const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const Course = require("../models/Course");
const ActivityService = require("../services/activityService");
const User = require("../models/User");

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    // Validate input
    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create and save the course
    let course = await Course.create({
      title,
      description,
      category,
      price,
      createdBy: req.user._id,
      views: 0, // Initialize views
      averageRating: 0,
      totalReviews: 0,
    });

    // Populate instructor name and email
    course = await course.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all courses (public access)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("createdBy", "name email")
      .populate("studentsEnrolled", "name")
      .sort({ createdAt: -1 });

    console.log("Total courses found:", courses.length);

    res.status(200).json({
      success: true,
      courses: courses.map((course) => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        thumbnail: course.thumbnail,
        lectures: course.lectures || [],
        createdBy: course.createdBy,
        studentsEnrolled: course.studentsEnrolled || [],
        reviews: course.reviews || [],
        averageRating: course.averageRating || 0,
        totalReviews: course.totalReviews || 0,
        views: course.views || 0,
        createdAt: course.createdAt,
        lastViewed: course.lastViewed,
      })),
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

// Get courses by instructor
const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({ createdBy: instructorId })
      .populate("studentsEnrolled", "name email")
      .populate("reviews.user", "name")
      .sort({ createdAt: -1 });

    // Calculate additional metrics for each course
    const coursesWithMetrics = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      studentsEnrolled: course.studentsEnrolled || [],
      lectures: course.lectures || [],
      reviews: course.reviews || [],
      averageRating: course.averageRating || 0,
      totalReviews: course.totalReviews || 0,
      views: course.views || 0,
      revenue: (course.studentsEnrolled?.length || 0) * (course.price || 0),
      enrollmentCount: course.studentsEnrolled?.length || 0,
      lectureCount: course.lectures?.length || 0,
      createdAt: course.createdAt,
      lastViewed: course.lastViewed,
    }));

    res.status(200).json({
      success: true,
      courses: coursesWithMetrics,
      totalCourses: coursesWithMetrics.length,
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
    });
  }
};

// Get instructor analytics
const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({ createdBy: instructorId })
      .populate("studentsEnrolled", "name")
      .populate("reviews.user", "name");

    // Calculate overall statistics
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.studentsEnrolled?.length || 0),
      0
    );
    const totalViews = courses.reduce(
      (sum, course) => sum + (course.views || 0),
      0
    );
    const totalRevenue = courses.reduce(
      (sum, course) =>
        sum + (course.studentsEnrolled?.length || 0) * (course.price || 0),
      0
    );

    // Calculate average rating across all courses
    const coursesWithRatings = courses.filter(
      (course) => course.reviews?.length > 0
    );
    const avgRating =
      coursesWithRatings.length > 0
        ? coursesWithRatings.reduce(
            (sum, course) => sum + (course.averageRating || 0),
            0
          ) / coursesWithRatings.length
        : 0;

    // Course performance data
    const coursePerformance = courses.map((course) => ({
      id: course._id,
      title: course.title,
      studentsCount: course.studentsEnrolled?.length || 0,
      views: course.views || 0,
      revenue: (course.studentsEnrolled?.length || 0) * (course.price || 0),
      rating: course.averageRating || 0,
      reviewsCount: course.reviews?.length || 0,
      messagesCount: 0, // Placeholder for messages functionality
    }));

    res.status(200).json({
      success: true,
      totalCourses,
      totalStudents,
      totalViews,
      avgRating: Number(avgRating.toFixed(1)),
      totalRevenue,
      coursePerformance,
      platformGrowth: 0, // Placeholder for growth calculation
    });
  } catch (error) {
    console.error("Get instructor analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

// controllers/courseController.js - Enhanced tracking
const trackCourseView = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Check if this user has viewed this course in the last 24 hours
    const recentView = userId
      ? course.viewHistory?.find(
          (view) =>
            view.userId?.toString() === userId.toString() &&
            Date.now() - view.viewedAt < 24 * 60 * 60 * 1000 // 24 hours
        )
      : null;

    // If no recent view, count it as a new view
    if (!recentView) {
      // Increment total views
      course.views = (course.views || 0) + 1;

      // Initialize viewHistory if it doesn't exist
      if (!course.viewHistory) {
        course.viewHistory = [];
      }

      // Add to view history
      course.viewHistory.push({
        userId: userId || null,
        viewedAt: new Date(),
        ipAddress,
        userAgent,
      });

      // Calculate unique views (distinct users)
      if (userId) {
        const uniqueViewers = new Set(
          course.viewHistory
            .filter((view) => view.userId)
            .map((view) => view.userId.toString())
        );
        course.uniqueViews = uniqueViewers.size;
      }

      course.lastViewed = new Date();
      await course.save();

      console.log(
        `Course ${courseId} viewed. Total views: ${course.views}, Unique: ${course.uniqueViews}`
      );
    }

    res.json({
      success: true,
      message: "View tracked",
      views: course.views,
      uniqueViews: course.uniqueViews || 0,
    });
  } catch (error) {
    console.error("Track view error:", error);
    res.status(500).json({ success: false, message: "Failed to track view" });
  }
};

// ✅ ADD: Track when someone visits the course detail page
const trackCoursePageView = async (req, res) => {
  // Track when someone visits the course detail page
  await trackCourseView(req, res);
};

// ✅ ADD: Track when someone actually starts watching a lecture
const trackCourseLectureView = async (req, res) => {
  try {
    const courseId = req.params.id;
    const lectureId = req.params.lectureId;

    console.log(
      `Tracking lecture view: Course ${courseId}, Lecture ${lectureId}`
    );

    // Track both course view and lecture-specific analytics
    await trackCourseView(req, res);

    // Additional lecture tracking logic here
    const course = await Course.findById(courseId);
    if (course) {
      // Track lecture-specific views
      const lecture = course.lectures.id(lectureId);
      if (lecture) {
        lecture.views = (lecture.views || 0) + 1;
        await course.save();
        console.log(
          `Lecture ${lectureId} in course ${courseId} viewed. Lecture views: ${lecture.views}`
        );
      }
    }
  } catch (error) {
    console.error("Track lecture view error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to track lecture view" });
  }
};

// ✅ ADD: Get course view analytics for instructors
const getCourseViewAnalytics = async (req, res) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user._id;

    const course = await Course.findOne({
      _id: courseId,
      createdBy: instructorId,
    }).populate("viewHistory.userId", "name email");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Calculate view statistics
    const totalViews = course.views || 0;
    const uniqueViews = course.uniqueViews || 0;
    const averageViewsPerUser =
      uniqueViews > 0 ? (totalViews / uniqueViews).toFixed(1) : 0;

    // Recent views (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentViews =
      course.viewHistory?.filter((view) => view.viewedAt >= thirtyDaysAgo) ||
      [];

    // Views by day (last 7 days)
    const viewsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayViews =
        course.viewHistory?.filter(
          (view) => view.viewedAt >= dayStart && view.viewedAt <= dayEnd
        ).length || 0;

      viewsByDay.push({
        date: dayStart.toISOString().split("T")[0],
        views: dayViews,
      });
    }

    res.json({
      success: true,
      analytics: {
        totalViews,
        uniqueViews,
        averageViewsPerUser,
        recentViews: recentViews.length,
        viewsByDay,
        lastViewed: course.lastViewed,
      },
    });
  } catch (error) {
    console.error("Get course analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

// Course enrollment
const enrollInCourse = async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      (enrolledId) => enrolledId.toString() === courseId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled in this course",
        alreadyEnrolled: true,
      });
    }

    // Add course to user's enrolledCourses
    user.enrolledCourses.push(courseId);

    // Add student to course's studentsEnrolled
    const isStudentInCourse = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === user._id.toString()
    );

    if (!isStudentInCourse) {
      course.studentsEnrolled.push(user._id);
    }

    // Save both user and course
    await user.save();
    await course.save();

    // Log activity
    try {
      if (ActivityService) {
        await ActivityService.logActivity({
          type: "student_enrolled",
          description: `${user.name} enrolled in "${course.title}"`,
          instructor: course.createdBy,
          actor: {
            userId: user._id,
            name: user.name,
          },
          target: {
            courseId: course._id,
            courseTitle: course.title,
          },
        });
      }
    } catch (activityError) {
      console.log("Activity logging failed:", activityError.message);
    }

    res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.title}`,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        enrolledAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Enrollment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add lecture to course
const addLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, duration, order } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Lecture title and videoUrl required",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only instructor who created it can add lectures
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can add lectures",
      });
    }

    // Create new lecture object
    const newLecture = {
      title,
      videoUrl,
      duration: duration || 0,
      order: order || course.lectures.length + 1,
    };

    // Add new lecture
    course.lectures.push(newLecture);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added successfully",
      lecture: newLecture,
      totalLectures: course.lectures.length,
    });
  } catch (error) {
    console.error("Add Lecture Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add lecture",
    });
  }
};

// Get all lectures for a course
const getAllLectures = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate("createdBy", "name");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      courseTitle: course.title,
      instructor: course.createdBy.name,
      lectures: course.lectures.sort((a, b) => (a.order || 0) - (b.order || 0)),
    });
  } catch (error) {
    console.error("Get lectures error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lectures",
    });
  }
};

// Get course progress for a user
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const totalLectures = course.lectures.length;
    const user = await User.findById(userId);

    const courseProgress = user.completedLectures.find(
      (entry) => entry.courseId?.toString() === courseId
    );

    const completed = courseProgress ? courseProgress.lectureIds.length : 0;
    const percentage =
      totalLectures > 0
        ? ((completed / totalLectures) * 100).toFixed(2)
        : "0.00";

    res.status(200).json({
      success: true,
      data: {
        courseTitle: course.title,
        completedLectures: completed,
        totalLectures,
        percentage: percentage + "%",
        completedLectureIds: courseProgress?.lectureIds || [],
        isFullyCompleted: completed === totalLectures && totalLectures > 0,
      },
    });
  } catch (error) {
    console.error("Progress Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course progress",
    });
  }
};

// Increment course views (legacy function)
const incrementCourseViews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: { views: 1 },
        lastViewed: new Date(),
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "View recorded",
      views: course.views,
    });
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record view",
    });
  }
};

// Add course review
const addCourseReview = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = course.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // Add review
    const newReview = {
      user: userId,
      rating: parseInt(rating),
      comment: comment.trim(),
    };
    course.reviews.push(newReview);

    // Recalculate average rating
    course.averageRating =
      course.reviews.reduce((sum, r) => sum + r.rating, 0) /
      course.reviews.length;
    course.totalReviews = course.reviews.length;

    await course.save();

    // Populate the new review with user data
    await course.populate("reviews.user", "name email");
    const addedReview = course.reviews[course.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: addedReview,
      courseStats: {
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
      },
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// Get course reviews
const getCourseReviews = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate("reviews.user", "name email")
      .select("reviews averageRating totalReviews title");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: course.reviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
      averageRating: course.averageRating || 0,
      totalReviews: course.totalReviews || 0,
      courseTitle: course.title,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// Update course (instructor only)
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, price } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only course creator can update
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the course creator can update this course",
      });
    }

    // Update course fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;

    await course.save();

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

// Delete course (instructor only)
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Only course creator can delete
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the course creator can delete this course",
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getInstructorCourses,
  getInstructorAnalytics,
  enrollInCourse,
  addLecture,
  getAllLectures,
  getCourseProgress,
  addCourseReview,
  getCourseReviews,
  incrementCourseViews,
  trackCourseView,
  trackCourseLectureView ,
  getCourseViewAnalytics ,
  trackCoursePageView,
  updateCourse,
  deleteCourse,
};
