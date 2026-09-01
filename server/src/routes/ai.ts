import { Router, Response } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ipRateLimit, userRateLimit } from '../middleware/ipRateLimit';
import { isAiConfigured, askConsultant, AiUnavailableError } from '../lib/anthropic';
import { buildConsultMessages } from '../lib/consultMessages';

const router = Router();

// The system prompt belongs to the server.
//
// /consult used to take one from the request body and pass it straight through
// as the system message, which made this route an unmetered proxy to our own
// provider key: any authenticated client could point the model at any task it
// liked, on our bill. The text itself did not change -- it moved here from
// src/lib/aiPrompts.ts, to the side that pays for it.

const consultSchema = z.object({
  // Profilul e generat de noi și trimis de client; intră în prompt ca date,
  // niciodată în câmpul `system`. 6000 acoperă cu mult profilul cel mai bogat.
  profileContext: z.string().trim().min(1).max(6000),
  // Întrebarea o scrie un om. Vechea schemă avea un singur câmp de 8000, care
  // amesteca profilul cu întrebarea; opt mii de caractere de întrebare nu sunt
  // o întrebare.
  question: z.string().trim().min(1).max(1000),
  language: z.enum(['ro', 'en', 'ru']).default('en'),
  // Patru schimburi. API-ul e stateless, deci istoricul se retrimite întreg la
  // fiecare rundă și fiecare mesaj în plus se plătește din nou.
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1500),
      }),
    )
    .max(8)
    .default([]),
});

router.post(
  '/consult',
  authenticateToken,
  ipRateLimit({ windowMs: 60 * 60 * 1000, max: 30 }),
  userRateLimit({ windowMs: 60 * 60 * 1000, max: 15 }),
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Starea se spune înainte de a valida orice altceva. Verificat înaintea
    // formei cererii, nu după: indisponibilitatea nu depinde de ce a trimis
    // clientul, iar `ai-honesty.test.ts` verifică exact asta -- un client care
    // trimite un corp complet diferit tot primește 503, nu 400, când nu există
    // cheie. Vechiul cod cădea în tăcere pe un răspuns inventat; aici lipsa
    // cheii e un fapt pe care interfața îl arată dintâi.
    if (!isAiConfigured()) {
      return res.status(503).json({ error: 'ai_unavailable' });
    }

    const parsed = consultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    const { profileContext, question, conversationHistory, language } = parsed.data;

    try {
      const { system, messages } = buildConsultMessages({
        language,
        profileContext,
        history: conversationHistory,
        question,
      });

      const result = await askConsultant({ system, messages });

      // Prefixul cache-abil e scurt (system + profil). Sub pragul minim al
      // modelului cache-ul nu se activează, în tăcere -- de aceea îl măsurăm
      // în loc să presupunem că merge.
      console.log(
        `[ai] in=${result.usage.inputTokens} out=${result.usage.outputTokens} ` +
          `cache_read=${result.usage.cacheReadTokens} cache_write=${result.usage.cacheCreationTokens}`,
      );

      return res.json({ success: true, answer: result.text, truncated: result.truncated });
    } catch (error: unknown) {
      // Clase tipate, nu potriveli pe textul mesajului: un 429 și un 401 arată
      // la fel într-un string și cer răspunsuri complet diferite.
      if (error instanceof AiUnavailableError || error instanceof Anthropic.AuthenticationError) {
        console.error('[ai] provider credentials rejected or missing');
        return res.status(503).json({ error: 'ai_unavailable' });
      }
      if (error instanceof Anthropic.RateLimitError) {
        console.error('[ai] provider rate limit');
        return res.status(429).json({ error: 'ai_busy' });
      }
      console.error('[ai] consultation failed:', error);
      return res.status(502).json({ error: 'ai_failed' });
    }
  },
);

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
