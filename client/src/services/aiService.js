// Replace with your Render backend URL
const API_BASE_URL = 'https://trainify-learning-platform.onrender.com/api';

class AIService {
  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // If you have auth
        },
        credentials: 'include' // ✅ important for cross-domain cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error(`AI Service Error (${endpoint}):`, error);
      throw error;
    }
  }

  async chatbotTutor({ message, userId, context }) {
    return await this.makeRequest('/chatbot', { message, userId, context });
  }

  async doubtSolver({ code, errorMessage, language, description, userId }) {
    return await this.makeRequest('/doubt-solver', { code, errorMessage, language, description, userId });
  }

  async generateQuiz({ topic, difficulty, questionCount, userId }) {
    return await this.makeRequest('/generate-quiz', { topic, difficulty, questionCount, userId });
  }

  async evaluateAnswer({ question, userAnswer, correctAnswer, questionType, userId }) {
    return await this.makeRequest('/evaluate-answer', { question, userAnswer, correctAnswer, questionType, userId });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/health`, { credentials: 'include' });
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const aiService = new AIService();
