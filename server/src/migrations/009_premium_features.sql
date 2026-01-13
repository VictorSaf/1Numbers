-- Premium Features Migration
-- Adds support for tier-based features, usage tracking, and one-time purchases

-- Update subscription_plans to support new tier structure
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS tier_id VARCHAR(20);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS badge VARCHAR(10);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS highlighted BOOLEAN DEFAULT false;

-- Update existing plans with tier info
UPDATE subscription_plans SET tier_id = 'free', badge = NULL, highlighted = false WHERE name = 'free';
UPDATE subscription_plans SET tier_id = 'premium', badge = '⭐', highlighted = true WHERE name = 'premium';
UPDATE subscription_plans SET tier_id = 'pro', badge = '👑', highlighted = false WHERE name = 'pro';

-- Create Pro plan if it doesn't exist
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, is_active, tier_id, badge, highlighted)
SELECT 'pro', 'Pro', 'Professional tools for practitioners and consultants', 9.99, 79.99,
  '["Everything in Premium", "Unlimited AI", "Business Tools", "API Access", "White Label Reports", "Custom Reports", "Early Access", "2 Live Consultations/month"]'::jsonb,
  true, 'pro', '👑', false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'pro');

-- Feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_id VARCHAR(50) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_period ON feature_usage(period_start, period_end);

-- One-time purchases table
CREATE TABLE IF NOT EXISTS one_time_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON one_time_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON one_time_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON one_time_purchases(status);

-- White label configurations for Pro users
CREATE TABLE IF NOT EXISTS white_label_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(100),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  contact_info VARCHAR(200),
  disclaimer TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Function to check and increment feature usage
CREATE OR REPLACE FUNCTION check_feature_limit(
  p_user_id INTEGER,
  p_feature_id VARCHAR(50),
  p_limit INTEGER
) RETURNS TABLE(
  allowed BOOLEAN,
  current_usage INTEGER,
  limit_value INTEGER
) AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_current_usage INTEGER;
BEGIN
  -- Get current month period
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;

  -- Get or create usage record
  INSERT INTO feature_usage (user_id, feature_id, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_id, 0, v_period_start, v_period_end)
  ON CONFLICT (user_id, feature_id, period_start) DO NOTHING;

  -- Get current usage
  SELECT fu.usage_count INTO v_current_usage
  FROM feature_usage fu
  WHERE fu.user_id = p_user_id
    AND fu.feature_id = p_feature_id
    AND fu.period_start = v_period_start;

  -- Check if under limit (-1 means unlimited)
  IF p_limit = -1 OR v_current_usage < p_limit THEN
    RETURN QUERY SELECT true, v_current_usage, p_limit;
  ELSE
    RETURN QUERY SELECT false, v_current_usage, p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id INTEGER,
  p_feature_id VARCHAR(50)
) RETURNS INTEGER AS $$
DECLARE
  v_period_start DATE;
  v_new_count INTEGER;
BEGIN
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;

  UPDATE feature_usage
  SET usage_count = usage_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id
    AND feature_id = p_feature_id
    AND period_start = v_period_start
  RETURNING usage_count INTO v_new_count;

  RETURN COALESCE(v_new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's tier and limits
CREATE OR REPLACE FUNCTION get_user_tier_info(p_user_id INTEGER)
RETURNS TABLE(
  tier_id VARCHAR(20),
  plan_name VARCHAR(50),
  is_premium BOOLEAN,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(sp.tier_id, 'free')::VARCHAR(20),
    COALESCE(sp.name, 'free')::VARCHAR(50),
    COALESCE(sp.name != 'free' AND s.status = 'active', false),
    COALESCE(sp.features, '[]'::jsonb)
  FROM users u
  LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
  LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE u.id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
