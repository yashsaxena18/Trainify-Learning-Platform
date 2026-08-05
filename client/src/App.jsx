// src/App.jsx - Performance Optimized
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import LoadingScreen from "./components/ui/LoadingScreen";

// Lazy Loaded Components
const Login = React.lazy(() => import("./components/auth/Login"));
const Register = React.lazy(() => import("./components/auth/Register"));
const Home = React.lazy(() => import("./pages/HOME/Home"));
const StudentDashboard = React.lazy(() => import("./pages/student/StudentDashboard"));
const InstructorDashboard = React.lazy(() => import("./pages/instructor/InstructorDashboard"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const CoursePlayer = React.lazy(() => import("./pages/course/CoursePlayer"));
const InstructorCourseManager = React.lazy(() => import("./pages/instructor/InstructorCourseManager"));
const AILearningAssistant = React.lazy(() => import("./components/AI/AILearningAssistant"));

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  // NOTE: We no longer block the entire app on `loading`.
  // Public routes (Home, Login, Register) render instantly.
  // ProtectedRoute handles its own loading state for auth-gated pages.

  return (
    <div className="App bg-gray-900 min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />

      {/* Only show Navbar on authenticated routes */}
      <Navbar />

      <Suspense fallback={<LoadingScreen skeleton />}>
        <Routes>
          {/* HOME ROUTE - Should be accessible to everyone */}
          <Route path="/" element={<Home />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              loading || !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              loading || !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AILearningAssistant userId={user?.id} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/learn"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor/course/:id"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorCourseManager />
              </ProtectedRoute>
            }
          />

          {/* Role-based redirect */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "instructor":
      return <Navigate to="/instructor/dashboard" replace />;
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default App;
