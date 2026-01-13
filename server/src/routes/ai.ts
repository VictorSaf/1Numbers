import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Types for AI requests
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse {
  answer: string;
  relatedNumbers?: number[];
  suggestions?: string[];
  followUpQuestions?: string[];
}

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'mock'; // 'openai', 'anthropic', or 'mock'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Mock AI response for development/testing
function generateMockResponse(userMessage: string, language: string): AIResponse {
  const responses: Record<string, Record<string, AIResponse>> = {
    ro: {
      default: {
        answer: 'Bazat pe profilul tău numerologic, pot observa că ai un potențial remarcabil. Numerele tale indică o combinație unică de energie și direcție în viață. Te încurajez să explorezi mai profund semnificația numerelor tale personale pentru a descoperi cum poți folosi cel mai bine aceste energii.',
        relatedNumbers: [1, 5, 7],
        suggestions: [
          'Explorează mai mult despre Drumul Vieții',
          'Verifică previziunile pentru luna aceasta',
          'Analizează compatibilitatea cu partenerul',
        ],
        followUpQuestions: [
          'Ce semnifică Numărul Destinului pentru mine?',
          'Cum pot îmbunătăți energia anului personal?',
          'Care sunt lecțiile karmice principale?',
        ],
      },
    },
    en: {
      default: {
        answer: 'Based on your numerological profile, I can see that you have remarkable potential. Your numbers indicate a unique combination of energy and life direction. I encourage you to explore more deeply the meaning of your personal numbers to discover how you can best use these energies.',
        relatedNumbers: [1, 5, 7],
        suggestions: [
          'Explore more about your Life Path',
          'Check predictions for this month',
          'Analyze compatibility with your partner',
        ],
        followUpQuestions: [
          'What does my Destiny Number mean for me?',
          'How can I improve my personal year energy?',
          'What are my main karmic lessons?',
        ],
      },
    },
    ru: {
      default: {
        answer: 'Основываясь на вашем нумерологическом профиле, я вижу, что у вас замечательный потенциал. Ваши числа указывают на уникальное сочетание энергии и направления в жизни. Рекомендую глубже изучить значение ваших личных чисел, чтобы понять, как лучше использовать эти энергии.',
        relatedNumbers: [1, 5, 7],
        suggestions: [
          'Изучите больше о Жизненном Пути',
          'Проверьте прогнозы на этот месяц',
          'Проанализируйте совместимость с партнером',
        ],
        followUpQuestions: [
          'Что означает мое Число Судьбы?',
          'Как улучшить энергию личного года?',
          'Каковы мои основные кармические уроки?',
        ],
      },
    },
  };

  return responses[language]?.default || responses.en.default;
}

// Call OpenAI API
async function callOpenAI(request: AIRequest): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: request.messages,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message?: { content?: string } }>;
  };
  return data.choices[0]?.message?.content || '';
}

// Call Anthropic API
async function callAnthropic(request: AIRequest): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Extract system message and user messages
  const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
  const userMessages = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: request.maxTokens || 1000,
      system: systemMessage,
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json() as {
    content: Array<{ text?: string }>;
  };
  return data.content[0]?.text || '';
}

