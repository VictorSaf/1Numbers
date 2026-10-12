import { createHash, randomBytes } from 'crypto';
import pool from '../db';

/**
 * Jetoane de unică folosință pentru acțiunile care trec prin email.
 *
 * Verificarea adresei, resetarea parolei și confirmarea ștergerii au aceeași
 * formă -- un secret trimis pe email, valabil puțin, folosit o dată -- deci au
 * un singur loc unde se nasc și se consumă.
 *
 * Ce se ține în baza de date e hash-ul, nu jetonul. Un tabel cu jetoane în clar
 * e o listă de chei de resetare pentru toți cei care au cerut una în ultima
 * jumătate de oră; oricine ajunge la o copie a bazei intră în conturile lor.
 *
 * SHA-256 fără sare e suficient AICI, și numai aici: jetonul are 32 de octeți
 * din `randomBytes`, deci nu există dicționar care să-l atace, spre deosebire de
 * o parolă aleasă de om. Pentru parole rămâne bcrypt.
 */

export type TokenKind = 'verify_email' | 'reset_password' | 'delete_account';

/** Cât trăiește un jeton. Scris în emailuri, deci schimbarea lui se vede. */
export const TOKEN_MINUTES = 30;

/**
 * Câte cereri de același fel acceptăm de la același cont într-o oră.
 *
 * Limitarea pe IP există deja pe rute; asta e limitarea pe CONT, care oprește
 * altceva: cineva care cere resetare pentru adresa altcuiva, de pe adrese IP
 * diferite, ca să-i umple inboxul.
 */
const MAX_PER_HOUR = 5;

const hash = (raw: string): string => createHash('sha256').update(raw).digest('hex');

export class TooManyRequestsError extends Error {
  constructor() {
    super('too many token requests for this account');
    this.name = 'TooManyRequestsError';
  }
}

/**
 * Naște un jeton și îl scrie ca hash. Întoarce partea în clar -- singura dată
 * când există -- ca să ajungă în email.
 */
export async function mintToken(userId: string, kind: TokenKind): Promise<string> {
  const recent = await pool.query(
    `SELECT count(*)::int AS n FROM auth_tokens
      WHERE user_id = $1 AND kind = $2 AND created_at > now() - interval '1 hour'`,
    [userId, kind],
  );
  if (recent.rows[0].n >= MAX_PER_HOUR) throw new TooManyRequestsError();

  const raw = randomBytes(32).toString('base64url');
  await pool.query(
    `INSERT INTO auth_tokens (user_id, kind, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [userId, kind, hash(raw), String(TOKEN_MINUTES)],
  );
  return raw;
}

export type TokenVerdict =
  | { ok: true; userId: string }
  | { ok: false; reason: 'unknown' | 'expired' | 'used' };

/**
 * Consumă un jeton: îl validează ȘI îl marchează folosit, într-o singură
 * instrucțiune. Verificarea și marcarea separate lasă o fereastră în care două
 * cereri simultane trec amândouă -- iar la resetarea parolei asta înseamnă că
 * un link interceptat mai poate fi folosit o dată după ce omul l-a folosit.
 *
 * Cele trei motive de refuz sunt deosebite fiindcă omul merită să știe care:
 * „l-ai folosit deja" și „a expirat" cer lucruri diferite de la el.
 */
export async function consumeToken(raw: string, kind: TokenKind): Promise<TokenVerdict> {
  const marked = await pool.query(
    `UPDATE auth_tokens SET used_at = now()
      WHERE token_hash = $1 AND kind = $2 AND used_at IS NULL AND expires_at > now()
      RETURNING user_id`,
    [hash(raw), kind],
  );
  if (marked.rowCount === 1) return { ok: true, userId: marked.rows[0].user_id };

  // N-a mers. Se citește ca să spunem DE CE, nu ca să reîncercăm.
  const found = await pool.query(
    'SELECT used_at, expires_at FROM auth_tokens WHERE token_hash = $1 AND kind = $2',
    [hash(raw), kind],
  );
  if (found.rowCount === 0) return { ok: false, reason: 'unknown' };
  if (found.rows[0].used_at) return { ok: false, reason: 'used' };
  return { ok: false, reason: 'expired' };
}

/**
 * Anulează jetoanele nefolosite de un fel. Se cheamă după o resetare reușită:
 * dacă cineva a cerut trei linkuri, celelalte două nu mai au ce debloca.
 */
export async function revokeTokens(userId: string, kind: TokenKind): Promise<void> {
  await pool.query(
    'UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND kind = $2 AND used_at IS NULL',
    [userId, kind],
  );
}
