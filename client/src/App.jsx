// src/App.jsx - Updated with Stripe integration
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

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

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  const { isAuthenticated, loading } = useAuth();
  const { user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Elements stripe={stripePromise}>
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

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* HOME ROUTE - Should be accessible to everyone */}
            <Route path="/" element={<Home />} />

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
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
    </Elements>
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
