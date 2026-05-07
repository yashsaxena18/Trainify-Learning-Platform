import React, { useState } from 'react';
import { aiService } from '../../services/aiService';

const QuizMaker = ({ userId }) => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuiz(null);
    setAnswers({});
    setShowResults(false);
    setShowExplanations({});
    setError('');
    
    try {
      const response = await aiService.generateQuiz({ topic, userId });
      if (response.success) setQuiz(response.quiz);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setTopic('');
    setShowResults(false);
    setShowExplanations({});
    setError('');
  };

  const submitQuiz = () => {
    setShowResults(true);
    const all = {};
    quiz.questions.forEach((_, i) => { all[i] = true; });
    setShowExplanations(all);
  };

  const toggleExplanation = (i) => {
    setShowExplanations(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const calculateScore = () => {
    if (!quiz || !showResults) return 0;
    return quiz.questions.reduce((s, q, i) => {
      const correct = q.correctAnswer ?? q.correct_answer;
      return s + (answers[i] === correct ? 1 : 0);
    }, 0);
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz?.questions?.length || 0;
  const score = calculateScore();
  const pct = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;

  return (
    <div className="px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}

        {!quiz ? (
          /* ─── Generator ─── */
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold text-white/90 mb-1">Quiz Maker</h2>
              <p className="text-sm text-white/35">Enter a topic and AI will generate a quiz to test your knowledge</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Topic</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., JavaScript Arrays, Python OOP, React Hooks..."
                  className="w-full bg-[#0a0b0f] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/15 focus:outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/10 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && topic.trim() && generateQuiz()}
                />
              </div>

              <button
                onClick={generateQuiz}
                disabled={isLoading || !topic.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white py-3 rounded-xl text-sm font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating quiz...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ─── Quiz ─── */
          <div className="space-y-5" style={{ animation: 'fadeUp 0.4s ease-out' }}>

            {/* Quiz header */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white/90">{quiz.title || `${topic} Quiz`}</h2>
                  <p className="text-xs text-white/30 mt-0.5">
                    {totalCount} questions • {answeredCount} answered
                    {showResults && <span className="ml-2 text-violet-400 font-medium">Score: {score}/{totalCount} ({pct}%)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!showResults && (
                    <div className="text-xs text-white/25 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                      {totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0}%
                    </div>
                  )}
                  <button
                    onClick={resetQuiz}
                    className="text-xs text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/[0.06] transition-all"
                  >
                    New Quiz
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {!showResults && (
                <div className="mt-3 w-full bg-white/[0.04] rounded-full h-1">
                  <div
                    className="bg-violet-500 rounded-full h-1 transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>

            {/* Questions */}
            {quiz.questions?.map((q, i) => {
              const correctIdx = q.correctAnswer ?? q.correct_answer;
              const isAnswered = answers[i] !== undefined;
              const isCorrect = showResults && isAnswered && answers[i] === correctIdx;
              const isWrong = showResults && isAnswered && answers[i] !== correctIdx;

              return (
                <div
                  key={i}
                  className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
                    showResults
                      ? isCorrect ? 'border-emerald-500/20' : isWrong ? 'border-red-500/20' : 'border-white/[0.06]'
                      : 'border-white/[0.06]'
                  }`}
                >
                  {/* Question */}
                  <div className="p-5 border-b border-white/[0.04]">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        showResults
                          ? isCorrect ? 'bg-emerald-500/20 text-emerald-400' : isWrong ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.06] text-white/30'
                          : isAnswered ? 'bg-violet-500/20 text-violet-400' : 'bg-white/[0.06] text-white/30'
                      }`}>
                        {showResults ? (isCorrect ? '✓' : isWrong ? '✗' : i + 1) : i + 1}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed pt-0.5">{q.question}</p>
                    </div>
                  </div>

                  {/* Options */}
                  {q.options?.length > 0 && (
                    <div className="p-4 space-y-2">
                      {q.options.map((opt, idx) => {
                        const isSelected = answers[i] === idx;
                        const isCorrectOption = idx === correctIdx;
                        const letter = String.fromCharCode(65 + idx);

                        let style = 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:border-white/10 hover:text-white/70';
                        if (showResults) {
                          if (isCorrectOption) style = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300';
                          else if (isSelected && !isCorrectOption) style = 'bg-red-500/10 border-red-500/25 text-red-300';
                          else style = 'bg-white/[0.02] border-white/[0.04] text-white/25';
                        } else if (isSelected) {
                          style = 'bg-violet-500/15 border-violet-500/30 text-violet-300';
                        }

                        return (
                          <label
                            key={idx}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${style} ${showResults ? 'cursor-default' : ''}`}
                          >
                            <span className="text-xs font-mono font-bold w-5 text-center opacity-60">{letter}</span>
                            <input
                              type="radio"
                              name={`q${i}`}
                              checked={isSelected}
                              onChange={() => !showResults && setAnswers({ ...answers, [i]: idx })}
                              className="sr-only"
                              disabled={showResults}
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}

                      {/* Explanation toggle */}
                      {q.explanation && (
                        <button
                          onClick={() => toggleExplanation(i)}
                          className="mt-2 text-xs text-violet-400/60 hover:text-violet-400 transition-colors flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          {showExplanations[i] ? 'Hide explanation' : 'Show explanation'}
                        </button>
                      )}

                      {/* Explanation */}
                      {q.explanation && showExplanations[i] && (
                        <div className="mt-2 px-4 py-3 bg-violet-500/[0.06] border border-violet-500/10 rounded-xl" style={{ animation: 'fadeUp 0.3s ease-out' }}>
                          <p className="text-xs text-violet-200/70 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit / Results */}
            {!showResults ? (
              <div className="text-center py-4">
                <button
                  onClick={submitQuiz}
                  disabled={answeredCount === 0}
                  className="bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
                {answeredCount < totalCount && answeredCount > 0 && (
                  <p className="text-xs text-amber-400/50 mt-2">{totalCount - answeredCount} unanswered</p>
                )}
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center" style={{ animation: 'fadeUp 0.4s ease-out' }}>
                <div className={`text-4xl font-bold mb-2 ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score}/{totalCount}
                </div>
                <p className="text-sm text-white/40 mb-4">{pct}% — {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
                <button
                  onClick={resetQuiz}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Take Another Quiz
                </button>
              </div>
            )}
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

export default QuizMaker;