import { motion } from "framer-motion";

// Reusable Card Component
const StepCard = ({ step, title, description, icon, gradient, delay }) => (
  <motion.div
    className="relative p-[2px] rounded-xl group bg-gradient-to-br from-white/10 via-white/30 to-white/10 shadow-xl"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    {/* Glowing Animated Border */}
    <div
      className={`absolute inset-0 rounded-xl opacity-20 blur-md group-hover:opacity-50 group-hover:blur-lg transition-all duration-300 ${`bg-gradient-to-br ${gradient}`}`}
    ></div>

    {/* Card Content */}
    <div className="relative z-10 h-full bg-slate-900/80 backdrop-blur-md rounded-xl p-6 text-white flex flex-col gap-4 hover:shadow-2xl transition-all duration-300">
      <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold">{`Step ${step}: ${title}`}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  </motion.div>
);

// Main Section
const HowItWorks = () => (
  <motion.section
    className="relative z-10 py-32 bg-gradient-to-r from-slate-900/50 to-purple-900/50 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Title */}
      <motion.div
        className="text-center mb-20"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-6">
          How Trainify Works
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
          Transform your career in four powerful steps with our next-gen learning ecosystem
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StepCard
          step="1"
          title="Create Your Path"
          description="Set your career goals and get a personalized roadmap tailored to your interests and strengths."
          icon="🎯"
          gradient="from-rose-500 to-yellow-500"
          delay={0.2}
        />
        <StepCard
          step="2"
          title="Learn by Doing"
          description="Dive into hands-on courses, build real-world projects, and get expert feedback to grow."
          icon="💻"
          gradient="from-indigo-500 to-fuchsia-500"
          delay={0.4}
        />
        <StepCard
          step="3"
          title="Certify & Shine"
          description="Earn industry-grade certificates and build a portfolio that stands out to employers."
          icon="🎓"
          gradient="from-green-400 to-cyan-500"
          delay={0.6}
        />
        <StepCard
          step="4"
          title="Join the Community"
          description="Get support, collaborate with peers, and unlock new career opportunities together."
          icon="👥"
          gradient="from-blue-500 to-violet-500"
          delay={0.8}
        />
      </div>
    </div>
  </motion.section>
);

export default HowItWorks;
