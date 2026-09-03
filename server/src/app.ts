import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import profileRoutes from './routes/profiles';
import journalRoutes from './routes/journal';
import subscriptionRoutes from './routes/subscriptions';
import gamificationRoutes from './routes/gamification';
import aiRoutes from './routes/ai';
import todayRoutes from './routes/today';
import chartRoutes from './routes/chart';
import notificationRoutes from './routes/notifications';
import friendsRoutes from './routes/friends';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

// Middleware
//
// Production is same-origin -- the tunnel routes /api/* to this process on the
// host that serves the frontend -- so CORS matters only for local development,
// where Vite serves the app on 8082 and proxies here.
//
// The list used to also carry 8080 (twice) and 8081. Those are llama-server's
// ports on this machine now, not the frontend's; vite.config.ts explains why the
// dev server moved to 8082 with strictPort.
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8082',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
  // The production build served locally by scripts/serve-compass.mjs.
  'http://localhost:8090',
  'http://127.0.0.1:8090',
];

app.use(cors({
  origin: [...new Set(allowedOrigins)],
  credentials: true
}));
// A request body large enough to matter here is a journal entry or an AI
// question, both bounded by their own schemas. Express defaults to 100kb; the
// point of saying it is that the default is a decision, not an accident.
app.use(express.json({ limit: '100kb' }));

// This API answers JSON and nothing else -- it renders no page, loads no asset
// and is never framed -- so the policy is the strictest one there is. The three
// headers that used to be set by hand here are a subset of what helmet sets;
// scripts/serve-compass.mjs is the reference for the static origin, and this is
// its counterpart for /api.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'none'"],
      'form-action': ["'none'"],
    },
  },
  // Set below, and only behind TLS: the tunnel terminates it, and a bare
  // http:// request has to be redirected before it is worth pinning.
  strictTransportSecurity: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// Cloudflare terminates TLS and forwards the client's original scheme. Mirrors
// the static server so /api behaves identically to the rest of the origin.
// HSTS without includeSubDomains: sibling subdomains on this tunnel must not
// inherit the policy.
app.use((req, res, next) => {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0].trim();
  if (proto === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  if (proto === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/today', todayRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
