import { Router, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { writeDay, DAY_PARTS, type DayBody } from '../lib/dayWriter';
import { parseCalendarDate, personalDayNumber } from '../lib/personalDay';

/**
 * Ziua omului, scrisă o dată pe zi.
 *
 * Cache-ul nu e aici în primul rând pentru bani. Fără el, omul reîncarcă pagina
 * și ziua îi spune altceva -- iar o citire care se schimbă la refresh nu e o
 * citire, e un generator de vorbe. Încrederea moare exact acolo.
 *
 * Efectele secundare sunt tot bune: un apel scurt per om per zi plafonează și
 * costul, și cât ar putea obține cineva care ar vrea să folosească ruta asta ca
 * proxy gratuit către modelul nostru.
 *
 * De ce primește propozițiile de la client: motorul de arhetipuri și cele patru
 * poziții stau în frontend, iar oglindirea lor aici ar însemna duplicarea a 195
 * de texte plus toată aritmetica pitagoreică -- două copii care ar diverge.
 * Ce POATE serverul verifica singur, verifică: ziua personală se recalculează
 * din data nașterii aflată în baza lui, și dacă nu se potrivește, nu se scrie
 * nimic. Restul propozițiilor privesc doar citirea proprie a omului.
 */

const router = Router();

const sentence = z.string().trim().min(1).max(600);

const readingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  language: z.enum(['ro', 'en', 'ru']),
  personalDay: z.number().int().min(1).max(33),
  composed: z.object({
    ziua: sentence, fric: sentence, aproape: sentence, intrebare: sentence,
  }),
});

router.post('/reading', authenticateToken, async (req: AuthRequest, res: Response) => {
  const parsed = readingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request', details: parsed.error.issues });
  }
  const { date, language, personalDay, composed } = parsed.data;

  try {
    const profile = await pool.query(
      'SELECT id, birth_date FROM user_profiles WHERE user_id = $1 AND is_active = true LIMIT 1',
      [req.userId],
    );
    if (!profile.rowCount) return res.status(404).json({ error: 'no_profile' });

    const { id: profileId, birth_date: birthDate } = profile.rows[0];

    // Singura verificare pe care serverul o poate face fără să dubleze motorul.
    const expected = personalDayNumber(
      parseCalendarDate(String(birthDate).slice(0, 10)),
      parseCalendarDate(date),
    );
    if (expected !== personalDay) {
      return res.status(400).json({ error: 'day_mismatch' });
    }

    const hit = await pool.query(
      `SELECT body, source, model FROM daily_readings
        WHERE profile_id = $1 AND on_date = $2 AND language = $3 LIMIT 1`,
      [profileId, date, language],
    );
    if (hit.rowCount) {
      const row = hit.rows[0];
      return res.json({ body: row.body, source: row.source, model: row.model, cached: true });
    }

    const written = await writeDay({ personalDay, language, composed });

    try {
      await pool.query(
        `INSERT INTO daily_readings (profile_id, on_date, language, personal_day, body, source, model)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (profile_id, on_date, language) DO NOTHING`,
        [profileId, date, language, personalDay, JSON.stringify(written.body),
         written.source, written.model ?? null],
      );
    } catch (err) {
      // O zi nescrisă în cache costă un apel în plus mâine. O zi nelivrată e un
      // ecran gol azi -- deci se răspunde oricum.
      console.error('daily_readings: nu s-a putut scrie în cache', err);
    }

    return res.json({
      body: written.body, source: written.source, model: written.model, cached: false,
    });
  } catch (err) {
    console.error('GET today reading failed', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;
export { DAY_PARTS, type DayBody };
