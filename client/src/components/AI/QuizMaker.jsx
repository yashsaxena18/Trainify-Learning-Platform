import React, { useState } from 'react';

// Updated aiService to use Gemini API
const aiService = {
  generateQuiz: async ({ topic, userId }) => {
    // Replace with your actual Gemini API key
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    const prompt = `Generate exactly 5 multiple choice questions about "${topic}". 
    
    Format the response as a valid JSON object with this exact structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation of why this answer is correct and why other options are wrong"
        }
      ]
    }
    
    Requirements:
    - Each question should have exactly 4 options
    - correctAnswer should be the index (0-3) of the correct option
    - Explanations should be educational and detailed
    - Questions should test understanding, not just memorization
    - Make questions relevant and practical for learning ${topic}`;

    const GEMINI_MODEL = 'gemini-1.5-flash';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - Please check your API key`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from API');
      }

      const quizData = JSON.parse(jsonMatch[0]);
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz data structure');
      }

      return {
        success: true,
        quiz: {
          title: `${topic} Quiz`,
          questions: quizData.questions
        }
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }
  }
};

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
      if (response.success) {
        setQuiz(response.quiz);
      }
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
    // Show all explanations when submitting
    const allExplanations = {};
    quiz.questions.forEach((_, index) => {
      allExplanations[index] = true;
    });
    setShowExplanations(allExplanations);
  };

  const toggleExplanation = (questionIndex) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const calculateScore = () => {
    if (!quiz || !showResults) return 0;
    return quiz.questions.reduce((score, question, index) => {
      return score + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Full Screen Container */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl mb-6 shadow-2xl">
            <span className="text-4xl">📝</span>
          </div>
          {/* <h1 className="text-2xl font-bold text-gray-100 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Smart Quiz Maker
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Generate custom quizzes on any topic using AI and test your knowledge with detailed explanations
          </p> */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-400 text-red-300 p-6 mb-8 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {!quiz ? (
          /* Quiz Generator Section */
          <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-12 max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-100 mb-3">Create Your AI-Powered Quiz</h2>
                <p className="text-lg text-gray-300">Enter a topic and our AI will generate personalized questions with explanations</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-200 mb-4">
                    Quiz Topic
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., JavaScript ,CPP , Python...."
                    className="w-full px-6 py-4 text-lg border-2 border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 bg-gray-700 text-gray-100 placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && topic.trim() && generateQuiz()}
                  />
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={isLoading || !topic.trim()}
                  className={`w-full py-5 px-8 text-xl font-bold rounded-2xl transition-all duration-300 transform ${
                    isLoading || !topic.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Your AI Quiz...</span>
                    </div>
                  ) : (
                    <>
                      <span className="mr-3">🤖</span>
                      Generate AI Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Display Section */
          <div className="space-y-8">
            
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-bold mb-3">{quiz.title}</h2>
                  <p className="text-xl text-purple-100">
                    {totalQuestions} AI-Generated Questions • {answeredQuestions} Answered
                    {showResults && (
                      <span className={`block mt-2 text-2xl font-bold ${getScoreColor(calculateScore(), totalQuestions)}`}>
                        Score: {calculateScore()}/{totalQuestions} ({Math.round((calculateScore()/totalQuestions)*100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-4">
                  {!showResults && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                      <div className="text-sm text-purple-100">Progress</div>
                      <div className="text-2xl font-bold">
                        {totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0}%
                      </div>
                    </div>
                  )}
                  <button
                    onClick={resetQuiz}
                    className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-semibold hover:bg-purple-50 transition-all duration-200"
                  >
                    New Quiz
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {!showResults && (
                <div className="mt-6">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
                      style={{ width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Questions Container */}
            <div className="grid gap-8">
              {quiz.questions?.map((q, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCorrect = showResults && isAnswered && answers[i] === q.correctAnswer;
                const isWrong = showResults && isAnswered && answers[i] !== q.correctAnswer;
                
                return (
                  <div key={i} className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
                    {/* Question Header */}
                    <div className={`p-8 border-b border-gray-700 ${
                      showResults 
                        ? isCorrect 
                          ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                          : isWrong 
                            ? 'bg-gradient-to-r from-red-900/50 to-red-800/50'
                            : 'bg-gradient-to-r from-gray-700 to-gray-800'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800'
                    }`}>
                      <div className="flex items-start gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                          showResults 
                            ? isCorrect 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : isWrong 
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600'
                        }`}>
                          {showResults ? (
                            <span className="text-white font-bold text-xl">
                              {isCorrect ? '✓' : isWrong ? '✗' : '?'}
                            </span>
                          ) : (
                            <span className="text-white font-bold text-xl">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-100 leading-relaxed">
                            {q.question}
                          </h3>
                          <div className="flex items-center gap-4 mt-3">
                            {isAnswered && (
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                showResults 
                                  ? isCorrect 
                                    ? 'bg-green-900/50 text-green-300 border border-green-700' 
                                    : 'bg-red-900/50 text-red-300 border border-red-700'
                                  : 'bg-green-900/50 text-green-300 border border-green-700'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  showResults 
                                    ? isCorrect 
                                      ? 'bg-green-400' 
                                      : 'bg-red-400'
                                    : 'bg-green-400'
                                }`}></span>
                                {showResults 
                                  ? isCorrect 
                                    ? 'Correct' 
                                    : 'Incorrect'
                                  : 'Answered'
                                }
                              </div>
                            )}
                            
                            {q.explanation && (
                              <button
                                onClick={() => toggleExplanation(i)}
                                className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 border border-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-800/50 transition-colors"
                              >
                                <span className="text-lg">💡</span>
                                {showExplanations[i] ? 'Hide Explanation' : 'Show Explanation'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Answer Options */}
                    {q.options?.length > 0 && (
                      <div className="p-8">
                        <div className="grid gap-4">
                          {q.options.map((opt, idx) => {
                            const isSelected = answers[i] === idx;
                            const isCorrectOption = idx === q.correctAnswer;
                            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                            
                            let optionStyle = '';
                            if (showResults) {
                              if (isCorrectOption) {
                                optionStyle = 'bg-green-900/30 border-green-500 text-green-200';
                              } else if (isSelected && !isCorrectOption) {
                                optionStyle = 'bg-red-900/30 border-red-500 text-red-200';
                              } else {
                                optionStyle = 'bg-gray-700 border-gray-600 text-gray-300';
                              }
                            } else {
                              optionStyle = isSelected 
                                ? 'bg-purple-900/30 border-purple-400 shadow-lg transform scale-105 text-gray-100' 
                                : 'bg-gray-700 border-gray-600 hover:bg-purple-900/20 hover:border-purple-500 hover:shadow-md text-gray-200';
                            }
                            
                            return (
                              <label 
                                key={idx} 
                                className={`flex items-center gap-4 p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${optionStyle} ${showResults ? 'cursor-default' : ''}`}
                              >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                                  showResults
                                    ? isCorrectOption
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                                      : isSelected && !isCorrectOption
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                                        : 'bg-gray-600 border-2 border-gray-500 text-gray-300'
                                    : isSelected
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                      : 'bg-gray-600 border-2 border-gray-500 text-gray-300'
                                }`}>
                                  {optionLetter}
                                  {showResults && isCorrectOption && <span className="ml-1">✓</span>}
                                  {showResults && isSelected && !isCorrectOption && <span className="ml-1">✗</span>}
                                </div>
                                
                                <input
                                  type="radio"
                                  name={`q${i}`}
                                  checked={isSelected}
                                  onChange={() => !showResults && setAnswers({ ...answers, [i]: idx })}
                                  className="sr-only"
                                  disabled={showResults}
                                />
                                
                                <span className={`text-lg font-medium transition-colors duration-200 ${
                                  showResults 
                                    ? isCorrectOption 
                                      ? 'text-green-200' 
                                      : isSelected 
                                        ? 'text-red-200' 
                                        : 'text-gray-300'
                                    : isSelected 
                                      ? 'text-gray-100' 
                                      : 'text-gray-200'
                                }`}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        
                        {/* Explanation */}
                        {q.explanation && showExplanations[i] && (
                          <div className="mt-6 p-6 bg-blue-900/30 border-l-4 border-blue-400 rounded-lg">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">💡</span>
                              <div>
                                <h4 className="font-bold text-blue-300 mb-2">Explanation</h4>
                                <p className="text-blue-200 leading-relaxed">{q.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Section */}
            {!showResults && (
              <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">Ready to Submit?</h3>
                  <p className="text-lg text-gray-300 mb-8">
                    You've answered {answeredQuestions} out of {totalQuestions} questions.
                    {answeredQuestions < totalQuestions && (
                      <span className="block mt-2 text-amber-400 font-medium">
                        ⚠️ {totalQuestions - answeredQuestions} questions remaining
                      </span>
                    )}
                  </p>
                  
                  <button 
                    onClick={submitQuiz}
                    disabled={answeredQuestions === 0}
                    className={`px-12 py-5 text-xl font-bold rounded-2xl transition-all duration-300 transform ${
                      answeredQuestions === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-105'
                    }`}
                  >
                    <span className="mr-3">🚀</span>
                    Submit Quiz & See Results
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {showResults && (
              <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8">
                <div className="text-center max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold text-gray-100 mb-6">Quiz Complete! 🎉</h3>
                  <div className={`text-6xl font-bold mb-4 ${getScoreColor(calculateScore(), totalQuestions)}`}>
                    {calculateScore()}/{totalQuestions}
                  </div>
                  <p className="text-xl text-gray-300 mb-8">
                    You scored {Math.round((calculateScore()/totalQuestions)*100)}% on this {topic} quiz!
                  </p>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={resetQuiz}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    >
                      Take Another Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMaker;