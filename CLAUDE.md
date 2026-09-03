# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Numerology Compass is a multilingual (Romanian/English/Russian) numerology web application using the Pythagorean system. It calculates Life Path, Destiny, Soul Urge, and Personality numbers, plus compatibility analysis, karmic debt, personal cycles, and predictions.

## Commands

```bash
# Frontend
npm run dev           # Start dev server on http://localhost:8082
npm run build         # Build without the internal routes
npm run build:internal # Build WITH /admin, /design-system, /white-label — use
                      # this one to deploy the machine that serves. See Routing.
npm run lint          # Run ESLint
npm run typecheck     # tsc -b --noEmit. USE THIS ONE. `npx tsc --noEmit` from the
                      # repo root checks ZERO files: tsconfig.json has "files": []
                      # and only project references, so it exits 0 on anything.
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Coverage report (targets src/lib/)

# Run single test file
npm run test:run -- src/lib/__tests__/numerology.test.ts

# Backend (from server/ directory)
cd server
npm run dev           # Start Express server with nodemon
npm run build         # TypeScript compilation
npm run migrate       # Apply every pending migration, in filename order
npm run migrate -- --baseline   # Record them as applied WITHOUT running them
npm run test          # Run backend tests once
npm run test:watch    # Run backend tests in watch mode
```

## Architecture

**Tech Stack**: React 18 + TypeScript + Vite 6 (SWC) | shadcn/ui + Tailwind | React Router + React Query | Express + PostgreSQL

### Layer Structure
```
src/
├── lib/           # Pure TypeScript business logic (no React imports)
├── pages/         # Route components (lazy-loaded)
├── components/    # UI: shadcn in ui/, custom at root, charts/
├── contexts/      # LanguageContext, AuthContext, ThemeContext
├── hooks/         # Custom React hooks
├── services/      # api.ts — client for the Express API (JWT in localStorage)
└── data/          # routes.json — the route registry (see Routing)

server/src/
├── routes/        # API endpoints
├── middleware/    # Auth middleware
└── migrations/    # Database migrations
```

### Core Business Logic (`src/lib/`)

All numerology calculations are pure TypeScript functions:
- `numerology.ts` - Life Path, Destiny, Soul Urge, Personality, Personal Year
- `compatibility.ts` + `compatibilityMatrix.ts` - Compatibility scoring (Life Path 50%, Destiny 30%, Soul Urge 20%)
- `karmic.ts` - Karmic debt (13, 14, 16, 19) and lessons
- `personalCycles.ts` - Day/Month/Year cycles
- `pinnacles.ts` - Life pinnacles and challenges
- `predictions.ts` - Daily/monthly forecasts
- `nameAnalysis.ts` - Name-specific analysis; phone, address and plate analysis
  live in `numerology-plus/applied.ts`. The duplicate copies under `src/lib/`
  had no importer and were removed on 2026-08-30.
- `calendarDate.ts` - The only place a `YYYY-MM-DD` from the API becomes a Date
- `translations.ts` - All UI text in RO/EN/RU

### Routing

`src/data/routes.json` is the single source of truth for every route. Nothing
else declares a route list — `sitemap.xml`, the prerendered per-route `index.html`
files and the static server's 404 allowlist are all generated from it by
`scripts/emit-routes.mjs` at build time. `src/App.tsx` maps each path to a
component and fails loudly in development if the registry lists one it cannot
render.

Each route has a `kind`:

- `public` — indexable, carries `meta` per language, appears in the sitemap
- `app` — a real route that is private or carries params: served, never indexed
- `internal` — `/admin`, `/design-system`, `/white-label`. Left out by
  `npm run build`, put back by `npm run build:internal`.

  **Deploy the machine that serves with `build:internal`.** There is one
  `dist/` and one static server, and the tunnel is what keeps `/admin`
  private — it answers 404 to `^/admin(/|$)` and `^/api/admin(/|$)`
  (measured 2026-09-01, decided 2026-08-30). Building without the internal
  routes takes admin away from the machine too, where it is meant to work,
  and buys no privacy the tunnel was not already providing. See DEPLOY.md.

Adding a route means editing `routes.json` și `PAGES` in `App.tsx`. Nothing else.

### Migrations

`server/src/migrations/` holds the schema, `001_create_users.sql` first. Every
`.sql` file is applied once, in filename order, each in its own transaction, and
recorded in `schema_migrations`; `npm run migrate` is a no-op once they are all
in. A failing migration rolls back alone and stops the run.

They are not replayable: `CREATE TRIGGER` in 004, 006 and 007 has no
`IF NOT EXISTS`, and 009 seeds `subscription_plans` without `ON CONFLICT`.
(005 seeds the same table but *does* carry `ON CONFLICT (name) DO NOTHING`;
this file used to name it alongside 009, wrongly. The inserts in 006 and 007
sit inside function bodies, not seeds.)

Numbering has a gap: 011 does not exist, and never did. Next free is 017. Against a database that already carries the schema but has no
`schema_migrations` — which is what the live one was until 2026-08-30 — run
`npm run migrate -- --baseline` once, then migrate normally from there.

### Auth

JWT issued by the Express API in `server/`, held in `localStorage`, attached by
`src/services/api.ts` and surfaced through `AuthContext`.

