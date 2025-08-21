const API_BASE_URL =  'http://localhost:5000';

class AIService {
  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // If you have auth
        },
        body: JSON.stringify(data)
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

  // 1. Chatbot Tutor
  async chatbotTutor({ message, userId, context }) {
    return await this.makeRequest('/chatbot', {
      message,
      userId,
      context
    });
  }

  // 2. Doubt Solver
  async doubtSolver({ code, errorMessage, language, description, userId }) {
    return await this.makeRequest('/doubt-solver', {
      code,
      errorMessage,
      language,
      description,
      userId
    });
  }

  // 3. Quiz Generator
  async generateQuiz({ topic, difficulty, questionCount, userId }) {
    return await this.makeRequest('/generate-quiz', {
      topic,
      difficulty,
      questionCount,
      userId
    });
  }

  // 4. Answer Evaluation
  async evaluateAnswer({ question, userAnswer, correctAnswer, questionType, userId }) {
    return await this.makeRequest('/evaluate-answer', {
      question,
      userAnswer,
      correctAnswer,
      questionType,
      userId
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const aiService = new AIService();