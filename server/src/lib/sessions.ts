import pool from '../db';

/**
 * Când a fost schimbată ultima dată parola unui cont.
 *
 * Trăiește în modulul lui, nu în middleware, din două motive.
 *
 * Primul e de proiectare: e o întrebare despre starea contului, nu despre
 * jetonul din antet. Middleware-ul decodează un JWT; asta citește o bază.
 *
 * Al doilea l-am aflat lipind-o întâi în middleware: dublurile din teste
 * amorsează răspunsuri POZIȚIONAL, deci o citire nouă pe calea fierbinte a
 * spart optzeci și patru de teste din douăsprezece fișiere. Puteam adăuga o
 * amorsare în fiecare, dar atunci fiecare test viitor care autentifică ar fi
 * trebuit să știe de interogarea asta. Aici se poate înlocui o dată, în
 * `setup.ts`, iar testele care chiar vor s-o verifice o pot suprascrie.
 *
 * `null` înseamnă „nu se știe” și se citește ca „nu invalida nimic”: un cont
 * care n-a schimbat niciodată parola n-are de ce să-și piardă sesiunile.
 */
export async function passwordChangedAt(userId: string): Promise<Date | null | undefined> {
  const row = await pool.query('SELECT password_changed_at FROM users WHERE id = $1', [userId]);
  // `undefined` distinct de `null`: contul nu mai există, deci jetonul lui nu
  // mai are pe cine să reprezinte.
  if (row.rowCount === 0) return undefined;
  return (row.rows[0].password_changed_at as Date | null) ?? null;
}
