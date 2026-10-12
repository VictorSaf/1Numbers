# UNIVERSAL MULTI-MASTER ASYNCHRONOUS ARCHITECTURE (ACE-CORE v8 - DEEP RESEARCH)

## 1. AUTOMATIC BOOTSTRAP, PROTOCOL ISOLATION & AUTO-DISCOVERY
- Upon session boot, the system verifies if the official Superpowers framework is active. If missing, it is authorized to run `/plugin install superpowers@claude-plugins-official`.
- **Zero-Knowledge Local Discovery:** If `./Agentic/audit.md` does not exist, the system suspends all feature development, sniffs the current workspace directory natively (lockfiles, directory structures), and generates an abstract code reference map `./Agentic/code_map.json`.
- **Strict Sandbox Containment:** All structural discovery tools are mathematically restricted to the current folder (`./`). Accessing parent directories, neighboring repositories, or global system-wide processes outside this workspace is strictly prohibited.

## 2. PROACTIVE RESEARCH GATE & INTERVIEW ENHANCEMENT
- **The Strategic Query:** Right after saving the audit, @Lead pauses execution and prints a single prompt in the terminal:
  *"[ACE-ENGINE]: Local project audited successfully. Victor, what is your primary strategic objective for this workspace?"*
- **Autonomous Research Engine (The Brainstorming Phase):** The moment the user types their brief (even if informal or brief), @Lead is forbidden from breaking it into tasks immediately. Instead, it must trigger its web search tools to execute deep, concurrent online research tailored specifically to the project's stack (e.g., searching for advanced Next.js 16 memory pooling, Prisma/SQLite high-concurrency configurations, or React 19 render optimization tricks).
- **The Prompt Augmentation Document:** Based on its online findings and the technical vulnerabilities mapped in `audit.md`, @Lead builds a comprehensive, ultra-detailed engineering specification. It injects edge-case scenarios, performance bottlenecks, and architectural security rules that the user might not be aware of.
- **The Final Verification Gate:** @Lead presents the complete, hyper-augmented prompt directly on your screen and freezes, prompting you:
  *"[ARCHITECT]: Based on deep online research and your local audit, I have engineered this augmented technical specification for your objective. Review the final suggested prompt details below. Do you approve initializing the Multi-Master Swarm on this blueprint? (Type 'yes' to execute, 'no' to cancel, or provide changes)."*
- **Administrative Activation:** Upon typing 'yes', @Lead takes administrative control of the main checkout, commits current untracked files into an automated temporary backup (`git add -A && git commit -m "ACE-WIP-backup"`), creates the local `ace-integration` branch, and launches the execution graph.

## 3. MULTI-LEAD CONCURRENT ORCHESTRATION & DAG DEPENDENCY SCHEDULING
- **The Central Swarm Coordinator:** Once authorized, the augmented prompt is mapped out as an asynchronous Directed Acyclic Graph (DAG) inside `./Agentic/PLAN.md` where all tasks are broken down into 2-5 minute atomic units.
- **Concurrent Sub-Masters (Multi-Lead Threading):** If decoupled architectural zones are discovered, the engine spawns separate concurrent orchestrators on disk (`./Agentic/master1.md`, `./Agentic/master2.md`, etc.).
- **Non-Blocking Context-Switching:** No orchestrator or Sub-Master is allowed to block or idle while waiting for an ephemeral agent loop. If a node is waiting for a `@Worker` or a `@Tester`, the managing `@Lead` instantly suspends that specific branch on disk, scans the DAG for unblocked nodes, spawns a new parallel worker/tester pair, and advances other parts of the plan concurrently.

## 4. INDUSTRIAL SANDBOX FLEET & SPEED OPTIMIZATIONS
- **Git Worktrees Fleet:** Sub-masters operate inside independent directory sandboxes located at `.claude/worktrees/ace-wf-[task-name]`.
- **Pre-Cache Symlinking:** Directories like `node_modules`, `.venv`, `.env` setups, and build caches are linked automatically via symlinks into the worktree sandbox during initialization to skip boot latencies.
- **Chirurgie de Context:** Workers cannot load entire modules into their context windows. They are restricted to pulling targeted 100-line code snippets using structural cross-reference markers from `code_map.json`.

## 5. EXPERT WORKFLOW EXECUTION (Superpowers TDD & Shadow Testing)
- **Superpowers Inline Batching:** Tasks are processed consecutively within the same active worktree context using automated batching workflows to preserve token windows.
- **Strict TDD Compliance:** Workers must execute the Superpowers RED-GREEN-REFACTOR protocol. A failing unit test must be written first and proven to fail before any production code mutation is allowed.
- **Shadow Watcher Pool:** Testers run the framework test suites in a persistent asynchronous background watch mode inside the sandbox. Modifications are validated live in milliseconds.
- **Automated Lot Review:** Upon batch completion, `@Tester` outputs a cumulative `REVIEW.md` breaking defects down into `[LOW]`, `[MEDIUM]`, and `[CRITICAL]`.

## 6. FULLY DELEGATED AUTONOMOUS MERGE & RECOVERY
- **Master Merge Decision Engine:** Branch validation and merge confirmations are offloaded entirely to the managing Master agent.
  * If `REVIEW.md` is `PASS` with zero `CRITICAL` errors, **the Master issues its own merge confirmation string**, integrates the worktree locally into the primary integration branch, prunes the sandbox directory, marks the nodes as complete in `PLAN.md`, and unblocks downstream tasks.
  * If `CRITICAL` regressions are found, Master blocks the branch and loops back an immediate recovery agent without prompting the user.

## 7. ZERO CHAT NOISE
- Inter-agent coordination is strictly file-driven via disk updates. The console remains completely silent, displaying only a dynamic task grid via `/tasks`. You are only notified upon total epic success or an unrecoverable framework crash.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Numerology Compass is a multilingual (Romanian/English/Russian) numerology web application using the Pythagorean system. It calculates Life Path, Destiny, Soul Urge, and Personality numbers, plus compatibility analysis, karmic debt, personal cycles, and predictions.

## Ce e produsul (citește înainte să construiești ceva nou)

`docs/produs/` e baza de produs: `01-definitie.md` (ce e și pentru cine), `02-doctrina.md`
(mecanismul diferențiator și regulile), `03-filtru.md` (ce rămâne, ce se mută, ce dispare),
`04-extinderi.md`, `05-glosar.md`.

Pe scurt: aplicația nu e un calculator de numerologie. Arată **unde nu ești de acord cu
tine** — punți în interiorul unui sistem, dezacorduri între sisteme paralele, absențe pe
două drumuri. Distanța dintre două căi corecte e informația. Nu se fac medii, acordul e un
rezultat, o distanță nu e o eroare.

Orice funcție nouă trece întâi prin `02-doctrina.md`. Ce nu o servește, nu se construiește.

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
- `compatibility.ts` - Compatibility scoring (Life Path 50%, Destiny 30%, Soul Urge 20%)
- `karmic.ts` - Karmic debt (13, 14, 16, 19) and lessons
- `personalCycles.ts` - Day/Month/Year cycles
- `pinnacles.ts` - Life pinnacles and challenges
- `predictions.ts` - Daily/monthly forecasts
- `nameAnalysis.ts` - Name-specific analysis; address analysis lives in
  `numerology-plus/applied.ts`. Phone and plate analysis had no caller and were
  removed on 2026-10-12, as were the duplicate copies under `src/lib/` (2026-08-30).
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

Numbering has a gap: 011 does not exist, and never did. Next free is 019. Against a database that already carries the schema but has no
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
