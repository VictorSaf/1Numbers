import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Acordurile, ca dovadă.
 *
 * GDPR nu cere doar să ceri acordul, ci să poți demonstra că l-ai avut. Un rând
 * care se rescrie nu demonstrează nimic -- spune ce e adevărat acum, nu ce era
 * adevărat când omul a trimis datele.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const ID = '00000000-0000-0000-0000-0000000c0de5';
const asMe = `Bearer ${jwt.sign({ userId: ID, email: 'om@exemplu.ro', role: 'user' }, process.env.JWT_SECRET!)}`;

beforeEach(() => vi.mocked(pool.query).mockReset());

describe('POST /api/account/consents', () => {
  it('ADAUGĂ un rând, nu rescrie unul', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)  // insert
      .mockResolvedValueOnce({ rows: [{ kind: 'model', granted_at: new Date() }], rowCount: 1 } as never);

    await request(app).post('/api/account/consents').set('Authorization', asMe)
      .send({ kind: 'model', granted: true }).expect(200);

    const sql = String(vi.mocked(pool.query).mock.calls[0][0]);
    expect(sql).toMatch(/INSERT INTO user_consents/);
    expect(sql).not.toMatch(/UPDATE|ON CONFLICT/i);
  });

  it('scrie versiunea politicii, ca să știm ce text a acceptat', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await request(app).post('/api/account/consents').set('Authorization', asMe)
      .send({ kind: 'model', granted: true }).expect(200);

    const params = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(params[2]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('retragerea e tot un rând, pe cealaltă coloană', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await request(app).post('/api/account/consents').set('Authorization', asMe)
      .send({ kind: 'model', granted: false }).expect(200);

    const params = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(params[3]).toBeNull();      // granted_at
    expect(params[4]).toBeInstanceOf(Date); // withdrawn_at
  });

  it('nu lasă termenii să fie comutați dintr-un buton', async () => {
    // A „retrage" acceptarea contractului înseamnă a pleca, iar pentru asta
    // există ștergerea contului.
    const res = await request(app).post('/api/account/consents').set('Authorization', asMe)
      .send({ kind: 'terms', granted: false });

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('refuză un fel inventat', async () => {
    await request(app).post('/api/account/consents').set('Authorization', asMe)
      .send({ kind: 'orice', granted: true }).expect(400);
  });

  it('cere autentificare', async () => {
    await request(app).post('/api/account/consents').send({ kind: 'model', granted: true }).expect(401);
  });
});

describe('GET /api/account/consents', () => {
  it('deosebește „a refuzat" de „n-a fost întrebat"', async () => {
    // Interfața are nevoie de diferența asta ca să știe dacă trebuie să ceară.
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ kind: 'model', granted_at: null }],
      rowCount: 1,
    } as never);

    const res = await request(app).get('/api/account/consents').set('Authorization', asMe).expect(200);

    expect(res.body.consents.model).toBe(false);
    expect(res.body.consents.notifications).toBeUndefined();
  });

  it('citește ultimul rând pentru fiecare fel, nu primul', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await request(app).get('/api/account/consents').set('Authorization', asMe).expect(200);

    const sql = String(vi.mocked(pool.query).mock.calls[0][0]);
    expect(sql).toMatch(/DISTINCT ON \(kind\)/);
    expect(sql).toMatch(/ORDER BY kind, created_at DESC/);
  });
});
