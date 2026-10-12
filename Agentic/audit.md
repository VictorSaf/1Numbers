# Audit local — numerology-compass

Data: 2026-10-12, ~16:40; reverificat 16:43 (typecheck, teste, lint, npm audit, `public/`). Ramura: `feature/numerology-plus`. Domeniu: doar `./`.
Fiecare afirmație de mai jos e **observată** (comandă rulată în această sesiune), dacă nu
e marcată altfel.

## 1. Stack

| Strat | Ce rulează |
|---|---|
| Frontend | React 18.3 + Vite 6 (SWC) + TS 5.8, shadcn/Radix, Tailwind 3.4, React Router 6, React Query 5, Vitest 4 |
| Backend | `server/`: Express 5, pg, JWT, bcrypt, helmet, zod 4, web-push, `@anthropic-ai/sdk` 0.122 |
| DB | PostgreSQL, 18 migrații SQL (`000`–`018`, fără `011`) |
| Deploy | pm2 (`ecosystem.config.cjs`) + Cloudflare Tunnel (vezi `DEPLOY.md`) |
| Lockfile-uri | `package-lock.json` **și** `bun.lockb` la rădăcină; `server/package-lock.json` |

Dimensiune: ~58.200 linii TS/TSX în `src/` + `server/src/` (fără teste), 113 fișiere de test.
Cele mai mari fișiere: `translations.ts` (1503), `remedies.ts` (1075), `predictions.ts` (1039),
`loShuGrid.ts` (1002), `compatibility.ts` (813), `Tools.tsx` (782).

## 2. Sănătate — verificări rulate

| Verificare | Rezultat |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run test:run` | 84 fișiere, **864/864 trec** |
| `cd server && npm run test` | 28 fișiere, **208/208 trec** |
| `npm run lint` | 0 erori, 20 warning-uri (aproape toate `react-hooks/exhaustive-deps`) |

## 3. Constatări, după gravitate

### ~~[CRITICAL] Asset-uri șterse~~ — RETRAS la reverificare (16:43)
Versiunea de la 16:40 a acestui audit spunea că `public/favicon.ico`, `og-image.png`, `icons/*` și
`tarot/1..22.jpg` sunt șterse în working tree. La 16:43, `git status --short public/` nu întoarce
nimic, iar fișierele există pe disc. Afirmația nu mai e adevărată. Nu știu dacă a fost greșită de
la început sau dacă fișierele au fost restaurate între timp. `public/tarot/SURSA.md` documentează
sursa scanurilor: Rider & Son, 1909/1910, Pamela Colman Smith.

### [CRITICAL] Vulnerabilități în dependențele de producție (`npm audit --omit=dev`)
- **Backend:** `proxy-addr` (critical), `path-to-regexp` (high), `qs` (moderate), `body-parser`
  (low). Toate au fix disponibil. E lanțul Express, care e expus prin tunel.
- **Frontend:** 20 în total la 16:43 (1 critical, 12 high, 7 moderate). `jspdf` e cel critical, iar printre high sunt `lodash`, `nanoid`, `postcss` și `micromatch`. Printre moderate:
  `dompurify`, `react-router`… Toate au fix disponibil. Multe sunt doar de
  build, nu ajung în bundle. Asta e inferat, nu verificat pachet cu pachet.

### [MEDIUM] Modificări necomise care schimbă producția
- `ecosystem.config.cjs`: `HOST` trece din `0.0.0.0` în `127.0.0.1` pe ambele procese și apare
  un job nou, `compass-retention` (cron `17 3 * * *`). `server/dist/jobs/retention.js` există deja.
- Fișiere noi, neversionate: `server/src/jobs/`, migrația `018_retention_runs.sql`,
  `retention.test.ts`, `LifeCycleCard.tsx`, `pinnacles.test.ts`, `docs/produs/`.
- Nu am verificat dacă pm2 rulează deja cu aceste valori.

### [MEDIUM] Documentația contrazice codul
- `CLAUDE.md` spune „Next free is 017”, dar `017_user_consents.sql` și `018_retention_runs.sql`
  există. Următorul număr liber e 019.
- La rădăcină stau 12 documente din ianuarie (`MCP_*`, `PR_SUMMARY.md`, `DELIVERABLES.md`,
  `ARCHITECTURE.md`, `API_REFERENCE.md`…). `CLAUDE.md` le declară deja istorice pe cele despre
  FastAPI/Docker. *Neverificat* dacă toate sunt depășite.
- Directoarele `backend/` și `mcp_servers/` conțin doar `.DS_Store`.

### [LOW]
- Două lockfile-uri, `bun.lockb` și `package-lock.json`. Scripturile folosesc npm.
- `package.json` se numește încă `vite_react_shadcn_ts`. Scriptul `orchestrate` cere
  `.claude/orchestrator`, care nu există.
- Zod 3 în frontend, Zod 4 în backend. Nu împart scheme, deci acum nu contează.
- Dependențe în urmă: Radix (minor), `@hookform/resolvers` 3→5, ESLint 9→10.
- Fișiere uriașe (`translations.ts`, `remedies.ts`, `predictions.ts`) adună tot textul RO/EN/RU
  într-un singur loc.
- 20 de warning-uri `exhaustive-deps` (de ex. `Admin/sections/UsersSection.tsx:213`).

## 4. Ce nu am făcut

- Nu am generat `Agentic/code_map.json` și nu am pornit „swarm-ul” descris în `CLAUDE.md`.
  Cererea a fost doar auditul.
- Nu am rulat build-ul, migrațiile, pm2 sau verificări pe rețea.
