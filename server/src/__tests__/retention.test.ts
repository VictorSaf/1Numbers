import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../db';
import { runRetention } from '../jobs/retention';

/**
 * Politica de retenție, verificabilă fără o bază reală: patru DELETE-uri, cu
 * fereastra ei proprie, apoi un rând în retention_runs -- rularea trebuie să
 * se poată dovedi, nu doar să se fi întâmplat.
 */

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

beforeEach(() => vi.mocked(pool.query).mockReset());

const mockDeletes = (counts: [number | null, number | null, number | null, number | null]) => {
  for (const rowCount of counts) {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount } as never);
  }
  // The retention_runs insert that follows the four deletes.
  vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 1 } as never);
};

describe('runRetention', () => {
  it('deletes from each table by its own retention window', async () => {
    mockDeletes([3, 1, 5, 2]);

    const result = await runRetention();

    expect(result).toEqual({
      daily_readings: 3,
      user_activity_log: 1,
      notification_history: 5,
      auth_tokens: 2,
    });

    const calls = vi.mocked(pool.query).mock.calls;
    expect(calls[0][0]).toMatch(/DELETE FROM daily_readings.*created_at.*90 days/s);
    expect(calls[1][0]).toMatch(/DELETE FROM user_activity_log.*created_at.*12 months/s);
    expect(calls[2][0]).toMatch(/DELETE FROM notification_history.*sent_at.*90 days/s);
    // auth_tokens is kept by expires_at, not created_at -- 7 days past expiry.
    expect(calls[3][0]).toMatch(/DELETE FROM auth_tokens.*expires_at.*7 days/s);
  });

  it('logs a retention_runs row with the counts and a duration', async () => {
    mockDeletes([0, 0, 0, 0]);

    const result = await runRetention();

    const insertCall = vi.mocked(pool.query).mock.calls[4];
    expect(insertCall[0]).toContain('retention_runs');
    const [deletedJson, durationMs] = insertCall[1] as [string, number];
    expect(JSON.parse(deletedJson)).toEqual(result);
    expect(typeof durationMs).toBe('number');
  });

  it('treats a null rowCount as zero', async () => {
    mockDeletes([null, null, null, null]);

    const result = await runRetention();

    expect(result).toEqual({
      daily_readings: 0,
      user_activity_log: 0,
      notification_history: 0,
      auth_tokens: 0,
    });
  });
});
