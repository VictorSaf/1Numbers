import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ipRateLimit } from '../middleware/ipRateLimit';
import { SYSTEM_PROMPTS } from '../lib/aiPrompts';

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

// Which provider can actually answer, decided per request.
//
// There used to be a third value here -- 'mock' -- and it was the default, so
// an install with no key configured answered every question. It returned a
// paragraph about the reader's "remarkable potential" and a hardcoded
// [1, 5, 7], with HTTP 200 and the same shape as a real answer, which meant
// nothing downstream could tell it apart -- and the client rendered it as a
// reading. A consultant that is switched off is honest; one that invents is
// not, because the reader cannot tell which of the two they got.
//
// The environment is read per call rather than at import, so a test can prove
// the unconfigured case without reloading the module.

type Provider = 'openai' | 'anthropic';

function resolveProvider(): Provider | null {
  const explicit = process.env.AI_PROVIDER;
  if (explicit === 'openai') return process.env.OPENAI_API_KEY ? 'openai' : null;
  if (explicit === 'anthropic') return process.env.ANTHROPIC_API_KEY ? 'anthropic' : null;
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

// Call OpenAI API
async function callOpenAI(request: AIRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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
      'x-api-key': apiKey,
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

// The system prompt belongs to the server.
//
// /consult used to take one from the request body and pass it straight through
// as the system message, which made this route an unmetered proxy to our own
// provider key: any authenticated client could point the model at any task it
// liked, on our bill. The text itself did not change -- it moved here from
// src/lib/aiPrompts.ts, to the side that pays for it.

const consultSchema = z.object({
  // The client folds the user's profile context into this string, so it is
  // far longer than the question itself.
  userPrompt: z.string().trim().min(1).max(8000),
  language: z.enum(['ro', 'en', 'ru']).default('en'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .default([]),
});

// Main AI consultation endpoint
router.post(
  '/consult',
  authenticateToken,
  ipRateLimit({ windowMs: 60 * 60 * 1000, max: 30 }),
  async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const parsed = consultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const { userPrompt, conversationHistory, language } = parsed.data;

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS[language] },
      ...conversationHistory,
      { role: 'user', content: userPrompt },
    ];

    const provider = resolveProvider();
    if (!provider) {
      return res.status(503).json({ error: 'ai_unavailable' });
    }

    const answer =
      provider === 'anthropic'
        ? await callAnthropic({ messages })
        : await callOpenAI({ messages });

    res.json({
      success: true,
      answer,
      provider,
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
