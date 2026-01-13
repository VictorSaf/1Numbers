import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import journalRoutes from './routes/journal';
import subscriptionRoutes from './routes/subscriptions';
import gamificationRoutes from './routes/gamification';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8080'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
