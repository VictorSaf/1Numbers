import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { writeDeepReading } from '../lib/deepReading';

/**
 * Citirea întreagă se scrie o dată per hartă, nu per vizită: e cea mai scumpă
 * operație din aplicație, iar harta nu se schimbă de la o zi la alta.
 */

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/deepReading', async (orig) => ({
  ...(await orig<typeof import('../lib/deepReading')>()),
  writeDeepReading: vi.fn(),
}));

const USER_ID = '00000000-0000-0000-0000-000000000091';
const token = jwt.sign({ userId: USER_ID, email: 'a@b.ro' }, process.env.JWT_SECRET!);
const profileRow = { rows: [{ id: '11111111-1111-1111-1111-111111111111' }], rowCount: 1 };

const STEPS = [
  { name: 'Drumul Vieții', figures: '7', say: 'Energia întrebării: nu accepți un răspuns comod.' },
  { name: 'Destinul', figures: '1', say: 'Energia începutului și a deciziei asumate singur.' },
  { name: 'Sufletul', figures: '5', say: 'Energia mișcării: stagnarea te costă mai mult decât riscul.' },
];
const BODY = { opening: 'o.', chapters: [{ title: 't', text: 'x' }], closing: 'c.' };
const post = (b: object = { language: 'ro', steps: STEPS }) =>
  request(app).post('/api/chart/reading').set('Authorization', `Bearer ${token}`).send(b);

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(writeDeepReading).mockReset().mockResolvedValue({
    body: BODY, source: 'model', model: 'claude-opus-5',
  });
});

describe('POST /api/chart/reading', () => {
  it('cere autentificare', async () => {
    await request(app).post('/api/chart/reading').send({ language: 'ro', steps: STEPS }).expect(401);
  });

  it('scrie citirea și o ține minte', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
      .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);

    const res = await post().expect(200);

    expect(res.body.source).toBe('model');
    expect(writeDeepReading).toHaveBeenCalledTimes(1);
    expect(vi.mocked(pool.query).mock.calls[2][0]).toMatch(/INSERT INTO deep_readings/i);
  });

  it('nu rescrie citirea pentru aceeași hartă', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce(profileRow as never)
      .mockResolvedValueOnce({ rows: [{ body: BODY, source: 'model', model: 'x' }], rowCount: 1 } as never);

    const res = await post().expect(200);

    expect(writeDeepReading).not.toHaveBeenCalled();
    expect(res.body.cached).toBe(true);
  });

  it('altă hartă, altă amprentă, altă citire', async () => {
    const hashes: string[] = [];
    for (const steps of [STEPS, [...STEPS.slice(0, 2), { ...STEPS[2], figures: '8' }]]) {
      vi.mocked(pool.query).mockReset();
      vi.mocked(pool.query)
        .mockResolvedValueOnce(profileRow as never)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
        .mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as never);
      await post({ language: 'ro', steps }).expect(200);
      hashes.push(String(vi.mocked(pool.query).mock.calls[1][1]![2]));
    }
    expect(hashes[0]).not.toBe(hashes[1]);
  });

  it('refuză o hartă prea scurtă ca să fie o hartă', async () => {
    await post({ language: 'ro', steps: STEPS.slice(0, 1) }).expect(400);
  });

  it('refuză o cerere care ar umfla promptul', async () => {
    await post({ language: 'ro', steps: Array(40).fill(STEPS[0]) }).expect(400);
  });

  it('spune 404 dacă omul n-are profil', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await post().expect(404);
  });
});
