import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { passwordChangedAt } from '../lib/sessions';

/**
 * GET /api/auth/me -- ruta pe care clientul o cheamă la fiecare reîncărcare ca
 * să afle dacă mai e autentificat.
 *
 * Își decoda singură jetonul, pe lângă `authenticateToken`, deci nu întreba
 * dacă parola s-a schimbat după emiterea lui. Un dispozitiv rămas cu jetonul
 * vechi după o resetare primea 403 pe orice altă rută, dar 200 aici, așa că la
 * reîncărcare aplicația îl considera în continuare autentificat.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const ID = '00000000-0000-0000-0000-00000000beef';
const USER_ROW = {
  id: ID,
  email: 'om@exemplu.ro',
  name: 'Om',
  role: 'user',
  created_at: new Date('2026-01-01T00:00:00Z'),
};

const tokenIssuedAt = (iat: number) =>
  `Bearer ${jwt.sign({ userId: ID, email: 'om@exemplu.ro', role: 'user', iat }, process.env.JWT_SECRET!)}`;

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(passwordChangedAt).mockResolvedValue(null);
});

describe('GET /api/auth/me', () => {
  it('întoarce contul pentru un jeton valid', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [USER_ROW], rowCount: 1 } as never);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', tokenIssuedAt(Math.floor(Date.now() / 1000)))
      .expect(200);

    expect(res.body.user).toMatchObject({ id: ID, email: 'om@exemplu.ro', role: 'user' });
  });

  it('refuză un jeton emis înainte de ultima schimbare de parolă', async () => {
    const acumUnCeas = Math.floor(Date.now() / 1000) - 3600;
    vi.mocked(passwordChangedAt).mockResolvedValue(new Date());
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [USER_ROW], rowCount: 1 } as never);

    const res = await request(app).get('/api/auth/me').set('Authorization', tokenIssuedAt(acumUnCeas));

    expect(res.status).toBe(403);
    expect(res.body.user).toBeUndefined();
  });

  it('cere un jeton', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });
});