Seven routes: `login`, `register`, `me`, `forgot`, `reset`, `verify-email`,
`resend-verification`. `/forgot` returns the same answer whether or not the
address has an account — otherwise it tells you who is signed up. Tokens for the
email flows live in `auth_tokens` (migration 015) as **hashes**, one row per
action, single use, 30 minutes; `server/src/lib/authTokens.ts` is the only place
they are minted or consumed.

`authenticateToken` asks `lib/sessions.ts` whether the password changed after the
JWT was issued, and refuses stale ones — that is what makes "signed out on every
device" true after a reset. It costs one primary-key read per authenticated
request. It lives in its own module rather than inline because the test doubles
prime `pool.query` positionally: inline, a new read on the hot path broke 84
tests across 12 files. `src/__tests__/setup.ts` primes it once, for all of them.

Email leaves through `server/src/lib/email.ts` — one POST, no SDK, no dependency.
Without `RESEND_API_KEY` nothing is sent *and* nothing pretends it was. There is no Supabase —
the dead client, its folder și cheile sale were removed on 2026-08-30. Likewise
there is no Python backend, Docker stack or Kubernetes deployment; the versions
of those that used to sit in this repo never ran.

### Key Conventions

**Master Numbers**: 11, 22, 33 preserved via `preserveMaster` flag in `reduceToSingleDigit()`

**Translations**: Access via `useLanguage()` hook:
```typescript
const { t, language, setLanguage } = useLanguage();
// Access: t.section.key
```

**Component Structure**:
```typescript
// External imports → Internal (@/) imports → Interface → Component
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props { ... }

export const Component = ({ ... }: Props) => {
  // Order: hooks → state → effects → handlers → render
};
```

**Import Alias**: `@/` maps to `src/`

### Styling

Every colour is a token in `src/index.css`; nothing in `src/components` or
`src/pages` names an `hsl()` of its own, and a test enforces that. Two palettes,
light and dark, chosen with `data-theme` or followed from `prefers-color-scheme`
— there is no theme switcher beyond those and no named themes.

Three faces, each with a job: **Literata** for headings and interpretation prose
(`font-heading`), **IBM Plex Mono** for every numeral, label and coordinate
(`.num`, which also turns on tabular figures), **Raleway** for interface chrome
(`font-raleway`). Self-hosted from `public/fonts/`, one file per subset.

`--tension` and `--harmony` carry the relations between numbers — a wide bridge,
an unbalanced plane. They are deliberately not `--crit`/`--ok`: a bridge of 6 is
a distance, not an error.

Nimic nu e închis într-o cutie. Un bloc se anunță cu o LINIE și un titlu, iar
textul stă direct pe pagină; `.card-mystic` și `Card` păstrează doar filetul de
sus, iar câmpurile sunt rânduri cu filet dedesubt, nu casete. Culoarea semantică
stă pe linie, nu pe umplutură.

Singura suprafață plină e **placa** — `bg-plate` plus `.plate-sky` — folosită de
frontispiciu (`PagePlate`) și de capul de secțiune numerotat (`SectionHead`), și
nicăieri altundeva. Nu urmează tema: e un obiect. Ce intră în ea primește
`.on-plate`, care rescrie tokenii de culoare pentru suprafața închisă — altfel un
câmp desenat cu `--line` ar fi invizibil pe tema deschisă.

Utilitare: `.page-measure` (66rem, cu padding-ul o singură dată, aici),
`.page-rhythm` (56px între blocuri), `.section-rhythm` (32px), `.card-mystic`,
`.number-display`, `.btn-primary`, `.plate-sky`, `.on-plate`.

`.text-gradient-gold`, `.glow-gold` și `.btn-mystic` erau citate aici, dar nu
existau în CSS: 24 de fișiere le foloseau fără să emită nimic.

### Routes

`/` (harta), `/doi`, `/azi`, `/unelte`, `/invata`, `/chaldean`, `/remedies`,
`/raport` — publice. `/auth`, `/eu`, `/jurnal`, `/cercul-meu`, `/invite/:code` —
au nevoie de cont. `/admin`, `/design-system`, `/white-label` — interne.

Adresele englezești (`/guide`, `/compatibility`, `/predictions`, `/tools`,
`/profile`, `/journal`, `/premium`…) sunt REDIRECTURI către cele de mai sus, nu
rute. Lista lor stă tot în `routes.json`.

`/unelte` e un lansator: fără parametru arată cele opt unelte ca destinații,
`?s=<unealtă>` deschide una. Redirecturile intră direct pe unealta lor.

## Key Files

- `app-truth.md` - Single source of truth for architecture, patterns, and domain rules
- `.claude/agents/` - Multi-agent definitions (orchestrator, implement, verify, test, docs, numerology-expert, creative, optimize)
- `.claude/skills/` - Custom skills (/build-check, /new-feature, /add-translation, /quick-test, /analyze)

## Deployment

`DEPLOY.md` describes what actually runs: two pm2 processes behind a Cloudflare
Tunnel, `ecosystem.config.cjs` for the topology. `docs/istoric/` holds documents
describing a FastAPI/Docker/Kubernetes system that never ran -- do not treat
them as current.

## Testing

Vitest + Testing Library. Test files in `src/lib/__tests__/`. Setup: `src/test/setup.ts`. Coverage targets `src/lib/`.
