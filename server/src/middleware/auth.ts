import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Admin access is decided by the database, not by the token.
 *
 * The role travels in a JWT signed for seven days and there is no server-side
 * logout, so trusting req.userRole meant a demoted admin kept every admin route
 * for up to a week -- and the only way to close that window was to rotate
 * JWT_SECRET and sign everyone out. One indexed lookup by primary key, on a
 * router that sees very little traffic, buys the demotion taking effect on the
 * next request.
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const result = await pool.query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [req.userId],
    );

    const role = result.rows[0]?.role;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Everything downstream reads the live role, not the one in the token.
    req.userRole = role;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Failed to verify admin access' });
  }
};

