import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const USER_ID = '00000000-0000-0000-0000-000000000042';
const token = jwt.sign(
  { userId: USER_ID, email: 'abonat@test.local', role: 'user' },
  process.env.JWT_SECRET!,
);

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
  keys: { p256dh: 'p', auth: 'a' },
};

const lastInsertParams = () => vi.mocked(pool.query).mock.calls[0][1] as unknown[];

describe('POST /api/notifications/subscribe', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(pool.query).mockResolvedValue({ rows: [], rowCount: 1 } as never);
  });

  it('stochează limba trimisă de client', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription, language: 'ru' });

    expect(response.status).toBe(200);
    expect(lastInsertParams()[3]).toBe('ru');
  });

  it('cade pe română când clientul nu trimite nicio limbă', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription });

    expect(response.status).toBe(200);
    expect(lastInsertParams()[3]).toBe('ro');
  });

  it('respinge o limbă pe care nu o avem, în loc să o scrie și să pice la CHECK', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription, language: 'de' });

    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
