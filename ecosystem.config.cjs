// pm2 process topology.
//
// Names verified against `pm2 list` on the host that runs it on 2026-08-30;
// the first version of this file guessed 'compass-web' and was wrong.
//
// This existed only in the memory of that host: ci.yml and the
// header of scripts/serve-compass.mjs both refer to pm2, and nothing in the
// repository said what it starts. A machine rebuild would have had to guess.
//
// .cjs rather than .js because the root package.json is "type": "module" and
// pm2 reads this file with require().
//
// Ambele procese ascultă pe rețeaua locală, nu doar pe loopback. Tunelul
// Cloudflare rulează pe aceeași mașină și împarte pe cale: /api/* la API,
// restul la serverul static -- asta nu se schimbă.
//
// HOST e aici, nu în cod, fiindcă e o decizie de topologie: cine deschide
// fișierul ăsta vede dintr-o privire ce e expus și unde se schimbă. Codul are
// loopback ca implicit, deci o mașină fără fișierul ăsta rămâne închisă.
//
// Motivul: panoul de admin. Tunelul răspunde 404 la ^/admin și ^/api/admin din
// 2026-08-30 și rămâne așa, deci de pe alt calculator nu exista nicio cale.
// Dintre cele trei posibile -- tunel SSH (Remote Login oprit), Cloudflare
// Access (se configurează în panoul Cloudflare) și scoaterea blocajului din
// tunel (ar pune adminul pe internetul deschis) -- rețeaua locală e cea mai
// mică schimbare care rezolvă.
//
// Ce se expune nou e strict panoul de admin: restul aplicației era deja
// publică prin tunel. Îl apără mai departe autentificarea și requireAdmin,
// care citește rolul din baza de date la fiecare cerere, nu din token.
//
// Ca să revii: șterge cele două linii HOST și `pm2 restart compass compass-api`.
module.exports = {
  apps: [
    {
      name: 'compass',
      script: 'scripts/serve-compass.mjs',
      cwd: __dirname,
      // Zero dependencies and no state, so a single process is enough and a
      // restart costs nothing.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
      },
    },
    {
      name: 'compass-api',
      script: 'dist/index.js',
      // cwd e server/, nu rădăcina: app.ts și db.ts cheamă dotenv.config() fără
      // cale, care rezolvă față de process.cwd(). Cu rădăcina, dotenv citea
      // .env-ul de sus și nu găsea JWT_SECRET, iar procesul cădea la pornire.
      cwd: require('path').join(__dirname, 'server'),
      // instances: 1 nu mai e o presupunere pe care se sprijină corectitudinea.
      // Dispecerul de notificări revendică fiecare trimitere printr-un
      // INSERT ... ON CONFLICT DO NOTHING pe indexul unic
      // (user_id, dedupe_key) din migrația 010, deci două procese nu pot
      // trimite aceeași notificare de două ori. Ceea ce e bine, fiindcă
      // `pm2 restart` are exact asta, câteva secunde.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        // Everything else -- DATABASE_URL, JWT_SECRET, the feature flags -- is
        // read from server/.env by dotenv, which is where the secrets live and
        // where they stay out of this file.
      },
    },
    {
      name: 'compass-retention',
      script: 'dist/jobs/retention.js',
      cwd: require('path').join(__dirname, 'server'),
      // A job, not a server: it starts, deletes what's past its window, logs
      // a retention_runs row, and exits 0. autorestart: false means pm2
      // leaves it stopped there instead of relaunching it in a loop;
      // cron_restart is what brings it back, once a day, regardless of
      // autorestart -- that's the standard pm2 shape for a scheduled job.
      autorestart: false,
      cron_restart: '17 3 * * *',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
