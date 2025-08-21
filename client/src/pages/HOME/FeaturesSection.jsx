// src/components/home/FeaturesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Brain,
  BadgeCheck,
  Video,
  Lock,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={36} className="text-purple-600" />,
    title: "Personalized Progress Tracker",
    description: "Track your course progress with visual insights.",
    gradient: "from-purple-400 to-orange-400",
  },
  {
    icon: <Brain size={36} className="text-blue-600" />,
    title: "AI-based Recommendations",
    description: "Get course suggestions based on your learning style.",
    gradient: "from-blue-400 to-teal-400",
  },
  {
    icon: <BadgeCheck size={36} className="text-green-600" />,
    title: "Free Certificates",
    description: "Earn certificates after completing each course.",
    gradient: "from-green-400 to-yellow-400",
  },
  {
    icon: <Video size={36} className="text-pink-600" />,
    title: "HD Video Content",
    description: "Engage with high-quality visual learning material.",
    gradient: "from-pink-400 to-indigo-400",
  },
  {
    icon: <Lock size={36} className="text-red-600" />,
    title: "Lifetime Access",
    description: "Learn anytime, with no expiry on course access.",
    gradient: "from-red-400 to-yellow-300",
  },
  {
    icon: <Bell size={36} className="text-yellow-500" />,
    title: "Real-time Notifications",
    description: "Stay updated with instant alerts and course updates.",
    gradient: "from-yellow-400 to-rose-400",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-[#f8f9fb]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          🚀 Why Choose <span className="text-indigo-600">Trainify?</span>
        </h2>
        <p className="text-gray-600">Your future-ready learning platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`rounded-2xl p-[1px] bg-gradient-to-tr ${feature.gradient} shadow-xl`}
          >
            <div className="flex flex-col items-center bg-white rounded-2xl h-full px-5 py-8 text-center">
              <div className="bg-gray-100 rounded-full p-3 mb-4 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
