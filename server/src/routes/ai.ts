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
    // Forma cererii se validează la marginea routerului, înaintea oricărei
    // verificări de stare: un corp malformat primește 400 indiferent de mediu.
    const parsed = consultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    }

    // Abia după ce cererea e validă verificăm dacă avem cu ce răspunde. Un
    // corp valid pe un server neconfigurat primește 503, nu un răspuns
    // inventat -- vechiul cod cădea în tăcere pe unul local.
    if (!isAiConfigured()) {
      return res.status(503).json({ error: 'ai_unavailable' });
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

export default router;
