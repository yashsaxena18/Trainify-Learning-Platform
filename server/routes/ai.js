
// server/routes/ai.js - AI Features Backend Implementation
const express = require('express');
const router = express.Router();

// ✅ API Keys from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Model configuration
const GEMINI_MODEL = 'gemini-flash-latest';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting helper
const userRequests = new Map();
const RATE_LIMIT = 50;
const RATE_WINDOW = 60 * 60 * 1000;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userHistory = userRequests.get(userId) || [];
  const recentRequests = userHistory.filter(time => now - time < RATE_WINDOW);
  if (recentRequests.length >= RATE_LIMIT) return false;
  recentRequests.push(now);
  userRequests.set(userId, recentRequests);
  return true;
};

// ─── Provider 1: Groq (FREE, fast, reliable) ───
async function callGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Provider 2: Gemini (FREE Google AI) ───
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
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
      throw new Error(errorData.error?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ✅ Main AI function: tries Groq first (faster), falls back to Gemini
async function callAI(prompt) {
  const errors = [];

  // Try Groq first (faster and more reliable on free tier)
  if (GROQ_API_KEY) {
    try {
      console.log('[AI] Trying Groq...');
      return await callGroq(prompt);
    } catch (err) {
      console.warn(`[AI] Groq failed: ${err.message}`);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      console.log('[AI] Trying Gemini...');
      return await callGemini(prompt);
    } catch (err) {
      console.warn(`[AI] Gemini failed: ${err.message}`);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  console.error('[AI] All providers failed:', errors);
  throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
}

// 1. CHATBOT TUTOR ENDPOINT
router.post('/chatbot', async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

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

    const aiResponse = await callAI(prompt);

    res.json({ success: true, response: aiResponse, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Chatbot Error]:', error.message);
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

    const aiResponse = await callAI(prompt);
    
    res.json({
      success: true,
      solution: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Doubt Solver Error]:', error.message);
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
    
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

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

    const aiResponse = await callAI(prompt);
    
    // Try to parse JSON response
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const quizData = JSON.parse(cleanResponse);
      
      res.json({
        success: true,
        quiz: quizData.quiz || quizData,
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
    console.error('[AI Quiz Generator Error]:', error.message);
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

    const aiResponse = await callAI(prompt);
    
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
    console.error('[AI Evaluate Error]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  const status = { groq: 'not configured', gemini: 'not configured' };
  
  if (GROQ_API_KEY) {
    try {
      await callGroq('test');
      status.groq = 'working';
    } catch (e) {
      status.groq = `error: ${e.message.substring(0, 50)}`;
    }
  }
  
  if (GEMINI_API_KEY) {
    try {
      await callGemini('test');
      status.gemini = 'working';
    } catch (e) {
      status.gemini = `error: ${e.message.substring(0, 50)}`;
    }
  }
  
  res.json({
    success: true,
    message: 'AI service is running',
    providers: status,
    features: ['chatbot', 'doubt-solver', 'quiz-generator', 'answer-evaluation']
  });
});

module.exports = router;