import { motion } from "framer-motion";

// Dummy Stats
const platformStats = {
  totalStudents: 12000,
  totalCourses: 150,
  totalInstructors: 40,
  hoursWatched: 48000,
};

const Hero = () => {
  const handleGetStarted = () => alert("Get Started Clicked!");
  const handleBrowseCourses = () => alert("Browse Courses Clicked!");

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 min-h-screen flex items-center justify-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text + CTA */}
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
              Trainify helps you master the future. Learn AI, web development,
              design, and more — all with hands-on projects and{" "}
              <span className="text-cyan-400 font-bold">real-world</span>{" "}
              results.
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
                  🚀 Start Free Trial
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
                  📚 Explore Courses
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
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
              <div className="grid grid-cols-2 gap-6 text-center text-white font-semibold text-lg">
                <StatsCard
                  number={platformStats.totalStudents.toLocaleString()}
                  label="Students"
                  icon="👩‍🎓"
                  gradient="from-cyan-400 to-blue-500"
                />
                <StatsCard
                  number={platformStats.totalCourses}
                  label="Courses"
                  icon="📘"
                  gradient="from-purple-400 to-pink-500"
                />
                <StatsCard
                  number={platformStats.totalInstructors}
                  label="Instructors"
                  icon="🧑‍🏫"
                  gradient="from-green-400 to-teal-500"
                />
                <StatsCard
                  number={`${(platformStats.hoursWatched / 1000).toFixed(1)}k`}
                  label="Hours Watched"
                  icon="⏱️"
                  gradient="from-yellow-400 to-orange-500"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
