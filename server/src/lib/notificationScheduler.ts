import { configurePush } from './push';
import { runDailyDispatch } from './dailyDispatch';

/**
 * Ceasul.
 *
 * setInterval, nu node-cron. Singurul lucru pe care node-cron îl aduce e
 * alinierea la minutul de ceas, iar alinierea contează numai dacă selecția e o
 * egalitate pe minut. A noastră e o fereastră -- „ora ta a trecut și n-ai
 * primit azi" -- deci un tick sărit, un drift de câteva secunde sau zece
 * minute de proces mort nu pierd nimic: următorul tick prinde.
 *
 * Două comutatoare, amândouă implicit închise:
 *   NOTIFICATIONS_ENABLED='true'  -- fără el, dispecerul nici nu pornește
 *   NOTIFICATIONS_ONLY_USER=<uuid> -- restrânge trimiterea la un singur cont
 *
 * O notificare zilnică trimisă greșit ajunge la toți deodată și nu se poate
 * retrage. De asta prima rulare reală se face cu ONLY_USER setat.
 */

const TICK_MS = 60_000;

export function startNotificationScheduler(): NodeJS.Timeout | null {
  if (process.env.NOTIFICATIONS_ENABLED !== 'true') {
    console.log('[notifications] dispecerul e oprit (NOTIFICATIONS_ENABLED nu e "true")');
    return null;
  }

  if (!configurePush()) {
    console.error(
      '[notifications] dispecerul NU a pornit: lipsesc VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT',
    );
    return null;
  }

  const onlyUser = process.env.NOTIFICATIONS_ONLY_USER;
  console.log(
    onlyUser
      ? `[notifications] dispecerul pornit, DOAR pentru ${onlyUser}`
      : '[notifications] dispecerul pornit, pentru toți abonații',
  );

  const timer = setInterval(() => {
    runDailyDispatch()
      .then((tally) => {
        if (tally.claimed > 0 || tally.failed > 0 || tally.gone > 0) {
          console.log('[notifications] dispecerat', tally);
        }
      })
      .catch((error) => console.error('[notifications] dispecerarea a eșuat', error));
  }, TICK_MS);

  // Listener-ul HTTP e ce ține procesul viu. Timerul nu trebuie să adauge un al
  // doilea motiv de a nu se închide.
  timer.unref();

  return timer;
}
