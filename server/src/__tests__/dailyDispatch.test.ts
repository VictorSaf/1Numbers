import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../db';
import { sendToSubscription } from '../lib/push';
import {
  localHhMm,
  localIsoDate,
  dailyDedupeKey,
  runDailyDispatch,
  DUE_ROWS_SQL,
} from '../lib/dailyDispatch';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/push', () => ({ sendToSubscription: vi.fn() }));

const NOW = new Date(2026, 8, 1, 8, 5, 0); // 2026-09-01, 08:05 local

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  user_id: 'u1',
  endpoint: 'https://push.example/1',
  keys: { p256dh: 'p', auth: 'a' },
  language: 'ro',
  birth_date: '1990-05-15',
  ...over,
});

const claimed = () => ({ rows: [{ id: 'h1' }], rowCount: 1 });
const alreadyClaimed = () => ({ rows: [], rowCount: 0 });

describe('ferestre de timp', () => {
  it('formatează ora locală cu zero în față', () => {
    expect(localHhMm(new Date(2026, 8, 1, 8, 5))).toBe('08:05');
    expect(localHhMm(new Date(2026, 8, 1, 23, 59))).toBe('23:59');
  });

  it('formatează ziua locală, nu cea UTC', () => {
    expect(localIsoDate(new Date(2026, 8, 1, 0, 30))).toBe('2026-09-01');
  });

  it('cheia de revendicare poartă tipul și ziua', () => {
    expect(dailyDedupeKey('2026-09-01')).toBe('daily-prediction:2026-09-01');
  });
});

describe('runDailyDispatch', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(sendToSubscription).mockReset();
    delete process.env.NOTIFICATIONS_ONLY_USER;
  });

  it('caută abonații cu ora trecută care n-au primit azi', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await runDailyDispatch(NOW);

    expect(vi.mocked(pool.query).mock.calls[0][0]).toBe(DUE_ROWS_SQL);
    expect(vi.mocked(pool.query).mock.calls[0][1]).toEqual([
      '08:05',
      null,
      'daily-prediction:2026-09-01',
    ]);
  });

  it('restrânge selecția la un singur utilizator când NOTIFICATIONS_ONLY_USER e setat', async () => {
    process.env.NOTIFICATIONS_ONLY_USER = 'u-test';
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await runDailyDispatch(NOW);

    expect(vi.mocked(pool.query).mock.calls[0][1]).toEqual([
      '08:05',
      'u-test',
      'daily-prediction:2026-09-01',
    ]);
  });

  it('revendică o dată și trimite payload-ul zilei către fiecare dispozitiv al utilizatorului', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row(), row({ endpoint: 'https://push.example/2' })], rowCount: 2 } as never)
      .mockResolvedValueOnce(claimed() as never);
    vi.mocked(sendToSubscription).mockResolvedValue('sent');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 1, sent: 2, gone: 0, failed: 0 });
    expect(sendToSubscription).toHaveBeenCalledTimes(2);
    // 1990-05-15 la 2026-09-01 e ziua personală 4.
    expect(vi.mocked(sendToSubscription).mock.calls[0][1]).toEqual({
      title: 'Energia Zilei Tale',
      body: 'Zi bună pentru ce se construiește încet. Ai grijă să nu folosești munca drept adăpost.',
      tag: 'daily-prediction',
      data: { type: 'daily-prediction', personalDay: 4, url: '/azi' },
    });
  });

  it('nu trimite nimic dacă revendicarea a fost luată de altcineva', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(alreadyClaimed() as never);

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 0, sent: 0, gone: 0, failed: 0 });
    expect(sendToSubscription).not.toHaveBeenCalled();
  });

  it('renunță la revendicare când niciun dispozitiv n-a primit din cauza unei erori tranzitorii', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(claimed() as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    vi.mocked(sendToSubscription).mockResolvedValue('failed');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 0, sent: 0, gone: 0, failed: 1 });
    expect(vi.mocked(pool.query).mock.calls[2]).toEqual([
      'DELETE FROM notification_history WHERE id = $1',
      ['h1'],
    ]);
  });

  it('păstrează revendicarea când singurul dispozitiv era mort — nu mai e cui trimite', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(claimed() as never);
    vi.mocked(sendToSubscription).mockResolvedValue('gone');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 1, sent: 0, gone: 1, failed: 0 });
    expect(vi.mocked(pool.query)).toHaveBeenCalledTimes(2);
  });
});
