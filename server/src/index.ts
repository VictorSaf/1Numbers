import app from './app';
import { startNotificationScheduler } from './lib/notificationScheduler';

const PORT = Number(process.env.PORT) || 3001;

// Start server
// Bound to loopback: the Cloudflare Tunnel connects from this machine, so the
// API never needs to be reachable on the LAN.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);

  // Nu pornește nimic dacă NOTIFICATIONS_ENABLED nu e 'true'. Tipărește motivul
  // în oricare din cazuri, ca `pm2 logs compass-api` să spună de ce tace.
  startNotificationScheduler();
});
