import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ipRateLimit } from '../middleware/ipRateLimit';
import { mintToken, consumeToken, TOKEN_MINUTES, TooManyRequestsError } from '../lib/authTokens';
import { isEmailConfigured, sendLetter } from '../lib/email';
import { mailLang, confirmDeletion } from '../lib/emailTemplates';
import { currentConsents, recordConsent, isConsentKind, POLICY_VERSION } from '../lib/consents';

/**
 * Contul, în mâna omului: să-l ia cu el, sau să-l facă să dispară.
 *
 * Articolele 17 și 20 din GDPR cer amândouă un buton, nu o adresă de email la
 * care scrii și aștepți. Iar politica de confidențialitate le va promite -- de
 * asta se scriu ÎNAINTEA ei, nu după: o politică scrisă prima ar descrie un
 * produs care nu poate încă ce spune.
 */

const router = Router();

const appUrl = (): string => (process.env.FRONTEND_URL || 'http://localhost:8082').replace(/\/+$/, '');

/**
 * Cere ștergerea. Nu șterge -- trimite confirmarea pe email.
 *
 * Ștergerea trece prin email tocmai fiindcă e ireversibilă: cineva care îți
 * lasă laptopul deschis nu trebuie să-ți poată șterge harta cu două apăsări.
 */
router.post('/deletion-request', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const found = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
    if (found.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    if (!isEmailConfigured()) {
      // Fără transport n-avem cum confirma, iar a șterge direct ar sări chiar
      // peste pasul care face gestul sigur. Se spune, nu se improvizează.
      return res.status(503).json({ error: 'email_unavailable' });
    }

    const raw = await mintToken(found.rows[0].id, 'delete_account');
    const link = `${appUrl()}/eu?delete=${encodeURIComponent(raw)}`;
    await sendLetter(confirmDeletion(mailLang(req.body?.language), found.rows[0].email, link, TOKEN_MINUTES));

    res.json({ success: true });
  } catch (error) {
    if (error instanceof TooManyRequestsError) return res.status(429).json({ error: 'too_many_requests' });
    console.error('Deletion request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Șterge, pe baza jetonului din email.
 *
 * O singură instrucțiune. Toate cele douăzeci și trei de chei străine către
 * `users(id)` sunt ON DELETE CASCADE, iar citirile atârnă de profiluri, care
 * atârnă de utilizator -- verificat pe baza vie, într-o tranzacție anulată:
 * un DELETE duce profilurile, jurnalul, citirile și preferințele.
 *
 * Nu e marcare ca inactiv. „Ștergem" trebuie să însemne ștergem.
 */
router.post('/delete', ipRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body ?? {};
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const verdict = await consumeToken(token, 'delete_account');
    if (!verdict.ok) return res.status(400).json({ error: verdict.reason });

    const gone = await pool.query('DELETE FROM users WHERE id = $1', [verdict.userId]);
    if (gone.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    // Se notează CĂ s-a șters, fără nimic din ce s-a șters. Altfel jurnalul de
    // audit devine locul unde datele supraviețuiesc ștergerii.
    console.info('account deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Ia-ți datele cu tine.
 *
 * JSON, fiindcă portabilitatea cere un format citibil de mașină. `pdfExport`
 * există deja, dar un PDF nu e portabilitate -- e o frumusețe pe deasupra.
 *
 * Ce NU pleacă: hash-ul parolei, jetoanele de autentificare și cheile
 * abonamentelor push. Alea sunt credențiale, nu datele omului; un export care
 * le conține transformă un drept într-o scurgere.
 */
router.get('/export', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.userId;
    const one = async (sql: string) => (await pool.query(sql, [id])).rows;

    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Datele tale din Numerologia. Parola, jetoanele și cheile de notificare nu sunt incluse: sunt credențiale, nu date despre tine.',
      account: (await one('SELECT id, email, name, role, created_at, email_verified_at FROM users WHERE id = $1'))[0],
      profiles: await one('SELECT * FROM user_profiles WHERE user_id = $1 ORDER BY created_at'),
      journal: await one('SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at'),
      dailyReadings: await one(
        `SELECT d.* FROM daily_readings d
          JOIN user_profiles p ON p.id = d.profile_id WHERE p.user_id = $1 ORDER BY d.on_date`,
      ),
      deepReadings: await one(
        `SELECT d.* FROM deep_readings d
          JOIN user_profiles p ON p.id = d.profile_id WHERE p.user_id = $1`,
      ),
      notificationPreferences: await one('SELECT * FROM notification_preferences WHERE user_id = $1'),
      gamification: await one('SELECT * FROM user_gamification WHERE user_id = $1'),
      achievements: await one('SELECT * FROM user_achievements WHERE user_id = $1'),
      activity: await one('SELECT * FROM user_activity_log WHERE user_id = $1 ORDER BY created_at'),
      friends: await one('SELECT * FROM friendships WHERE user_id = $1'),
      subscriptions: await one('SELECT * FROM subscriptions WHERE user_id = $1'),
      purchases: await one('SELECT * FROM one_time_purchases WHERE user_id = $1'),
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="numerologia-datele-mele.json"');
    res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Ce a acordat omul, și pe ce versiune de politică.
 *
 * Un fel care lipsește din răspuns înseamnă „nu l-am întrebat niciodată" --
 * altceva decât „a refuzat". Interfața are nevoie de diferența asta ca să știe
 * dacă trebuie să întrebe.
 */
router.get('/consents', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({ consents: await currentConsents(req.userId!), policyVersion: POLICY_VERSION });
  } catch (error) {
    console.error('Consents read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Acordă sau retrage. Adaugă un rând; nu rescrie niciunul. */
router.post('/consents', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { kind, granted } = req.body ?? {};
    if (!isConsentKind(kind) || typeof granted !== 'boolean') {
      return res.status(400).json({ error: 'kind and granted are required' });
    }
    // Termenii se acceptă la înregistrare, nu se comută dintr-un buton: a
    // „retrage" acceptarea contractului înseamnă a pleca, iar pentru asta
    // există ștergerea contului.
    if (kind === 'terms') return res.status(400).json({ error: 'terms_not_toggleable' });

    await recordConsent(req.userId!, kind, granted);
    res.json({ success: true, consents: await currentConsents(req.userId!) });
  } catch (error) {
    console.error('Consent write error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
