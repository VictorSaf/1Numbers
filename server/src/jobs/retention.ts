import pool from '../db';

/**
 * Curățenia zilnică promisă în politica de confidențialitate.
 *
 * Pornit din pm2 cu cron_restart (vezi ecosystem.config.cjs la rădăcină), o
 * dată pe zi. Fiecare ștergere e după propria coloană de timp a tabelului --
 * nu toate `created_at` -- iar intervalul e cel din politică, nu o
 * presupunere:
 *
 *   daily_readings       90 zile   (migrația 013) -- se pot regenera din hartă
 *   user_activity_log    12 luni   (migrația 006) -- destul pentru securitate
 *   notification_history 90 zile   (migrația 007) -- istoric, nu arhivă
 *   auth_tokens   7 zile după expirare (migrația 015) -- diagnostic, apoi nimic
 *
 * journal_entries și user_profiles nu apar aici: sunt ale omului și stau până
 * le șterge el, prin /api/account/delete sau /export.
 *
 * Un rând în retention_runs la final face rularea verificabilă -- fără el,
 * "rulează zilnic" ar fi o promisiune pe care nimic n-o susține.
 */

export interface RetentionResult {
  daily_readings: number;
  user_activity_log: number;
  notification_history: number;
  auth_tokens: number;
}

export async function runRetention(): Promise<RetentionResult> {
  const start = Date.now();

  const dailyReadings = await pool.query(
    `DELETE FROM daily_readings WHERE created_at < now() - interval '90 days'`,
  );
  const activityLog = await pool.query(
    `DELETE FROM user_activity_log WHERE created_at < now() - interval '12 months'`,
  );
  const notificationHistory = await pool.query(
    `DELETE FROM notification_history WHERE sent_at < now() - interval '90 days'`,
  );
  // expires_at, nu created_at: ținem jetonul 7 zile după ce a EXPIRAT, ca
  // diagnostic pentru cineva care raportează un link ce nu a mers -- nu 7
  // zile de la emitere, ceea ce l-ar șterge înainte să apuce să expire.
  const authTokens = await pool.query(
    `DELETE FROM auth_tokens WHERE expires_at < now() - interval '7 days'`,
  );

  const deleted: RetentionResult = {
    daily_readings: dailyReadings.rowCount ?? 0,
    user_activity_log: activityLog.rowCount ?? 0,
    notification_history: notificationHistory.rowCount ?? 0,
    auth_tokens: authTokens.rowCount ?? 0,
  };

  await pool.query(
    `INSERT INTO retention_runs (deleted, duration_ms) VALUES ($1, $2)`,
    [JSON.stringify(deleted), Date.now() - start],
  );

  return deleted;
}

// Pornit direct de pm2 (cron_restart), nu importat de restul serverului.
if (require.main === module) {
  runRetention()
    .then((deleted) => {
      console.log('[retention]', JSON.stringify(deleted));
      return pool.end();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('[retention] failed', error);
      process.exit(1);
    });
}
