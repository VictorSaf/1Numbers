-- Migration: Create friends system tables
-- Stores friendships, friend requests, and shared profiles

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user_id, to_user_id),
  CONSTRAINT no_self_request CHECK (from_user_id != to_user_id)
);

-- Create friendships table (normalized for efficient lookups)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Create friend_invite_links table
CREATE TABLE IF NOT EXISTS friend_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create shared_comparisons table (track comparisons made)
CREATE TABLE IF NOT EXISTS shared_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comparison_type VARCHAR(50) NOT NULL DEFAULT 'full',
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_invite_links_code ON friend_invite_links(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_friend_invite_links_user ON friend_invite_links(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_comparisons_user ON shared_comparisons(user_id);

-- Add comments
COMMENT ON TABLE friend_requests IS 'Stores pending and processed friend requests';
COMMENT ON TABLE friendships IS 'Stores established friendships (bidirectional)';
COMMENT ON TABLE friend_invite_links IS 'Stores shareable invite links for adding friends';
COMMENT ON TABLE shared_comparisons IS 'Logs numerology comparisons between friends';

-- Function to accept a friend request
CREATE OR REPLACE FUNCTION accept_friend_request(p_request_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_from_user_id UUID;
  v_to_user_id UUID;
BEGIN
  -- Get request details and verify it's for this user
  SELECT from_user_id, to_user_id INTO v_from_user_id, v_to_user_id
  FROM friend_requests
  WHERE id = p_request_id AND to_user_id = p_user_id AND status = 'pending';

  IF v_from_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update request status
  UPDATE friend_requests
  SET status = 'accepted', responded_at = NOW()
  WHERE id = p_request_id;

  -- Create bidirectional friendship
  INSERT INTO friendships (user_id, friend_id)
  VALUES (v_from_user_id, v_to_user_id), (v_to_user_id, v_from_user_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get friends list with profile info
CREATE OR REPLACE FUNCTION get_friends_with_profiles(p_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  email VARCHAR(255),
  birth_date DATE,
  full_name VARCHAR(255),
  friendship_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.friend_id,
    u.email,
    u.birth_date,
    u.full_name,
    f.created_at as friendship_date
  FROM friendships f
  JOIN users u ON u.id = f.friend_id
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_code VARCHAR(20);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM friend_invite_links WHERE code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to use an invite link
CREATE OR REPLACE FUNCTION use_invite_link(p_code VARCHAR(20), p_user_id UUID)
RETURNS UUID AS $$ -- Returns the inviter's user_id or NULL
DECLARE
  v_link_id UUID;
  v_inviter_id UUID;
BEGIN
  -- Find valid invite link
  SELECT id, user_id INTO v_link_id, v_inviter_id
  FROM friend_invite_links
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses_count < max_uses)
    AND user_id != p_user_id;

  IF v_link_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update usage count
  UPDATE friend_invite_links
  SET uses_count = uses_count + 1
  WHERE id = v_link_id;

  -- Create bidirectional friendship
  INSERT INTO friendships (user_id, friend_id)
  VALUES (v_inviter_id, p_user_id), (p_user_id, v_inviter_id)
  ON CONFLICT DO NOTHING;

  RETURN v_inviter_id;
END;
$$ LANGUAGE plpgsql;
