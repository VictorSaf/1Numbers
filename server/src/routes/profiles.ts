import { Router, Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const PROFILE_COLUMNS =
  'id, user_id, full_name, birth_date, birth_time, birth_place, category, is_active, created_at, updated_at';

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  category: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const toProfile = (row: ProfileRow) => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  birthDate: row.birth_date,
  birthTime: row.birth_time,
  birthPlace: row.birth_place,
  category: row.category,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const PROFILE_CATEGORIES = ['eu', 'apropiat', 'copil', 'afacere'] as const;

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  birthPlace: z.string().trim().max(200).optional().nullable(),
  category: z.enum(PROFILE_CATEGORIES).default('eu'),
  setAsActive: z.boolean().optional(),
});

// Get current user's active profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM user_profiles WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, profile: null });
    }

    res.json({
      success: true,
      profile: toProfile(result.rows[0] as ProfileRow),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all profiles for current user
router.get('/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT ${PROFILE_COLUMNS}
       FROM user_profiles
       WHERE user_id = $1
       ORDER BY is_active DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      profiles: (result.rows as ProfileRow[]).map(toProfile),
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new profile (always creates, never updates)
/**
 * Harta proprie o dă adminul. Restul hărților sunt ale utilizatorului.
 *
 * O hartă `eu` leagă o persoană de platformă -- ea E accesul, iar accesul se
 * acordă, nu se ia. Plus: numele și data de pe ea nu se mai schimbă odată puse
 * (vezi PUT mai jos), iar dacă utilizatorul și-ar putea face alta, regula aia
 * ar fi o sugestie. Cele două țin doar împreună.
 *
 * O hartă de copil, apropiat sau afacere nu dă acces nimănui: e a lui, ținută
 * pentru altcineva. N-are de ce să treacă pe la administrator.
 *
 * Rolul se citește din baza de date, nu din token: un token semnat acum șapte
 * zile pentru cineva între timp retrogradat nu mai deschide nimic.
 */
router.post('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile', details: parsed.error.issues });
    }
    const { fullName, birthDate, birthTime, birthPlace, category, setAsActive } = parsed.data;

    /**
     * O singură hartă proprie. Fără asta, faptul că identitatea de pe `eu` e
     * fixă ar fi o sugestie: creezi al doilea profil „eu” cu alte date și îl
     * faci activ.
     */
    if (category === 'eu') {
      const who = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (who.rows[0]?.role !== 'admin') {
        return res.status(403).json({
          error: 'admin_only',
          message: 'Your own map is set up by an administrator.',
        });
      }

      const own = await pool.query(
        "SELECT id FROM user_profiles WHERE user_id = $1 AND category = 'eu' LIMIT 1",
        [userId],
      );
      if (own.rowCount) {
        return res.status(409).json({
          error: 'own_map_exists',
          message: 'You already have your own map. Other people go in as apropiat, copil or afacere.',
        });
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If setAsActive is true, deactivate all other profiles — but only for
      // a profile that can actually become active (own map).
      if (category === 'eu' && setAsActive) {
        await client.query(
          'UPDATE user_profiles SET is_active = false WHERE user_id = $1',
          [userId]
        );
      }

      // Check if this is the first profile - make it active by default
      const existingCount = await client.query(
        'SELECT COUNT(*) as count FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      const isFirstProfile = parseInt(existingCount.rows[0].count) === 0;
      // Numai o hartă proprie poate fi cea activă: profilul activ alimentează
      // /azi și prefill-urile, iar harta unui copil ajunsă activă ar arăta
      // previziunile copilului drept ale utilizatorului. Constrângerea din
      // migrația 012 spune același lucru; asta o spune înainte de INSERT, ca
      // utilizatorul să primească un răspuns și nu o eroare de bază de date.
      const shouldBeActive =
        category === 'eu' && (setAsActive === true || (isFirstProfile && setAsActive !== false));

      // Create new profile
      const result = await client.query(
        `INSERT INTO user_profiles (user_id, full_name, birth_date, birth_time, birth_place, category, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${PROFILE_COLUMNS}`,
        [userId, fullName, birthDate, birthTime || null, birthPlace || null, category, shouldBeActive]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        profile: toProfile(result.rows[0] as ProfileRow),
      });
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Create profile error:', error);

    const pgError = error as { code?: string; message?: string };
    // Provide more detailed error information
    if (pgError.code === '42P01') {
      // Table does not exist
      return res.status(500).json({
        error: 'Database table not found. Please run migration: npm run migrate'
      });
    }

    if (pgError.code === '23503') {
      // Foreign key violation
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? pgError.message : undefined
    });
  }
});

