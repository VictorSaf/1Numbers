import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

/**
 * The consultant is not allowed to invent.
 *
 * /consult used to answer 200 with a paragraph nobody wrote for this person --
 * AI_PROVIDER defaulted to 'mock', and the mock branch returned flattery about
 * "remarkable potential" plus a hardcoded [1, 5, 7], shaped exactly like a real
 * answer. A reader had no way to tell the difference, and neither did the
 * client: it saw 200 and rendered it.
 *
 * These assertions are about the one case that used to lie -- no provider
 * configured. Saying "not available" is the whole feature.
 */

const asUser = `Bearer ${jwt.sign(
  { userId: 'u1', email: 'u1@test.local', role: 'user' },
  process.env.JWT_SECRET!,
)}`;

const ENV_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'AI_PROVIDER'] as const;
const saved = new Map<string, string | undefined>();

// The suite runs on a machine that may well have a real key exported. Without
// this the test would prove nothing about the unconfigured case.
beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved.set(key, process.env[key]);
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = saved.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const consult = () =>
  request(app)
    .post('/api/ai/consult')
    .set('Authorization', asUser)
    .send({
      profileContext: 'Drumul Vieții: 7',
      question: 'Ce spune harta mea despre anul asta?',
      language: 'ro',
    });

describe('with no provider configured', () => {
  it('reports itself unavailable instead of answering', async () => {
    const response = await consult();

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('ai_unavailable');
  });

  it('carries no answer text of any kind', async () => {
    const response = await consult();

    expect(response.body.answer).toBeUndefined();
    expect(response.body.success).not.toBe(true);
  });
});
