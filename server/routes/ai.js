// server/routes/ai.js - AI Features Backend Implementation
'use strict';

const express = require('express');
const router  = express.Router();

// ── Environment ────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;

// ── Model Config ───────────────────────────────────────────────────
const GROQ_MODEL      = 'llama-3.3-70b-versatile';
const GEMINI_MODEL    = 'gemini-2.0-flash';
const GROQ_BASE_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const TIMEOUT_MS = 25_000;
const MAX_TOKENS = 2048;

// ── Rate Limiter ───────────────────────────────────────────────────
const userRequests = new Map();
const RATE_LIMIT   = 50;
const RATE_WINDOW  = 60 * 60 * 1_000; // 1 hour

const checkRateLimit = (userId) => {
  const now     = Date.now();
  const history = userRequests.get(userId) || [];
  const recent  = history.filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  userRequests.set(userId, recent);
  return true;
};

// ── Provider: Groq ─────────────────────────────────────────────────
async function callGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      signal  : controller.signal,
      body    : JSON.stringify({
        model      : GROQ_MODEL,
        messages   : [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens : MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from Groq');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Provider: Gemini ───────────────────────────────────────────────
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url      = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      signal  : controller.signal,
      body    : JSON.stringify({
        contents        : [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: MAX_TOKENS },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ── callAI: Groq first, fallback to Gemini ─────────────────────────
async function callAI(prompt) {
  const errors = [];

  if (GROQ_API_KEY) {
    try {
      console.log('[AI] Trying Groq...');
      return await callGroq(prompt);
    } catch (err) {
      console.warn(`[AI] Groq failed: ${err.message}`);
      errors.push(`Groq: ${err.message}`);
    }
  }

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

// ── JSON cleaner ───────────────────────────────────────────────────
const cleanJSON = (raw) => raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

// ══════════════════════════════════════════════════════════════════
//  1. CHATBOT TUTOR
// ══════════════════════════════════════════════════════════════════
router.post('/chatbot', async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    if (!message?.trim()) {
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

// ══════════════════════════════════════════════════════════════════
//  2. DOUBT SOLVER
// ══════════════════════════════════════════════════════════════════
router.post('/doubt-solver', async (req, res) => {
  try {
    const { code, errorMessage, language, description, userId } = req.body;

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please try again later.' });
    }

    const prompt = `You are an expert coding doubt solver for Trainfy students. A student is facing an issue and needs your help to understand and fix it.

Programming Language: ${language || 'JavaScript'}
${errorMessage ? `Error Message: ${errorMessage}` : ''}
${description  ? `Problem Description: ${description}` : ''}

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
    res.json({ success: true, solution: aiResponse, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('[AI Doubt Solver Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  3. QUIZ GENERATOR  — always 10 MCQ questions, no exceptions
// ══════════════════════════════════════════════════════════════════
const QUIZ_QUESTION_COUNT = 10;

router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty, userId } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please try again later.' });
    }

    const prompt = `Create a multiple-choice quiz for Trainfy students.

Topic      : ${topic}
Difficulty : ${difficulty || 'intermediate'}

STRICT REQUIREMENTS — follow exactly:
- Generate EXACTLY ${QUIZ_QUESTION_COUNT} questions. No more, no less.
- Every question MUST be type "multiple_choice".
- Every question MUST have EXACTLY 4 answer options.
- "correct_answer" MUST be a number: 0 = first option, 1 = second, 2 = third, 3 = fourth.
- Output ONLY valid raw JSON. No markdown. No code fences. No explanation text outside JSON.

JSON format to follow:
{
  "quiz": {
    "title": "${topic} Quiz",
    "description": "Test your understanding of ${topic}",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "Your question here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Why this answer is correct and why others are wrong."
      }
    ]
  }
}

Generate all ${QUIZ_QUESTION_COUNT} questions now:`;

    const aiResponse = await callAI(prompt);

    try {
      const quizData = JSON.parse(cleanJSON(aiResponse));
      const quiz     = quizData.quiz || quizData;

      // Sanitise & enforce rules server-side
      if (Array.isArray(quiz.questions)) {
        quiz.questions = quiz.questions
          .filter(q => Array.isArray(q.options) && q.options.length === 4)
          .slice(0, QUIZ_QUESTION_COUNT)
          .map((q, i) => ({
            id            : i + 1,
            type          : 'multiple_choice',
            question      : q.question,
            options       : q.options,
            correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer
                          : typeof q.correctAnswer  === 'number' ? q.correctAnswer
                          : 0,
            explanation   : q.explanation || '',
          }));
      }

      res.json({ success: true, quiz, timestamp: new Date().toISOString() });

    } catch (parseError) {
      console.error('[Quiz] JSON parse failed:', parseError.message);
      res.status(500).json({
        success: false,
        error  : 'Failed to parse quiz data. Please try again.',
      });
    }

  } catch (error) {
    console.error('[AI Quiz Generator Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  4. QUIZ ANSWER EVALUATION
// ══════════════════════════════════════════════════════════════════
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, questionType, userId } = req.body;

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please try again later.' });
    }

    // MCQ — no AI call needed, just compare
    if (questionType === 'multiple_choice') {
      const isCorrect = userAnswer === correctAnswer;
      return res.json({
        success : true,
        isCorrect,
        score   : isCorrect ? 100 : 0,
        feedback: isCorrect ? 'Correct! Well done!' : "That's not quite right. Try again!",
      });
    }

    // Short answer — AI evaluation
    const prompt = `You are evaluating a student's answer for Trainfy quiz system.

Question: ${question}
Expected Answer/Key Points: ${correctAnswer}
Student's Answer: ${userAnswer}

Respond ONLY with this JSON (no extra text):
{
  "score": 85,
  "feedback": "Brief 2-3 sentence feedback.",
  "strengths": "What the student got right.",
  "improvements": "What the student could improve."
}`;

    const aiResponse = await callAI(prompt);

    try {
      const evaluation = JSON.parse(cleanJSON(aiResponse));
      res.json({ success: true, ...evaluation, timestamp: new Date().toISOString() });
    } catch {
      res.json({ success: true, score: 50, feedback: aiResponse, timestamp: new Date().toISOString() });
    }

  } catch (error) {
    console.error('[AI Evaluate Error]:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════════
router.get('/health', async (req, res) => {
  const status = { groq: 'not configured', gemini: 'not configured' };

  if (GROQ_API_KEY) {
    try   { await callGroq('ping'); status.groq = 'working'; }
    catch (e) { status.groq = `error: ${e.message.substring(0, 50)}`; }
  }

  if (GEMINI_API_KEY) {
    try   { await callGemini('ping'); status.gemini = 'working'; }
    catch (e) { status.gemini = `error: ${e.message.substring(0, 50)}`; }
  }

  res.json({
    success     : true,
    message     : 'AI service is running',
    providers   : status,
    features    : ['chatbot', 'doubt-solver', 'quiz-generator', 'answer-evaluation'],
    quiz_config : { question_count: QUIZ_QUESTION_COUNT, question_type: 'multiple_choice' },
  });
});

module.exports = router;