// Update specific profile by ID
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profileId = req.params.id;
    const parsed = profileSchema.partial({ category: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile', details: parsed.error.issues });
    }
    const { fullName, birthDate, birthTime, birthPlace, category } = parsed.data;

    // Verify profile belongs to user
    const verifyResult = await pool.query(
      'SELECT id, category, full_name, birth_date::text AS birth_date FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, userId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    /**
     * Numele și data nașterii de pe harta proprie nu se mai schimbă.
     *
     * Toată aplicația e construită pe ele: ziua personală din /azi, ecoul din
     * jurnal legat de cifra zilei, citirea întreagă indexată pe amprenta
     * hărții. Schimbate, tot ce s-a scris înainte rămâne în bază adevărat
     * despre altă hartă decât cea pe care o vede omul azi, iar jurnalul lui
     * devine dovada altcuiva.
     *
     * Doar `eu`. Un profil de copil sau de apropiat rămâne editabil: acolo o
     * dată greșită e o greșeală de tastare despre altcineva, nu temelia
     * propriilor lui date.
     */
    const current = verifyResult.rows[0];
    if (current.category === 'eu') {
      const changed =
        (fullName !== undefined && fullName.trim() !== String(current.full_name).trim()) ||
        (birthDate !== undefined && birthDate !== String(current.birth_date).slice(0, 10));
      if (changed) {
        return res.status(409).json({
          error: 'identity_is_fixed',
          message: 'The name and birth date of your own map cannot be changed once set.',
        });
      }
    }

    // Update profile
    const result = await pool.query(
      `UPDATE user_profiles
       SET full_name = $1, birth_date = $2, birth_time = $3, birth_place = $4,
           category = COALESCE($5, category), updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING ${PROFILE_COLUMNS}`,
      [fullName, birthDate, birthTime || null, birthPlace || null, category ?? null, profileId, userId]
    );

    res.json({
      success: true,
      profile: toProfile(result.rows[0] as ProfileRow),
    });
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Delete specific profile by ID
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profileId = req.params.id;

    // Verify profile belongs to user
    const verifyResult = await pool.query(
      'SELECT id, is_active FROM user_profiles WHERE id = $1 AND user_id = $2',
      [profileId, userId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const wasActive = verifyResult.rows[0].is_active;

    // Delete profile
    await pool.query('DELETE FROM user_profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);

    // If deleted profile was active, activate the most recent profile
    if (wasActive) {
      const remainingResult = await pool.query(
        `UPDATE user_profiles
         SET is_active = true
         WHERE user_id = $1 AND id = (
           SELECT id FROM user_profiles
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 1
         )
         RETURNING id`,
        [userId]
      );
    }

    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set profile as active
router.post('/:id/activate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profileId = req.params.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify profile belongs to user
      const verifyResult = await client.query(
        'SELECT id, category FROM user_profiles WHERE id = $1 AND user_id = $2',
        [profileId, userId]
      );

      if (verifyResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Profile not found' });
      }

      if (verifyResult.rows[0].category !== 'eu') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only your own maps can be the active profile' });
      }

      // Deactivate all profiles for this user
      await client.query(
        'UPDATE user_profiles SET is_active = false WHERE user_id = $1',
        [userId]
      );

      // Activate the selected profile
      const result = await client.query(
        `UPDATE user_profiles
         SET is_active = true
         WHERE id = $1 AND user_id = $2
         RETURNING ${PROFILE_COLUMNS}`,
        [profileId, userId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        profile: toProfile(result.rows[0] as ProfileRow),
      });
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Activate profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;
