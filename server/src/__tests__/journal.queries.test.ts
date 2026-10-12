import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

/**
 * Jurnalul: cât cere clientul și cât de repede răspunde serverul.
 *
 * `limit` venea din query string direct în SQL: `?limit=abc` ajungea NaN, iar
 * `?limit=100000` scotea tot jurnalul dintr-o bucată. Iar statisticile puneau
 * cinci întrebări independente una după alta, deși nu se așteaptă între ele.
 */

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

const asMe = `Bearer ${jwt.sign({ userId: 'u1', email: 'u1@test.local', role: 'user' }, process.env.JWT_SECRET!)}`;

beforeEach(() => vi.mocked(pool.query).mockReset());

const lastParams = () => {
  const calls = vi.mocked(pool.query).mock.calls;
  return calls[calls.length - 1][1] as unknown[];
};

describe('GET /api/journal/entries -- limit și offset', () => {
  it('un limit care nu e număr cade pe 100, nu pe NaN', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    await request(app).get('/api/journal/entries?limit=abc&offset=xyz').set('Authorization', asMe).expect(200);
    expect(lastParams().slice(-2)).toEqual([100, 0]);
  });

  it('un limit uriaș e tăiat la 100', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    await request(app).get('/api/journal/entries?limit=100000').set('Authorization', asMe).expect(200);
    expect(lastParams().slice(-2)).toEqual([100, 0]);
  });

  it('un limit rezonabil trece neschimbat', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    await request(app).get('/api/journal/entries?limit=20&offset=40').set('Authorization', asMe).expect(200);
    expect(lastParams().slice(-2)).toEqual([20, 40]);
  });
});

describe('GET /api/journal/statistics', () => {
  it('pune cele cinci întrebări deodată, nu una după alta', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    vi.mocked(pool.query).mockImplementation((async (sql: string) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      if (/COUNT\(\*\) as count FROM journal_entries WHERE user_id = \$1$/.test(String(sql).trim())) {
        return { rows: [{ count: '3' }] };
      }
      return { rows: [] };
    }) as never);

    const res = await request(app).get('/api/journal/statistics').set('Authorization', asMe).expect(200);

    expect(maxInFlight).toBe(5);
    expect(res.body.statistics.totalEntries).toBe(3);
  });
});
