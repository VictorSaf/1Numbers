-- Migration: Create gamification system tables
-- Stores user XP, levels, achievements, streaks, and challenges

-- Create user_gamification table for main stats
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_updated_at TIMESTAMPTZ,
  readings_count INTEGER NOT NULL DEFAULT 0,
  compatibility_count INTEGER NOT NULL DEFAULT 0,
  journal_entries_count INTEGER NOT NULL DEFAULT 0,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  predictions_viewed INTEGER NOT NULL DEFAULT 0,
  tools_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_achievements table for earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Create user_activity_log table for tracking XP-earning activities
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create weekly_challenges table for active challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id VARCHAR(50) NOT NULL,
  title_ro TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_ro TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_count INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_total_xp ON user_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_current_streak ON user_gamification(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active ON weekly_challenges(is_active, week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);

-- Add comments
COMMENT ON TABLE user_gamification IS 'Stores user gamification stats including XP, level, and streaks';
COMMENT ON TABLE user_achievements IS 'Tracks achievements earned by users';
COMMENT ON TABLE user_activity_log IS 'Logs all XP-earning activities for users';
COMMENT ON TABLE weekly_challenges IS 'Stores weekly challenge definitions';
COMMENT ON TABLE user_challenge_progress IS 'Tracks user progress on weekly challenges';

-- Create trigger for updated_at on user_gamification
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on user_challenge_progress
CREATE TRIGGER update_user_challenge_progress_updated_at
  BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_activity_type VARCHAR(50),
  p_metadata JSONB DEFAULT NULL
) RETURNS TABLE (
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get or create user gamification record
  INSERT INTO user_gamification (user_id, total_xp)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current stats
  SELECT total_xp, current_level INTO v_current_xp, v_current_level
  FROM user_gamification
  WHERE user_id = p_user_id;

  -- Calculate new XP
  v_current_xp := v_current_xp + p_xp_amount;

  -- Calculate new level based on XP thresholds
  -- Levels: 1(0), 2(100), 3(300), 4(600), 5(1000), 6(1500), 7(2500), 8(4000), 9(6000)
  v_new_level := CASE
    WHEN v_current_xp >= 6000 THEN 9
    WHEN v_current_xp >= 4000 THEN 8
    WHEN v_current_xp >= 2500 THEN 7
    WHEN v_current_xp >= 1500 THEN 6
    WHEN v_current_xp >= 1000 THEN 5
    WHEN v_current_xp >= 600 THEN 4
    WHEN v_current_xp >= 300 THEN 3
    WHEN v_current_xp >= 100 THEN 2
    ELSE 1
  END;

  -- Update user gamification
  UPDATE user_gamification
  SET total_xp = v_current_xp,
      current_level = v_new_level,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the activity
  INSERT INTO user_activity_log (user_id, activity_type, xp_earned, metadata)
  VALUES (p_user_id, p_activity_type, p_xp_amount, p_metadata);

  -- Return results
  RETURN QUERY SELECT v_current_xp, v_new_level, v_new_level > v_current_level;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_continued BOOLEAN
) AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get or create user gamification record
  INSERT INTO user_gamification (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current stats
  SELECT ug.last_activity_date, ug.current_streak, ug.longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM user_gamification ug
  WHERE ug.user_id = p_user_id;

  -- Calculate streak
  IF v_last_activity IS NULL THEN
    -- First activity
    v_current_streak := 1;
  ELSIF v_last_activity = v_today THEN
    -- Already logged in today, no change
    RETURN QUERY SELECT v_current_streak, v_longest_streak, false;
    RETURN;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    -- Consecutive day
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Streak broken
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update user gamification
  UPDATE user_gamification
  SET last_activity_date = v_today,
      user_gamification.current_streak = v_current_streak,
      user_gamification.longest_streak = v_longest_streak,
      streak_updated_at = NOW(),
      updated_at = NOW()
  WHERE user_gamification.user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, true;
END;
$$ LANGUAGE plpgsql;

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_id VARCHAR(50),
  p_xp_reward INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_already_earned BOOLEAN;
BEGIN
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_earned;

  IF v_already_earned THEN
    RETURN false;
  END IF;

  -- Award achievement
  INSERT INTO user_achievements (user_id, achievement_id, xp_awarded)
  VALUES (p_user_id, p_achievement_id, p_xp_reward);

  -- Add XP
  PERFORM add_user_xp(p_user_id, p_xp_reward, 'achievement', jsonb_build_object('achievement_id', p_achievement_id));

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to increment activity counter
CREATE OR REPLACE FUNCTION increment_activity_counter(
  p_user_id UUID,
  p_counter_name VARCHAR(50)
) RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- Ensure record exists
  INSERT INTO user_gamification (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Increment the appropriate counter
  EXECUTE format(
    'UPDATE user_gamification SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1 RETURNING %I',
    p_counter_name, p_counter_name, p_counter_name
  ) INTO v_new_count USING p_user_id;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default weekly challenges
INSERT INTO weekly_challenges (
  challenge_id,
  title_ro, title_en, title_ru,
  description_ro, description_en, description_ru,
  requirement_type, requirement_count, xp_reward,
  week_start, week_end, is_active
) VALUES
(
  'weekly_readings',
  'Cititor Dedicat', 'Dedicated Reader', 'Преданный Читатель',
  'Completează 5 lecturi numerologice săptămâna aceasta',
  'Complete 5 numerology readings this week',
  'Завершите 5 нумерологических чтений на этой неделе',
  'readings', 5, 100,
  date_trunc('week', CURRENT_DATE)::date,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date,
  true
),
(
  'weekly_journal',
  'Scriitor de Jurnal', 'Journal Writer', 'Журналист',
  'Adaugă 3 intrări în jurnal săptămâna aceasta',
  'Add 3 journal entries this week',
  'Добавьте 3 записи в журнал на этой неделе',
  'journal', 3, 75,
  date_trunc('week', CURRENT_DATE)::date,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date,
  true
),
(
  'weekly_compatibility',
  'Expert în Compatibilitate', 'Compatibility Expert', 'Эксперт Совместимости',
  'Verifică compatibilitatea cu 3 persoane',
  'Check compatibility with 3 people',
  'Проверьте совместимость с 3 людьми',
  'compatibility', 3, 75,
  date_trunc('week', CURRENT_DATE)::date,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date,
  true
)
ON CONFLICT DO NOTHING;

-- Create view for leaderboard
CREATE OR REPLACE VIEW gamification_leaderboard AS
SELECT
  ug.user_id,
  u.email,
  ug.total_xp,
  ug.current_level,
  ug.current_streak,
  ug.longest_streak,
  (SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = ug.user_id) as achievements_count,
  ug.updated_at as last_active
FROM user_gamification ug
JOIN users u ON u.id = ug.user_id
ORDER BY ug.total_xp DESC;

COMMENT ON VIEW gamification_leaderboard IS 'Leaderboard view showing top users by XP';
