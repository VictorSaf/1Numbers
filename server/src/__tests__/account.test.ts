import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { sendLetter, isEmailConfigured } from '../lib/email';
import { consumeToken, mintToken } from '../lib/authTokens';

/**
 * Contul, în mâna omului.
 *
 * Cele două drepturi din GDPR care cer un buton, nu o adresă de email la care
 * scrii și aștepți: să-ți iei datele, și să dispari.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));
vi.mock('../lib/email', () => ({
  isEmailConfigured: vi.fn(() => true),
  sendLetter: vi.fn(async () => ({ id: 'x' })),
}));
vi.mock('../lib/authTokens', async () => {
  const real = await vi.importActual<typeof import('../lib/authTokens')>('../lib/authTokens');
  return { ...real, mintToken: vi.fn(async () => 'JETON'), consumeToken: vi.fn() };
});

const ID = '00000000-0000-0000-0000-00000000beef';
const asMe = `Bearer ${jwt.sign({ userId: ID, email: 'om@exemplu.ro', role: 'user' }, process.env.JWT_SECRET!)}`;

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(sendLetter).mockClear();
  vi.mocked(isEmailConfigured).mockReturnValue(true);
});

describe('POST /api/account/deletion-request', () => {
  it('nu șterge nimic -- trimite confirmarea pe email', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: ID, email: 'om@exemplu.ro' }], rowCount: 1 } as never);

    await request(app).post('/api/account/deletion-request').set('Authorization', asMe).send({}).expect(200);

    expect(sendLetter).toHaveBeenCalledOnce();
    // Nicio interogare de ștergere n-a plecat.
    const sqls = vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => /DELETE/i.test(s))).toBe(false);
  });

  it('refuză când nu se poate trimite email, în loc să șteargă direct', async () => {
    // Fără confirmare, gestul ireversibil ar fi la o singură apăsare de pe un
    // laptop lăsat deschis. Se spune că nu se poate, nu se improvizează.
    vi.mocked(isEmailConfigured).mockReturnValue(false);
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ id: ID, email: 'om@exemplu.ro' }], rowCount: 1 } as never);

    const res = await request(app).post('/api/account/deletion-request').set('Authorization', asMe).send({});

    expect(res.status).toBe(503);
    expect(sendLetter).not.toHaveBeenCalled();
  });

  it('cere autentificare', async () => {
    await request(app).post('/api/account/deletion-request').send({}).expect(401);
  });
});

describe('POST /api/account/delete', () => {
  it('șterge de-adevăratelea, cu un singur DELETE', async () => {
    vi.mocked(consumeToken).mockResolvedValueOnce({ ok: true, userId: ID });
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    await request(app).post('/api/account/delete').send({ token: 'JETON' }).expect(200);

    const sql = String(vi.mocked(pool.query).mock.calls[0][0]);
    expect(sql).toMatch(/^DELETE FROM users/);
    // Nu marcare ca inactiv: „ștergem" trebuie să însemne ștergem.
    expect(sql).not.toMatch(/UPDATE|deleted_at|is_active/i);
  });

  it('refuză un jeton deja folosit și spune care e motivul', async () => {
    vi.mocked(consumeToken).mockResolvedValueOnce({ ok: false, reason: 'used' });

    const res = await request(app).post('/api/account/delete').send({ token: 'JETON' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('used');
  });

  it('nu șterge fără jeton', async () => {
    await request(app).post('/api/account/delete').send({}).expect(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('GET /api/account/export', () => {
  const gol = () => vi.mocked(pool.query).mockResolvedValue({ rows: [], rowCount: 0 } as never);

  it('nu scoate niciodată parola sau jetoanele', async () => {
    // Un export care conține credențiale transformă un drept într-o scurgere.
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: ID, email: 'om@exemplu.ro', name: 'Om' }],
      rowCount: 1,
    } as never);

    const res = await request(app).get('/api/account/export').set('Authorization', asMe).expect(200);

    const brut = JSON.stringify(res.body);
    expect(brut).not.toMatch(/password_hash|token_hash|auth_tokens|"p256dh"|"endpoint"/);
    const sqls = vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => /password_hash|auth_tokens|push_subscriptions/i.test(s))).toBe(false);
  });

  it('vine ca fișier de descărcat, nu ca pagină', async () => {
    gol();
    const res = await request(app).get('/api/account/export').set('Authorization', asMe).expect(200);

    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('cere autentificare', async () => {
    await request(app).get('/api/account/export').expect(401);
  });

  it('pune întrebările deodată și păstrează fiecare răspuns la cheia lui', async () => {
    // Douăsprezece citiri independente, una după alta, însemnau douăsprezece
    // drumuri dus-întors până la bază pentru un singur buton.
    let inFlight = 0;
    let maxInFlight = 0;
    vi.mocked(pool.query).mockImplementation((async (sql: string) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      const table = /FROM (\w+)/.exec(sql)![1];
      return { rows: [{ from: table }], rowCount: 1 };
    }) as never);

    const res = await request(app).get('/api/account/export').set('Authorization', asMe).expect(200);

    expect(maxInFlight).toBe(12);
    expect(res.body.account).toEqual({ from: 'users' });
    expect(res.body.profiles).toEqual([{ from: 'user_profiles' }]);
    expect(res.body.dailyReadings).toEqual([{ from: 'daily_readings' }]);
    expect(res.body.purchases).toEqual([{ from: 'one_time_purchases' }]);
    expect(Object.keys(res.body)).toEqual([
      'exportedAt', 'note', 'account', 'profiles', 'journal', 'dailyReadings', 'deepReadings',
      'notificationPreferences', 'gamification', 'achievements', 'activity', 'friends',
      'subscriptions', 'purchases',
    ]);
  });
});
