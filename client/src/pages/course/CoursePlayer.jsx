// src/pages/course/CoursePlayer.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import VideoPlayer from "../../components/course/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import NotesPanel from "../../components/course/NotesPanel";

// Helper function to extract YouTube ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State
  // Notes state - should be with your other useState declarations
  const [notesOpen, setNotesOpen] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  // Course completion state
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showCertificateButton, setShowCertificateButton] = useState(false);

  // View tracking state
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [lectureViewTracked, setLectureViewTracked] = useState(new Set());

  // Review-related state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Track lecture view function
  const trackLectureView = async (courseId, lectureId) => {
    try {
      console.log(
        `📹 Tracking lecture view: Course ${courseId}, Lecture ${lectureId}`
      );
      const response = await API.post(
        `/courses/${courseId}/lectures/${lectureId}/view`
      );

      if (response.data.success) {
        console.log("✅ Lecture view tracked successfully");
        setLectureViewTracked((prev) => new Set([...prev, lectureId]));
      }
    } catch (error) {
      console.error("Failed to track lecture view:", error);
    }
  };

  // Track course page view when component loads
  useEffect(() => {
    const trackCoursePageView = async () => {
      try {
        console.log("📄 Tracking course page view for:", courseId);
        await API.post(`/courses/${courseId}/view`);
        console.log("✅ Course page view tracked");
      } catch (error) {
        console.error("Failed to track course page view:", error);
      }
    };

    if (courseId && !hasTrackedView) {
      trackCoursePageView();
      setHasTrackedView(true);
    }
  }, [courseId, hasTrackedView]);

  // Track lecture view when lecture changes
  useEffect(() => {
    const currentLectureId = lectures[currentLecture]?._id;

    if (currentLectureId && !lectureViewTracked.has(currentLectureId)) {
      const timer = setTimeout(() => {
        trackLectureView(courseId, currentLectureId);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentLecture, lectures, courseId, lectureViewTracked]);

  // FIXED: Video event handlers to pass to VideoPlayer
  const handleVideoPlay = () => {
    const currentLectureId = lectures[currentLecture]?._id;
    if (currentLectureId && !lectureViewTracked.has(currentLectureId)) {
      console.log("▶️ Video started playing, tracking lecture view");
      trackLectureView(courseId, currentLectureId);
    }
  };

  const handleVideoTimeUpdate = (event) => {
    const currentTime = event.target.currentTime;
    const currentLectureId = lectures[currentLecture]?._id;

    if (
      currentTime > 10 &&
      currentLectureId &&
      !lectureViewTracked.has(currentLectureId)
    ) {
      console.log("⏱️ 10+ seconds watched, tracking lecture view");
      trackLectureView(courseId, currentLectureId);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkReviewStatus();
    }
  }, [courseId]);

  // Enhanced completion detection
  useEffect(() => {
    console.log("🔍 Progress state updated:", progress);

    if (!progress || Object.keys(progress).length === 0) {
      console.log("⏳ No progress data available");
      return;
    }

    const checks = {
      percentageString:
        progress.percentage === "100%" || progress.percentage === "100.00%",
      percentageNumber:
        progress.percentage === 100 ||
        parseFloat(progress.percentage || 0) >= 100,
      lecturesComplete:
        progress.completedLectures >= progress.totalLectures &&
        progress.totalLectures > 0,
      allLecturesMarked:
        progress.completedLectureIds &&
        lectures.length > 0 &&
        progress.completedLectureIds.length >= lectures.length,
      explicitComplete:
        progress.isCompleted === true || progress.isFullyCompleted === true,
    };

    const isCompleted = Object.values(checks).some((check) => check === true);

    console.log("📊 Completion analysis:", {
      progressData: progress,
      checks,
      finalResult: isCompleted,
      lecturesLength: lectures.length,
    });

    if (isCompleted) {
      console.log("🎉 Course is completed! Setting up completion state...");
      setShowCertificateButton(true);
      setCanReview(true);

      if (!showCongratulations && !justCompleted) {
        setJustCompleted(true);
        setShowCongratulations(true);
      }
    } else {
      console.log("⏳ Course not yet completed");
      setShowCertificateButton(false);
      setCanReview(false);
    }
  }, [progress, lectures, showCongratulations, justCompleted]);

  const fetchCourseData = async () => {
    try {
      console.log("📚 Fetching course data...");
      const [lecturesRes, progressRes] = await Promise.all([
        API.get(`/courses/${courseId}/lectures`),
        API.get(`/courses/progress/${courseId}`),
      ]);

      console.log("📖 Lectures response:", lecturesRes.data);
      console.log("📈 Progress response:", progressRes.data);

      const lecturesData = lecturesRes.data.lectures || lecturesRes.data || [];
      setLectures(lecturesData);

      let progressData = {};

      if (progressRes.data.success && progressRes.data.data) {
        progressData = progressRes.data.data;
      } else if (progressRes.data.success) {
        progressData = progressRes.data;
      } else {
        progressData = progressRes.data;
      }

      console.log("✅ Processed progress data:", progressData);
      setProgress(progressData);

      setCourse({
        title: lecturesRes.data.courseTitle || "Course Title",
        instructor: lecturesRes.data.instructor || "Instructor",
      });
    } catch (error) {
      console.error("Failed to load course data:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const checkReviewStatus = async () => {
    try {
      console.log("🔍 Checking review status...");
      const [reviewsRes, userRes] = await Promise.all([
        API.get(`/courses/${courseId}/reviews`),
        API.get("/users/me"),
      ]);

      const userData = userRes.data.user || userRes.data;
      const reviews = reviewsRes.data.reviews || [];

      const existingReview = reviews.find(
        (review) =>
          review.user._id === userData._id || review.user === userData._id
      );

      console.log("📝 Has user reviewed?", !!existingReview);
      setHasReviewed(!!existingReview);
    } catch (error) {
      console.error("Failed to check review status:", error);
    }
  };

  const markLectureComplete = async (lectureId) => {
    try {
      console.log("✅ Marking lecture complete:", lectureId);
      console.log("📊 Current progress before completion:", progress);

      const previousPercentage = progress.percentage;
      const previousCompleted = progress.completedLectures || 0;
      const wasCompleted =
        previousPercentage === "100%" ||
        previousPercentage === "100.00%" ||
        previousPercentage === 100;

      console.log("📊 Previous state:", {
        previousPercentage,
        previousCompleted,
        wasCompleted,
      });

      const markResponse = await API.post(
        `/progress/${courseId}/lectures/${lectureId}/complete`
      );
      console.log("📝 Mark complete response:", markResponse.data);

      toast.success("🎉 Lecture marked as complete!", {
        duration: 3000,
        style: {
          background: "#10B981",
          color: "white",
          fontWeight: "bold",
        },
      });

      let attempts = 0;
      let newProgress = null;

      while (attempts < 3 && !newProgress) {
        try {
          console.log(
            `🔄 Fetching updated progress (attempt ${attempts + 1})...`
          );

          if (attempts > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          const progressRes = await API.get(`/courses/progress/${courseId}`);
          console.log(
            `📈 Progress response attempt ${attempts + 1}:`,
            progressRes.data
          );

          if (progressRes.data.success && progressRes.data.data) {
            newProgress = progressRes.data.data;
          } else if (progressRes.data.success) {
            newProgress = progressRes.data;
          } else {
            newProgress = progressRes.data;
          }

          if (newProgress && typeof newProgress === "object") {
            break;
          }
        } catch (error) {
          console.error(
            `❌ Progress fetch attempt ${attempts + 1} failed:`,
            error
          );
        }
        attempts++;
      }

      if (newProgress) {
        console.log("✅ Successfully fetched new progress:", newProgress);
        setProgress(newProgress);

        const newPercentage = newProgress.percentage;
        const newCompleted = newProgress.completedLectures || 0;
        const newTotal = newProgress.totalLectures || lectures.length;

        const isNowCompleted =
          newPercentage === "100%" ||
          newPercentage === "100.00%" ||
          newPercentage === 100 ||
          parseFloat(newPercentage || 0) >= 100 ||
          (newCompleted >= newTotal && newTotal > 0) ||
          newProgress.isCompleted === true ||
          newProgress.isFullyCompleted === true;

        console.log("🎯 New completion analysis:", {
          newPercentage,
          newCompleted,
          newTotal,
          isNowCompleted,
          justCompleted: isNowCompleted && !wasCompleted,
        });

        if (isNowCompleted && !wasCompleted) {
          console.log("🎉 COURSE JUST COMPLETED! Triggering celebration...");

          setShowCertificateButton(true);
          setCanReview(true);
          setJustCompleted(true);
          setShowCongratulations(true);

          setTimeout(() => {
            checkReviewStatus();
          }, 1000);
        }
      } else {
        console.error(
          "❌ Failed to fetch updated progress after multiple attempts"
        );
        toast.error("Failed to update progress. Please refresh the page.");
      }
    } catch (error) {
      console.error("Failed to mark lecture complete:", error);
      toast.error("Failed to mark lecture complete");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/student/dashboard");
  };

  // Modern Review Modal
  const ReviewModal = () => {
    const [localRating, setLocalRating] = useState(5);
    const [localComment, setLocalComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!localRating) {
        toast.error("Please select a star rating");
        return;
      }

      if (!localComment.trim()) {
        toast.error("Please write a comment");
        return;
      }

      try {
        setSubmitting(true);
        console.log("📝 Submitting review:", {
          rating: localRating,
          comment: localComment,
        });

        const response = await API.post(`/courses/${courseId}/review`, {
          rating: localRating,
          comment: localComment.trim(),
        });

        console.log("📝 Review response:", response.data);

        if (response.data.success) {
          toast.success("🌟 Review submitted successfully!", {
            duration: 4000,
            style: {
              background: "#3B82F6",
              color: "white",
              fontWeight: "bold",
            },
          });
          setShowReviewModal(false);
          setCanReview(false);
          setHasReviewed(true);
          setLocalRating(5);
          setLocalComment("");
        }
      } catch (error) {
        console.error("Failed to submit review:", error);
        toast.error(error.response?.data?.message || "Failed to submit review");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full shadow-2xl border border-white/20 mx-2 sm:mx-0 max-h-[95vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <div className="text-center mb-4 sm:mb-6">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2">
              Rate Your Experience
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              How was "{course?.title}"?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Your Rating
              </label>
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setLocalRating(star)}
                    className={`text-3xl sm:text-4xl transition-all duration-200 cursor-pointer ${
                      star <= localRating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {localRating > 0
                  ? `${localRating} out of 5 stars`
                  : "Click to rate"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Your Review
              </label>
              <textarea
                rows={3}
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-medium text-sm sm:text-base"
                placeholder="Share your experience with this course..."
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">
                {localComment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
              <motion.button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setLocalRating(5);
                  setLocalComment("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-colors text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={submitting || !localRating || !localComment.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span className="hidden xs:inline">Submitting...</span>
                    <span className="xs:hidden">...</span>
                  </div>
                ) : (
                  "✨ Submit Review"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  // Modern Congratulations Modal
  const CongratulationsModal = () => (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-4 text-center shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <div className="mb-6 sm:mb-8">
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🎉 Congratulations!
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            You have successfully completed:
          </motion.p>
          <motion.p
            className="text-lg sm:text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-4 sm:mb-6 px-2 sm:px-4 break-words"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            "{course?.title}"
          </motion.p>
          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs sm:text-sm text-green-700 font-bold break-words">
              ✅ Progress: {progress.percentage} • {progress.completedLectures}/
              {progress.totalLectures} lectures completed
            </p>
          </motion.div>
          <motion.p
            className="text-xs sm:text-sm text-gray-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            🏆 You've earned a certificate of completion!
          </motion.p>
        </div>

        <motion.div
          className="space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {!hasReviewed && (
            <motion.button
              onClick={() => {
                setShowCongratulations(false);
                setShowReviewModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span className="truncate">⭐ Rate This Course</span>
            </motion.button>
          )}

          <motion.button
            onClick={() => {
              setShowCongratulations(false);
              navigate("/student/dashboard", {
                state: { activeTab: "certificates" },
              });
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="truncate">🏆 Download Certificate</span>
          </motion.button>

          <motion.button
            onClick={() => setShowCongratulations(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Learning
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full shadow-2xl"></div>
          <div className="absolute inset-3 sm:inset-4 border-4 border-transparent border-b-pink-400 border-l-yellow-400 rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!lectures.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-900 p-4">
        <motion.div
          className="text-center p-4 sm:p-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📚</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            No Lectures Available
          </h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg">
            This course doesn't have any lectures yet.
          </p>
          <motion.button
            onClick={handleBackToDashboard}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg w-full sm:w-auto"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Modern Course Header */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <motion.button
                onClick={handleBackToDashboard}
                className="text-white/90 hover:text-white mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm font-medium bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm border border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </motion.button>
              <motion.h1
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-2 line-clamp-2 break-words"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {course?.title}
              </motion.h1>
              <motion.div
                className="flex flex-col gap-2 text-xs sm:text-sm text-blue-100"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/10 rounded-full px-3 sm:px-4 py-1 backdrop-blur-sm inline-block w-fit">
                  <span className="font-bold">
                    Progress: {progress.percentage || "0%"}
                  </span>
                </div>
                <div className="bg-white/10 rounded-full px-3 sm:px-4 py-1 backdrop-blur-sm inline-block w-fit">
                  <span>
                    {progress.completedLectures || 0} of{" "}
                    {progress.totalLectures || lectures.length} lectures
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Certificate/Review Section */}
          {showCertificateButton && (
            <motion.div
              className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30 rounded-xl sm:rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg sm:text-xl text-white">
                      Course Completed! 🎉
                    </h3>
                    <p className="text-green-200 font-medium text-sm sm:text-base">
                      You've earned a certificate of completion
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  {!hasReviewed && (
                    <motion.button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Rate Course</span>
                      <span className="sm:hidden">Rate</span>
                    </motion.button>
                  )}

                  {hasReviewed && (
                    <div className="bg-white/10 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-white/20">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Reviewed ✓
                    </div>
                  )}

                  <motion.button
                    onClick={() =>
                      navigate("/student/dashboard", {
                        state: { activeTab: "certificates" },
                      })
                    }
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Get Certificate</span>
                    <span className="sm:hidden">Certificate</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <motion.div
          className="flex-1 p-3 sm:p-4 lg:p-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {lectures[currentLecture] && (
            <motion.div
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-video w-full relative">
                {getYouTubeId(lectures[currentLecture].videoUrl) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(
                      lectures[currentLecture].videoUrl
                    )}?enablejsapi=1&origin=${window.location.origin}`}
                    className="w-full h-full rounded-t-2xl sm:rounded-t-3xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lectures[currentLecture].title}
                    onLoad={handleVideoPlay}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-2xl sm:rounded-t-3xl">
                    <div className="text-center p-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <svg
                          className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"
                          />
                        </svg>
                      </motion.div>
                      <p className="text-gray-300 font-medium text-sm sm:text-base">
                        Invalid video URL
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-4 sm:p-6 backdrop-blur-sm border-t border-white/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 line-clamp-2 break-words">
                  {lectures[currentLecture].title}
                </h2>
                <p className="text-cyan-200 font-medium text-sm sm:text-base">
                  Lecture {currentLecture + 1} of {lectures.length}
                </p>
              </div>
            </motion.div>
          )}

          {/* Enhanced Navigation */}
          <motion.div
            className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setCurrentLecture(Math.max(0, currentLecture - 1))}
              disabled={currentLecture === 0}
              className="flex-1 sm:flex-none bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-800 disabled:to-gray-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </motion.button>

            <motion.button
              onClick={() => markLectureComplete(lectures[currentLecture]._id)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Mark Complete</span>
              <span className="sm:hidden">Complete</span>
            </motion.button>

            <motion.button
              onClick={() =>
                setCurrentLecture(
                  Math.min(lectures.length - 1, currentLecture + 1)
                )
              }
              disabled={currentLecture === lectures.length - 1}
              className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-800 disabled:to-gray-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Sidebar */}
        <motion.div
          className="w-full lg:w-80 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-t lg:border-l lg:border-t-0 border-white/20 p-3 sm:p-4 lg:p-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="lg:hidden mb-4 sm:mb-6">
            <div className="space-y-2 sm:space-y-3">
              {/* Course Content Toggle */}
              <motion.button
                onClick={() => setShowSidebar(!showSidebar)}
                className="w-full bg-white/10 hover:bg-white/20 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all duration-300 border border-white/20 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-bold text-white text-sm sm:text-base">
                  📚 Course Content
                </span>
                <motion.svg
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-white transform transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: showSidebar ? 180 : 0 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.button>

              {/* Notes Button for Mobile */}
              <motion.button
                onClick={() => setNotesOpen((prev) => !prev)}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all duration-300 border text-white font-bold text-sm sm:text-base ${
                  notesOpen
                    ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/50"
                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl">📝</span>
                  <span>{notesOpen ? "Close Notes" : "Open Notes"}</span>
                </div>
                {hasNotes && !notesOpen && (
                  <motion.div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {(showSidebar || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:opacity-100 lg:h-auto"
              >
                {/* Notes Button + Course Content Header */}
                <div className="hidden lg:block mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-black text-lg sm:text-xl text-white flex items-center gap-2">
                      📚 Course Content
                    </h3>
                    <motion.button
                      onClick={() => setNotesOpen((prev) => !prev)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold ${
                        notesOpen
                          ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={notesOpen ? "Close Notes" : "Open Notes"}
                    >
                      <span className="text-sm sm:text-base">📝</span>
                      <span>{notesOpen ? "Close" : "Notes"}</span>
                      {hasNotes && !notesOpen && (
                        <motion.div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 lg:max-h-none overflow-y-auto custom-scrollbar">
                  {lectures.map((lecture, index) => (
                    <motion.div
                      key={lecture._id}
                      onClick={() => {
                        setCurrentLecture(index);
                        setShowSidebar(false);
                      }}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 border ${
                        index === currentLecture
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/50 shadow-lg"
                          : "hover:bg-white/10 border-white/10 hover:border-white/20"
                      }`}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <motion.div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 ${
                            progress.completedLectureIds?.includes(lecture._id)
                              ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                              : index === currentLecture
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                              : "bg-white/20 text-white border border-white/30"
                          }`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {progress.completedLectureIds?.includes(lecture._id)
                            ? "✓"
                            : index + 1}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-bold text-white text-xs sm:text-sm line-clamp-2 break-words">
                            {lecture.title}
                          </span>
                          {index === currentLecture && (
                            <motion.span
                              className="text-xs text-cyan-300 font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              Now Playing
                            </motion.span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {lectureViewTracked.has(lecture._id) && (
                            <motion.div
                              className="text-purple-400 text-sm sm:text-base"
                              title="View tracked"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              👁️
                            </motion.div>
                          )}
                          {index === currentLecture && (
                            <motion.div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReviewModal && <ReviewModal />}
        {showCongratulations && <CongratulationsModal />}
      </AnimatePresence>
      {/* Notes Panel */}
      <AnimatePresence>
        {notesOpen && (
          <NotesPanel
            courseId={courseId}
            isOpen={notesOpen}
            onToggle={() => setNotesOpen(false)}
            onNotesChange={(hasContent) => setHasNotes(hasContent)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;
