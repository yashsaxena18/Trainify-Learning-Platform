// src/components/AI/DoubtSolver.jsx
import React, { useState } from 'react';
import { aiService } from '../../services/aiService';

const DoubtSolver = ({ userId }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    'javascript', 'python', 'java', 'c++', 'c', 'typescript', 'html/css', 'sql', 'php', 'go', 'rust', 'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setSolution('');

    try {
      const response = await aiService.doubtSolver({ code, language, description, userId });
      if (response.success) setSolution(response.solution);
    } catch (error) {
      setSolution(`Something went wrong: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold text-white/90 mb-1">Doubt Solver</h2>
          <p className="text-sm text-white/35">Paste your code and describe the issue — AI will explain and fix it</p>
        </div>

        {/* Input card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          {/* Language selector */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Language</label>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    language === lang
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50 hover:border-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code input */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Your Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows="10"
              className="w-full bg-[#0a0b0f] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/15 font-mono focus:outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/10 resize-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Describe the issue <span className="text-white/20">(optional)</span></label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Getting an error on line 5, or 'I don't understand why...'"
              className="w-full bg-[#0a0b0f] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !code.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>Solve My Doubt</span>
              </>
            )}
          </button>
        </div>

        {/* Solution */}
        {solution && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden" style={{ animation: 'fadeUp 0.4s ease-out' }}>
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Solution</span>
            </div>
            <div className="px-5 py-4">
              <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-[system-ui]">
                {solution}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DoubtSolver;