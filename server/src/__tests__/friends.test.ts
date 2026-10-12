import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Cercul: liste cu capăt și scrieri care merg împreună sau deloc.
 *
 * Acceptarea unei cereri și folosirea unui link de invitație scriau de două ori
 * fără tranzacție: o cădere între ele lăsa cererea „acceptată" fără prietenie,
 * sau linkul consumat fără nimic în schimb. Iar `max_uses` se verifica într-o
 * interogare și se incrementa în alta -- doi oameni pe același link de o
 * singură folosire treceau amândoi.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const ME = 'u1';
const OTHER = 'u2';
const asMe = `Bearer ${jwt.sign({ userId: ME, email: 'u1@test.local', role: 'user' }, process.env.JWT_SECRET!)}`;

const client = { query: vi.fn(), release: vi.fn() };

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(pool.connect).mockReset();
  client.query.mockReset();
  client.release.mockReset();
  vi.mocked(pool.connect).mockResolvedValue(client as never);
});

afterEach(() => {
  delete process.env.FRONTEND_URL;
});

const clientSqls = () => client.query.mock.calls.map((c) => String(c[0]).trim());
const poolSqls = () => vi.mocked(pool.query).mock.calls.map((c) => String(c[0]));

describe('listele au un capăt', () => {
  it.each(['/', '/requests', '/requests/sent', '/invite-links'])('GET %s are LIMIT', async (path) => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    await request(app).get(`/api/friends${path}`).set('Authorization', asMe).expect(200);
    expect(poolSqls().some((s) => /LIMIT\s+200/i.test(s))).toBe(true);
  });
});

describe('POST /api/friends/request/:id/accept', () => {
  it('acceptă și creează prietenia în aceeași tranzacție', async () => {
    client.query.mockImplementation(async (sql: string) =>
      /UPDATE friend_requests/.test(sql) ? { rows: [{ from_user_id: OTHER }], rowCount: 1 } : { rows: [], rowCount: 0 },
    );

    const res = await request(app).post('/api/friends/request/r1/accept').set('Authorization', asMe).expect(200);

    expect(res.body).toEqual({ success: true, message: 'Friend request accepted' });
    const sqls = clientSqls();
    expect(sqls[0]).toBe('BEGIN');
    expect(sqls.some((s) => /INSERT INTO friendships/.test(s))).toBe(true);
    expect(sqls[sqls.length - 1]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('o cerere care nu e a ta sau nu mai e în așteptare dă 404 și nu scrie nimic', async () => {
    client.query.mockResolvedValue({ rows: [], rowCount: 0 });

    await request(app).post('/api/friends/request/r1/accept').set('Authorization', asMe).expect(404);

    const sqls = clientSqls();
    expect(sqls.some((s) => /INSERT INTO friendships/.test(s))).toBe(false);
    expect(sqls).toContain('ROLLBACK');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('dacă prietenia nu se poate scrie, acceptarea se anulează', async () => {
    client.query.mockImplementation(async (sql: string) => {
      if (/UPDATE friend_requests/.test(sql)) return { rows: [{ from_user_id: OTHER }], rowCount: 1 };
      if (/INSERT INTO friendships/.test(sql)) throw new Error('boom');
      return { rows: [], rowCount: 0 };
    });

    await request(app).post('/api/friends/request/r1/accept').set('Authorization', asMe).expect(500);

    expect(clientSqls()).toContain('ROLLBACK');
    expect(clientSqls()).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });
});

describe('POST /api/friends/invite/:code', () => {
  const link = { rows: [{ id: 'l1', user_id: OTHER }], rowCount: 1 };

  it('consumă linkul atomic: verificarea max_uses stă în UPDATE, nu înaintea lui', async () => {
    client.query.mockImplementation(async (sql: string) => {
      if (/FROM friend_invite_links/.test(sql)) return link;
      if (/UPDATE friend_invite_links/.test(sql)) return { rows: [{ id: 'l1' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    vi.mocked(pool.query).mockResolvedValue({ rows: [{ email: 'b@x.ro', full_name: 'B' }] } as never);

    const res = await request(app).post('/api/friends/invite/abc').set('Authorization', asMe).expect(200);

    expect(res.body).toEqual({
      success: true,
      message: 'Friendship created',
      friend: { id: OTHER, email: 'b@x.ro', fullName: 'B' },
    });
    const update = clientSqls().find((s) => /UPDATE friend_invite_links/.test(s))!;
    expect(update).toMatch(/uses_count < max_uses/);
    expect(update).toMatch(/RETURNING/);
    expect(clientSqls()[0]).toBe('BEGIN');
    expect(clientSqls()).toContain('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('dacă altcineva a luat ultima folosire între timp, nu se creează prietenia', async () => {
    client.query.mockImplementation(async (sql: string) => {
      if (/FROM friend_invite_links/.test(sql)) return link;
      return { rows: [], rowCount: 0 }; // UPDATE-ul nu mai găsește loc
    });

    await request(app).post('/api/friends/invite/abc').set('Authorization', asMe).expect(404);

    expect(clientSqls().some((s) => /INSERT INTO friendships/.test(s))).toBe(false);
    expect(clientSqls()).toContain('ROLLBACK');
    expect(client.release).toHaveBeenCalledOnce();
  });
});

describe('adresa de invitație', () => {
  it('cade pe portul aplicației (8082), nu pe 8080', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ code: 'ABC' }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const res = await request(app).post('/api/friends/invite-link').set('Authorization', asMe).send({}).expect(200);

    expect(res.body.inviteUrl).toBe('http://localhost:8082/invite/ABC');
  });

  it('folosește FRONTEND_URL fără bară dublă', async () => {
    process.env.FRONTEND_URL = 'https://numerologia.ro/';
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: 'l1', code: 'XYZ', uses_count: 0, max_uses: null, expires_at: null, created_at: null, is_active: true }],
    } as never);

    const res = await request(app).get('/api/friends/invite-links').set('Authorization', asMe).expect(200);

    expect(res.body.links[0].inviteUrl).toBe('https://numerologia.ro/invite/XYZ');
  });
});
