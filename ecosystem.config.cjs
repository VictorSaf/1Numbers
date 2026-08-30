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
// Both processes bind to loopback. The Cloudflare Tunnel runs on the same host
// and splits by path: /api/* to the API, everything else to the static server.
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
      },
    },
    {
      name: 'compass-api',
      script: 'server/dist/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        // Everything else -- DATABASE_URL, JWT_SECRET, the feature flags -- is
        // read from server/.env by dotenv, which is where the secrets live and
        // where they stay out of this file.
      },
    },
  ],
};
