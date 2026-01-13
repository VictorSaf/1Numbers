import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Store push subscription
router.post('/subscribe', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Store subscription in database
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET keys = $3, updated_at = NOW()`,
      [userId, subscription.endpoint, JSON.stringify(subscription.keys)]
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
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

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
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

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

// Update user notification preferences
router.put('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Preferences required' });
    }

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

// Get notification history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, notification_type, title, body, sent_at, read_at
       FROM notification_history
       WHERE user_id = $1
       ORDER BY sent_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit as string), parseInt(offset as string)]
    );

    res.json({
      success: true,
      notifications: result.rows.map((n) => ({
        id: n.id,
        type: n.notification_type,
        title: n.title,
        body: n.body,
        sentAt: n.sent_at,
        readAt: n.read_at,
      })),
    });
  } catch (error: unknown) {
    console.error('Get history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get notification history',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Mark notification as read
router.post('/read/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    await pool.query(
      `UPDATE notification_history
       SET read_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: unknown) {
    console.error('Mark read error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to mark notification as read',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM notification_history
       WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );

    res.json({
      success: true,
      count: parseInt(result.rows[0].count),
    });
  } catch (error: unknown) {
    console.error('Get unread count error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get unread count',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
