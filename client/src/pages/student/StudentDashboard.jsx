// src/pages/student/StudentDashboard.jsx - Complete AI-Integrated Version
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CertificatesSection from "../../components/certificates/CertificatesSection";
import PaymentModal from "../../components/payment/PaymentModal";

// AI COMPONENTS IMPORT
import ChatbotTutor from "../../components/AI/ChatbotTutor";
import DoubtSolver from "../../components/AI/DoubtSolver";
import QuizMaker from "../../components/AI/QuizMaker";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // AI ASSISTANT STATE
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeAIFeature, setActiveAIFeature] = useState("chatbot");

  // State management
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [certificateStatus, setCertificateStatus] = useState({});
  const [courseProgress, setCourseProgress] = useState([]);
  const [completionStats, setCompletionStats] = useState({
    totalEnrolled: 0,
    totalCompleted: 0,
    completionRate: "0%",
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalProgress: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    totalStudyTime: 0,
    totalLecturesCompleted: 0,
    totalLecturesAcrossAllCourses: 0,
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    courseId: null,
    courseName: "",
    coursePrice: 499,
  });

  // AI FEATURES CONFIGURATION
  const aiFeatures = [
    {
      id: "chatbot",
      name: "AI Tutor Chat",
      icon: "🤖",
      description: "Get instant help with programming concepts",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "doubt-solver",
      name: "Code Debugger",
      icon: "🔍",
      description: "Debug your code and fix errors instantly",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "quiz",
      name: "Smart Quizzes",
      icon: "📝",
      description: "Generate personalized quizzes on any topic",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  // Fetch all progress data with proper error handling
  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        console.log("📊 Fetching all progress data...");
        const response = await API.get("/progress/");
        console.log("📈 Progress response:", response.data);

        if (response.data.success) {
          const progressData = response.data.data.courseProgress || [];
          const statsData = {
            totalEnrolled: response.data.data.totalEnrolledCourses || 0,
            totalCompleted: response.data.data.totalCompletedCourses || 0,
            completionRate: response.data.data.overallCompletionRate || "0%",
          };

          console.log("✅ Setting course progress:", progressData);
          console.log("✅ Setting completion stats:", statsData);

          setCourseProgress(progressData);
          setCompletionStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
        setCourseProgress([]);
        setCompletionStats({
          totalEnrolled: 0,
          totalCompleted: 0,
          completionRate: "0%",
        });
      }
    };
    fetchAllProgress();
  }, []);

  useEffect(() => {
    fetchStudentData();

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      toast.success(
        "🎉 Course completed! Your certificate is ready for download."
      );
    }
  }, [location.state]);

  useEffect(() => {
    calculateDashboardStats();
  }, [
    enrolledCourses,
    userProgress,
    certificateStatus,
    courseProgress,
    completionStats,
  ]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [userResponse, coursesResponse] = await Promise.all([
        API.get("/users/me"),
        API.get("/courses"),
      ]);

      const userData = userResponse.data.user || userResponse.data;
      const coursesData =
        coursesResponse.data.courses || coursesResponse.data || [];

      setEnrolledCourses(userData.enrolledCourses || []);
      setAvailableCourses(coursesData);

      if (userData.enrolledCourses && userData.enrolledCourses.length > 0) {
        await fetchProgressData(userData.enrolledCourses);
        await checkCertificateStatus(userData.enrolledCourses);
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async (courses) => {
    const progressPromises = courses.map(async (course) => {
      try {
        const courseId = typeof course === "string" ? course : course._id;
        const response = await API.get(`/progress/${courseId}`);
        if (response.data.success) {
          return { courseId, progress: response.data.data };
        }
        return { courseId, progress: null };
      } catch (error) {
        const courseId = typeof course === "string" ? course : course._id;
        console.error(`Error fetching progress for course ${courseId}:`, error);
        return { courseId, progress: null };
      }
    });

    const progressResults = await Promise.all(progressPromises);
    const progressMap = {};
    progressResults.forEach(({ courseId, progress }) => {
      progressMap[courseId] = progress;
    });
    setUserProgress(progressMap);
  };

  const checkCertificateStatus = async (courses) => {
    const statusPromises = courses.map(async (course) => {
      try {
        const courseId = typeof course === "string" ? course : course._id;
        const response = await API.get(`/certificate/check/${courseId}`);
        return { courseId, status: response.data };
      } catch (error) {
        console.log(error);
        const courseId = typeof course === "string" ? course : course._id;
        return { courseId, status: { isCompleted: false } };
      }
    });

    const statusResults = await Promise.all(statusPromises);
    const statusMap = {};
    statusResults.forEach(({ courseId, status }) => {
      statusMap[courseId] = status;
    });
    setCertificateStatus(statusMap);
  };

  const calculateDashboardStats = () => {
    try {
      if (!enrolledCourses || enrolledCourses.length === 0) {
        setDashboardStats({
          totalProgress: 0,
          completedCourses: 0,
          certificatesEarned: 0,
          totalStudyTime: 0,
          totalLecturesCompleted: 0,
          totalLecturesAcrossAllCourses: 0,
        });
        return;
      }

      let totalLecturesCompleted = 0;
      let totalLecturesAcrossAllCourses = 0;
      let completedCourses = 0;
      let certificatesEarned = 0;

      if (courseProgress && courseProgress.length > 0) {
        courseProgress.forEach((progress) => {
          totalLecturesCompleted += progress.completedLectures || 0;
          totalLecturesAcrossAllCourses += progress.totalLectures || 0;

          if (
            progress.isCompleted ||
            progress.percentage === "100%" ||
            progress.percentage === "100.00%"
          ) {
            completedCourses++;
          }
        });
      } else {
        enrolledCourses.forEach((course) => {
          const courseId = course._id || course;
          const courseProgressData = userProgress[courseId];
          const certStatus = certificateStatus[courseId];

          if (courseProgressData) {
            totalLecturesCompleted += courseProgressData.completedLectures || 0;
            totalLecturesAcrossAllCourses +=
              courseProgressData.totalLectures || 0;

            const isCompleted =
              courseProgressData.percentage === "100%" ||
              courseProgressData.percentage === "100.00%";

            if (isCompleted) {
              completedCourses++;
              if (certStatus && certStatus.isCompleted) {
                certificatesEarned++;
              }
            }
          }
        });
      }

      if (completionStats.totalCompleted > 0) {
        completedCourses = completionStats.totalCompleted;
      }

      const totalProgress =
        totalLecturesAcrossAllCourses > 0
          ? Math.round(
              (totalLecturesCompleted / totalLecturesAcrossAllCourses) * 100
            )
          : 0;

      const estimatedStudyTime = Math.round((totalLecturesCompleted * 10) / 60);

      setDashboardStats({
        totalProgress,
        completedCourses,
        certificatesEarned,
        totalStudyTime: estimatedStudyTime,
        totalLecturesCompleted,
        totalLecturesAcrossAllCourses,
      });
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      setDashboardStats({
        totalProgress: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        totalStudyTime: 0,
        totalLecturesCompleted: 0,
        totalLecturesAcrossAllCourses: 0,
      });
    }
  };

  const handleEnrollment = (course) => {
    setPaymentModal({
      isOpen: true,
      courseId: course._id,
      courseName: course.title,
      coursePrice: course.price || 499,
    });
  };

  const processEnrollmentAfterPayment = async (courseId) => {
    try {
      console.log("Starting enrollment for course:", courseId);

      const response = await API.post(`/courses/${courseId}/enroll`);

      if (response.data && response.data.success) {
        if (response.data.alreadyEnrolled) {
          toast.info("You are already enrolled in this course");
        } else {
          toast.success(response.data.message || "Successfully enrolled!");
        }
        await fetchStudentData();
      } else {
        toast.error(response.data?.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Enrollment error:", error);

      if (error.response?.status === 200 && error.response?.data?.success) {
        toast.success(error.response.data.message || "Successfully enrolled!");
        await fetchStudentData();
      } else {
        if (
          error.response?.status === 500 &&
          error.response?.data?.message?.includes("not a valid enum value")
        ) {
          toast.error("Course category not supported. Please contact support.");
        } else {
          toast.error(
            error.response?.data?.message ||
              "Enrollment failed. Please try again."
          );
        }
      }
    }
  };

  const filteredAvailableCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isNotEnrolled = !enrolledCourses.some(
      (enrolled) => enrolled._id === course._id
    );

    return matchesSearch && isNotEnrolled;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-32 h-32 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full shadow-2xl"></div>
          <div className="absolute inset-4 border-4 border-transparent border-b-pink-400 border-l-yellow-400 rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* AI ASSISTANT FLOATING BUTTON */}
      <motion.button
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-2xl text-white z-50 hover:shadow-cyan-500/25"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          🤖
        </motion.div>

        {/* Pulsing ring effect */}
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400 rounded-full"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      </motion.button>

      {/* AI ASSISTANT MODAL */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAIAssistant(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* AI Modal Header */}
              <div className="p-6 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 backdrop-blur-xl border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      🤖 AI Learning Assistant
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Your personal AI tutor for coding and learning
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* AI Feature Navigation */}
              <div className="p-6 border-b border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiFeatures.map((feature, index) => (
                    <motion.button
                      key={feature.id}
                      onClick={() => setActiveAIFeature(feature.id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        activeAIFeature === feature.id
                          ? `bg-gradient-to-r ${feature.gradient} text-white border-white/30 shadow-lg`
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{feature.name}</h3>
                      <p className="text-xs opacity-90">
                        {feature.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* AI Feature Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeAIFeature === "chatbot" && (
                    <motion.div
                      key="chatbot"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="ai-chatbot-container"
                    >
                      <ChatbotTutor userId={user?._id} />
                    </motion.div>
                  )}
                  {activeAIFeature === "doubt-solver" && (
                    <motion.div
                      key="doubt-solver"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="ai-doubt-solver-container"
                    >
                      <DoubtSolver userId={user?._id} />
                    </motion.div>
                  )}
                  {activeAIFeature === "quiz" && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="ai-quiz-maker-container"
                    >
                      <QuizMaker userId={user?._id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Header */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1
                className="text-4xl font-black text-white mb-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎓 Learning Dashboard
              </motion.h1>
              <motion.p
                className="text-blue-100 text-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back,{" "}
                <span className="font-bold text-yellow-300">{user?.name}</span>!
                Continue your amazing journey.
              </motion.p>
              {completionStats.totalEnrolled > 0 && (
                <motion.p
                  className="text-sm text-cyan-200 mt-3 bg-white/10 rounded-full px-4 py-2 inline-block backdrop-blur-sm"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  🏆 Overall completion:{" "}
                  <span className="font-bold">
                    {completionStats.completionRate}
                  </span>
                  ({completionStats.totalCompleted} of{" "}
                  {completionStats.totalEnrolled} courses)
                </motion.p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* AI ASSISTANT HEADER BUTTON */}
              <motion.button
                onClick={() => setShowAIAssistant(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg text-sm md:text-base"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-md">🤖</span>
                AI Assistant
              </motion.button>
              <motion.div
                className="text-center md:text-right bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-sm text-blue-100">Total Progress</div>
                <div className="text-3xl md:text-4xl font-black text-white">
                  {dashboardStats.totalProgress}%
                </div>
                <div className="text-xs pt-3 text-cyan-200">
                  {dashboardStats.totalLecturesCompleted} of{" "}
                  {dashboardStats.totalLecturesAcrossAllCourses} lectures
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex space-x-1 pt-6 bg-white/5 rounded-b-2xl backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            {
              id: "overview",
              name: "📊 Overview",
              color: "from-blue-500 to-cyan-500",
            },
            {
              id: "courses",
              name: "📚 My Courses",
              color: "from-purple-500 to-pink-500",
            },
            {
              id: "browse",
              name: "🔍 Browse",
              color: "from-emerald-500 to-teal-500",
            },
            {
              id: "certificates",
              name: "🏆 Certificates",
              color: "from-yellow-500 to-orange-500",
            },
            {
              id: "progress",
              name: "📈 Progress",
              color: "from-indigo-500 to-purple-500",
            },
            {
              id: "ai-assistant",
              name: "🤖 AI Assistant",
              color: "from-cyan-500 to-blue-500",
            },
          ].map(({ id, name, color }) => (
            <motion.button
              key={id}
              onClick={() => {
                setActiveTab(id);
              }}
              className={`relative px-6 py-4 rounded-t-2xl font-bold text-sm transition-all duration-300 ${
                activeTab === id
                  ? `bg-gradient-to-r ${color} text-white shadow-2xl transform scale-105`
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-t-2xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{name}</span>
              {id === "ai-assistant" && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Modern Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                  title="Enrolled Courses"
                  value={enrolledCourses.length}
                  icon="📚"
                  gradient="from-blue-500 to-cyan-500"
                  subtitle={`${dashboardStats.totalLecturesAcrossAllCourses} total lectures`}
                  delay={0.1}
                />
                <ModernStatCard
                  title="Completed Courses"
                  value={dashboardStats.completedCourses}
                  icon="✅"
                  gradient="from-green-500 to-emerald-500"
                  subtitle={`${dashboardStats.totalLecturesCompleted} lectures done`}
                  delay={0.2}
                />
                <ModernStatCard
                  title="Certificates Earned"
                  value={dashboardStats.certificatesEarned}
                  icon="🏆"
                  gradient="from-purple-500 to-pink-500"
                  subtitle={`${
                    dashboardStats.completedCourses -
                    dashboardStats.certificatesEarned
                  } pending`}
                  delay={0.3}
                />
                <ModernStatCard
                  title="Study Time"
                  value={`${dashboardStats.totalStudyTime}h`}
                  icon="⏰"
                  gradient="from-orange-500 to-red-500"
                  subtitle="Estimated learning time"
                  delay={0.4}
                />
              </div>

              {/* Learning Overview Card */}
              {completionStats.totalEnrolled > 0 && (
                <motion.div
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    Learning Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        label: "Total Enrolled",
                        value: completionStats.totalEnrolled,
                        color: "text-blue-400",
                        bg: "from-blue-500/20 to-cyan-500/20",
                      },
                      {
                        label: "Completed",
                        value: completionStats.totalCompleted,
                        color: "text-green-400",
                        bg: "from-green-500/20 to-emerald-500/20",
                      },
                      {
                        label: "Completion Rate",
                        value: completionStats.completionRate,
                        color: "text-purple-400",
                        bg: "from-purple-500/20 to-pink-500/20",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className={`text-center p-6 rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/10`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className={`text-4xl font-black ${stat.color}`}>
                          {stat.value}
                        </div>
                        <div className="text-gray-300 font-medium">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Continue Learning Section */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">🚀</span>
                    Continue Learning
                  </h2>
                </div>
                <div className="p-8">
                  {enrolledCourses.length === 0 ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="text-8xl mb-6">📚</div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        No enrolled courses yet
                      </h3>
                      <p className="text-gray-300 mb-8 text-lg">
                        Start your learning journey by enrolling in a course.
                      </p>
                      <motion.button
                        onClick={() => setActiveTab("browse")}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🔍 Browse Courses
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                      {enrolledCourses.slice(0, 4).map((course, index) => (
                        <ModernEnrolledCourseCard
                          key={course._id}
                          course={course}
                          progress={userProgress[course._id]}
                          onProgressUpdate={fetchStudentData}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === "ai-assistant" && (
            <motion.div
              key="ai-assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* AI Assistant Page Header */}
              <motion.div
                className="bg-gradient-to-br from-slate-800 via-purple-900 to-indigo-900 rounded-3xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-white flex items-center gap-4 mb-3">
                      <span className="text-5xl">🤖</span>
                      AI Learning Assistant
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Your personal AI tutor for coding and learning - Available
                      24/7
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Online & Ready</span>
                      </div>
                      <div className="text-cyan-200 text-sm">
                        🎯 Personalized • 💡 Interactive • 🚀 Instant Help
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="text-8xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    🧠
                  </motion.div>
                </div>
              </motion.div>

              {/* AI Feature Navigation */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                  {aiFeatures.map((feature, index) => (
                    <motion.button
                      key={feature.id}
                      onClick={() => setActiveAIFeature(feature.id)}
                      className={`p-6 rounded-2xl border transition-all duration-300 ${
                        activeAIFeature === feature.id
                          ? `bg-gradient-to-r ${feature.gradient} text-white border-white/30 shadow-lg scale-105`
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-bold text-lg mb-2">{feature.name}</h3>
                      <p className="text-sm opacity-90">
                        {feature.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* AI Feature Content Container */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="p-8 min-h-[600px]">
                  <AnimatePresence mode="wait">
                    {activeAIFeature === "chatbot" && (
                      <motion.div
                        key="chatbot"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                            <span className="text-3xl">🤖</span>
                            AI Tutor Chat
                          </h3>
                          <p className="text-gray-300">
                            Get instant help with programming concepts and
                            coding questions
                          </p>
                        </div>
                        <ChatbotTutor userId={user?._id} />
                      </motion.div>
                    )}

                    {activeAIFeature === "doubt-solver" && (
                      <motion.div
                        key="doubt-solver"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                            <span className="text-3xl">🔍</span>
                            Code Debugger
                          </h3>
                          <p className="text-gray-300">
                            Debug your code and fix errors with AI assistance
                          </p>
                        </div>
                        <DoubtSolver userId={user?._id} />
                      </motion.div>
                    )}

                    {activeAIFeature === "quiz" && (
                      <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                            <span className="text-3xl">📝</span>
                            Smart Quizzes
                          </h3>
                          <p className="text-gray-300">
                            Generate personalized quizzes on any topic you're
                            learning
                          </p>
                        </div>
                        <QuizMaker userId={user?._id} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* My Courses Tab */}
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-purple-600/50 to-pink-600/50 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📚</span>
                  My Courses ({enrolledCourses.length})
                </h2>
              </div>
              <div className="p-8">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-8xl mb-6">📚</div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No enrolled courses
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Start learning by enrolling in a course.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, index) => (
                      <ModernEnrolledCourseCard
                        key={course._id}
                        course={course}
                        progress={userProgress[course._id]}
                        detailed={true}
                        onProgressUpdate={fetchStudentData}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Browse Courses Tab */}
          {activeTab === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Modern Search */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Search for amazing courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-6 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm text-lg"
                  />
                </div>
              </motion.div>

              {/* Available Courses */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-8 py-6 bg-gradient-to-r from-emerald-600/50 to-teal-600/50 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">🌟</span>
                    Available Courses ({filteredAvailableCourses.length})
                  </h2>
                </div>
                <div className="p-8">
                  {filteredAvailableCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-8xl mb-6">🔍</div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        No courses found
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Try adjusting your search criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAvailableCourses.map((course, index) => (
                        <ModernAvailableCourseCard
                          key={course._id}
                          course={course}
                          onEnroll={handleEnrollment}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  Your Certificates
                </h2>
              </div>
              <div className="p-8">
                <CertificatesSection
                  enrolledCourses={enrolledCourses}
                  userProgress={userProgress}
                  onCertificateDownload={fetchStudentData}
                  user={user}
                />
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📈</span>
                  Detailed Progress
                </h2>
              </div>
              <div className="p-8">
                {courseProgress.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-8xl mb-6">📊</div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No progress data available
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Start learning to see your progress here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {courseProgress.map((progress, index) => (
                      <motion.div
                        key={progress.courseId}
                        className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-white text-lg">
                              {progress.courseTitle}
                            </h3>
                            <p className="text-gray-300">
                              {progress.completedLectures} of{" "}
                              {progress.totalLectures} lectures completed
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">
                              {progress.percentage}
                            </div>
                            {progress.isCompleted && (
                              <span className="text-sm text-green-400 font-bold">
                                ✅ Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              progress.isCompleted
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : "bg-gradient-to-r from-cyan-400 to-blue-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: progress.percentage }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                        {progress.lastAccessedLecture && (
                          <p className="text-xs text-gray-400 mt-3">
                            Last accessed: {progress.lastAccessedLecture}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ PAYMENT MODAL INTEGRATION */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal((prev) => ({ ...prev, isOpen: false }))}
        courseId={paymentModal.courseId}
        courseName={paymentModal.courseName}
        coursePrice={paymentModal.coursePrice}
        onPaymentSuccess={() => {
          fetchStudentData(); // Refresh data after successful payment
          setPaymentModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onEnrollmentComplete={processEnrollmentAfterPayment} // ✅ ADD
      />
    </div>
  );
};

// Modern Stat Card Component
const ModernStatCard = ({ title, value, icon, gradient, subtitle, delay }) => (
  <motion.div
    className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-sm`} // ✅ FIXED: template literal
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{
      scale: 1.05,
      y: -5,
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-4xl">{icon}</div>
      <motion.div
        className="text-right"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        <div className="text-3xl font-black text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </motion.div>
    </div>
    <div className="text-white/90 font-semibold mb-1">{title}</div>
    {subtitle && <div className="text-white/70 text-sm">{subtitle}</div>}
  </motion.div>
);

// Modern Enrolled Course Card
const ModernEnrolledCourseCard = ({
  course,
  progress,
  detailed = false,
  onProgressUpdate,
  index,
}) => {
  const navigate = useNavigate();

  const handleContinueLearning = () => {
    navigate(`/course/${course._id}/learn`); // ✅ FIXED: removed escape
  };

  const progressPercentage = progress
    ? progress.isFullyCompleted
      ? 100
      : parseFloat(progress.percentage) || 0
    : 0;

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-xl overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }} // ✅ FIXED: multiplication
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {course.title}
          </h3>
          <div className="text-2xl">
            {progressPercentage === 100 ? "🏆" : "📚"}
          </div>
        </div>

        {detailed && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 font-medium">Progress</span>
            <span className="text-lg font-bold text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full transition-all duration-1000 ${
                progressPercentage === 100
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 }} // ✅ FIXED: multiplication
            />
          </div>
        </div>

        {progress && (
          <div className="text-sm text-gray-400 mb-4">
            {progress.completedLectures || 0} of{" "}
            {progress.totalLectures || course.lectures?.length || 0} lectures
            completed
          </div>
        )}

        <motion.button
          onClick={handleContinueLearning}
          className={`w-full px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
            progressPercentage === 100
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{progressPercentage === 100 ? "🏆" : "▶️"}</span>
          {progressPercentage === 0
            ? "Start Learning"
            : progressPercentage === 100
            ? "Course Completed"
            : "Continue Learning"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Modern Available Course Card
const ModernAvailableCourseCard = ({ course, onEnroll, index }) => {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    await onEnroll(course); // ✅ FIXED: pass entire course object
    setEnrolling(false);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-xl overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }} // ✅ FIXED: multiplication
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {course.title}
          </h3>
          <div className="text-2xl">⭐</div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              📚 {course.lectures?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              👥 {course.studentsEnrolled?.length || 0}
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            &#8377;{course.price}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {"⭐".repeat(Math.round(course.averageRating || 0))}
            </div>
            <span className="text-sm text-gray-400">
              {course.averageRating?.toFixed(1) || 0} (
              {course.totalReviews || 0})
            </span>
          </div>
          <span className="text-md text-red-500">
            By {course.createdBy?.name}
          </span>
        </div>

        <motion.button
          onClick={handleEnroll}
          disabled={enrolling}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {enrolling ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Enrolling...
            </>
          ) : (
            <>🚀 Enroll Now</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
