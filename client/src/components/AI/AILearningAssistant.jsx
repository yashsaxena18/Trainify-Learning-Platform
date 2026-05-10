// src/components/AI/AILearningAssistant.jsx
import React, { useState, useCallback, lazy, Suspense } from 'react';

const ChatbotTutor = lazy(() => import('./ChatbotTutor'));
const DoubtSolver = lazy(() => import('./DoubtSolver'));
const QuizMaker = lazy(() => import('./QuizMaker'));

const FEATURES = [
  {
    id: 'chatbot',
    name: 'AI Tutor',
    short: 'Tutor',
    desc: 'Ask anything, learn instantly',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: 'doubt-solver',
    name: 'Doubt Solver',
    short: 'Debug',
    desc: 'Paste code, get answers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: 'quiz',
    name: 'Quiz Maker',
    short: 'Quiz',
    desc: 'Test your knowledge',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const TabSkeleton = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#7c5cfc]/20 border-t-[#7c5cfc] animate-spin" />
      </div>
      <p className="text-[13px] text-white/20 tracking-widest uppercase font-mono">Loading</p>
    </div>
  </div>
);

const AILearningAssistant = ({ userId }) => {
  const [activeFeature, setActiveFeature] = useState('chatbot');

  const handleTab = useCallback((id) => setActiveFeature(id), []);

  return (
    <div className="min-h-screen bg-[#080a0f] font-sans" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#7c5cfc]/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] rounded-full bg-[#5b8dee]/[0.05] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05]" style={{ background: 'rgba(8,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#5b8dee] opacity-90" />
              <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <span className="text-[15px] font-semibold text-white/90 tracking-tight">Trainify <span className="text-[#7c5cfc]">AI</span></span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] gap-0.5">
            {FEATURES.map((f) => {
              const active = activeFeature === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleTab(f.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    active ? 'text-white' : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]" style={{ boxShadow: '0 0 12px rgba(124,92,252,0.15)' }} />
                  )}
                  <span className={`relative z-10 flex items-center gap-1.5 ${active ? 'text-[#a78bfa]' : ''}`}>
                    {f.icon}
                    <span className="hidden sm:inline">{f.name}</span>
                    <span className="sm:hidden">{f.short}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active tab indicator strip */}
        <div className="relative h-[1px] bg-white/[0.05]">
          <div
            className="absolute h-full bg-gradient-to-r from-transparent via-[#7c5cfc]/60 to-transparent transition-all duration-300"
            style={{
              width: '33.33%',
              left: `${FEATURES.findIndex(f => f.id === activeFeature) * 33.33}%`,
            }}
          />
        </div>
      </header>

      {/* Feature description pill */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-1">
        {FEATURES.filter(f => f.id === activeFeature).map(f => (
          <div key={f.id} className="flex items-center gap-2 animate-fadeUp">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#a78bfa]/60 bg-[#7c5cfc]/[0.08] border border-[#7c5cfc]/[0.15] px-3 py-1 rounded-full font-mono uppercase tracking-widest">
              {f.icon} {f.name}
            </span>
            <span className="text-[12px] text-white/20">{f.desc}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        <Suspense fallback={<TabSkeleton />}>
          {activeFeature === 'chatbot' && <ChatbotTutor userId={userId} />}
          {activeFeature === 'doubt-solver' && <DoubtSolver userId={userId} />}
          {activeFeature === 'quiz' && <QuizMaker userId={userId} />}
        </Suspense>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.35s ease-out both; }
      `}</style>
    </div>
  );
};

export default React.memo(AILearningAssistant);