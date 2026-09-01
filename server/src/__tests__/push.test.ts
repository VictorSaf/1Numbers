import { describe, it, expect, vi, beforeEach } from 'vitest';
import webpush from 'web-push';
import pool from '../db';
import { sendToSubscription, configurePush } from '../lib/push';

vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
}));
vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const SUB = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  keys: { p256dh: 'p', auth: 'a' },
};

const PAYLOAD = {
  title: 'Energia Zilei Tale',
  body: 'orice',
  tag: 'daily-prediction',
  data: { type: 'daily-prediction', url: '/azi' },
};

const failWith = (statusCode: number) => {
  const error = Object.assign(new Error('push rejected'), { statusCode });
  vi.mocked(webpush.sendNotification).mockRejectedValueOnce(error as never);
};

describe('sendToSubscription', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(webpush.sendNotification).mockReset();
    vi.mocked(pool.query).mockResolvedValue({ rows: [], rowCount: 0 } as never);
  });

  it('trimite payload-ul serializat și raportează "sent"', async () => {
    vi.mocked(webpush.sendNotification).mockResolvedValueOnce({} as never);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('sent');
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: SUB.endpoint, keys: SUB.keys },
      JSON.stringify(PAYLOAD),
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each([410, 404])('la %i șterge subscripția moartă și raportează "gone"', async (status) => {
    failWith(status);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('gone');
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM push_subscriptions WHERE endpoint = $1',
      [SUB.endpoint],
    );
  });

  it('la 500 raportează "failed" și NU șterge nimic — eșecul e al serverului de push, nu al abonatului', async () => {
    failWith(500);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('failed');
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('configurePush', () => {
  it('întoarce false când lipsește o cheie', () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;

    expect(configurePush()).toBe(false);
    expect(webpush.setVapidDetails).not.toHaveBeenCalled();
  });
});