// Main AI consultation endpoint
router.post('/consult', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { systemPrompt, userPrompt, conversationHistory, language = 'en' } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: 'User prompt is required' });
    }

    // Build messages array
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: userPrompt });

    let answer: string;

    // Call appropriate AI provider
    switch (AI_PROVIDER) {
      case 'openai':
        answer = await callOpenAI({ messages });
        break;
      case 'anthropic':
        answer = await callAnthropic({ messages });
        break;
      case 'mock':
      default:
        // Use mock response for development
        const mockResponse = generateMockResponse(userPrompt, language);
        return res.json({
          success: true,
          ...mockResponse,
          provider: 'mock',
        });
    }

    // Parse AI response for structured data
    // In a production app, you might ask the AI to return JSON
    res.json({
      success: true,
      answer,
      provider: AI_PROVIDER,
    });
  } catch (error: unknown) {
    console.error('AI consultation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'AI consultation failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get daily suggestion endpoint
router.get('/daily-suggestion', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { language = 'en' } = req.query;

    // Get personal day number from user's birth date
    // In production, this would fetch from user profile
    const personalDay = new Date().getDate() % 9 || 9;

    const suggestions: Record<string, Record<number, object>> = {
      ro: {
        1: {
          message: 'Astăzi este o zi perfectă pentru noi începuturi.',
          focus: 'Leadership și independență',
          luckyNumbers: [1, 10, 19],
          affirmation: 'Sunt un lider și creez propria mea realitate.',
        },
        2: {
          message: 'Energia zilei favorizează cooperarea.',
          focus: 'Diplomație și parteneriate',
          luckyNumbers: [2, 11, 20],
          affirmation: 'Sunt în armonie cu cei din jurul meu.',
        },
        // Add more days...
      },
      en: {
        1: {
          message: 'Today is perfect for new beginnings.',
          focus: 'Leadership and independence',
          luckyNumbers: [1, 10, 19],
          affirmation: 'I am a leader and I create my own reality.',
        },
        2: {
          message: 'Today\'s energy favors cooperation.',
          focus: 'Diplomacy and partnerships',
          luckyNumbers: [2, 11, 20],
          affirmation: 'I am in harmony with those around me.',
        },
        // Add more days...
      },
      ru: {
        1: {
          message: 'Сегодня идеальный день для новых начинаний.',
          focus: 'Лидерство и независимость',
          luckyNumbers: [1, 10, 19],
          affirmation: 'Я лидер и создаю свою реальность.',
        },
        2: {
          message: 'Энергия дня благоприятствует сотрудничеству.',
          focus: 'Дипломатия и партнерство',
          luckyNumbers: [2, 11, 20],
          affirmation: 'Я в гармонии с окружающими.',
        },
        // Add more days...
      },
    };

    const langSuggestions = suggestions[language as string] || suggestions.en;
    const suggestion = langSuggestions[personalDay] || langSuggestions[1];

    res.json({
      success: true,
      personalDay,
      suggestion,
    });
  } catch (error: unknown) {
    console.error('Daily suggestion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get daily suggestion',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get frequent questions
router.get('/frequent-questions', async (req, res: Response) => {
  try {
    const { language = 'en' } = req.query;

    const questions: Record<string, Array<{ question: string; category: string }>> = {
      ro: [
        { question: 'Ce înseamnă Numărul Drumului Vieții pentru mine?', category: 'core' },
        { question: 'Cum pot folosi numerologia în cariera mea?', category: 'career' },
        { question: 'Ce spune Grila Lo Shu despre personalitatea mea?', category: 'loShu' },
        { question: 'Care este compatibilitatea mea ideală?', category: 'compatibility' },
        { question: 'Ce lecții karmice trebuie să învăț?', category: 'karmic' },
      ],
      en: [
        { question: 'What does my Life Path Number mean for me?', category: 'core' },
        { question: 'How can I use numerology in my career?', category: 'career' },
        { question: 'What does the Lo Shu Grid say about my personality?', category: 'loShu' },
        { question: 'What is my ideal compatibility?', category: 'compatibility' },
        { question: 'What karmic lessons do I need to learn?', category: 'karmic' },
      ],
      ru: [
        { question: 'Что означает мое Число Жизненного Пути?', category: 'core' },
        { question: 'Как я могу использовать нумерологию в карьере?', category: 'career' },
        { question: 'Что говорит сетка Ло Шу о моей личности?', category: 'loShu' },
        { question: 'Какова моя идеальная совместимость?', category: 'compatibility' },
        { question: 'Какие кармические уроки мне нужно выучить?', category: 'karmic' },
      ],
    };

    res.json({
      success: true,
      questions: questions[language as string] || questions.en,
    });
  } catch (error: unknown) {
    console.error('Frequent questions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get frequent questions',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Track AI usage for rate limiting
router.post('/track-usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // In production, this would update usage counters in the database
    // For now, just acknowledge the request

    res.json({
      success: true,
      message: 'Usage tracked',
    });
  } catch (error: unknown) {
    console.error('Track usage error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to track usage',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
