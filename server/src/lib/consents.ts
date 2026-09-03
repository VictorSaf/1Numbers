import pool from '../db';

/**
 * Acordurile: ce e adevărat acum, și dovada că a fost.
 *
 * Tabelul e un jurnal -- fiecare acordare și fiecare retragere e un rând nou --
 * fiindcă GDPR nu cere doar să ceri acordul, ci să poți demonstra că l-ai avut.
 * Starea de acum e ultimul rând pentru (om, fel). Nimic nu se actualizează pe
 * loc; un rând care se rescrie nu mai e o dovadă.
 */

export const CONSENT_KINDS = ['model', 'notifications', 'terms'] as const;
export type ConsentKind = (typeof CONSENT_KINDS)[number];

export const isConsentKind = (v: unknown): v is ConsentKind =>
  typeof v === 'string' && (CONSENT_KINDS as readonly string[]).includes(v);

/**
 * Versiunea politicii pe care o acceptă cineva azi.
 *
 * Aceeași valoare ca `LEGAL_UPDATED` din față. Se schimbă cu mâna, când se
 * schimbă textul de fond -- iar atunci se vede cine a acceptat varianta veche.
 */
export const POLICY_VERSION = '2026-09-03';

/** Ce e acordat acum, pe feluri. Lipsa unui fel înseamnă „niciodată întrebat”. */
export async function currentConsents(userId: string): Promise<Record<string, boolean>> {
  const rows = await pool.query(
    `SELECT DISTINCT ON (kind) kind, granted_at
       FROM user_consents WHERE user_id = $1
      ORDER BY kind, created_at DESC`,
    [userId],
  );
  const out: Record<string, boolean> = {};
  for (const r of rows.rows) out[r.kind] = r.granted_at !== null;
  return out;
}

/** Adaugă un rând. Nu actualizează nimic -- de asta e o dovadă. */
export async function recordConsent(
  userId: string,
  kind: ConsentKind,
  granted: boolean,
): Promise<void> {
  await pool.query(
    `INSERT INTO user_consents (user_id, kind, policy_version, granted_at, withdrawn_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, kind, POLICY_VERSION, granted ? new Date() : null, granted ? null : new Date()],
  );
}
