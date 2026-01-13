import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user gamification stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get or create gamification record
    const result = await pool.query(
      `INSERT INTO user_gamification (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [userId]
    );

    const stats = result.rows[0];

    // Get user achievements
    const achievementsResult = await pool.query(
      `SELECT achievement_id, earned_at, xp_awarded
       FROM user_achievements
       WHERE user_id = $1
       ORDER BY earned_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        totalXP: stats.total_xp,
        currentLevel: stats.current_level,
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak,
        lastActivityDate: stats.last_activity_date,
        readingsCount: stats.readings_count,
        compatibilityCount: stats.compatibility_count,
        journalEntriesCount: stats.journal_entries_count,
        coursesCompleted: stats.courses_completed,
        predictionsViewed: stats.predictions_viewed,
        toolsUsed: stats.tools_used,
        createdAt: stats.created_at,
        updatedAt: stats.updated_at,
      },
      achievements: achievementsResult.rows.map((a) => ({
        achievementId: a.achievement_id,
        earnedAt: a.earned_at,
        xpAwarded: a.xp_awarded,
      })),
    });
  } catch (error: unknown) {
    console.error('Get gamification stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Add XP for an activity
router.post('/add-xp', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { activityType, xpAmount, metadata } = req.body;

    if (!activityType || typeof xpAmount !== 'number' || xpAmount <= 0) {
      return res.status(400).json({ error: 'Invalid activity type or XP amount' });
    }

    // Validate XP amount (prevent abuse)
    const maxXP: Record<string, number> = {
      daily_login: 10,
      complete_reading: 25,
      compatibility_check: 15,
      journal_entry: 20,
      view_prediction: 10,
      complete_course: 100,
      share_result: 15,
      use_tool: 10,
      first_profile: 50,
      weekly_challenge: 150,
    };

    const allowedXP = maxXP[activityType];
    if (!allowedXP) {
      return res.status(400).json({ error: 'Unknown activity type' });
    }

    const actualXP = Math.min(xpAmount, allowedXP);

    const result = await pool.query(
      'SELECT * FROM add_user_xp($1, $2, $3, $4)',
      [userId, actualXP, activityType, metadata ? JSON.stringify(metadata) : null]
    );

    const xpResult = result.rows[0];

    res.json({
      success: true,
      xpAdded: actualXP,
      totalXP: xpResult.new_total_xp,
      currentLevel: xpResult.new_level,
      levelUp: xpResult.level_up,
    });
  } catch (error: unknown) {
    console.error('Add XP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Update streak (called on daily login)
router.post('/update-streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query('SELECT * FROM update_user_streak($1)', [userId]);

    const streakResult = result.rows[0];

    // Award streak-based XP
    if (streakResult.streak_continued) {
      let streakXP = 10; // Base daily login XP

      // Bonus XP for streak milestones
      if (streakResult.current_streak === 7) {
        streakXP += 50; // 7-day streak bonus
      } else if (streakResult.current_streak === 30) {
        streakXP += 200; // 30-day streak bonus
      } else if (streakResult.current_streak === 100) {
        streakXP += 500; // 100-day streak bonus
      }

      await pool.query(
        'SELECT * FROM add_user_xp($1, $2, $3, $4)',
        [userId, streakXP, 'daily_login', JSON.stringify({ streak: streakResult.current_streak })]
      );
    }

    res.json({
      success: true,
      currentStreak: streakResult.current_streak,
      longestStreak: streakResult.longest_streak,
      streakContinued: streakResult.streak_continued,
    });
  } catch (error: unknown) {
    console.error('Update streak error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Award achievement
router.post('/award-achievement', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { achievementId, xpReward } = req.body;

    if (!achievementId || typeof xpReward !== 'number') {
      return res.status(400).json({ error: 'Invalid achievement ID or XP reward' });
    }

    const result = await pool.query(
      'SELECT * FROM award_achievement($1, $2, $3)',
      [userId, achievementId, xpReward]
    );

    const awarded = result.rows[0].award_achievement;

    if (!awarded) {
      return res.json({
        success: true,
        awarded: false,
        message: 'Achievement already earned',
      });
    }

    res.json({
      success: true,
      awarded: true,
      achievementId,
      xpAwarded: xpReward,
    });
  } catch (error: unknown) {
    console.error('Award achievement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT achievement_id, earned_at, xp_awarded
       FROM user_achievements
       WHERE user_id = $1
       ORDER BY earned_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      achievements: result.rows.map((a) => ({
        achievementId: a.achievement_id,
        earnedAt: a.earned_at,
        xpAwarded: a.xp_awarded,
      })),
    });
  } catch (error: unknown) {
    console.error('Get achievements error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get weekly challenges
router.get('/challenges', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get active challenges
    const challengesResult = await pool.query(
      `SELECT id, challenge_id, title_ro, title_en, title_ru,
              description_ro, description_en, description_ru,
              requirement_type, requirement_count, xp_reward,
              week_start, week_end
       FROM weekly_challenges
       WHERE is_active = true
         AND CURRENT_DATE BETWEEN week_start AND week_end
       ORDER BY xp_reward DESC`
    );

    // Get user progress for these challenges
    const challengeIds = challengesResult.rows.map((c) => c.id);

    let progressMap: Record<string, { progress: number; completed: boolean; xpClaimed: boolean }> = {};

    if (challengeIds.length > 0) {
      const progressResult = await pool.query(
        `SELECT challenge_id, current_progress, completed, xp_claimed
         FROM user_challenge_progress
         WHERE user_id = $1 AND challenge_id = ANY($2)`,
        [userId, challengeIds]
      );

      progressMap = progressResult.rows.reduce((acc, row) => {
        acc[row.challenge_id] = {
          progress: row.current_progress,
          completed: row.completed,
          xpClaimed: row.xp_claimed,
        };
        return acc;
      }, {} as Record<string, { progress: number; completed: boolean; xpClaimed: boolean }>);
    }

    const challenges = challengesResult.rows.map((c) => ({
      id: c.id,
      challengeId: c.challenge_id,
      title: {
        ro: c.title_ro,
        en: c.title_en,
        ru: c.title_ru,
      },
      description: {
        ro: c.description_ro,
        en: c.description_en,
        ru: c.description_ru,
      },
      requirementType: c.requirement_type,
      requirementCount: c.requirement_count,
      xpReward: c.xp_reward,
      weekStart: c.week_start,
      weekEnd: c.week_end,
      progress: progressMap[c.id]?.progress || 0,
      completed: progressMap[c.id]?.completed || false,
      xpClaimed: progressMap[c.id]?.xpClaimed || false,
    }));

    res.json({
      success: true,
      challenges,
    });
  } catch (error: unknown) {
    console.error('Get challenges error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Update challenge progress
router.post('/challenge-progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { challengeId, incrementBy = 1 } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    // Get challenge info
    const challengeResult = await pool.query(
      `SELECT id, requirement_count, xp_reward
       FROM weekly_challenges
       WHERE id = $1 AND is_active = true
         AND CURRENT_DATE BETWEEN week_start AND week_end`,
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found or not active' });
    }

    const challenge = challengeResult.rows[0];

    // Create or update progress
    const progressResult = await pool.query(
      `INSERT INTO user_challenge_progress (user_id, challenge_id, current_progress)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, challenge_id)
       DO UPDATE SET
         current_progress = LEAST(
           user_challenge_progress.current_progress + $3,
           $4
         ),
         completed = CASE
           WHEN user_challenge_progress.current_progress + $3 >= $4 THEN true
           ELSE user_challenge_progress.completed
         END,
         completed_at = CASE
           WHEN user_challenge_progress.current_progress + $3 >= $4 AND user_challenge_progress.completed = false
           THEN NOW()
           ELSE user_challenge_progress.completed_at
         END,
         updated_at = NOW()
       RETURNING current_progress, completed, xp_claimed`,
      [userId, challengeId, incrementBy, challenge.requirement_count]
    );

    const progress = progressResult.rows[0];

    res.json({
      success: true,
      currentProgress: progress.current_progress,
      requirementCount: challenge.requirement_count,
      completed: progress.completed,
      xpClaimed: progress.xp_claimed,
    });
  } catch (error: unknown) {
    console.error('Update challenge progress error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Claim challenge reward
router.post('/claim-challenge', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    // Check if challenge is completed and not claimed
    const progressResult = await pool.query(
      `SELECT ucp.current_progress, ucp.completed, ucp.xp_claimed, wc.xp_reward
       FROM user_challenge_progress ucp
       JOIN weekly_challenges wc ON wc.id = ucp.challenge_id
       WHERE ucp.user_id = $1 AND ucp.challenge_id = $2`,
      [userId, challengeId]
    );

    if (progressResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge progress not found' });
    }

    const progress = progressResult.rows[0];

    if (!progress.completed) {
      return res.status(400).json({ error: 'Challenge not completed' });
    }

    if (progress.xp_claimed) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }

    // Mark as claimed and add XP
    await pool.query(
      `UPDATE user_challenge_progress
       SET xp_claimed = true, updated_at = NOW()
       WHERE user_id = $1 AND challenge_id = $2`,
      [userId, challengeId]
    );

    const xpResult = await pool.query(
      'SELECT * FROM add_user_xp($1, $2, $3, $4)',
      [userId, progress.xp_reward, 'weekly_challenge', JSON.stringify({ challengeId })]
    );

    res.json({
      success: true,
      xpAwarded: progress.xp_reward,
      totalXP: xpResult.rows[0].new_total_xp,
      currentLevel: xpResult.rows[0].new_level,
      levelUp: xpResult.rows[0].level_up,
    });
  } catch (error: unknown) {
    console.error('Claim challenge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Increment activity counter
router.post('/increment-counter', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { counterName } = req.body;

    const validCounters = [
      'readings_count',
      'compatibility_count',
      'journal_entries_count',
      'courses_completed',
      'predictions_viewed',
      'tools_used',
    ];

    if (!counterName || !validCounters.includes(counterName)) {
      return res.status(400).json({ error: 'Invalid counter name' });
    }

    const result = await pool.query(
      'SELECT * FROM increment_activity_counter($1, $2)',
      [userId, counterName]
    );

    res.json({
      success: true,
      counterName,
      newCount: result.rows[0].increment_activity_counter,
    });
  } catch (error: unknown) {
    console.error('Increment counter error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (_req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT user_id, total_xp, current_level, current_streak, longest_streak
       FROM user_gamification
       ORDER BY total_xp DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      leaderboard: result.rows.map((row, index) => ({
        rank: index + 1,
        totalXP: row.total_xp,
        currentLevel: row.current_level,
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
      })),
    });
  } catch (error: unknown) {
    console.error('Get leaderboard error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get user rank
router.get('/rank', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT rank FROM (
         SELECT user_id, RANK() OVER (ORDER BY total_xp DESC) as rank
         FROM user_gamification
       ) ranked
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        rank: null,
        message: 'User not ranked yet',
      });
    }

    res.json({
      success: true,
      rank: parseInt(result.rows[0].rank),
    });
  } catch (error: unknown) {
    console.error('Get rank error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
