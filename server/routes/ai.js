// server/routes/ai.js - AI Features Backend Implementation
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configure your Gemini API key (get from Google AI Studio)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Updated to latest supported model (use gemini-1.5-flash or gemini-1.5-pro)
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Rate limiting helper
const userRequests = new Map();
const RATE_LIMIT = 50; // requests per hour per user
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userHistory = userRequests.get(userId) || [];

  // Remove old requests outside the window
  const recentRequests = userHistory.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  userRequests.set(userId, recentRequests);
  return true;
};

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // ✅ Updated response parsing for Gemini 1.5
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
}

// 1. CHATBOT TUTOR ENDPOINT
router.post('/chatbot', async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please try again later.' });
    }

    const prompt = `You are an AI tutor for Trainfy, an educational platform. Help students learn programming, web development, and coding concepts.

Context: ${context || 'General programming help'}
Student Question: ${message}

Provide a helpful, encouraging response that:
- Explains concepts clearly
- Uses examples when helpful
- Encourages learning
- Stays focused on educational content
- Keeps responses concise but informative

Response:`;

    const aiResponse = await callGeminiAPI(prompt);

    res.json({ success: true, response: aiResponse, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 2. DOUBT SOLVER ENDPOINT
router.post('/doubt-solver', async (req, res) => {
  try {
    const { code, errorMessage, language, description, userId } = req.body;
    
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    const prompt = `You are a coding doubt solver for Trainfy students. Analyze the following code issue and provide a clear solution.

Programming Language: ${language || 'JavaScript'}
${errorMessage ? `Error Message: ${errorMessage}` : ''}
${description ? `Problem Description: ${description}` : ''}

Code:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Please provide:
1. **Problem Explanation**: What's causing the issue?
2. **Solution**: How to fix it step-by-step
3. **Corrected Code**: Show the fixed version
4. **Learning Tip**: Help them avoid this in future

Keep your explanation beginner-friendly and educational.`;

    const aiResponse = await callGeminiAPI(prompt);
    
    res.json({
      success: true,
      solution: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. QUIZ GENERATOR ENDPOINT
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty, questionCount, userId } = req.body;
    
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    const prompt = `Create an interactive quiz for Trainfy students on the following topic:

Topic: ${topic}
Difficulty: ${difficulty || 'intermediate'}
Number of Questions: ${questionCount || 5}

Generate questions in this EXACT JSON format:
{
  "quiz": {
    "title": "${topic} Quiz",
    "description": "Test your knowledge on ${topic}",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Why this answer is correct"
      },
      {
        "id": 2,
        "type": "short_answer",
        "question": "Question requiring written response?",
        "sample_answer": "Expected answer format",
        "key_points": ["Point 1", "Point 2", "Point 3"]
      }
    ]
  }
}

Mix multiple choice and short answer questions. Make questions practical and test real understanding, not just memorization.`;

    const aiResponse = await callGeminiAPI(prompt);
    
    // Try to parse JSON response
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const quizData = JSON.parse(cleanResponse);
      
      res.json({
        success: true,
        quiz: quizData.quiz,
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      // If JSON parsing fails, return raw response
      res.json({
        success: true,
        quiz: {
          title: `${topic} Quiz`,
          raw_response: aiResponse
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. QUIZ ANSWER EVALUATION ENDPOINT
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, questionType, userId } = req.body;
    
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (questionType === 'multiple_choice') {
      const isCorrect = userAnswer === correctAnswer;
      res.json({
        success: true,
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? "Correct! Well done!" : "That's not quite right. Try again!"
      });
      return;
    }

    // For short answer questions, use AI evaluation
    const prompt = `You are evaluating a student's answer for Trainfy quiz system.

Question: ${question}
Expected Answer/Key Points: ${correctAnswer}
Student's Answer: ${userAnswer}

Evaluate the student's answer and provide:
1. Score (0-100)
2. Brief feedback (2-3 sentences)
3. What they got right
4. What they could improve

Respond in this JSON format:
{
  "score": 85,
  "feedback": "Good understanding shown...",
  "strengths": "You correctly identified...",
  "improvements": "Consider also mentioning..."
}`;

    const aiResponse = await callGeminiAPI(prompt);
    
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const evaluation = JSON.parse(cleanResponse);
      
      res.json({
        success: true,
        ...evaluation,
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      res.json({
        success: true,
        score: 50,
        feedback: aiResponse,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI service is running',
    features: ['chatbot', 'doubt-solver', 'quiz-generator', 'answer-evaluation']
  });
});

module.exports = router;