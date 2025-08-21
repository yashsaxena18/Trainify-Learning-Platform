// src/components/AI/AILearningAssistant.jsx
import React, { useState } from 'react';
import ChatbotTutor from './ChatbotTutor';
import DoubtSolver from './DoubtSolver';
import QuizMaker from './QuizMaker';

const AILearningAssistant = ({ userId }) => {
  const [activeFeature, setActiveFeature] = useState('chatbot');

  const features = [
    { id: 'chatbot', name: 'AI Tutor', icon: '🤖' },
    { id: 'doubt-solver', name: 'Doubt Solver', icon: '🔍' },
    { id: 'quiz', name: 'Quiz Maker', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* AI Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-2xl md:text-3xl">🎓</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Learning Assistant
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your personal AI tutor for coding and learning
          </p>
        </div>

        {/* AI Navigation */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-10">
          {features.map((feature) => (
            <button
              key={feature.id}
              className={`group flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${
                activeFeature === feature.id
                  ? 'bg-white text-blue-700 shadow-xl border-2 border-blue-200 scale-105'
                  : 'bg-white/70 text-gray-700 shadow-md hover:bg-white hover:shadow-lg border-2 border-transparent'
              }`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <span className={`text-xl md:text-2xl transition-transform group-hover:scale-110 ${
                activeFeature === feature.id ? 'animate-pulse' : ''
              }`}>
                {feature.icon}
              </span>
              <span className="font-medium hidden sm:inline">{feature.name}</span>
            </button>
          ))}
        </div>

        {/* AI Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          <div className="min-h-[600px] transition-all duration-500 ease-in-out">
            {activeFeature === 'chatbot' && (
              <div className="animate-fadeIn">
                <ChatbotTutor userId={userId} />
              </div>
            )}
            {activeFeature === 'doubt-solver' && (
              <div className="animate-fadeIn">
                <DoubtSolver userId={userId} />
              </div>
            )}
            {activeFeature === 'quiz' && (
              <div className="animate-fadeIn">
                <QuizMaker userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AILearningAssistant;