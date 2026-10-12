import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { configurePush } from '../lib/push';
import { dispatchForUser, USER_ROWS_SQL } from '../lib/dailyDispatch';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/push', () => ({ configurePush: vi.fn() }));
vi.mock('../lib/dailyDispatch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/dailyDispatch')>();
  return { ...actual, dispatchForUser: vi.fn() };
});

const ADMIN_ID = '00000000-0000-0000-0000-0000000000ad';
const token = jwt.sign(
  { userId: ADMIN_ID, email: 'admin@test.local', role: 'admin' },
  process.env.JWT_SECRET!,
);

const asAdmin = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as never);
const asUser = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'user' }], rowCount: 1 } as never);

describe('POST /api/notifications/test-send', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(configurePush).mockReset().mockReturnValue(true);
    vi.mocked(dispatchForUser).mockReset().mockResolvedValue({
      claimed: 1, sent: 1, gone: 0, failed: 0,
    });
  });

  it('cere un token', async () => {
    const response = await request(app).post('/api/notifications/test-send');
    expect(response.status).toBe(401);
  });

  it('refuză un cont care nu e admin', async () => {
    asUser();
    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });

  it('răspunde 503 dacă lipsesc cheile VAPID, în loc să pretindă că a trimis', async () => {
    asAdmin();
    vi.mocked(configurePush).mockReturnValue(false);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(503);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });

  it('trimite către propriile dispozitive, cu o cheie de revendicare de test', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{
        user_id: ADMIN_ID,
        endpoint: 'https://push.example/1',
        keys: { p256dh: 'p', auth: 'a' },
        language: 'ro',
        birth_date: '1990-05-15',
      }],
      rowCount: 1,
    } as never);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tally).toEqual({ claimed: 1, sent: 1, gone: 0, failed: 0 });

    expect(vi.mocked(pool.query).mock.calls[1][0]).toBe(USER_ROWS_SQL);
    expect(vi.mocked(pool.query).mock.calls[1][1]).toEqual([ADMIN_ID]);

    const dedupeKey = vi.mocked(dispatchForUser).mock.calls[0][2];
    expect(dedupeKey.startsWith('test:')).toBe(true);
  });

  it('răspunde 404 dacă adminul n-are niciun dispozitiv abonat', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });
});
