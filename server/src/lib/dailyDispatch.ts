import pool from '../db';
import { sendToSubscription, type StoredSubscription } from './push';
import { personalDayNumber, parseCalendarDate } from './personalDay';
import { buildDailyPredictionPayload, type NotificationLanguage } from './dailyNotification';

/**
 * Dispecerul notificării zilnice.
 *
 * Selecția e o FEREASTRĂ, nu o egalitate pe minut: „ora ta a trecut ȘI n-ai
 * primit azi". Egalitatea pe minut -- care e ce face funcția
 * get_users_for_daily_notification din 007 -- pierde notificarea la orice
 * restart, drift sau minut sărit, și o pierde tăcut.
 *
 * Revendicarea e un INSERT ... ON CONFLICT DO NOTHING RETURNING id în
 * notification_history. Indexul unic (user_id, dedupe_key) din 010 e lacătul.
 * Dacă nu se întoarce niciun rând, altcineva trimite deja -- alt proces, sau
 * acelaşi proces la un tick anterior care încă rulează. Nu se trimite nimic.
 *
 * Ora se compară cu ceasul LOCAL al acestei mașini. dailyPredictionTime n-are
 * fus orar și nimic din schemă nu ține fusul utilizatorului. E o limitare
 * cunoscută, nu un accident.
 */

export interface DueRow {
  user_id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  language: NotificationLanguage;
  birth_date: string;
}

export interface DispatchTally {
  claimed: number;
  sent: number;
  gone: number;
  failed: number;
}

export function localHhMm(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function localIsoDate(now: Date): string {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

export function dailyDedupeKey(isoDate: string): string {
  return `daily-prediction:${isoDate}`;
}

/**
 * $1 ora locală HH:MM, $2 utilizatorul unic în modul de probă (sau NULL),
 * $3 cheia de revendicare a zilei.
 *
 * Comparația `<= $1` pe șiruri e corectă fiindcă preferencesSchema impune deja
 * HH:MM cu zero în față.
 */
export const DUE_ROWS_SQL = `
  SELECT ps.user_id, ps.endpoint, ps.keys, ps.language, up.birth_date
  FROM push_subscriptions ps
  JOIN notification_preferences np ON np.user_id = ps.user_id
  JOIN user_profiles up ON up.user_id = ps.user_id AND up.is_active = true
  WHERE (np.preferences->>'enabled')::boolean = true
    AND (np.preferences->>'dailyPrediction')::boolean = true
    AND np.preferences->>'dailyPredictionTime' <= $1
    AND ($2::uuid IS NULL OR ps.user_id = $2::uuid)
    AND NOT EXISTS (
      SELECT 1 FROM notification_history nh
      WHERE nh.user_id = ps.user_id AND nh.dedupe_key = $3
    )
`;

/** Toate dispozitivele unui utilizator, fără să întrebe de preferințe sau de oră. */
export const USER_ROWS_SQL = `
  SELECT ps.user_id, ps.endpoint, ps.keys, ps.language, up.birth_date
  FROM push_subscriptions ps
  JOIN user_profiles up ON up.user_id = ps.user_id AND up.is_active = true
  WHERE ps.user_id = $1::uuid
`;

const CLAIM_SQL = `
  INSERT INTO notification_history (user_id, notification_type, title, body, data, dedupe_key)
  VALUES ($1, 'daily-prediction', $2, $3, $4, $5)
  ON CONFLICT (user_id, dedupe_key) DO NOTHING
  RETURNING id
`;

/**
 * Trimite unui singur utilizator, pe toate dispozitivele lui.
 *
 * `rows` trebuie să fie toate ale aceluiaşi utilizator; prima e cea din care se
 * ia data nașterii, care e a profilului activ și e aceeași pe toate.
 */
export async function dispatchForUser(
  rows: DueRow[],
  isoDate: string,
  dedupeKey: string,
): Promise<DispatchTally> {
  const tally: DispatchTally = { claimed: 0, sent: 0, gone: 0, failed: 0 };
  if (rows.length === 0) return tally;

  const personalDay = personalDayNumber(
    parseCalendarDate(rows[0].birth_date),
    parseCalendarDate(isoDate),
  );
  const payload = buildDailyPredictionPayload(personalDay, rows[0].language);

  const claim = await pool.query<{ id: string }>(CLAIM_SQL, [
    rows[0].user_id,
    payload.title,
    payload.body,
    JSON.stringify(payload.data),
    dedupeKey,
  ]);

  if (claim.rowCount === 0) return tally;
  tally.claimed = 1;

  let delivered = 0;
  let failedHere = 0;

  for (const row of rows) {
    const subscription: StoredSubscription = { endpoint: row.endpoint, keys: row.keys };
    const outcome = await sendToSubscription(subscription, payload);

    if (outcome === 'sent') {
      delivered += 1;
      tally.sent += 1;
    } else if (outcome === 'gone') {
      tally.gone += 1;
    } else {
      failedHere += 1;
      tally.failed += 1;
    }
  }

  // Nimic n-a plecat și motivul e tranzitoriu: eliberăm revendicarea ca
  // tick-ul următor să reîncerce. Dacă toate dispozitivele erau moarte
  // ('gone'), revendicarea rămâne -- nu mai e cui trimite, iar o reîncercare
  // ar reface aceeași interogare la nesfârșit.
  if (delivered === 0 && failedHere > 0) {
    await pool.query('DELETE FROM notification_history WHERE id = $1', [claim.rows[0].id]);
    tally.claimed = 0;
  }

  return tally;
}

export async function runDailyDispatch(now: Date = new Date()): Promise<DispatchTally> {
  const isoDate = localIsoDate(now);
  const dedupeKey = dailyDedupeKey(isoDate);
  const onlyUser = process.env.NOTIFICATIONS_ONLY_USER || null;

  const { rows } = await pool.query<DueRow>(DUE_ROWS_SQL, [localHhMm(now), onlyUser, dedupeKey]);

  const byUser = new Map<string, DueRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  const total: DispatchTally = { claimed: 0, sent: 0, gone: 0, failed: 0 };

  for (const userRows of byUser.values()) {
    const tally = await dispatchForUser(userRows, isoDate, dedupeKey);
    total.claimed += tally.claimed;
    total.sent += tally.sent;
    total.gone += tally.gone;
    total.failed += tally.failed;
  }

  return total;
}
