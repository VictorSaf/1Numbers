#!/usr/bin/env node
/**
 * Pune o parolă nouă pe un cont existent.
 *
 * Parola se citește cu ecoul stins și nu ajunge nicăieri în clar: nici pe
 * ecran, nici în istoricul shell-ului, nici într-un log. În baza de date intră
 * doar hash-ul bcrypt, prin exact același drum ca înregistrarea publică -- 10
 * runde, aceeași funcție. Un cont resetat de aici nu se deosebește cu nimic de
 * unul creat normal.
 *
 * De aceea parola nu e un argument de linie de comandă: `node ... parola` ar
 * rămâne în ~/.zsh_history și în lista de procese, vizibilă oricui rulează
 * `ps`.
 */

import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

/**
 * Conexiune proprie, nu `dist/db.js`.
 *
 * Acela e CommonJS compilat, iar un import dinamic din ESM îl împachetează de
 * două ori (`m.default.default`) -- o subtilitate care n-are ce căuta într-un
 * script de întreținere. Aici se citește o singură coloană și se scrie una;
 * parserele de tip din db.ts nu schimbă nimic pentru text.
 *
 * Efect secundar util: scriptul merge și pe o mașină unde serverul n-a fost
 * încă build-uit.
 */
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const ask = (prompt) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (v) => {
      rl.close();
      resolve(v.trim());
    });
  });

/**
 * Citește o linie fără s-o scrie pe ecran.
 *
 * Ieșirea trece printr-un stream care înghite tot ce nu e promptul însuși,
 * deci tastele apăsate nu lasă nicio urmă vizibilă -- nici măcar asteriscuri,
 * care ar trăda lungimea.
 */
const askHidden = (prompt) =>
  new Promise((resolve) => {
    let shown = false;
    const muted = new Writable({
      write(chunk, _enc, done) {
        if (!shown) {
          process.stdout.write(chunk);
          shown = true;
        }
        done();
      },
    });
    const rl = createInterface({ input: process.stdin, output: muted, terminal: true });
    rl.question(prompt, (value) => {
      rl.close();
      process.stdout.write('\n');
      resolve(value);
    });
  });

const email = (await ask('Email: ')).toLowerCase();

const found = await db.query('SELECT id, email, role FROM users WHERE lower(email) = $1', [email]);
if (!found.rowCount) {
  const all = await db.query('SELECT email FROM users ORDER BY created_at');
  console.error(`\nNu există niciun cont cu ${email}.`);
  console.error('Conturi existente: ' + all.rows.map((r) => r.email).join(', '));
  await db.end();
  process.exit(1);
}

const password = await askHidden('Parola nouă: ');

// Aceeași limită ca la înregistrarea publică. Două praguri diferite ar însemna
// două uși de intrare cu încuietori diferite.
if (password.length < 6) {
  console.error('Parola trebuie să aibă cel puțin 6 caractere. Nu s-a schimbat nimic.');
  await db.end();
  process.exit(1);
}

const again = await askHidden('Încă o dată: ');
if (password !== again) {
  console.error('Cele două nu se potrivesc. Nu s-a schimbat nimic.');
  await db.end();
  process.exit(1);
}

// Exact ce face POST /auth/reset. `password_changed_at` pe acum face ca
// middleware-ul să refuze orice JWT emis înainte, deci sesiunile deschise cu
// parola veche se închid. Fără el, cine avea contul îl păstra încă o săptămână
// după ce i-ai schimbat parola de aici.
// Într-o tranzacție: dacă a doua scriere cade, nu rămâne o parolă nouă cu
// linkurile vechi de resetare încă valabile.
const hash = await bcrypt.hash(password, 10);
const tx = await db.connect();
try {
  await tx.query('BEGIN');
  await tx.query(
    'UPDATE users SET password_hash = $1, password_changed_at = now(), updated_at = now() WHERE id = $2',
    [hash, found.rows[0].id],
  );
  // Linkurile de resetare încă nefolosite nu mai au ce debloca.
  await tx.query(
    "UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND kind = 'reset_password' AND used_at IS NULL",
    [found.rows[0].id],
  );
  await tx.query('COMMIT');
} catch (error) {
  await tx.query('ROLLBACK');
  throw error;
} finally {
  tx.release();
}

console.log(`\nParola pentru ${found.rows[0].email} (${found.rows[0].role}) a fost schimbată.`);
console.log('Sesiunile deschise cu parola veche au fost închise.');
console.log('Nu a fost tipărită nicăieri și nu e în istoricul shell-ului.');

await db.end();
