
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { motion, useScroll, useTransform } from "framer-motion";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./Howitworks";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const coursesRes = await API.get("/courses?limit=6&featured=true");

      if (coursesRes) {
        const coursesData = coursesRes.data.courses || coursesRes.data || [];
        setFeaturedCourses(coursesData.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(
        user?.role === "instructor"
          ? "/instructor/dashboard"
          : "/student/dashboard"
      );
    } else {
      navigate("/register");
    }
  };

  const handleBrowseCourses = () => {
    if (isAuthenticated) {
      // If logged in, redirect to appropriate dashboard browse section based on role
      if (user?.role === "student") {
        navigate("/student/dashboard", { state: { activeTab: "browse" } });
      } else if (user?.role === "instructor") {
        navigate("/instructor/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Default to student dashboard if role is unclear
        navigate("/student/dashboard", { state: { activeTab: "browse" } });
      }
    } else {
      // If not logged in, redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <motion.div className="absolute inset-0 opacity-30" style={{ y }}>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full filter blur-3xl opacity-70 animate-pulse delay-500"></div>
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 min-h-screen flex items-center justify-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Learn Skills That{" "}
                <motion.span
                  className="text-yellow-400 drop-shadow-lg"
                  animate={{
                    textShadow: [
                      "0 0 20px #facc15",
                      "0 0 40px #facc15",
                      "0 0 20px #facc15",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Matter
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl mb-10 text-gray-300 font-medium leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Master cutting-edge technologies with{" "}
                <span className="text-cyan-400 font-bold">AI-powered</span>{" "}
                courses. Build real projects, earn certificates, and{" "}
                <span className="text-purple-400 font-bold">
                  transform your career
                </span>
                .
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-6"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  onClick={handleGetStarted}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105"
                  whileHover={{
                    boxShadow: "0 20px 60px rgba(6, 182, 212, 0.4)",
                    y: -5,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {isAuthenticated ? "🚀 Go to Dashboard" : "🎯 Enroll Now"}
                  </span>
                </motion.button>

                <motion.button
                  onClick={handleBrowseCourses}
                  className="group px-8 py-4 border-2 border-purple-400 text-purple-400 hover:text-white font-bold text-lg rounded-full transition-all duration-300 hover:bg-purple-500 hover:border-purple-500 shadow-lg backdrop-blur-sm"
                  whileHover={{
                    boxShadow: "0 20px 60px rgba(168, 85, 247, 0.4)",
                    y: -5,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    📚 Browse Courses
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - No Data Interface with Learning Journey */}
            <motion.div
              className="relative"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(255, 255, 255, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Central Learning Icon */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-4xl shadow-2xl mb-4"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🎓
                  </motion.div>
                  <motion.h3
                    className="text-2xl font-bold text-white mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Your Learning Journey
                  </motion.h3>
                  <motion.p
                    className="text-gray-300 text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    Transform your skills in 3 simple steps
                  </motion.p>
                </motion.div>

                {/* Learning Steps */}
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      icon: "🔍",
                      title: "Discover & Explore",
                      description:
                        "Choose from cutting-edge courses tailored to your goals",
                      gradient: "from-cyan-400 to-blue-500",
                      delay: 1.2,
                    },
                    {
                      step: "02",
                      icon: "🚀",
                      title: "Learn & Build",
                      description:
                        "Master skills through hands-on projects and real applications",
                      gradient: "from-purple-400 to-pink-500",
                      delay: 1.4,
                    },
                    {
                      step: "03",
                      icon: "🏆",
                      title: "Achieve & Shine",
                      description:
                        "Earn certificates and unlock new career opportunities",
                      gradient: "from-emerald-400 to-cyan-500",
                      delay: 1.6,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item.delay }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      {/* Step Number */}
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
                      >
                        {item.step}
                      </div>

                      {/* Icon */}
                      <div className="text-2xl">{item.icon}</div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm">
                          {item.title}
                        </h4>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Call to Action */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <motion.button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      ✨ Begin Your Journey Today
                    </span>
                  </motion.button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  className="mt-6 flex justify-center items-center gap-6 text-gray-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Expert Instructors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Industry Level Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Lifetime Access</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                💡
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -180, -360],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                ⚡
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Featured Courses Section */}
      <motion.section
        className="relative z-10 py-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-6">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-300 font-medium">
              Start with our most popular and transformative learning
              experiences
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 animate-pulse backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="h-48 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-600 rounded w-20"></div>
                    <div className="h-4 bg-gray-600 rounded w-16"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  className="rounded-2xl p-6 backdrop-blur-sm border-2 border-transparent bg-gradient-to-br from-white/5 to-white/10 shadow-md hover:shadow-xl transition-all duration-300"
                  style={{
                    boxShadow: "0 0 15px 2px rgba(168, 85, 247, 0.4)",
                    borderImage:
                      "linear-gradient(to right, #a855f7, #ec4899) 1",
                    borderStyle: "solid",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-xl font-extrabold text-white mb-2">
                    {course.title}
                  </h3>

                  <p className="text-sm font-semibold text-pink-400 mb-4">
                    👨‍🏫 {course.instructor}
                  </p>

                  <button
                    onClick={() => {
                      if (user) {
                        navigate("/dashboard");
                      } else {
                        navigate("/login");
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full hover:scale-105 transition-all duration-200"
                  >
                    🚀 Enroll Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            className="text-center mt-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={handleBrowseCourses}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-2xl transform transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(168, 85, 247, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              🌟 Explore All Courses
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Categories Section */}
      <motion.section
        className="relative z-10 py-32 bg-gradient-to-r from-purple-900/30 to-slate-900/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-6">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-300 font-medium">
              Discover your passion across diverse learning domains
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "AI & Machine Learning",
                icon: "🤖",
                count: 4,
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                name: "Full Stack Development",
                icon: "💻",
                count: 2,
                gradient: "from-purple-500 to-pink-600",
              },
              {
                name: "Data Science",
                icon: "📊",
                count: 1,
                gradient: "from-emerald-500 to-cyan-600",
              },
              {
                name: "Data Structures ",
                icon: "🎨",
                count: 4,
                gradient: "from-yellow-500 to-orange-600",
              },
            ].map((category, index) => (
              <CategoryCard
                key={category.name}
                category={category}
                index={index}
              />
            ))}
          </div>
          <p className="text-lg mt-6 text-gray-400 font-medium italic relative">
            <span className="inline-block w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mr-3 animate-pulse"></span>
            Counts are depending on the courses available in each category till Now
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Trainify
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering the next generation of innovators with cutting-edge
                skills and transformative learning experiences.
              </p>
              <div className="flex space-x-4">
                {["📘", "🐦", "💼", "📷"].map((icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl hover:shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {[
              {
                title: "Courses",
                links: [
                  "AI & Machine Learning",
                  "Full Stack Development",
                  "Data Science",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Contact"],
              },
              {
                title: "Support",
                links: ["Help Center", "Privacy Policy"],
              },
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-bold mb-6 text-cyan-400">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li key={linkIndex}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline"
                      >
                        {link}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="border-t border-gray-700 mt-12 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400">
              &copy; 2025 Trainify. All rights reserved. Made By Yash Saxena
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

// Supporting Components
const StatsCard = ({ number, label, icon, gradient, delay }) => (
  <motion.div
    className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl text-white`}
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{
      scale: 1.05,
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    }}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-black mb-1">{number}+</div>
    <div className="text-sm font-medium opacity-90">{label}</div>
  </motion.div>
);

const StepCard = ({ step, title, description, icon, gradient, delay }) => (
  <motion.div
    className="text-center group"
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <motion.div
      className={`w-24 h-24 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300`}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
      }}
    >
      <span className="text-4xl">{icon}</span>
    </motion.div>
    <motion.div
      className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}
    >
      {step}
    </motion.div>
    <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
    <p className="text-gray-300 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const ModernCourseCard = ({ course, index }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCourseClick = () => {
    if (isAuthenticated) {
      navigate(`/course/${course._id}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={handleCourseClick}
    >
      <motion.div
        className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500"
        whileHover={{
          y: -10,
          boxShadow:
            "0 25px 50px rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="relative h-56 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-purple-600/20"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))",
                "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
                "linear-gradient(225deg, rgba(236, 72, 153, 0.2), rgba(6, 182, 212, 0.2))",
                "linear-gradient(315deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.span
            className="text-6xl z-10"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            📚
          </motion.span>
        </div>

        <div className="p-8">
          <motion.h3
            className="font-bold text-xl text-white mb-4 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {course.title}
          </motion.h3>

          <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
            {course.description}
          </p>

          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity:
                        i < Math.round(course.averageRating || 0) ? 1 : 0.3,
                    }}
                    transition={{ delay: i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <span className="text-sm text-gray-400 ml-2">
                {course.averageRating?.toFixed(1) || "0.0"} (
                {course.totalReviews || 0})
              </span>
            </motion.div>
            <motion.span
              className="text-sm text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              👥 {course.studentsEnrolled?.length || 0} students
            </motion.span>
          </div>

          <div className="flex justify-between items-center">
            <motion.span
              className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.1 }}
            >
              ₹{course.price || 0}
            </motion.span>
            <span className="text-sm text-gray-400">
              By {course.createdBy?.name || "Expert Instructor"}
            </span>
          </div>

          <motion.button
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Enroll Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CategoryCard = ({ category, index }) => (
  <motion.div
    className="group cursor-pointer"
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: index * 0.05 }}
    viewport={{ once: true }}
  >
    <motion.div
      className={`bg-gradient-to-br ${category.gradient} p-8 rounded-3xl text-white text-center shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm`}
      whileHover={{
        y: -10,
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
      }}
    >
      <motion.div
        className="text-5xl mb-6"
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {category.icon}
      </motion.div>
      <h3 className="font-bold text-lg mb-3">{category.name}</h3>
      <motion.p
        className="text-sm opacity-90 font-medium"
        whileHover={{ scale: 1.05 }}
      >
        {category.count} courses
      </motion.p>
    </motion.div>
  </motion.div>
);

export default Home;
