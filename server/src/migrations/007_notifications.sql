-- Migration: Create notification system tables
-- Stores push subscriptions, preferences, and notification history

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, endpoint)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "dailyPrediction": true,
    "dailyPredictionTime": "08:00",
    "streakReminder": true,
    "streakReminderTime": "20:00",
    "specialDates": true,
    "achievements": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create notification_history table
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create scheduled_notifications table for future notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_unread ON notification_history(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending ON scheduled_notifications(scheduled_for, sent) WHERE sent = false;

-- Add comments
COMMENT ON TABLE push_subscriptions IS 'Stores push notification subscriptions for each user';
COMMENT ON TABLE notification_preferences IS 'Stores notification preferences for each user';
COMMENT ON TABLE notification_history IS 'Logs all notifications sent to users';
COMMENT ON TABLE scheduled_notifications IS 'Queue for scheduled future notifications';

-- Create trigger for updated_at on notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log sent notification
CREATE OR REPLACE FUNCTION log_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification_history (user_id, notification_type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get users who should receive daily notifications at a specific time
CREATE OR REPLACE FUNCTION get_users_for_daily_notification(
  p_notification_type VARCHAR(50),
  p_hour INTEGER,
  p_minute INTEGER
) RETURNS TABLE (
  user_id UUID,
  endpoint TEXT,
  keys JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT ps.user_id, ps.endpoint, ps.keys
  FROM push_subscriptions ps
  JOIN notification_preferences np ON np.user_id = ps.user_id
  WHERE
    (np.preferences->>'enabled')::boolean = true
    AND (
      (p_notification_type = 'daily-prediction'
       AND (np.preferences->>'dailyPrediction')::boolean = true
       AND np.preferences->>'dailyPredictionTime' = LPAD(p_hour::text, 2, '0') || ':' || LPAD(p_minute::text, 2, '0'))
      OR
      (p_notification_type = 'streak-reminder'
       AND (np.preferences->>'streakReminder')::boolean = true
       AND np.preferences->>'streakReminderTime' = LPAD(p_hour::text, 2, '0') || ':' || LPAD(p_minute::text, 2, '0'))
    );
END;
$$ LANGUAGE plpgsql;
