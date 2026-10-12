import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

/**
 * Rutele pe care nu le chema nimeni au fost șterse, nu ascunse.
 *
 * Cu un jeton valid, un 404 nu poate veni decât din lipsa rutei: dacă una ar
 * mai exista, ar răspunde cu altceva (200, 400, 403 sau 500 pe baza mock-uită).
 * Vecinii păstrați răspund în continuare 401 fără jeton, deci nu i-am luat
 * odată cu ele.
 */
const asUser = `Bearer ${jwt.sign(
  { userId: 'u1', email: 'u1@test.local', role: 'user' },
  process.env.JWT_SECRET!,
)}`;

const REMOVED: Array<['get' | 'post', string]> = [
  ['get', '/api/gamification/stats'],
  ['post', '/api/gamification/award-achievement'],
  ['get', '/api/ai/daily-suggestion'],
  ['get', '/api/ai/frequent-questions'],
  ['post', '/api/ai/track-usage'],
  ['get', '/api/subscriptions/status'],
  ['post', '/api/subscriptions/cancel'],
  ['get', '/api/subscriptions/feature/readings/check'],
  ['post', '/api/subscriptions/feature/readings/use'],
  ['get', '/api/subscriptions/usage'],
  ['get', '/api/subscriptions/purchases'],
  ['post', '/api/subscriptions/purchase'],
  ['post', '/api/subscriptions/upgrade'],
  ['get', '/api/notifications/history'],
  ['post', '/api/notifications/read/1'],
  ['get', '/api/notifications/unread-count'],
];

const KEPT: Array<['get' | 'post' | 'put', string]> = [
  ['post', '/api/ai/consult'],
  ['post', '/api/subscriptions/create'],
  ['get', '/api/subscriptions/check'],
  ['get', '/api/subscriptions/tier'],
  ['get', '/api/subscriptions/white-label'],
  ['put', '/api/subscriptions/white-label'],
  ['post', '/api/notifications/subscribe'],
  ['post', '/api/notifications/unsubscribe'],
  ['get', '/api/notifications/preferences'],
  ['put', '/api/notifications/preferences'],
  ['post', '/api/notifications/test-send'],
];

describe('removed routes are gone', () => {
  it.each(REMOVED)('%s %s answers 404 even to a valid token', async (method, path) => {
    const response = await request(app)[method](path).set('Authorization', asUser).send({});
    expect(response.status).toBe(404);
  });
});

describe('their kept neighbours are still there', () => {
  it.each(KEPT)('%s %s still asks for a token', async (method, path) => {
    const response = await request(app)[method](path).send({});
    expect(response.status).toBe(401);
  });
});
