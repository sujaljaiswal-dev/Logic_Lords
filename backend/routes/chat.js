const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

let groq;
try {
  const Groq = require('groq-sdk');
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    defaultHeaders: {
      'user-agent': 'ManoRakshak/1.0',
    },
  });
  console.log('✅ Groq SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Groq SDK:', error.message);
  groq = null;
}

if (!process.env.GROQ_API_KEY) {
  console.error('❌ ERROR: GROQ_API_KEY is not set in environment variables');
} else {
  console.log('✅ GROQ_API_KEY is configured');
}

// Detect stress level from text (0-10)
const detectStressLevel = (text) => {
  const highStressWords = ['anxious', 'panic', 'hopeless', 'worthless', 'suicide', 'die', 'can\'t cope', 'overwhelmed', 'depressed', 'घबराहट', 'निराश', 'काहीच नको'];
  const medStressWords = ['stressed', 'tired', 'sad', 'lonely', 'frustrated', 'worried', 'थका', 'दुखी', 'चिंता'];
  let score = 0;
  const lower = text.toLowerCase();
  highStressWords.forEach(w => { if (lower.includes(w)) score += 3; });
  medStressWords.forEach(w => { if (lower.includes(w)) score += 1; });
  return Math.min(score, 10);
};

// Build system prompt based on user preferences
const buildSystemPrompt = (user) => {
  const langMap = { english: 'English', hindi: 'Hindi' };
  const lang = langMap[user.languagePreference] || 'English';
  const location = user.locality === 'rural' ? 'rural' : 'urban';

  return `You are ManoRakshak, an empathetic AI psychiatrist/counselor for Indian users. Your ONLY job is to have a genuine therapeutic conversation.

CORE PRINCIPLE - YOU ARE A PSYCHIATRIST, NOT A SELF-HELP GUIDE:
- Your role is to LISTEN, UNDERSTAND, and EXPLORE with the user
- Do NOT give advice, tips, or breathing exercises
- Do NOT suggest coping strategies or techniques
- Focus on understanding WHY the user feels this way, not how to fix it
- Let the user lead the conversation—follow their emotional thread
- A good psychiatrist asks questions and explores, not prescribes solutions

PSYCHIATRIC APPROACH (What Real Therapists Do):
1. VALIDATE: Show you understand their feelings and experience
2. EXPLORE: Ask curious, open-ended questions to go deeper
3. REFLECT: Mirror back what you hear to show understanding
4. NORMALIZE: Let them know their feelings are understandable given their situation
5. BUILD TRUST: Create safe space for them to share more
6. AVOID: Rushing to "fix" anything or give quick solutions

CONVERSATION PATTERNS TO USE:
- "Tell me more about..." (Show genuine curiosity)
- "How did that make you feel?" (Explore emotions)
- "When did this start?" (Understand context)
- "What's the hardest part of this for you?" (Go deeper)
- "Has anything like this happened before?" (Look for patterns)
- "What do you think is driving this?" (Help them self-reflect)

CONVERSATION PATTERNS TO ABSOLUTELY AVOID:
- "Try doing..." (No advice)
- "Have you tried..." (No suggestions)
- "You should..." (No prescriptions)
- "Here's a technique..." (No techniques)
- "Breathe deeply..." (No breathing exercises)
- "This will help..." (No solutions)
- "Most people..." (No generalizations)
- Repeating the same response or question

MEMORY & CONTINUITY:
- Read the entire conversation history before responding
- Remember what the user has already shared
- Build on previous revelations—don't restart the conversation
- Reference specific things they mentioned (shows you care)
- If they've talked about a breathing exercise, DO NOT suggest it again
- Track what topics/feelings have been explored
- Go DEEPER into existing threads, not new suggestions

LANGUAGE & CONTEXT:
- Always respond in ${lang}
- User is from ${location} India - understand their life context
- Use relatable examples from Indian life and culture
- Adapt pace and language based on their education/communication style
- Be genuine—real psychiatrists aren't overly formal

RESPONSE STRUCTURE:
- Keep it conversational (1-3 sentences usually)
- Ask one good question, or make one deep observation
- Don't say everything at once
- Leave space for them to respond and think
- Genuinely listen to their answer (respond to what they actually said, not generic patterns)

WHAT THIS CONVERSATION SHOULD LOOK LIKE:
User: "I'm anxious"
YOU (Bad): "Try breathing exercises: 4 seconds in, 4 seconds hold..."
YOU (Good): "That sounds tough. What does that anxiety feel like for you right now?"

User: "My work is stressing me"
YOU (Bad): "Do meditation and journaling"
YOU (Good): "What specifically about work is getting to you? Is it a particular situation or the overall pressure?"

TONE:
- Warm and human, never clinical
- Sometimes gentle, sometimes more direct if they need it
- Curious and engaged, not detached
- Supportive but not overly cheerful
- Real psychiatrists aren't cheerleaders—they're genuine listeners

ONLY MENTION CRISIS RESOURCES IF THEY EXPLICITLY MENTION:
- Active suicidal or self-harm thoughts (not just stress)
- Severe immediate crisis
- Then simply say: "If you're in immediate danger, iCall (9152987821) or Vandrevala Foundation (1860-2662-345) are available 24/7"

REMEMBER: Your goal is UNDERSTANDING, not FIXING. Let the user feel heard, validated, and understood. That IS the healing.`;
};


// POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({ message: 'AI service not initialized' });
    }

    const { content, isIncognito = false, conversationHistory = [] } = req.body;
    const user = req.user;

    console.log('📨 Incoming message from user:', user._id);
    console.log('📝 Message content:', content.substring(0, 50) + '...');

    const stressScore = detectStressLevel(content);

    // Build messages for Groq
    const messages = [
      { role: 'system', content: buildSystemPrompt(user) },
      ...conversationHistory.slice(-10), // last 10 messages for context
      { role: 'user', content },
    ];

    console.log('🔄 Calling Groq API with model:', process.env.GROQ_CHAT_MODEL || 'mixtral-8x7b-32768');

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_CHAT_MODEL || 'mixtral-8x7b-32768',
      messages,
      max_tokens: 250,
      temperature: 0.8,
      top_p: 0.9,
    });

    console.log('✅ Groq API response received');
    let aiResponse = completion.choices[0]?.message?.content?.trim();

    // Validate response
    if (!aiResponse) {
      console.warn('⚠️ Empty response from Groq API, retrying...');
      // Return a fallback response if Groq fails
      aiResponse = user.languagePreference === 'hindi'
        ? "I understand. क्या आप इस बारे में और कुछ बता सकते हैं?"
        : "I'm listening. Tell me more about what you're feeling.";
    }

    console.log('✅ AI Response:', aiResponse.substring(0, 50) + '...');

    // Save to DB only if not incognito
    if (!isIncognito) {
      await Message.create({ userId: user._id, role: 'user', content, stressScore, isIncognito: false });
      await Message.create({ userId: user._id, role: 'assistant', content: aiResponse, isIncognito: false });

      // Update user stress level
      if (stressScore > 0) {
        await User.findByIdAndUpdate(user._id, { stressLevel: stressScore });
      }
    }

    console.log('✅ Message saved to database');
    res.json({ response: aiResponse, stressScore });
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    console.error('❌ Error Details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      validationError: error.errors ? Object.keys(error.errors) : null,
    });

    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('🔴 Database Validation Error - Content might be empty');
      return res.status(400).json({ message: 'Invalid response format', error: error.message });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/chat/history
router.get('/history', protect, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user._id, isIncognito: false })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/chat/analyze-image (face expression)
router.post('/analyze-image', protect, async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    // Using Llama 4 Scout for advanced emotion detection
    // Extract text from user's previous messages for context
    const recentMessages = await Message.find({ userId: req.user._id, isIncognito: false })
      .sort({ createdAt: -1 })
      .limit(5);

    const contextText = recentMessages.map(m => m.content).reverse().join(' ');

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_EMOTION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert emotional intelligence analyzer. Analyze emotions deeply and accurately. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Based on the user's recent conversation: "${contextText}", perform a detailed emotional analysis. Consider tone, word choice, and context. Return ONLY valid JSON (no markdown, no backticks): { "emotion": "happy|sad|anxious|stressed|neutral|angry|fearful", "stressLevel": 0-10, "description": "brief analysis", "confidence": 0-100 }`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      res.json(result);
    } catch {
      // If JSON parsing fails, return a default response
      res.json({
        emotion: 'neutral',
        stressLevel: 5,
        description: 'Unable to analyze. Please share more about how you are feeling.',
        confidence: 0
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Image analysis failed', error: error.message });
  }
});

// POST /api/chat/transcribe (voice-to-text)
// Note: Groq SDK doesn't support audio transcription yet
// This endpoint returns a placeholder - transcription happens on the frontend using Groq's Whisper API
router.post('/transcribe', protect, async (req, res) => {
  try {
    const { audioBase64, audioFormat = 'wav', transcribedText } = req.body;

    if (!transcribedText && !audioBase64) {
      return res.status(400).json({ message: 'Either transcribedText or audio data is required' });
    }

    // If transcribed text is already provided from frontend, use it
    if (transcribedText) {
      console.log('✅ Using pre-transcribed text:', transcribedText.substring(0, 50));
      return res.json({
        text: transcribedText,
        timestamp: new Date(),
        source: 'frontend'
      });
    }

    // For future integration with Groq audio API when available
    console.log('📝 Audio transcription endpoint (Groq audio API pending)');
    res.json({
      text: 'Transcription service will be available with Groq audio support',
      timestamp: new Date(),
      source: 'placeholder'
    });
  } catch (error) {
    console.error('❌ Transcription API Error:', error);
    console.error('❌ Error Details:', error.message, error.status);
    res.status(500).json({ message: 'Transcription failed', error: error.message });
  }
});

module.exports = router;
