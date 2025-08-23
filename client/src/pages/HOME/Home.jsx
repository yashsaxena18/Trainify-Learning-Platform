// src/pages/Home.jsx - Complete Modern Version with Compact Instructor Cards
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./Howitworks";
import loveBabbarImg from "./lovebabbar.jpg";
import striverImg from "./striver.jpg";
import rohitnegiImg from "./rohitnegi.jpg";
import shradhaimg from "./shradha.jpeg";
import harryImg from "./harry.jpg";
import princeImg from "./prince.jpeg";
import harshImg from "./harsh.jpeg";
import kunalImg from "./kunal.jpeg";
import adityaImg from "./aditya.jpeg";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Users,
  BookOpen,
} from "lucide-react";

// Compact Instructor Card Component
const CompactInstructorCard = ({ instructor, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 ease-out snap-center hover:scale-105 hover:-translate-y-2"
      style={{
        boxShadow: isHovered
          ? "0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 30px rgba(99, 102, 241, 0.3)"
          : "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Header with Gradient Background */}
      <div
        className={`relative h-24 bg-gradient-to-r ${instructor.gradient} p-6`}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar with Glow Effect */}
            <div
              className={`
              relative w-16 h-16 rounded-full overflow-hidden border-3 border-white
              transition-all duration-300
              ${isHovered ? "ring-4 ring-white/50 scale-110" : ""}
            `}
            >
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    instructor.name
                  )}&background=6366f1&color=ffffff&size=200&bold=true`;
                }}
              />
              {isHovered && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>

            {/* Name and Title */}
            <div className="text-white">
              <h3 className="font-bold text-lg leading-tight">
                {instructor.name}
              </h3>
              <p className="text-white/90 text-sm">{instructor.title}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Active
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {instructor.courses}
            </div>
            <div className="text-xs text-gray-500">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {instructor.students}
            </div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {instructor.rating}
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            Key Achievements
          </h4>

          {instructor.achievements.map((achievement, i) => (
            <motion.div
              key={i}
              className={`
                flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r
                transform transition-all duration-300 hover:scale-105
                ${
                  i % 2 === 0
                    ? "from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
                    : "from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
                }
              `}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${
                  i % 2 === 0
                    ? "bg-blue-500 text-white"
                    : "bg-purple-500 text-white"
                }
              `}
              >
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {achievement.title}
                </div>
                <div className="text-xs text-gray-600">
                  {achievement.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const InstructorsSection = () => {
  const instructors = [
    {
      name: "Love Babbar",
      title: "Ex‑Amazon SDE & DSA Expert",
      image: loveBabbarImg,
      courses: 15,
      students: "2.5M",
      rating: "4.9",
      gradient: "from-red-500 to-orange-600",
      achievements: [
        {
          icon: "🏢",
          title: "Ex‑Amazon SDE‑2",
          description: "3+ years at Amazon India",
        },
        {
          icon: "🏆",
          title: "DSA expert",
          description: "Top Instructor of DS Algo",
        },
        {
          icon: "📚",
          title: "CodeHelp Founder",
          description: "2.5M+ YouTube subs",
        },
      ],
    },
    {
      name: "Raj (Striver)",
      title: "Ex-Google SDE & DSA Expert",
      image: striverImg,
      courses: 12,
      students: "1.8M",
      rating: "4.8",
      gradient: "from-blue-500 to-purple-600",
      achievements: [
        { icon: "📊", title: "Google", description: "5+ Years at Google" },
        {
          icon: "🏆",
          title: "Problem Solving",
          description: "Famous DSA Problem Sheet",
        },
        {
          icon: "💻",
          title: "takeUforward Founder",
          description: "1.8M+ YouTube subs",
        },
      ],
    },
    {
      name: "Rohit Negi",
      title: "Ex UBER SDE",
      image: rohitnegiImg,
      courses: 20,
      students: "400K+",
      rating: "4.7",
      gradient: "from-green-500 to-teal-600",
      achievements: [
        {
          icon: "🎯",
          title: "DSA & AI Expert",
          description: "Got AIR 202 in GATE 2020",
        },
        {
          icon: "👨‍🏫",
          title: "Coder Army Founder",
          description: "450K+ student base",
        },
        {
          icon: "📈",
          title: "Placement Expert",
          description: "Helped 50K+ students get placed",
        },
      ],
    },
    {
      name: "Shradha Khapra",
      title: "Ex-MICROSOFT SDE",
      image: shradhaimg,
      courses: 18,
      students: "3.2M",
      rating: "4.9",
      gradient: "from-purple-500 to-pink-600",
      achievements: [
        {
          icon: "🏢",
          title: "Ex‑Microsoft SDE‑2",
          description: "3+ years at Microsoft India",
        },
        {
          icon: "🏢",
          title: "Apna College Co‑Founder",
          description: "3.2M+ YouTube subs",
        },
        {
          icon: "🏆",
          title: "Top Ed Creator",
          description: "Most‑watched Tech Channel in India",
        },
      ],
    },
    {
      name: "Harry",
      title: "Founder of CodewithHarry",
      image: harryImg,
      courses: 25,
      students: "4.1M",
      rating: "4.8",
      gradient: "from-indigo-500 to-blue-600",
      achievements: [
        {
          icon: "💻",
          title: "IIT Graduate",
          description: "10+ years industry exp",
        },
        {
          icon: "📺",
          title: "CodeWithHarry Founder",
          description: "4.1M+ YouTube subs",
        },
        {
          icon: "📚",
          title: "Course Creator",
          description: "100+ free courses",
        },
      ],
    },
    {
      name: "Prince Kumar",
      title: "SDE At SERVICENOW",
      image: princeImg,
      courses: 8,
      students: "100K+",
      rating: "4.6",
      gradient: "from-yellow-500 to-red-600",
      achievements: [
        {
          icon: "🚀",
          title: "Backend & AI Instructor",
          description: "Specialized in mobile apps",
        },
        {
          icon: "📱",
          title: "Hello World Channel",
          description: "90K+ focused subs",
        },
        {
          icon: "🎯",
          title: "Project‑Based Learning",
          description: "Real‑world tutorials",
        },
      ],
    },
    {
      name: "Harsh Sharma",
      title: "Shreyians Coding School Founder",
      image: harshImg,
      courses: 14,
      students: "680K",
      rating: "4.7",
      gradient: "from-cyan-500 to-green-600",
      achievements: [
        {
          icon: "🎨",
          title: "Creative Developer",
          description: "Top Instructor",
        },
        { icon: "🏫", title: "Sheryians Founder", description: "680K+ subs" },
        {
          icon: "💡",
          title: "Modern Web Expert",
          description: "GSAP, Three.js, advanced CSS",
        },
      ],
    },
    {
      name: "Kunal Kushwaha",
      title: "DevOps & Open Source Expert",
      image: kunalImg,
      courses: 10,
      students: "720K",
      rating: "4.8",
      gradient: "from-orange-500 to-red-600",
      achievements: [
        {
          icon: "☁️",
          title: "DevOps Engineer",
          description: "Expert in Kubernetes & Docker",
        },
        {
          icon: "🌟",
          title: "Open Source Advocate",
          description: "MLH Fellowship mentor",
        },
        {
          icon: "🎓",
          title: "Community Builder",
          description: "720K+ subs, WeMakeDevs Founder",
        },
      ],
    },
    {
      name: "Aditya Tandon",
      title: "EX-OLA SDE",
      image: adityaImg,
      courses: 10,
      students: "720K",
      rating: "4.8",
      gradient: "from-orange-500 to-red-600",
      achievements: [
        {
          icon: "☁️",
          title: "System design expert",
          description: "LLD and HLD",
        },
        {
          icon: "🌟",
          title: "Founder of Coder Army ",
          description: "Placed 1000+ Students",
        },
        {
          icon: "🎓",
          title: "Community Builder",
          description: "3000K+ subs",
        },
      ],
    },
  ];

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text mb-6">
            Learn from India's Top Coding YouTubers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master programming with India's most loved coding instructors who
            have taught millions of students
          </p>
        </motion.div>

        {/* Improved Auto-scrolling Horizontal Container */}
        <div className="relative">
          {/* Main container with proper overflow handling */}
          <div className="overflow-hidden relative">
            <motion.div
              className="flex space-x-6 py-4"
              animate={{
                x: [-320, -(instructors.length * 320)], // Smooth left movement
              }}
              transition={{
                duration: 35, // Medium-fast - 35 seconds for full cycle
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ 
                width: `${(instructors.length * 2) * 320 + (instructors.length * 2 - 1) * 24}px` // Proper width calculation
              }}
            >
              {/* Duplicate the array to create seamless loop */}
              {[...instructors, ...instructors].map((instructor, index) => (
                <CompactInstructorCard
                  key={`${instructor.name}-${Math.floor(index / instructors.length)}-${index % instructors.length}`}
                  instructor={instructor}
                  index={index}
                />
              ))}
            </motion.div>
          </div>

          {/* Gradient Overlays for Visual Effect */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-50 via-blue-50/80 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* YouTube Stats Banner */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl p-8 text-white text-center"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">
            🔥 Trusted by Millions of Students
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-black">15M+</div>
              <div className="text-sm opacity-90">Total Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-black">500M+</div>
              <div className="text-sm opacity-90">Views</div>
            </div>
            <div>
              <div className="text-3xl font-black">100K+</div>
              <div className="text-sm opacity-90">Students Placed</div>
            </div>
            <div>
              <div className="text-3xl font-black">1000+</div>
              <div className="text-sm opacity-90">Free Videos</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            Join the community that's learning from India's best coding mentors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(239, 68, 68, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Start Coding Journey
            </motion.button>
            <motion.button
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
            >
              📺 Watch them Live
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    hoursWatched: 0,
  });
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.allSettled([
        API.get("/courses?limit=6&featured=true"),
        API.get("/platform/stats"),
      ]);

      if (coursesRes.status === "fulfilled") {
        const coursesData =
          coursesRes.value.data.courses || coursesRes.value.data || [];
        setFeaturedCourses(coursesData.slice(0, 6));
      }

      if (statsRes.status === "fulfilled") {
        setPlatformStats(
          statsRes.value.data || {
            totalStudents: 1250,
            totalCourses: 45,
            totalInstructors: 12,
            hoursWatched: 8500,
          }
        );
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

      {/* Compact Instructors Section */}
      <InstructorsSection />

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
