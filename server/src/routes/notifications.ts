import { Router, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { configurePush } from '../lib/push';
import { USER_ROWS_SQL, dispatchForUser, localIsoDate, type DueRow } from '../lib/dailyDispatch';

const router = Router();

// Limba în care pleacă push-ul spre acest dispozitiv. Coloana are un CHECK cu
// aceleași trei valori; validarea aici întoarce un 400 în loc să lase baza să
// arunce un 500.
const languageSchema = z.enum(['ro', 'en', 'ru']);

// Store push subscription
router.post('/subscribe', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { subscription, language } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    const parsedLanguage = language === undefined ? 'ro' : languageSchema.safeParse(language);
    if (parsedLanguage !== 'ro' && !parsedLanguage.success) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    const subscriptionLanguage = parsedLanguage === 'ro' ? 'ro' : parsedLanguage.data;

    // Store subscription in database
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys, language, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET keys = $3, language = $4, updated_at = NOW()`,
      [userId, subscription.endpoint, JSON.stringify(subscription.keys), subscriptionLanguage]
    );

    res.json({
      success: true,
      message: 'Subscription stored successfully',
    });
  } catch (error: unknown) {
    console.error('Subscribe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to store subscription',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Remove push subscription
router.post('/unsubscribe', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    // Remove all subscriptions for this user
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Unsubscribed successfully',
    });
  } catch (error: unknown) {
    console.error('Unsubscribe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to unsubscribe',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get user notification preferences
router.get('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT preferences FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default preferences
      return res.json({
        success: true,
        preferences: {
          enabled: false,
          dailyPrediction: true,
          dailyPredictionTime: '08:00',
          streakReminder: true,
          streakReminderTime: '20:00',
          specialDates: true,
          achievements: true,
        },
      });
    }

    res.json({
      success: true,
      preferences: result.rows[0].preferences,
    });
  } catch (error: unknown) {
    console.error('Get preferences error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get preferences',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// The shape 007 gives the column as its default, and the shape the dispatch
// function there reads back with preferences->>'enabled'. Anything else went
// into JSONB unchecked, so a preferences object of the wrong shape silently
// stopped that user's notifications instead of failing here.
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const preferencesSchema = z
  .object({
    enabled: z.boolean(),
    dailyPrediction: z.boolean(),
    dailyPredictionTime: z.string().regex(HHMM),
    streakReminder: z.boolean(),
    streakReminderTime: z.string().regex(HHMM),
    specialDates: z.boolean(),
    achievements: z.boolean(),
  })
  .strict();

// Update user notification preferences
router.put('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const parsed = preferencesSchema.safeParse(req.body?.preferences);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid preferences', details: parsed.error.issues });
    }
    const preferences = parsed.data;

    await pool.query(
      `INSERT INTO notification_preferences (user_id, preferences)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET preferences = $2, updated_at = NOW()`,
      [userId, JSON.stringify(preferences)]
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update preferences error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to update preferences',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * Proba.
 *
 * Trimite notificarea zilei de azi către propriile dispozitive ale adminului
 * care cheamă, ignorând ora și preferințele. Cheia de revendicare e
 * `test:<timestamp>`, deci nu consumă revendicarea zilnică și poate fi rulată
 * de câte ori e nevoie.
 *
 * Există fiindcă o notificare zilnică trimisă greșit ajunge la toți deodată și
 * nu se poate retrage: singurul mod cinstit de a dovedi lanțul e să-l parcurgi
 * o dată, către un dispozitiv al tău.
 */
router.post('/test-send', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!configurePush()) {
      return res.status(503).json({ error: 'Push is not configured (VAPID keys missing)' });
    }

    const { rows } = await pool.query<DueRow>(USER_ROWS_SQL, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No push subscription with an active profile for this user' });
    }

    const now = new Date();
    const tally = await dispatchForUser(rows, localIsoDate(now), `test:${now.toISOString()}`);

    res.json({ success: true, tally });
  } catch (error: unknown) {
    console.error('Test send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to send test notification',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
