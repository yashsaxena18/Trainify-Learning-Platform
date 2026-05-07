
// server/routes/ai.js - AI Features Backend Implementation
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configure your Gemini API key (get from Google AI Studio)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Updated to most stable and available latest flash model
const GEMINI_MODEL = 'gemini-flash-latest';
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

// Helper function to call Gemini API using native fetch
async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Response:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch from Gemini');
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (error) {
    console.error('Gemini API Error:', error.message);
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

    const prompt = `You are a highly knowledgeable, patient, and expert AI tutor for Trainfy, an educational platform.
Your primary focus is to EXPLAIN concepts in-depth and resolve student DOUBTS effectively.

Context: ${context || 'General programming help'}
Student Question/Doubt: ${message}

Instructions for your response:
1. Deeply analyze what the student is asking or struggling with.
2. Provide a clear, step-by-step explanation to resolve their doubt.
3. Use simple, beginner-friendly language and analogies if necessary.
4. Include practical, relevant code examples to demonstrate the concept.
5. If they share an error or bug, explain WHY it happens before giving the solution.
6. Keep the tone encouraging, educational, and focused on building their understanding.

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

    const prompt = `You are an expert coding doubt solver for Trainfy students. A student is facing an issue and needs your help to understand and fix it.

Programming Language: ${language || 'JavaScript'}
${errorMessage ? `Error Message: ${errorMessage}` : ''}
${description ? `Problem Description: ${description}` : ''}

Code provided by student:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Instructions for your response:
1. **Root Cause Analysis**: First, explain clearly what is causing the error or issue in their code. Why did this happen?
2. **Step-by-Step Solution**: Explain how to fix it conceptually before showing the final code.
3. **Corrected Code**: Provide the corrected version of their code.
4. **Learning Takeaway**: Give a brief tip to help them avoid this specific mistake or doubt in the future.

Ensure your explanation is thorough, educational, and directly addresses their specific doubt.`;

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

    const prompt = `Create an engaging and educational interactive quiz for Trainfy students on the following topic:

Topic: ${topic}
Difficulty: ${difficulty || 'intermediate'}
Number of Questions: ${questionCount || 5}

Generate questions in this EXACT JSON format ONLY (do not include markdown tags like \`\`\`json):
{
  "quiz": {
    "title": "${topic} Mastery Quiz",
    "description": "Test and reinforce your understanding of ${topic}",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Provide a detailed explanation of WHY this answer is correct and why the others are wrong."
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

Ensure the questions test deep understanding, not just memorization. Include detailed explanations for the answers so students learn from their mistakes.`;

    const aiResponse = await callGeminiAPI(prompt);
    
    // Try to parse JSON response
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const quizData = JSON.parse(cleanResponse);
      
      res.json({
        success: true,
        quiz: quizData.quiz || quizData, // Use fallback if top-level 'quiz' object is missing
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