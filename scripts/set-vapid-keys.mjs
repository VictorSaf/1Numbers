#!/usr/bin/env node
/**
 * Generează perechea VAPID și o scrie în fișierele de mediu.
 *
 * Cheia privată nu ajunge niciodată la ecran, în istoricul shell-ului sau
 * într-un log: se generează local și se scrie direct în server/.env. La ieșire
 * se tipărește doar cheia publică, care e publică prin definiție -- browserul o
 * primește oricum, la fiecare abonare.
 *
 * Cheia publică trebuie să existe în două locuri, fiindcă o citesc doi oameni
 * diferiți: serverul o folosește ca să semneze, iar frontendul ca să ceară
 * abonamentul. Aceeași valoare, două fișiere -- de-aia le scrie același script,
 * ca să nu se poată desincroniza.
 *
 * NU pornește nimic. `NOTIFICATIONS_ENABLED` rămâne cum era: cheile fac
 * trimiterea POSIBILĂ, dispecerul o face să se întâmple, iar a doua e o
 * decizie separată, cu telefoane reale la capătul ei.
 *
 * Generarea nu folosește `web-push`: pachetul stă în server/node_modules, iar
 * scriptul rulează din rădăcină. O pereche VAPID e oricum doar o cheie ECDSA
 * pe curba P-256 -- cheia publică e punctul necomprimat (0x04 ‖ x ‖ y), cheia
 * privată e scalarul, ambele în base64url. `crypto` din Node le dă direct,
 * deci scriptul n-are nicio dependență și merge de oriunde.
 *
 * Rotirea cheilor invalidează TOATE abonamentele existente -- browserele au
 * memorat cheia veche, iar cele vechi nu mai pot fi notificate niciodată. De
 * aceea scriptul refuză să suprascrie fără `--force`.
 */

import { writeFileSync, readFileSync, existsSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateKeyPairSync } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');
const subject =
  process.argv.find((a) => a.startsWith('--subject='))?.slice(10) ??
  'https://compass.oneaigency.com';

if (!/^(mailto:|https:\/\/)/.test(subject)) {
  console.error('--subject trebuie să fie mailto:... sau https://...');
  process.exit(1);
}

/** Scrie sau înlocuiește o cheie într-un fișier .env, fără să atingă restul. */
const put = (file, entries) => {
  const before = existsSync(file) ? readFileSync(file, 'utf8') : '';
  let out = before;
  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    out = re.test(out) ? out.replace(re, line) : `${out}${out.endsWith('\n') || out === '' ? '' : '\n'}${line}\n`;
  }
  writeFileSync(file, out, { mode: 0o600 });
  chmodSync(file, 0o600);
};

const serverEnv = resolve(root, 'server/.env');
const webEnv = resolve(root, '.env');

const already = existsSync(serverEnv) && /^VAPID_PRIVATE_KEY=.+$/m.test(readFileSync(serverEnv, 'utf8'));
if (already && !force) {
  console.log('Cheile VAPID există deja în server/.env.');
  console.log('Rotirea lor rupe definitiv toate abonamentele existente.');
  console.log('Dacă chiar asta vrei: npm run vapid -- --force');
  process.exit(0);
}

/**
 * O pereche VAPID, din primitivele standard.
 *
 * JWK dă coordonatele deja în base64url, deci nu se face nicio conversie de
 * mână: x și y se lipesc după octetul 0x04 care marchează un punct
 * necomprimat, iar d e chiar cheia privată.
 */
const generateVapidKeys = () => {
  const { publicKey: pub, privateKey: priv } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  const jwk = priv.export({ format: 'jwk' });
  const b64u = (s) => Buffer.from(s, 'base64url');
  return {
    publicKey: Buffer.concat([Buffer.from([0x04]), b64u(jwk.x), b64u(jwk.y)]).toString('base64url'),
    privateKey: b64u(jwk.d).toString('base64url'),
    _unused: pub,
  };
};

const { publicKey, privateKey } = generateVapidKeys();

put(serverEnv, {
  VAPID_PUBLIC_KEY: publicKey,
  VAPID_PRIVATE_KEY: privateKey,
  VAPID_SUBJECT: subject,
});
put(webEnv, { VITE_VAPID_PUBLIC_KEY: publicKey });

console.log('Scrise, cu drepturi 600:');
console.log('  server/.env  VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT');
console.log('  .env         VITE_VAPID_PUBLIC_KEY');
console.log('');
console.log(`subiect:      ${subject}`);
console.log(`cheia publică: ${publicKey}`);
console.log('');
console.log('Cheia privată e doar în server/.env. Nu a fost tipărită nicăieri.');
console.log('');
console.log('Ca să intre în vigoare:');
console.log('  npm run build:internal && pm2 restart compass compass-api');
console.log('');
console.log('Dispecerul rămâne oprit. Cheile fac trimiterea posibilă, nu pornită.');
