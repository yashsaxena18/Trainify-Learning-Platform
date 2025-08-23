import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Real data state
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    platformGrowth: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Updated API endpoints to match backend routes
      const [
        statsResponse,
        usersResponse,
        instructorsResponse,
        coursesResponse,
        activityResponse,
      ] = await Promise.all([
        API.get("/admin/stats").catch((e) => {
          console.log("Stats API failed, trying alternative:", e.message);
          return API.get("/admin/dashboard").catch(() => ({ data: {} }));
        }),
        API.get("/admin/all-users").catch((e) => {
          console.log("Users API failed, trying alternative:", e.message);
          return API.get("/admin/users").catch(() => ({ data: { users: [] } }));
        }),
        API.get("/admin/all-instructors").catch((e) => {
          console.log("Instructors API failed, trying alternative:", e.message);
          return API.get("/admin/instructors").catch(() => ({
            data: { instructors: [] },
          }));
        }),
        API.get("/admin/courses").catch(() => ({
          data: { courses: [], pendingCourses: [] },
        })),
        API.get("/admin/activity").catch(() => ({ data: { activities: [] } })),
      ]);

      // Debug logging
      console.log("API Responses:", {
        stats: statsResponse.data,
        users: usersResponse.data,
        instructors: instructorsResponse.data,
        courses: coursesResponse.data,
        activity: activityResponse.data,
      });

      // Set stats data
      if (statsResponse.data.success !== false) {
        setAdminStats({
          totalUsers: statsResponse.data.totalUsers || 0,
          totalInstructors: statsResponse.data.totalInstructors || 0,
          totalStudents: statsResponse.data.totalStudents || 0,
          totalCourses: statsResponse.data.totalCourses || 0,
          totalEnrollments: statsResponse.data.totalEnrollments || 0,
          totalRevenue: statsResponse.data.totalRevenue || 0,
          platformGrowth: statsResponse.data.platformGrowth || 0,
        });
      }

      // Set users data with better fallback
      setAllUsers(
        usersResponse.data.users || usersResponse.data.students || []
      );

      // Set instructors data with better fallback
      setAllInstructors(instructorsResponse.data.instructors || []);

      // Set courses data
      setAllCourses(coursesResponse.data.courses || []);

      // Set activity data
      setRecentActivity(activityResponse.data.activities || []);

      // Set pending approvals
      setPendingApprovals(coursesResponse.data.pendingCourses || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast.error("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/block`);
      toast.success("User blocked successfully");
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.log(error);
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/unblock`);
      toast.success("User unblocked successfully");
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.log(error);
      toast.error("Failed to unblock user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${userId}`);
        toast.success("User deleted successfully");
        fetchAdminData(); // Refresh data
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await API.put(`/admin/courses/${courseId}/approve`);
      toast.success("Course approved successfully");
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto my-2"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            ></div>
          </div>
          <p className="text-white/70 mt-4 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 right-40 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-white/70 mt-2 text-lg">
                Welcome back,{" "}
                <span className="font-semibold text-white">{user?.name}</span>!
                <span className="block sm:inline">
                  {" "}
                  Manage your Trainify platform.
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in-down">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  System Healthy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 pt-6 backdrop-blur-sm bg-white/5 rounded-2xl mt-6 p-2">
          {[
            { id: "overview", name: "Overview", icon: "📊" },
            { id: "users", name: "Users", icon: "👥" },
            { id: "instructors", name: "Instructors", icon: "👨‍🏫" },
            { id: "courses", name: "Courses", icon: "📚" },
            { id: "moderation", name: "Moderation", icon: "🛡️" },
          ].map(({ id, name, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{icon}</span>
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={adminStats.totalUsers}
                icon="👥"
                gradient="from-blue-500 to-cyan-500"
                subtitle={`${adminStats.totalStudents} students, ${adminStats.totalInstructors} instructors`}
                delay="0ms"
              />
              <StatCard
                title="Total Courses"
                value={adminStats.totalCourses}
                icon="📚"
                gradient="from-green-500 to-emerald-500"
                subtitle={`${pendingApprovals.length} pending approval`}
                delay="100ms"
              />
              <StatCard
                title="Total Enrollments"
                value={adminStats.totalEnrollments}
                icon="🎓"
                gradient="from-purple-500 to-violet-500"
                subtitle={`+${adminStats.platformGrowth}% this month`}
                delay="200ms"
              />
              <StatCard
                title="Platform Revenue"
                value={`₹${adminStats.totalRevenue.toLocaleString()}`}
                icon="💰"
                gradient="from-orange-500 to-red-500"
                subtitle="Total earnings"
                delay="300ms"
              />
            </div>

            {/* Platform Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 animate-slide-in-left">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">📈</span>
                  Platform Activity
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${getActivityColor(
                              activity.type
                            )} animate-pulse`}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {activity.description}
                            </p>
                            <p className="text-xs text-white/50">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                          {activity.user}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4 opacity-50">📊</div>
                      <p className="text-white/50">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 animate-slide-in-right">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveTab("users")}
                    className="w-full text-left p-5 hover:bg-white/10 rounded-2xl transition-all duration-300 flex items-center gap-4 group border border-white/10 hover:border-white/30 transform hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Manage Users</p>
                      <p className="text-sm text-white/60">
                        {adminStats.totalUsers} total users
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("courses")}
                    className="w-full text-left p-5 hover:bg-white/10 rounded-2xl transition-all duration-300 flex items-center gap-4 group border border-white/10 hover:border-white/30 transform hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Review Courses</p>
                      <p className="text-sm text-white/60">
                        {pendingApprovals.length} pending approval
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("moderation")}
                    className="w-full text-left p-5 hover:bg-white/10 rounded-2xl transition-all duration-300 flex items-center gap-4 group border border-white/10 hover:border-white/30 transform hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Moderation Queue
                      </p>
                      <p className="text-sm text-white/60">Platform safety</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {/* Users Tab - Mobile Responsive */}
        {activeTab === "users" && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl animate-fade-in">
            <div className="px-4 md:px-8 py-6 border-b border-white/20">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl md:text-3xl">👥</span>
                All Users ({allUsers.length})
              </h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {allUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-white/5 transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-lg">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-base font-semibold text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-white/60">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              user.role === "instructor"
                                ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-500/25"
                                : user.role === "admin"
                                ? "bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-lg shadow-purple-500/25"
                                : "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-500/25"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-white/70">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-2 w-fit ${
                              user.isBlocked
                                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                user.isBlocked
                                  ? "bg-white animate-pulse"
                                  : "bg-white animate-pulse"
                              }`}
                            ></div>
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex space-x-3">
                            {user.isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(user._id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(user._id)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                              >
                                Block
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {allUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* User Info Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-white/60">{user.email}</div>
                    </div>
                  </div>

                  {/* User Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                        Role
                      </div>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg ${
                          user.role === "instructor"
                            ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-500/25"
                            : user.role === "admin"
                            ? "bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-lg shadow-purple-500/25"
                            : "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-500/25"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                        Status
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${
                          user.isBlocked
                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isBlocked
                              ? "bg-white animate-pulse"
                              : "bg-white animate-pulse"
                          }`}
                        ></div>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                        Joined
                      </div>
                      <div className="text-sm text-white/70">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 justify-center">
                    {user.isBlocked ? (
                      <button
                        onClick={() => handleUnblockUser(user._id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 text-xs font-medium"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(user._id)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 text-xs font-medium"
                      >
                        Block
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Instructors Tab */}
        {activeTab === "instructors" && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl animate-fade-in">
            <div className="px-8 py-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">👨‍🏫</span>
                Instructors ({allInstructors.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {allInstructors.map((instructor, index) => (
                <div
                  key={instructor._id}
                  className="backdrop-blur-sm bg-white/5 p-6 rounded-3xl border border-white/20 hover:bg-white/10 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                      <span className="text-white font-bold text-xl">
                        {instructor.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {instructor.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {instructor.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Courses Created:</span>
                      <span className="font-semibold text-white bg-blue-500/20 px-3 py-1 rounded-full">
                        {instructor.coursesCreated || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Total Students:</span>
                      <span className="font-semibold text-white bg-purple-500/20 px-3 py-1 rounded-full">
                        {instructor.totalStudents || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Total Revenue:</span>
                      <span className="font-semibold text-white bg-green-500/20 px-3 py-1 rounded-full">
                        ₹{instructor.totalRevenue || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/20">
                    <span
                      className={`px-4 py-2 text-sm rounded-full font-semibold flex items-center gap-2 w-fit ${
                        instructor.isBlocked
                          ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full bg-white animate-pulse`}
                      ></div>
                      {instructor.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl animate-fade-in">
            <div className="px-8 py-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📚</span>
                All Courses ({allCourses.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {allCourses.map((course, index) => (
                <div
                  key={course._id}
                  className="backdrop-blur-sm bg-white/5 p-6 rounded-3xl border border-white/20 hover:bg-white/10 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Instructor:</span>
                      <span className="font-semibold text-white">
                        {course.createdBy?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Students:</span>
                      <span className="font-semibold text-white bg-purple-500/20 px-3 py-1 rounded-full">
                        {course.studentsEnrolled?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Price:</span>
                      <span className="font-semibold text-white bg-green-500/20 px-3 py-1 rounded-full">
                        ₹{course.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <span className="text-white/70">Category:</span>
                      <span className="font-semibold text-white bg-blue-500/20 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                    <span
                      className={`px-4 py-2 text-sm rounded-full font-semibold flex items-center gap-2 ${
                        course.isApproved
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                          : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full bg-white animate-pulse`}
                      ></div>
                      {course.isApproved ? "Approved" : "Pending"}
                    </span>

                    {!course.isApproved && (
                      <button
                        onClick={() => handleApproveCourse(course._id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === "moderation" && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl animate-fade-in">
            <div className="px-8 py-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                Content Moderation
              </h2>
            </div>
            <div className="p-8">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-6">
                  {pendingApprovals.map((item, index) => (
                    <div
                      key={item._id}
                      className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500 transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xl mb-2">
                            {item.title}
                          </h3>
                          <p className="text-white/70 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {item.createdBy?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white/60">
                                By {item.createdBy?.name}
                              </span>
                            </div>
                            <div className="text-white/40">•</div>
                            <span className="text-white/60">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <button
                            onClick={() => handleApproveCourse(item._id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 font-medium flex items-center gap-2"
                          >
                            <span>✓</span>
                            Approve
                          </button>
                          <button className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 font-medium flex items-center gap-2">
                            <span>✕</span>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6 animate-bounce">🛡️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No pending moderation
                  </h3>
                  <p className="text-white/60 text-lg">
                    All content has been reviewed and approved.
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 font-medium">
                      System Clean
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

// Enhanced StatCard Component
const StatCard = ({ title, value, icon, gradient, subtitle, delay }) => (
  <div
    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:scale-[1.02] animate-scale-in`}
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
          >
            {icon}
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
        {subtitle && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-sm">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Helper function for activity colors
const getActivityColor = (type) => {
  switch (type) {
    case "enrollment":
      return "bg-green-400";
    case "course_created":
      return "bg-blue-400";
    case "user_registered":
      return "bg-purple-400";
    case "payment":
      return "bg-yellow-400";
    default:
      return "bg-gray-400";
  }
};

export default AdminDashboard;
