import webpush from 'web-push';
import pool from '../db';

/**
 * Capătul care trimite.
 *
 * Restul lanțului exista de la început: sw.js ascultă 'push' și
 * 'notificationclick', routes/notifications.ts stochează subscripțiile,
 * 007 a creat tabelele. Nimic nu chema vreodată un server de push.
 *
 * Acest modul nu știe ce e o predicție. Primește un payload și o subscripție.
 */

export interface PushPayload {
  title: string;
  body: string;
  tag: string;
  data: Record<string, unknown>;
}

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export type SendOutcome = 'sent' | 'gone' | 'failed';

let configured = false;

/**
 * Citește cheile VAPID din mediu. Întoarce false dacă lipsește vreuna --
 * apelantul decide ce face cu asta; aici nu aruncăm, ca lipsa cheilor să
 * oprească dispecerul fără să oprească API-ul.
 */
export function configurePush(): boolean {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/**
 * 404 și 410 sunt singurele coduri care înseamnă „abonatul nu mai există":
 * browserul a dezinstalat PWA-ul, a golit datele sau a rotit endpoint-ul.
 * Orice altceva -- 429, 500, o rețea căzută -- e tranzitoriu, iar o subscripție
 * ștearsă acolo nu se mai întoarce niciodată singură.
 */
export async function sendToSubscription(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<SendOutcome> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(payload),
    );
    return 'sent';
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode === 404 || statusCode === 410) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
      return 'gone';
    }

    console.error('[push] trimitere eșuată', statusCode, error);
    return 'failed';
  }
}
