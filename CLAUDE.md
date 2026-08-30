# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Numerology Compass is a multilingual (Romanian/English/Russian) numerology web application using the Pythagorean system. It calculates Life Path, Destiny, Soul Urge, and Personality numbers, plus compatibility analysis, karmic debt, personal cycles, and predictions.

## Commands

```bash
# Frontend
npm run dev           # Start dev server on http://localhost:8082
npm run build         # Production build
npm run lint          # Run ESLint
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
- `nameAnalysis.ts`, `phoneAnalysis.ts`, `vehicleAnalysis.ts`, `locationAnalysis.ts`, `dateAnalysis.ts` - Specialized analysis
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
- `internal` — development only, dropped from the production build entirely
  (`/admin`, `/design-system`, `/white-label`). `npm run build:internal` puts
  them back for the copy served locally on :8090.

Adding a route means editing `routes.json` și `PAGES` in `App.tsx`. Nothing else.

### Migrations

`server/src/migrations/` holds the schema, `001_create_users.sql` first. Every
`.sql` file is applied once, in filename order, each in its own transaction, and
recorded in `schema_migrations`; `npm run migrate` is a no-op once they are all
in. A failing migration rolls back alone and stops the run.

They are not replayable: `CREATE TRIGGER` in 004, 006 and 007 has no
`IF NOT EXISTS`, and 005 and 009 seed `subscription_plans` without
`ON CONFLICT`. Against a database that already carries the schema but has no
`schema_migrations` — which is what the live one was until 2026-08-30 — run
`npm run migrate -- --baseline` once, then migrate normally from there.

### Auth

JWT issued by the Express API in `server/`, held in `localStorage`, attached by
`src/services/api.ts` and surfaced through `AuthContext`. There is no Supabase —
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

Custom `mystic-*` colors (gold, purple, violet, indigo). Fonts: Cinzel (headings), Raleway (body). CSS variables in `index.css`.

Custom utilities: `.text-gradient-gold`, `.glow-gold`, `.card-mystic`, `.number-display`, `.btn-mystic`

### Routes

`/` (calculator), `/guide`, `/compatibility`, `/predictions`, `/tools`, `/tutorials`, `/faq`, `/auth`, `/profile`, `/journal`, `/courses`, `/articles`, `/premium`

## Key Files

- `app-truth.md` - Single source of truth for architecture, patterns, and domain rules
- `.claude/agents/` - Multi-agent definitions (orchestrator, implement, verify, test, docs, numerology-expert, creative, optimize)
- `.claude/skills/` - Custom skills (/build-check, /new-feature, /add-translation, /quick-test, /analyze)

## Testing

Vitest + Testing Library. Test files in `src/lib/__tests__/`. Setup: `src/test/setup.ts`. Coverage targets `src/lib/`.
