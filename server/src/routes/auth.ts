import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../db';
import { ipRateLimit } from '../middleware/ipRateLimit';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { mintToken, consumeToken, revokeTokens, TOKEN_MINUTES, TooManyRequestsError } from '../lib/authTokens';
import { isEmailConfigured, sendLetter } from '../lib/email';
import { mailLang, verifyEmail, resetPassword } from '../lib/emailTemplates';
import { recordConsent } from '../lib/consents';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Login
router.post('/login', ipRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (without password)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/** Unde trimite linkurile. Aceeași variabilă pe care o folosește restul serverului. */
const appUrl = (): string => (process.env.FRONTEND_URL || 'http://localhost:8082').replace(/\/+$/, '');

/**
 * Naște un jeton de verificare și trimite emailul.
 *
 * Separat de rută fiindcă se cheamă din două locuri: la înregistrare și la
 * cererea de retrimitere.
 */
async function sendVerification(userId: string, email: string, language?: string): Promise<void> {
  if (!isEmailConfigured()) return;
  const lang = mailLang(language);
  const raw = await mintToken(userId, 'verify_email');
  const link = `${appUrl()}/auth?verify=${encodeURIComponent(raw)}`;
  await sendLetter(verifyEmail(lang, email, link, TOKEN_MINUTES));
}

// Register
// Public sign-up is closed on the compass.oneaigency.com deployment. Gated by
// environment rather than removed, so it can be reopened without a code change.
const registrationOpen = process.env.ALLOW_REGISTRATION === 'true';

router.post('/register', ipRateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req: Request, res: Response) => {
  if (!registrationOpen) {
    return res.status(403).json({ error: 'Registration is currently closed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name || email.split('@')[0]]
    );

    const user = result.rows[0];

    // Acceptarea termenilor se notează CU versiunea politicii, ca să știm mai
    // târziu cine a acceptat ce text. Nu e consimțământ în sensul din
    // regulament -- temeiul e contractul -- dar are aceeași nevoie de dovadă.
    await recordConsent(user.id, 'terms', true);

    // Verificarea pleacă, dar nu ține răspunsul pe loc și nu-l poate strica:
    // omul tocmai și-a făcut cont ca să-și vadă harta, nu ca să aștepte un SMTP.
    // Dacă emailul nu pleacă, contul rămâne valid și neverificat -- exact starea
    // pe care o poate repara singur din /auth/resend-verification.
    void sendVerification(user.id, user.email, req.body.language).catch((e) =>
      console.error('verification email failed:', e),
    );

    // Generate JWT token
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user. Prin `authenticateToken`, ca orice altă rută: clientul o
// cheamă la fiecare reîncărcare, deci dacă ar decoda singură jetonul, un
// dispozitiv rămas cu un jeton anterior resetării ar trece drept autentificat.
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Am uitat parola.
 *
 * Întoarce MEREU același răspuns, indiferent dacă adresa are cont sau nu.
 * Altfel ruta devine un instrument de aflat cine e înscris: ceri resetare
 * pentru o mie de adrese și citești din răspuns care dintre ele sunt clienți.
 *
 * Din același motiv nu se deosebește nici „n-am putut trimite emailul": omul
 * vede același text, iar eșecul se loghează pentru noi.
 */
router.post('/forgot', ipRateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), async (req: Request, res: Response) => {
  const { email, language } = req.body ?? {};
  const same = () => res.json({ success: true });

  if (!email || typeof email !== 'string') return same();

  try {
    const found = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (found.rowCount === 0) return same();

    const user = found.rows[0];
    if (isEmailConfigured()) {
      const raw = await mintToken(user.id, 'reset_password');
      const link = `${appUrl()}/auth?reset=${encodeURIComponent(raw)}`;
      await sendLetter(resetPassword(mailLang(language), user.email, link, TOKEN_MINUTES));
    }
    return same();
  } catch (error) {
    // Inclusiv TooManyRequestsError: cine cere al șaselea link într-o oră vede
    // același răspuns ca oricine altcineva.
    if (!(error instanceof TooManyRequestsError)) console.error('Forgot password error:', error);
    return same();
  }
});

/**
 * Parolă nouă, pe baza jetonului.
 *
 * `password_changed_at` se mută pe acum, iar middleware-ul refuză de acolo
 * încolo orice JWT emis înainte -- adică exact deconectarea de pe toate
 * dispozitivele pe care o promite emailul.
 */
router.post('/reset', ipRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const verdict = await consumeToken(token, 'reset_password');
    if (!verdict.ok) return res.status(400).json({ error: verdict.reason });

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, password_changed_at = now(), updated_at = now() WHERE id = $2',
      [passwordHash, verdict.userId],
    );
    // Celelalte linkuri cerute nu mai au ce debloca.
    await revokeTokens(verdict.userId, 'reset_password');

    res.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Confirmarea adresei. Nu deblochează aplicația -- deblochează notificările. */
router.post('/verify-email', ipRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), async (req: Request, res: Response) => {
  try {
    const { token } = req.body ?? {};
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const verdict = await consumeToken(token, 'verify_email');
    if (!verdict.ok) return res.status(400).json({ error: verdict.reason });

    await pool.query('UPDATE users SET email_verified_at = now() WHERE id = $1', [verdict.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Retrimiterea verificării, pentru cine a pierdut primul email.
 *
 * Cere autentificare: cine e deja înăuntru nu poate afla nimic nou despre
 * adresa lui, deci nu e nevoie de răspunsul uniform de la /forgot.
 */
router.post('/resend-verification', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const found = await pool.query('SELECT id, email, email_verified_at FROM users WHERE id = $1', [req.userId]);
    if (found.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    if (found.rows[0].email_verified_at) return res.json({ success: true, alreadyVerified: true });

    await sendVerification(found.rows[0].id, found.rows[0].email, req.body?.language);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      return res.status(429).json({ error: 'too_many_requests' });
    }
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
