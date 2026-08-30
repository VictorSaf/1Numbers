import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

/**
 * The three money routes wrote an active subscription -- or a completed
 * purchase, at a price the client chose -- with no payment step anywhere. They
 * are now shut unless ALLOW_BILLING is explicitly 'true', which it is not here
 * and is not in production either.
 *
 * The token is valid, so a 403 can only come from the billing gate: an
 * unauthenticated request would be stopped earlier, with a different body.
 */
const token = jwt.sign(
  { userId: '00000000-0000-0000-0000-000000000001', email: 'gate@test.local', role: 'user' },
  process.env.JWT_SECRET!,
);

const MONEY_ROUTES: Array<[string, Record<string, unknown>]> = [
  ['/api/subscriptions/create', { planId: 2, billingPeriod: 'monthly' }],
  ['/api/subscriptions/upgrade', { targetTierId: 'pro', billingPeriod: 'yearly' }],
  ['/api/subscriptions/purchase', { productId: 'report', productName: 'Report', price: 0.01 }],
];

describe('billing is closed while ALLOW_BILLING is unset', () => {
  it.each(MONEY_ROUTES)('POST %s answers 403 to a valid token', async (path, body) => {
    const response = await request(app)
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Payments are currently unavailable');
  });

  it.each(MONEY_ROUTES)('POST %s still requires a token', async (path, body) => {
    const response = await request(app).post(path).send(body);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Access token required');
  });
});
