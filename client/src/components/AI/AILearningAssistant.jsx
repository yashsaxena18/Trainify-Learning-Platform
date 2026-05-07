// src/components/AI/AILearningAssistant.jsx
import React, { useState } from 'react';
import ChatbotTutor from './ChatbotTutor';
import DoubtSolver from './DoubtSolver';
import QuizMaker from './QuizMaker';

const AILearningAssistant = ({ userId }) => {
  const [activeFeature, setActiveFeature] = useState('chatbot');

  const features = [
    { id: 'chatbot', name: 'AI Tutor', icon: '💬', desc: 'Ask anything' },
    { id: 'doubt-solver', name: 'Doubt Solver', icon: '🧩', desc: 'Debug code' },
    { id: 'quiz', name: 'Quiz Maker', icon: '🎯', desc: 'Test yourself' }
  ];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <h1 className="text-base font-semibold text-white/90 tracking-tight">Trainfy AI</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFeature(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFeature === f.id
                    ? 'bg-white/[0.1] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className="text-base">{f.icon}</span>
                <span className="hidden sm:inline">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        <div className="min-h-[calc(100vh-57px)]">
          {activeFeature === 'chatbot' && <ChatbotTutor userId={userId} />}
          {activeFeature === 'doubt-solver' && <DoubtSolver userId={userId} />}
          {activeFeature === 'quiz' && <QuizMaker userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default AILearningAssistant;