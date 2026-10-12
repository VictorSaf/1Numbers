import { Router, Response } from 'express';
import { createHash } from 'crypto';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { writeDeepReading } from '../lib/deepReading';

/**
 * Citirea întreagă a hărții.
 *
 * Cheia de cache e amprenta hărții, nu data: harta nu se schimbă de la o zi la
 * alta. Dacă se schimbă -- alt nume, altă dată de naștere -- e altă hartă și
 * merită altă citire, iar cea veche rămâne pentru harta ei.
 *
 * E cea mai scumpă operație din aplicație: intrare mare, ieșire lungă, model
 * puternic. De aceea se scrie o singură dată per hartă, nu per vizită.
 */

const router = Router();

const stepSchema = z.object({
  name: z.string().trim().min(1).max(120),
  figures: z.string().trim().min(1).max(40),
  say: z.string().trim().min(10).max(800),
});

const chartSchema = z.object({
  language: z.enum(['ro', 'en', 'ru']),
  // Harta întreagă are șaisprezece pași azi; treizeci lasă loc de creștere
  // fără să lase o cerere să umfle promptul oricât.
  steps: z.array(stepSchema).min(3).max(30),
});

const hashOf = (steps: Array<{ name: string; figures: string }>) =>
  createHash('sha256')
    .update(steps.map((s) => `${s.name}:${s.figures}`).join('|'))
    .digest('hex')
    .slice(0, 32);

router.post('/reading', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = chartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request', details: parsed.error.issues });
  }
  const { language, steps } = parsed.data;

  try {
    const profile = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1 AND is_active = true LIMIT 1',
      [req.userId],
    );
    if (!profile.rowCount) return res.status(404).json({ error: 'no_profile' });
    const profileId = profile.rows[0].id;
    const chartHash = hashOf(steps);

    const hit = await pool.query(
      `SELECT body, source, model FROM deep_readings
        WHERE profile_id = $1 AND language = $2 AND chart_hash = $3 LIMIT 1`,
      [profileId, language, chartHash],
    );
    if (hit.rowCount) {
      const row = hit.rows[0];
      return res.json({ body: row.body, source: row.source, model: row.model, cached: true });
    }

    const written = await writeDeepReading({ language, steps });

    try {
      await pool.query(
        `INSERT INTO deep_readings (profile_id, language, chart_hash, body, source, model)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (profile_id, language, chart_hash) DO NOTHING`,
        [profileId, language, chartHash, JSON.stringify(written.body), written.source,
         written.model ?? null],
      );
    } catch (err) {
      // O citire nesalvată costă un apel scump în plus. Una nelivrată costă
      // chiar lucrul pentru care omul a venit.
      console.error('deep_readings: nu s-a putut scrie în cache', err);
    }

    return res.json({
      body: written.body, source: written.source, model: written.model, cached: false,
    });
  } catch (err) {
    console.error('deep reading failed', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;
