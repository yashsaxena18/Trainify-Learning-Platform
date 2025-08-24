// src/pages/instructor/InstructorDashboard.jsx - Modern Animated Version
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Enhanced state for analytics and students
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalViews: 0,
    avgRating: 0,
    totalRevenue: 0,
    coursePerformance: [],
  });
  const [students, setStudents] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);

  // Main data fetching function
  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting to fetch instructor data...");

      const results = await Promise.allSettled([
        fetchDashboardData(),
        fetchInstructorCourses(),
        fetchActivities(),
        fetchStudentProgress(),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`API call ${index} failed:`, result.reason);
        }
      });

      console.log("✅ Data fetching completed");
    } catch (error) {
      console.error("Error fetching instructor data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, analyticsRes] = await Promise.all([
        API.get("/instructor/dashboard"),
        API.get("/instructor/analytics"),
      ]);

      if (dashboardRes.data) {
        setDashboardData(dashboardRes.data);
      }

      if (analyticsRes.data) {
        setAnalytics({
          totalCourses: analyticsRes.data.totalCourses || 0,
          totalStudents: analyticsRes.data.totalStudents || 0,
          totalViews: analyticsRes.data.totalViews || 0,
          avgRating: analyticsRes.data.avgRating || 0,
          totalRevenue: analyticsRes.data.totalRevenue || 0,
          coursePerformance: analyticsRes.data.coursePerformance || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const response = await API.get("/progress/instructor/students");
      if (response.data.success) {
        setStudentProgress(response.data.data.progressSummary || []);
      }
    } catch (error) {
      console.error("Failed to fetch student progress:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await API.get("/activity/instructor");
      if (response.data.success) {
        setActivities(response.data.activities || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await API.get("/instructor/courses");
      if (response.data.success) {
        setCourses(response.data.courses || []);
      } else {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const trackCourseView = async (courseId) => {
    try {
      const response = await API.post(`/courses/${courseId}/view`);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, views: response.data.views }
            : course
        )
      );

      setAnalytics((prev) => ({
        ...prev,
        totalViews: prev.totalViews + 1,
      }));
    } catch (err) {
      console.error("view track error", err);
    }
  };

  // Add real-time analytics refresh
  useEffect(() => {
    const refreshAnalytics = async () => {
      try {
        const response = await API.get("/instructor/analytics");
        if (response.data.success) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error("Failed to refresh analytics:", error);
      }
    };

    const interval = setInterval(refreshAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  const markActivitiesAsRead = async () => {
    try {
      await API.put("/activity/mark-read");
      setUnreadCount(0);
      setActivities(
        activities.map((activity) => ({ ...activity, isRead: true }))
      );
      toast.success("All activities marked as read");
    } catch (error) {
      console.error("Failed to mark activities as read:", error);
    }
  };

  const handleViewAnalytics = async () => {
    try {
      const response = await API.get("/instructor/analytics");
      if (response.data) {
        setAnalytics(response.data);
        setShowAnalytics(true);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  const handleManageStudents = async () => {
    try {
      const response = await API.get("/instructor/students");
      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents(response.data.students || []);
      }
      setShowStudents(true);
    } catch (error) {
      toast.error("Failed to load students");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchInstructorData();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Modern Header */}
      <motion.div 
        className="relative z-10 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-black text-white mb-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎓 Instructor Dashboard
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, <span className="font-bold text-yellow-300">{user?.name}</span>! 
                Manage your courses and track student progress.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Enhanced Notification Bell */}
              <motion.div className="relative">
                <motion.button
                  onClick={markActivitiesAsRead}
                  className="p-3 text-white/80 hover:text-white relative bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title="Mark all as read"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-4-6c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 6s-2-2-8-2-8 2-8 2v10s2 2 8 2 8-2 8-2V6z" />
                  </svg>
                  {unreadCount > 0 && (
                    <motion.span 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>

              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg font-bold"
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Course
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Modern Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernStatCard
            title="Total Courses"
            value={analytics.totalCourses || courses.length || 0}
            subtitle="Published courses"
            icon="📚"
            gradient="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <ModernStatCard
            title="Total Students"
            value={analytics.totalStudents || 0}
            subtitle="Enrolled students"
            icon="👥"
            gradient="from-green-500 to-emerald-500"
            delay={0.2}
          />
          <ModernStatCard
            title="Course Views"
            value={analytics.totalViews ? analytics.totalViews.toLocaleString() : "0"}
            subtitle="Total page views"
            icon="👁️"
            gradient="from-purple-500 to-pink-500"
            delay={0.3}
          />
          <ModernStatCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalRevenue || 0)}
            subtitle="Total earnings"
            icon="💰"
            gradient="from-yellow-500 to-orange-500"
            delay={0.4}
          />
        </motion.div>

        {/* Course Management and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Course List */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-600/50 to-purple-600/50 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    Your Courses ({courses.length})
                  </h2>
                  <motion.button
                    onClick={fetchInstructorCourses}
                    className="text-cyan-200 hover:text-white bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Refresh
                  </motion.button>
                </div>
              </div>
              
              <div className="p-8">
                {courses.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-8xl mb-6">📚</div>
                    <h3 className="text-2xl font-bold text-white mb-4">No courses yet</h3>
                    <p className="text-gray-300 mb-8 text-lg">Get started by creating your first course.</p>
                    <motion.button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🚀 Create Course
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {courses.map((course, index) => (
                      <ModernCourseCard
                        key={course._id}
                        course={course}
                        onRefresh={fetchInstructorCourses}
                        onTrackView={trackCourseView}
                        navigate={navigate}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton
                  onClick={() => setShowCreateForm(true)}
                  icon="➕"
                  text="Create New Course"
                  gradient="from-cyan-500 to-blue-600"
                />
                <QuickActionButton
                  onClick={handleViewAnalytics}
                  icon="📊"
                  text="View Analytics"
                  gradient="from-green-500 to-emerald-600"
                />
                <QuickActionButton
                  onClick={handleManageStudents}
                  icon="👥"
                  text="Manage Students"
                  gradient="from-purple-500 to-pink-600"
                />
                <QuickActionButton
                  onClick={fetchInstructorData}
                  icon="🔄"
                  text="Refresh Data"
                  gradient="from-yellow-500 to-orange-600"
                />
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  Recent Activity
                </h3>
                {unreadCount > 0 && (
                  <motion.span 
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {unreadCount} new
                  </motion.span>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {activities.slice(0, 10).map((activity, index) => (
                    <motion.div
                      key={activity._id || index}
                      className={`p-4 rounded-2xl border-l-4 transition-all duration-300 ${
                        activity.isRead
                          ? "border-gray-400 bg-white/5"
                          : "border-cyan-400 bg-cyan-400/10"
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">
                            {activity.description}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-300">
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>

                        <div className="ml-3 text-2xl">
                          {activity.type === "student_enrolled" && "👥"}
                          {activity.type === "course_completed" && "🏆"}
                          {activity.type === "lecture_completed" && "📖"}
                          {activity.type === "review_added" && "⭐"}
                          {activity.type === "course_created" && "📚"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-6xl mb-4">🔔</div>
                  <p className="text-gray-300 font-medium">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Activity will appear here when students interact with your courses
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Student Progress Section */}
        {studentProgress.length > 0 && (
          <motion.div 
            className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-600/50 to-teal-600/50 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📈</span>
                Student Progress Overview
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {studentProgress.map((courseData, index) => (
                  <motion.div
                    key={courseData.courseId}
                    className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <h3 className="font-bold text-white text-lg">
                        {courseData.courseTitle}
                      </h3>
                      <span className="text-sm text-cyan-300 bg-cyan-400/20 px-3 py-1 rounded-full">
                        {courseData.totalStudents} students enrolled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseData.studentsProgress.slice(0, 6).map((student, studentIndex) => (
                        <motion.div
                          key={student.studentId}
                          className="bg-white/10 rounded-2xl p-4 border border-white/20"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: studentIndex * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <p className="font-bold text-white text-sm mb-2">
                            {student.studentName}
                          </p>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-300 mb-2">
                              <span>Progress</span>
                              <span className="font-bold">{student.progressPercentage}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  student.isCompleted
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-cyan-400 to-blue-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: student.progressPercentage }}
                                transition={{ duration: 1, delay: studentIndex * 0.1 }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {student.completedLectures}/{student.totalLectures} lectures
                            {student.isCompleted && (
                              <span className="text-green-400 ml-2 font-bold">✓ Completed</span>
                            )}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {courseData.studentsProgress.length > 6 && (
                      <div className="mt-6 text-center">
                        <motion.button
                          onClick={() => handleManageStudents()}
                          className="text-cyan-300 hover:text-white bg-white/10 px-6 py-2 rounded-xl transition-all duration-300 font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          View all {courseData.studentsProgress.length} students →
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAnalytics && (
          <ModernAnalyticsModal
            analytics={analytics}
            onClose={() => setShowAnalytics(false)}
          />
        )}
        {showStudents && (
          <ModernStudentsModal
            students={students}
            onClose={() => setShowStudents(false)}
          />
        )}
        {showCreateForm && (
          <ModernCreateCourseModal
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchInstructorCourses();
              fetchDashboardData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Modern Stat Card Component
const ModernStatCard = ({ title, value, subtitle, icon, gradient, delay }) => (
  <motion.div
    className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-sm group`}
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ 
      scale: 1.05, 
      y: -5,
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
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
        <div className="text-2xl font-black text-white">
          {typeof value === "string" && value.includes("₹") ? value : (typeof value === "number" ? value.toLocaleString() : value)}
        </div>
      </motion.div>
    </div>
    <div className="text-white/90 font-bold mb-1">{title}</div>
    {subtitle && <div className="text-white/70 text-sm">{subtitle}</div>}
  </motion.div>
);

// Quick Action Button Component
const QuickActionButton = ({ onClick, icon, text, gradient }) => (
  <motion.button
    onClick={onClick}
    className={`w-full text-left p-4 hover:bg-gradient-to-r ${gradient} hover:text-white rounded-2xl transition-all duration-300 flex items-center gap-4 bg-white/5 text-gray-300 hover:shadow-lg border border-white/10`}
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-2xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </motion.button>
);

// Modern Course Card Component
const ModernCourseCard = ({ course, onRefresh, onTrackView, navigate, index }) => {
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [showCourseReviews, setShowCourseReviews] = useState(false);
  const [courseReviews, setCourseReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [localViews, setLocalViews] = useState(course.views || 0);

  useEffect(() => {
    setLocalViews(course.views || 0);
  }, [course.views]);

  const fetchCourseReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await API.get(`/courses/${course._id}/reviews`);
      if (response.data.success) {
        setCourseReviews(response.data.reviews || []);
      }
      setShowCourseReviews(true);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const addLecture = async (lectureData) => {
    try {
      await API.post(`/courses/${course._id}/lectures`, lectureData);
      toast.success("Lecture added successfully!");
      onRefresh();
      setShowLectureForm(false);
    } catch (error) {
      toast.error("Failed to add lecture");
    }
  };

  const handleManageCourse = async () => {
    try {
      if (onTrackView) {
        await onTrackView(course._id);
        setLocalViews((prev) => prev + 1);
      }
      navigate(`/instructor/course/${course._id}`);
    } catch (error) {
      console.error("Failed to track manage course view:", error);
      navigate(`/instructor/course/${course._id}`);
    }
  };

  const handleCourseView = async () => {
    try {
      const response = await API.post(`/courses/${course._id}/view`);
      if (response.data.success) {
        setLocalViews(response.data.views);
      }
      navigate(`/course/${course._id}`);
    } catch (error) {
      console.error("Failed to track view:", error);
      navigate(`/course/${course._id}`);
    }
  };

  const handleTitleClick = async () => {
    await handleCourseView();
  };

  return (
    <>
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-xl group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <motion.h4
              className="text-xl font-bold text-white mb-2 cursor-pointer hover:text-cyan-400 transition-colors line-clamp-2"
              onClick={handleTitleClick}
              whileHover={{ scale: 1.02 }}
              title="Click to view course"
            >
              {course.title}
            </motion.h4>
            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <motion.button
              onClick={() => setShowLectureForm(true)}
              className="p-3 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/20 rounded-2xl transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              title="Add Lecture"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.button>

            <motion.button
              onClick={handleManageCourse}
              className="p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-400/20 rounded-2xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Manage Course"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Course Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center bg-white/10 rounded-xl p-3 border border-white/20">
            <div className="text-cyan-400 font-bold text-lg">{course.studentsEnrolled?.length || 0}</div>
            <div className="text-gray-400 text-xs">Students</div>
          </div>
          <div className="text-center bg-white/10 rounded-xl p-3 border border-white/20">
            <div className="text-purple-400 font-bold text-lg">{course.lectures?.length || 0}</div>
            <div className="text-gray-400 text-xs">Lectures</div>
          </div>
          <div className="text-center bg-white/10 rounded-xl p-3 border border-white/20">
            <div className="text-yellow-400 font-bold text-lg">₹{course.price || 0}</div>
            <div className="text-gray-400 text-xs">Price</div>
          </div>
        </div>

        {/* Enhanced Engagement Metrics */}
        <div className="flex flex-wrap justify-between items-center text-sm border-t border-white/20 pt-4 gap-2">
          <motion.button
            onClick={handleCourseView}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors bg-purple-500/20 px-3 py-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {localViews.toLocaleString()} Views
          </motion.button>

          <motion.button
            onClick={fetchCourseReviews}
            className="flex items-center gap-2 text-yellow-300 hover:text-white transition-colors bg-yellow-500/20 px-3 py-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {course.reviews?.length || course.totalReviews || 0} Reviews
          </motion.button>

          {course.averageRating > 0 && (
            <div className="flex items-center gap-1 bg-green-500/20 px-3 py-2 rounded-xl">
              <div className="flex text-yellow-400">
                {"⭐".repeat(Math.round(course.averageRating || 0))}
              </div>
              <span className="text-green-300 font-bold">{course.averageRating?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Course Popularity Indicator */}
        {localViews > 100 && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg">
              🔥 Popular Course
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showLectureForm && (
          <ModernAddLectureModal
            courseId={course._id}
            onClose={() => setShowLectureForm(false)}
            onSuccess={addLecture}
          />
        )}
        {showCourseReviews && (
          <ModernReviewsModal
            course={course}
            reviews={courseReviews}
            loading={loadingReviews}
            onClose={() => setShowCourseReviews(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Modern Analytics Modal
const ModernAnalyticsModal = ({ analytics, onClose }) => (
  <motion.div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Course Analytics
        </h2>
        <motion.button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Courses", value: analytics.totalCourses || 0, color: "blue", icon: "📚" },
          { title: "Total Students", value: analytics.totalStudents || 0, color: "green", icon: "👥" },
          { title: "Total Views", value: analytics.totalViews || 0, color: "purple", icon: "👁️" },
          { title: "Avg Rating", value: `⭐ ${analytics.avgRating || 0}`, color: "yellow", icon: "⭐" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className={`bg-${stat.color}-50 p-6 rounded-2xl border border-${stat.color}-200`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <h3 className={`font-bold text-${stat.color}-800 text-sm`}>{stat.title}</h3>
            <p className={`text-2xl font-black text-${stat.color}-600`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-3xl border border-gray-200">
        <h3 className="font-black text-xl mb-6 text-gray-900 flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          Course Performance
        </h3>
        {analytics.coursePerformance?.length > 0 ? (
          <div className="space-y-4">
            {analytics.coursePerformance.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{course.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.studentsCount} students • {course.views} views • {course.reviewsCount} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-green-600">₹{course.revenue}</p>
                    <p className="text-sm text-gray-600">⭐ {course.rating}/5</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 font-medium">No course performance data available</p>
          </div>
        )}
      </div>
    </motion.div>
  </motion.div>
);

// Modern Students Modal
const ModernStudentsModal = ({ students, onClose }) => (
  <motion.div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <span className="text-4xl">👥</span>
          Manage Students ({students.length})
        </h2>
        <motion.button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      {students.length > 0 ? (
        <div className="space-y-6">
          {students.map((student, index) => (
            <motion.div
              key={student._id}
              className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {student.name?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                    <p className="text-gray-600">{student.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Revenue: ₹{student.totalRevenue || 0} • Courses: {student.coursesCreated || 0} • Students: {student.totalStudents || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    student.isBlocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {student.isBlocked ? "🚫 Blocked" : "✅ Active"}
                  </span>
                </div>
              </div>

              {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-sm mb-3 text-gray-900">Enrolled Courses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.enrolledCourses.slice(0, 5).map((course, courseIndex) => (
                      <span
                        key={courseIndex}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {course.title || course}
                      </span>
                    ))}
                    {student.enrolledCourses.length > 5 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        +{student.enrolledCourses.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-8xl mb-6">👥</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No students yet</h3>
          <p className="text-gray-500 text-lg">Students will appear here when they enroll in your courses.</p>
        </motion.div>
      )}
    </motion.div>
  </motion.div>
);

// Modern Create Course Modal
const ModernCreateCourseModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/courses/create", formData);
      toast.success("🎉 Course created successfully!", {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      onSuccess();
    } catch (error) {
      console.error("Create course error:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">📚</span>
          Create New Course
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-medium"
              placeholder="Enter course description"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              <option value="">Select Category</option>
              <option value="programming">Programming</option>
              <option value="ai-ml">AI & Machine Learning</option>
              <option value="data-science">Data Science</option>
              <option value="system-design">System Design</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="photography">Photography</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              placeholder="0"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 font-bold transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-bold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating...
                </div>
              ) : (
                "✨ Create Course"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Modern Add Lecture Modal
const ModernAddLectureModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    duration: 0,
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSuccess(formData);
    } catch (error) {
      toast.error("Failed to add lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">🎥</span>
          Add New Lecture
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Lecture Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              placeholder="Enter lecture title"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL</label>
            <input
              type="url"
              required
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Duration (min)</label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 font-bold transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-bold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Adding...
                </div>
              ) : (
                "🎥 Add Lecture"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Modern Reviews Modal
const ModernReviewsModal = ({ course, reviews, loading, onClose }) => (
  <motion.div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 lg:p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[85vh] sm:max-h-[80vh] lg:max-h-[75vh] overflow-y-auto shadow-2xl border border-white/20 mx-2 sm:mx-4"
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      transition={{ type: "spring", bounce: 0.4 }}
    >
      <div className="flex justify-between items-start gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 flex items-start gap-2 sm:gap-3 leading-tight">
            <span className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">⭐</span>
            <span className="break-words line-clamp-2">
              Reviews for "{course.title}"
            </span>
          </h3>
        </div>
        <motion.button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all duration-300 flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <motion.div
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3 sm:mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-500 font-medium text-sm sm:text-base">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <motion.div 
          className="text-center py-8 sm:py-12 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">📝</div>
          <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">No Reviews Yet</h4>
          <p className="text-gray-500 text-base sm:text-lg">Students haven't reviewed this course yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="mb-3 sm:mb-4">
            <p className="text-sm text-gray-600 font-medium">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} • Average rating: {' '}
              <span className="text-yellow-500 font-bold">
                {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)} ⭐
              </span>
            </p>
          </div>
          
          <div className="max-h-[50vh] sm:max-h-[45vh] lg:max-h-[50vh] overflow-y-auto space-y-4 sm:space-y-6 pr-2 custom-scrollbar">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id || index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {review.user?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {review.user?.name || "Anonymous"}
                      </span>
                      <div className="flex text-yellow-400 text-sm sm:text-base">
                        {"⭐".repeat(review.rating || 0)}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                      {review.comment}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  </motion.div>
);
export default InstructorDashboard;
