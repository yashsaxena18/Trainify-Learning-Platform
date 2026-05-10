// src/components/AI/QuizMaker.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { aiService } from '../../services/aiService';

const SUGGESTED = ['JavaScript Arrays', 'Python OOP', 'React Hooks', 'SQL Joins', 'CSS Flexbox'];

// ── QuizMaker ───────────────────────────────────────────────────────
const QuizMaker = ({ userId }) => {
  const [topic, setTopic]                   = useState('');
  const [quiz, setQuiz]                     = useState(null);
  const [answers, setAnswers]               = useState({});
  const [isLoading, setIsLoading]           = useState(false);
  const [showResults, setShowResults]       = useState(false);
  const [showExplanations, setShowExplanations] = useState({});
  const [error, setError]                   = useState('');

  // ── Actions ────────────────────────────────────────────────────
  const generateQuiz = useCallback(async () => {
    const t = topic.trim();
    if (!t || isLoading) return;
    setIsLoading(true);
    setQuiz(null);
    setAnswers({});
    setShowResults(false);
    setShowExplanations({});
    setError('');
    try {
      const response = await aiService.generateQuiz({ topic: t, userId });
      if (response.success) setQuiz(response.quiz);
      else throw new Error(response.error || 'Failed to generate quiz');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, userId, isLoading]);

  const resetQuiz = useCallback(() => {
    setQuiz(null); setAnswers({}); setTopic('');
    setShowResults(false); setShowExplanations({}); setError('');
  }, []);

  const submitQuiz = useCallback(() => {
    if (!quiz) return;
    setShowResults(true);
    const all = {};
    quiz.questions.forEach((_, i) => { all[i] = true; });
    setShowExplanations(all);
  }, [quiz]);

  const toggleExplanation = useCallback((i) => {
    setShowExplanations(prev => ({ ...prev, [i]: !prev[i] }));
  }, []);

  const setAnswer = useCallback((qi, idx) => {
    setAnswers(prev => ({ ...prev, [qi]: idx }));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading && topic.trim()) generateQuiz();
  }, [isLoading, topic, generateQuiz]);

  // ── Derived state ──────────────────────────────────────────────
  const { score, pct, totalCount, answeredCount } = useMemo(() => {
    const totalCount    = quiz?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    const score = showResults && quiz
      ? quiz.questions.reduce((s, q, i) => {
          const correct = q.correctAnswer ?? q.correct_answer;
          return s + (answers[i] === correct ? 1 : 0);
        }, 0)
      : 0;
    return {
      score,
      pct: totalCount > 0 ? Math.round((score / totalCount) * 100) : 0,
      totalCount,
      answeredCount,
    };
  }, [quiz, answers, showResults]);

  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div
        className="px-4 sm:px-6 py-8 min-h-screen"
        style={{ fontFamily: "'DM Sans', sans-serif", background: '#0d1117', color: '#c9d1d9' }}
      >
        <div className="max-w-2xl mx-auto">

          {/* Error */}
          {error && (
            <div className="mb-5 bg-[#1a0a0a] border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3 animate-fadeUp">
              <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p className="text-[13px] text-[#fca5a5] leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Generate Screen ────────────────────────────────── */}
          {!quiz && (
            <div className="space-y-5 animate-fadeUp">

              {/* Header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8dee] flex items-center justify-center text-white shadow-lg shadow-[#7c5cfc]/25">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-[16px] font-bold text-white leading-tight">Quiz Generator</h1>
                  <p className="text-[12px] text-[#8b949e]">Generate a quiz on any programming topic</p>
                </div>
              </div>

              {/* Card */}
              <div className="bg-[#161b26] border border-[#30363d] rounded-2xl p-5 space-y-5">

                {/* Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Topic
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. JavaScript Promises, CSS Grid, React Hooks..."
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[14px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#7c5cfc]/50 focus:shadow-[0_0_20px_rgba(124,92,252,0.1)] transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Popular Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED.map(s => (
                      <button
                        key={s}
                        onClick={() => setTopic(s)}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#8b949e] bg-[#0d1117] border border-[#30363d] hover:text-[#a78bfa] hover:border-[#7c5cfc]/40 hover:bg-[#7c5cfc]/08 transition-all duration-150"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateQuiz}
                  disabled={isLoading || !topic.trim()}
                  className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    topic.trim() && !isLoading
                      ? 'bg-gradient-to-r from-[#7c5cfc] to-[#6d4fe0] text-white shadow-lg shadow-[#7c5cfc]/25 hover:shadow-[#7c5cfc]/40 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                      Generating quiz…
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Quiz Screen ────────────────────────────────────── */}
          {quiz && (
            <div className="space-y-5 animate-fadeUp">

              {/* Quiz Header */}
              <div className="bg-[#161b26] border border-[#30363d] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-[15px] font-bold text-white leading-tight">{quiz.title || `${topic} Quiz`}</h2>
                    <p className="text-[12px] text-[#8b949e] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {answeredCount}/{totalCount} answered
                      {showResults && <span className="ml-2 text-[#a78bfa]">· Score: {pct}%</span>}
                    </p>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#8b949e] border border-[#30363d] bg-[#0d1117] hover:text-white hover:border-[#484f58] transition-all"
                  >
                    Exit
                  </button>
                </div>

                {/* Progress bar */}
                {!showResults && (
                  <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7c5cfc] to-[#a78bfa] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}

                {/* Results bar */}
                {showResults && (
                  <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        pct >= 80 ? 'bg-[#3fb950]' : pct >= 60 ? 'bg-[#d29922]' : 'bg-[#f85149]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {quiz.questions?.map((q, i) => {
                  const correctIdx = q.correctAnswer ?? q.correct_answer;
                  const isAnswered = answers[i] !== undefined;
                  const isCorrect  = showResults && answers[i] === correctIdx;
                  const isWrong    = showResults && isAnswered && answers[i] !== correctIdx;

                  return (
                    <div
                      key={i}
                      className={`bg-[#161b26] border rounded-2xl overflow-hidden transition-colors duration-300 ${
                        showResults
                          ? isCorrect ? 'border-[#3fb950]/40' : isWrong ? 'border-[#f85149]/40' : 'border-[#30363d]'
                          : isAnswered ? 'border-[#7c5cfc]/40' : 'border-[#30363d]'
                      }`}
                    >
                      {/* Question header */}
                      <div className="px-5 py-4 border-b border-[#21262d] flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-bold mt-0.5 ${
                          showResults
                            ? isCorrect ? 'bg-[#3fb950] text-white' : isWrong ? 'bg-[#f85149] text-white' : 'bg-[#21262d] text-[#8b949e]'
                            : isAnswered ? 'bg-[#7c5cfc] text-white' : 'bg-[#21262d] text-[#484f58]'
                        }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {showResults ? (isCorrect ? '✓' : isWrong ? '✕' : i + 1) : i + 1}
                        </div>
                        <p className="text-[14px] text-[#e6edf3] leading-relaxed font-medium">{q.question}</p>
                      </div>

                      {/* Options */}
                      {q.options?.length > 0 && (
                        <div className="p-4 space-y-2">
                          {q.options.map((opt, idx) => {
                            const isSelected   = answers[i] === idx;
                            const isCorrectOpt = idx === correctIdx;
                            const letter       = String.fromCharCode(65 + idx);

                            let cls = 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#484f58] hover:text-[#c9d1d9]';
                            if (showResults) {
                              if (isCorrectOpt)      cls = 'bg-[#3fb950]/10 border-[#3fb950]/40 text-[#3fb950]';
                              else if (isSelected)   cls = 'bg-[#f85149]/10 border-[#f85149]/40 text-[#f85149]';
                              else                   cls = 'bg-[#0d1117] border-[#21262d] text-[#484f58]';
                            } else if (isSelected) {
                              cls = 'bg-[#7c5cfc]/12 border-[#7c5cfc]/50 text-[#e6edf3]';
                            }

                            return (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${cls} ${showResults ? 'cursor-default' : 'active:scale-[0.99]'}`}
                              >
                                <span
                                  className="text-[11px] font-bold flex-shrink-0 w-5"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                  {letter}
                                </span>
                                <input
                                  type="radio"
                                  name={`q${i}`}
                                  checked={isSelected}
                                  onChange={() => !showResults && setAnswer(i, idx)}
                                  className="sr-only"
                                  disabled={showResults}
                                />
                                <span className="text-[13.5px] font-medium flex-1">{opt}</span>
                                {showResults && isCorrectOpt && (
                                  <svg className="flex-shrink-0 text-[#3fb950]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </label>
                            );
                          })}

                          {/* Explanation */}
                          {q.explanation && showResults && (
                            <div className="mt-3">
                              <button
                                onClick={() => toggleExplanation(i)}
                                className="flex items-center gap-2 text-[12px] font-medium text-[#a78bfa] hover:text-white transition-colors px-1"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                {showExplanations[i] ? 'Hide' : 'View'} Explanation
                              </button>
                              {showExplanations[i] && (
                                <div className="mt-2 px-4 py-3 bg-[#7c5cfc]/08 border border-[#7c5cfc]/20 rounded-xl animate-fadeUp">
                                  <p className="text-[13px] text-[#c4b5fd] leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Submit / Results ──────────────────────────── */}
              {!showResults ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <button
                    onClick={submitQuiz}
                    disabled={answeredCount === 0}
                    className={`px-10 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                      answeredCount > 0
                        ? 'bg-gradient-to-r from-[#7c5cfc] to-[#6d4fe0] text-white shadow-lg shadow-[#7c5cfc]/25 hover:shadow-[#7c5cfc]/40 hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
                    }`}
                  >
                    Submit Quiz
                  </button>
                  {answeredCount > 0 && answeredCount < totalCount && (
                    <p className="text-[12px] text-[#d29922] bg-[#d29922]/10 px-3 py-1 rounded-full border border-[#d29922]/20">
                      {totalCount - answeredCount} question{totalCount - answeredCount > 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-[#161b26] border border-[#30363d] rounded-2xl p-8 text-center animate-fadeUp">
                  <div className={`text-6xl font-black mb-3 tracking-tight ${
                    pct >= 80 ? 'text-[#3fb950]' : pct >= 60 ? 'text-[#d29922]' : 'text-[#f85149]'
                  }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {score}<span className="text-2xl text-[#484f58] ml-1">/ {totalCount}</span>
                  </div>
                  <p className="text-[15px] font-bold text-white mb-1">
                    {pct >= 80 ? 'Mastery Achieved! 🎉' : pct >= 60 ? 'Solid Progress! 👍' : 'Keep Practicing 📚'}
                  </p>
                  <p className="text-[13px] text-[#8b949e] mb-6">
                    {pct}% accuracy on the {topic} assessment
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="px-7 py-3 rounded-xl text-[14px] font-semibold bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#7c5cfc] hover:text-white hover:border-[#7c5cfc] transition-all duration-200 active:scale-95"
                  >
                    Create New Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.3s ease-out both; }

        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #30363d; border-radius: 99px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </>
  );
};

export default React.memo(QuizMaker);