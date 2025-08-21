// src/App.jsx - Updated with Stripe integration
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./pages/HOME/home";
import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoursePlayer from "./pages/course/CoursePlayer";
import InstructorCourseManager from "./pages/instructor/InstructorCourseManager";
import { Elements } from "@stripe/react-stripe-js";
import AILearningAssistant from "./components/AI/AILearningAssistant";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  const { isAuthenticated, loading } = useAuth();

  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="App">
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
