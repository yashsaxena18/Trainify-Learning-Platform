// src/pages/instructor/InstructorCourseManager.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-hot-toast";

/* ---------- Small helpers ---------- */
const StatCard = ({ icon, label, value, color }) => (
  <div className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
    <div className="relative p-6 flex items-center">
      <div
        className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <div className="ml-5">
        <dt className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">{label}</dt>
        <dd className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">{value}</dd>
      </div>
    </div>
    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-sm"></div>
  </div>
);

/* ---------- Main component ---------- */
const InstructorCourseManager = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  /* state */
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* modal state for new lecture */
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: ""
  });

  /* fetch on mount / id change */
  useEffect(() => {
    fetchCourseData();
    // eslint-disable-next-line
  }, [courseId]);

  /* ---------- API helpers ---------- */
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      let res;
      /* try instructor endpoint first */
      try {
        res = await API.get(`/instructor/courses/${courseId}`);
      } catch {
        /* fall back to public endpoint */
        res = await API.get(`/courses/${courseId}`);
      }

      const data = res.data.course || res.data;
      setCourse(data);
      setLectures(data.lectures || []);
    } catch (e) {
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const addLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.videoUrl.trim()) {
      toast.error("Title and video URL are required");
      return;
    }
    try {
      await API.post(`/courses/${courseId}/lectures`, newLecture);
      toast.success("Lecture added");
      setShowAddModal(false);
      setNewLecture({ title: "", description: "", videoUrl: "", duration: "" });
      fetchCourseData();
    } catch {
      toast.error("Could not add lecture");
    }
  };

  const deleteLecture = async (lectureId) => {
    if (!window.confirm("Delete this lecture?")) return;
    try {
      await API.delete(`/courses/${courseId}/lectures/${lectureId}`);
      toast.success("Lecture deleted");
      fetchCourseData();
    } catch {
      toast.error("Failed to delete lecture");
    }
  };

  const deleteCourse = async () => {
    if (!window.confirm("Delete the entire course?")) return;
    try {
      await API.delete(`/courses/${courseId}`);
      toast.success("Course deleted");
      navigate("/instructor/dashboard");
    } catch {
      toast.error("Failed to delete course");
    }
  };

  /* ---------- UI states ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin h-32 w-32 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full shadow-2xl"></div>
          <div className="absolute inset-0 animate-ping h-32 w-32 border-4 border-cyan-400/20 rounded-full"></div>
          <div className="absolute inset-4 animate-pulse bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-md opacity-50"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center animate-fadeIn">
          <div className="text-8xl mb-6 animate-bounce">😞</div>
          <h2 className="mt-4 text-4xl font-bold text-white">Course Not Found</h2>
          <p className="mt-4 text-xl text-gray-300">{error || "Invalid course id."}</p>
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="mt-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* header */}
      <header className="relative bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <button
                onClick={() => navigate("/instructor/dashboard")}
                className="group text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm font-medium mb-4 transition-colors duration-300"
              >
                <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                Dashboard
              </button>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3 animate-fadeIn">
                {course.title}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">{course.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">+</span>
                  Add Lecture
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={deleteCourse}
                className="group relative bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Delete Course</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* stats */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon="🎥" 
            label="Lectures" 
            value={lectures.length} 
            color="bg-gradient-to-br from-blue-500 to-blue-600" 
          />
          <StatCard
            icon="👥"
            label="Students"
            value={course.studentsEnrolled?.length || 0}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatCard 
            icon="👁️" 
            label="Views" 
            value={course.views || 0} 
            color="bg-gradient-to-br from-purple-500 to-purple-600" 
          />
          <StatCard
            icon="⭐"
            label="Reviews"
            value={course.reviews?.length || 0}
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
          />
        </div>
      </section>

      {/* course info */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="border-b border-white/10 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Course Information</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-base">
            <div className="group">
              <span className="font-semibold text-gray-300 group-hover:text-cyan-300 transition-colors duration-300">Category:</span>{" "}
              <span className="text-white font-medium">{course.category || "—"}</span>
            </div>
            <div className="group">
              <span className="font-semibold text-gray-300 group-hover:text-cyan-300 transition-colors duration-300">Price:</span>{" "}
              <span className="text-white font-medium">₹{course.price}</span>
            </div>
            <div className="group">
              <span className="font-semibold text-gray-300 group-hover:text-cyan-300 transition-colors duration-300">Created:</span>{" "}
              <span className="text-white font-medium">{new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="group">
              <span className="font-semibold text-gray-300 group-hover:text-cyan-300 transition-colors duration-300">Last Update:</span>{" "}
              <span className="text-white font-medium">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* lecture list */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="border-b border-white/10 px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Lectures ({lectures.length})
            </h2>
          </div>

          <div className="p-8">
            {lectures.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-50">📚</div>
                <p className="text-xl text-gray-300">No lectures added yet.</p>
                <p className="text-gray-400 mt-2">Click "Add Lecture" to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {lectures.map((lec, idx) => (
                  <div
                    key={lec._id}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 mb-2">
                          {idx + 1}. {lec.title}
                        </h3>
                        {lec.description && (
                          <p className="text-gray-300 leading-relaxed mb-4 group-hover:text-gray-200 transition-colors duration-300">
                            {lec.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                            Duration: {lec.duration || 'N/A'} min
                          </span>
                          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                            Order: {lec.order || idx + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 lg:flex-col lg:gap-2">
                        <button
                          onClick={() => window.open(lec.videoUrl, "_blank")}
                          title="Preview"
                          className="group/btn bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-indigo-200 p-3 rounded-xl border border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25"
                        >
                          <span className="text-lg">▶️</span>
                        </button>
                        <button
                          onClick={() => deleteLecture(lec._id)}
                          title="Delete"
                          className="group/btn bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-200 p-3 rounded-xl border border-red-500/30 hover:border-red-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Add Lecture Modal ---------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-2xl rounded-2xl shadow-2xl animate-scaleIn">
            <div className="border-b border-white/10 px-8 py-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Add New Lecture</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <span className="text-xl">✖️</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                <input
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  placeholder="Enter lecture title"
                  value={newLecture.title}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, title: e.target.value })
                  }
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                  rows={4}
                  placeholder="Enter lecture description"
                  value={newLecture.description}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, description: e.target.value })
                  }
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Video URL *</label>
                <input
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  placeholder="YouTube or video URL"
                  value={newLecture.videoUrl}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, videoUrl: e.target.value })
                  }
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  placeholder="Enter duration in minutes"
                  value={newLecture.duration}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, duration: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 hover:text-white rounded-xl border border-gray-500/30 hover:border-gray-400 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={addLecture}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Save Lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default InstructorCourseManager;