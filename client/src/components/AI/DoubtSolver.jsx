// src/components/AI/DoubtSolver.jsx
import React, { useState } from 'react';
import { aiService } from '../../services/aiService';

const DoubtSolver = ({ userId }) => {
  const [code, setCode] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setSolution('');

    try {
      const response = await aiService.doubtSolver({ code, userId });
      if (response.success) setSolution(response.solution);
    } catch (error) {
      setSolution(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-6 bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">🔍</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-100">Doubt Solver</h3>
          <p className="text-sm text-gray-300">Paste your code and get instant solutions</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Your Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here... (JavaScript, Python, Java, etc.)"
            rows="12"
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-gray-800 text-gray-100 placeholder-gray-400 font-mono text-sm transition-all duration-200"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !code.trim()}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            isLoading || !code.trim()
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing Code...
            </div>
          ) : (
            'Solve My Doubt'
          )}
        </button>
      </div>

      {/* Solution */}
      {solution && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <h4 className="font-semibold text-gray-100">Solution</h4>
          </div>
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-xl p-6">
            <div className="prose prose-sm max-w-none text-gray-100 whitespace-pre-wrap">
              {solution}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtSolver;