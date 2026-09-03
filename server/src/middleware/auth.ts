import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { passwordChangedAt } from '../lib/sessions';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Autentificarea, plus o singură întrebare pusă bazei: mai e valabil jetonul?
 *
 * JWT-ul e semnat pe șapte zile și nu există logout pe server, deci cine ți-a
 * furat parola și s-a autentificat rămâne autentificat o săptămână DUPĂ ce ți-o
 * schimbi. Adică exact scenariul pentru care omul cere resetarea, iar emailul
 * de resetare îi promite explicit că îl deconectăm de pe toate dispozitivele.
 *
 * `iat` călătorește deja în orice JWT. Se compară cu `password_changed_at`, iar
 * un jeton emis înainte de ultima schimbare e refuzat.
 *
 * Costul e o citire după cheia primară la fiecare cerere autentificată. E o
 * schimbare reală pe calea fierbinte și se spune, nu se ascunde -- dar
 * alternativa era ca promisiunea din email să fie o minciună.
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let decoded: { userId: string; email: string; role: string; iat?: number };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as typeof decoded;
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const changedAt = await passwordChangedAt(decoded.userId);
    // Contul a dispărut între emiterea jetonului și cererea asta.
    if (changedAt === undefined) return res.status(403).json({ error: 'Invalid or expired token' });

    // `iat` e în secunde. Se scade o secundă fiindcă jetonul emis CHIAR la
    // schimbarea parolei -- cel pe care îl primești când te reconectezi -- are
    // aceeași secundă și nu trebuie refuzat.
    if (changedAt && decoded.iat && decoded.iat < Math.floor(changedAt.getTime() / 1000) - 1) {
      return res.status(403).json({ error: 'Session ended. Please sign in again.' });
    }
  } catch (error) {
    console.error('Session check failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  req.userId = decoded.userId;
  req.userEmail = decoded.email;
  req.userRole = decoded.role;
  next();
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

