import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

/**
 * Datele altcuiva rămân ale altcuiva. Un cont care nu deține o hartă nu
 * trebuie să afle nici măcar că ea există -- de-asta orice acces străin
 * răspunde 404, nu 403 (403 ar confirma existența hărții).
 */

const tokenFor = (userId: string) =>
  `Bearer ${jwt.sign({ userId, email: `${userId}@test.local`, role: 'user' }, process.env.JWT_SECRET!)}`;

const intruder = tokenFor('u2');

const client = { query: vi.fn(), release: vi.fn() };

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(pool.connect).mockReset();
  client.query.mockReset();
  client.release.mockReset();
  vi.mocked(pool.connect).mockResolvedValue(client as never);
});

describe('un cont nu vede hărțile altui cont', () => {
  it('GET /all filtrează după user_id, nu întoarce hărțile altcuiva', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app).get('/api/profiles/all').set('Authorization', intruder);

    expect(response.status).toBe(200);
    expect(response.body.profiles).toEqual([]);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['u2']);
  });

  it('PUT pe o hartă străină dă 404, nu 403 sau 200', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app)
      .put('/api/profiles/p1')
      .set('Authorization', intruder)
      .send({ fullName: 'Alt Nume', birthDate: '1990-05-15' });

    expect(response.status).toBe(404);
  });

  it('DELETE pe o hartă străină dă 404, nu 403 sau 200', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app).delete('/api/profiles/p1').set('Authorization', intruder);

    expect(response.status).toBe(404);
  });

  it('activarea unei hărți străine dă 404, nu 403 sau 200', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT id, category FROM user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', intruder);

    expect(response.status).toBe(404);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('fără token, oricare rută răspunde 401, nu scurge nimic', async () => {
    const response = await request(app).get('/api/profiles/all');

    expect(response.status).toBe(401);
  });
});

describe('ștergerea hărții active', () => {
  const owner = tokenFor('u1');
  const clientSqls = () => client.query.mock.calls.map((c) => String(c[0]).trim());

  it('șterge și mută activarea pe alta în aceeași tranzacție', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [{ id: 'p1', is_active: true }] } as never);
    client.query.mockResolvedValue({ rows: [], rowCount: 1 });

    await request(app).delete('/api/profiles/p1').set('Authorization', owner).expect(200);

    const sqls = clientSqls();
    expect(sqls[0]).toBe('BEGIN');
    expect(sqls.some((s) => /DELETE FROM user_profiles/.test(s))).toBe(true);
    expect(sqls.some((s) => /SET is_active = true/.test(s))).toBe(true);
    expect(sqls[sqls.length - 1]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('dacă reactivarea pică, ștergerea se anulează -- nu rămâi fără hartă activă', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [{ id: 'p1', is_active: true }] } as never);
    client.query.mockImplementation(async (sql: string) => {
      if (/SET is_active = true/.test(sql)) throw new Error('boom');
      return { rows: [], rowCount: 1 };
    });

    await request(app).delete('/api/profiles/p1').set('Authorization', owner).expect(500);

    expect(clientSqls()).toContain('ROLLBACK');
    expect(clientSqls()).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
