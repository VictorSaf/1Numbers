import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get friends list
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT
        f.friend_id,
        u.email,
        u.birth_date,
        u.full_name,
        f.created_at as friendship_date
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      friends: result.rows.map(f => ({
        id: f.friend_id,
        email: f.email,
        birthDate: f.birth_date,
        fullName: f.full_name,
        friendshipDate: f.friendship_date,
      })),
    });
  } catch (error: unknown) {
    console.error('Get friends error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get friends',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get pending friend requests (received)
router.get('/requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT
        fr.id,
        fr.from_user_id,
        u.email,
        u.full_name,
        fr.message,
        fr.created_at
      FROM friend_requests fr
      JOIN users u ON u.id = fr.from_user_id
      WHERE fr.to_user_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      requests: result.rows.map(r => ({
        id: r.id,
        fromUserId: r.from_user_id,
        email: r.email,
        fullName: r.full_name,
        message: r.message,
        createdAt: r.created_at,
      })),
    });
  } catch (error: unknown) {
    console.error('Get friend requests error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get friend requests',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get sent friend requests
router.get('/requests/sent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT
        fr.id,
        fr.to_user_id,
        u.email,
        u.full_name,
        fr.status,
        fr.created_at
      FROM friend_requests fr
      JOIN users u ON u.id = fr.to_user_id
      WHERE fr.from_user_id = $1
      ORDER BY fr.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      requests: result.rows.map(r => ({
        id: r.id,
        toUserId: r.to_user_id,
        email: r.email,
        fullName: r.full_name,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (error: unknown) {
    console.error('Get sent requests error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get sent requests',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Send friend request by email
router.post('/request', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { email, message } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const toUserId = userResult.rows[0].id;

    if (toUserId === userId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if already friends
    const friendshipResult = await pool.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [userId, toUserId]
    );

    if (friendshipResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }

    // Check if request already exists
    const existingResult = await pool.query(
      `SELECT id, status FROM friend_requests
       WHERE (from_user_id = $1 AND to_user_id = $2)
          OR (from_user_id = $2 AND to_user_id = $1)`,
      [userId, toUserId]
    );

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already pending' });
      }
    }

    // Create friend request
    await pool.query(
      `INSERT INTO friend_requests (from_user_id, to_user_id, message)
       VALUES ($1, $2, $3)
       ON CONFLICT (from_user_id, to_user_id)
       DO UPDATE SET status = 'pending', message = $3, created_at = NOW(), responded_at = NULL`,
      [userId, toUserId, message || null]
    );

    res.json({
      success: true,
      message: 'Friend request sent',
    });
  } catch (error: unknown) {
    console.error('Send friend request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to send friend request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Accept friend request
router.post('/request/:requestId/accept', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get request and verify it's for this user
    const requestResult = await pool.query(
      `SELECT from_user_id, to_user_id FROM friend_requests
       WHERE id = $1 AND to_user_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const fromUserId = requestResult.rows[0].from_user_id;

    // Update request status
    await pool.query(
      `UPDATE friend_requests SET status = 'accepted', responded_at = NOW()
       WHERE id = $1`,
      [requestId]
    );

    // Create bidirectional friendship
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id)
       VALUES ($1, $2), ($2, $1)
       ON CONFLICT DO NOTHING`,
      [userId, fromUserId]
    );

    res.json({
      success: true,
      message: 'Friend request accepted',
    });
  } catch (error: unknown) {
    console.error('Accept friend request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to accept friend request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Reject friend request
router.post('/request/:requestId/reject', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `UPDATE friend_requests SET status = 'rejected', responded_at = NOW()
       WHERE id = $1 AND to_user_id = $2 AND status = 'pending'
       RETURNING id`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error: unknown) {
    console.error('Reject friend request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to reject friend request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Remove friend
router.delete('/:friendId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Remove bidirectional friendship
    await pool.query(
      `DELETE FROM friendships
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );

    res.json({
      success: true,
      message: 'Friend removed',
    });
  } catch (error: unknown) {
    console.error('Remove friend error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to remove friend',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Generate invite link
router.post('/invite-link', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { maxUses, expiresInDays } = req.body;

    // Generate unique code
    const codeResult = await pool.query('SELECT generate_invite_code() as code');
    const code = codeResult.rows[0].code;

    let expiresAt = null;
    if (expiresInDays) {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(expiresInDays));
      expiresAt = date.toISOString();
    }

    await pool.query(
      `INSERT INTO friend_invite_links (user_id, code, max_uses, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, code, maxUses || null, expiresAt]
    );

    res.json({
      success: true,
      code,
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/invite/${code}`,
    });
  } catch (error: unknown) {
    console.error('Generate invite link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to generate invite link',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Use invite link
router.post('/invite/:code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { code } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Find valid invite link
    const linkResult = await pool.query(
      `SELECT id, user_id FROM friend_invite_links
       WHERE code = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR uses_count < max_uses)`,
      [code.toUpperCase()]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invite link' });
    }

    const inviterId = linkResult.rows[0].user_id;
    const linkId = linkResult.rows[0].id;

    if (inviterId === userId) {
      return res.status(400).json({ error: 'Cannot use your own invite link' });
    }

    // Check if already friends
    const friendshipResult = await pool.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [userId, inviterId]
    );

    if (friendshipResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }

    // Update usage count
    await pool.query(
      'UPDATE friend_invite_links SET uses_count = uses_count + 1 WHERE id = $1',
      [linkId]
    );

    // Create bidirectional friendship
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id)
       VALUES ($1, $2), ($2, $1)
       ON CONFLICT DO NOTHING`,
      [userId, inviterId]
    );

    // Get inviter info
    const inviterResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [inviterId]
    );

    res.json({
      success: true,
      message: 'Friendship created',
      friend: {
        id: inviterId,
        email: inviterResult.rows[0]?.email,
        fullName: inviterResult.rows[0]?.full_name,
      },
    });
  } catch (error: unknown) {
    console.error('Use invite link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to use invite link',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get my invite links
router.get('/invite-links', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      `SELECT id, code, uses_count, max_uses, expires_at, created_at, is_active
       FROM friend_invite_links
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      links: result.rows.map(l => ({
        id: l.id,
        code: l.code,
        usesCount: l.uses_count,
        maxUses: l.max_uses,
        expiresAt: l.expires_at,
        createdAt: l.created_at,
        isActive: l.is_active,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/invite/${l.code}`,
      })),
    });
  } catch (error: unknown) {
    console.error('Get invite links error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get invite links',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Deactivate invite link
router.delete('/invite-link/:linkId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { linkId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    await pool.query(
      'UPDATE friend_invite_links SET is_active = false WHERE id = $1 AND user_id = $2',
      [linkId, userId]
    );

    res.json({
      success: true,
      message: 'Invite link deactivated',
    });
  } catch (error: unknown) {
    console.error('Deactivate invite link error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to deactivate invite link',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get friend profile for comparison
router.get('/:friendId/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Verify they are friends
    const friendshipResult = await pool.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    );

    if (friendshipResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    // Get friend's profile
    const profileResult = await pool.query(
      `SELECT id, email, birth_date, full_name, created_at
       FROM users WHERE id = $1`,
      [friendId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    const friend = profileResult.rows[0];

    // Log the comparison view
    await pool.query(
      `INSERT INTO shared_comparisons (user_id, friend_id, comparison_type)
       VALUES ($1, $2, 'profile_view')`,
      [userId, friendId]
    );

    res.json({
      success: true,
      profile: {
        id: friend.id,
        email: friend.email,
        birthDate: friend.birth_date,
        fullName: friend.full_name,
        memberSince: friend.created_at,
      },
    });
  } catch (error: unknown) {
    console.error('Get friend profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get friend profile',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get friends count and requests count (for badges)
router.get('/counts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const friendsResult = await pool.query(
      'SELECT COUNT(*) as count FROM friendships WHERE user_id = $1',
      [userId]
    );

    const requestsResult = await pool.query(
      `SELECT COUNT(*) as count FROM friend_requests
       WHERE to_user_id = $1 AND status = 'pending'`,
      [userId]
    );

    res.json({
      success: true,
      friendsCount: parseInt(friendsResult.rows[0].count),
      pendingRequestsCount: parseInt(requestsResult.rows[0].count),
    });
  } catch (error: unknown) {
    console.error('Get friends counts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get counts',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
