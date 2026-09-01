import app from './app';
import { startNotificationScheduler } from './lib/notificationScheduler';

const PORT = Number(process.env.PORT) || 3001;

/**
 * Loopback e implicit; rețeaua locală se cere explicit, prin HOST.
 *
 * Tunelul se conectează de pe mașina asta, deci pentru public API-ul n-are
 * nevoie de nimic altceva. Rețeaua locală se deschide pentru un singur motiv:
 * `/api/admin/*` e blocat cu 404 în tunel (decis 2026-08-30) și rămâne așa, deci
 * panoul de admin nu are altă cale către backend de pe alt calculator.
 *
 * Vezi scripts/serve-compass.mjs pentru raționamentul întreg și
 * ecosystem.config.cjs pentru unde se decide.
 */
const HOST = process.env.HOST ?? '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`API available at http://${HOST}:${PORT}/api`);

  // Nu pornește nimic dacă NOTIFICATIONS_ENABLED nu e 'true'. Tipărește motivul
  // în oricare din cazuri, ca `pm2 logs compass-api` să spună de ce tace.
  startNotificationScheduler();
});
