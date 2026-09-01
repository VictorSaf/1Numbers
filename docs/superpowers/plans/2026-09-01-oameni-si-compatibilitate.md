# Oameni salvați pe categorii și compatibilitate în timp — plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hărțile salvate capătă o categorie (eu / apropiat / copil / afacere), sunt grupate și filtrabile în `/eu` și pot fi păstrate direct din uneltele de nume; iar `/doi` primește un strat temporal — anul personal al fiecăruia și alinierea lor lună de lună — peste scorul existent.

**Architecture:** Livrabilul 1 adaugă o singură coloană (`user_profiles.category`) printr-o migrație nouă, o duce prin API și hook, și o expune în `/eu` prin două componente noi de prezentare. Livrabilul 2 adaugă un modul pur nou, `src/lib/relationshipTiming.ts`, care combină funcțiile existente de an și lună personală cu matricea de compatibilitate existentă — nicio formulă nouă, nicio pondere schimbată — și o componentă care îl desenează în tokenii `--harmony` / `--tension`. Cele două livrabile nu se ating: dacă se implementează doar primul, produsul e coerent; task-urile 9-13 nu importă nimic din task-urile 1-8.

**Tech Stack:** React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind, Vitest + Testing Library (jsdom), Express 5 + PostgreSQL (`pg`) + `zod`, supertest.

**Spec:** Nu există un document de spec separat. Cerințele de pornire sunt reproduse integral în secțiunea „Cerințe de pornire" de mai jos, iar constrângerile în „Global Constraints". Executantul citește ambele înainte de Task 1.

---

## Global Constraints

Cerințele astea se aplică fiecărui task din plan, fără să fie repetate în el.

- Repo: `/Users/victorsafta/work/numerology-compass`, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Backend: Express + PostgreSQL (`pg`) + `zod`, în `server/`. Teste: `cd server && npm run test` (vitest + supertest). Autentificare prin JWT în `localStorage`, atașat de `src/services/api.ts`, expus prin `AuthContext`.
- Migrații: `server/src/migrations/NNN_nume.sql`, aplicate o singură dată, în ordinea numelui, prin `cd server && npm run migrate`. NU sunt replayable: nu edita niciodată o migrație existentă, adaugă un fișier nou numerotat. Ultima existentă e `009_premium_features.sql`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = `routes.json` ȘI `PAGES` din `src/App.tsx`.
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare. Tokenii `--tension` și `--harmony` poartă relațiile dintre numere și sunt exact ce-ți trebuie pentru compatibilitate — NU sunt `--crit`/`--ok`: o punte de 6 e o distanță, nu o eroare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră, scor sau coordonată; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY: 78 de aserțiuni trec.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA. NU folosi prefixe conventional-commits.

### Constrângeri suplimentare, care ies din brief

- **Nu transforma asta în social.** `/cercul-meu`, prietenii și invitațiile există dar sunt haotice și se redefinesc separat, mai târziu. Planul ăsta nu le atinge, nu le extinde și nu depinde de ele. Un profil salvat e o hartă pe care o ține utilizatorul, nu o persoană cu cont.
- **Ponderile de compatibilitate rămân neatinse:** Drum 50%, Destin 30%, Suflet 20%, în `calculateCompatibility` din `src/lib/compatibility.ts`. Stratul temporal se adaugă *peste* ele, într-un fișier nou. Task 13 conține o aserțiune care blochează asta.
- **Fiecare livrabil se oprește după el însuși.** Task-urile 1-8 (Livrabilul 1) nu importă nimic din 9-13, și invers.

### Cerințe de pornire (spec-ul, verbatim)

**Livrabilul 1 — oameni pe categorii.** O categorie pe profilul salvat (personal / business / copil / altcineva), filtrare și grupare în `/eu`, și legătura din uneltele de nume: după ce calculezi un nume în `/unelte`, poți să-l păstrezi.

**Livrabilul 2 — relația în timp.** Compatibilitatea capătă o dimensiune temporală: pe lângă scorul de acum, ce spune anul personal al fiecăruia despre perioada asta, și unde se aliniază sau se bat cap în cap lunile lor.

**Datele altcuiva.** Salvezi numele și data nașterii unei alte persoane, care n-a consimțit la nimic. Tratează asta explicit: ce se stochează, cine îl vede, cum se șterge.

---

## Ce e deja în cod (verificat la sursă, 2026-09-01)

Citește lista asta înainte de Task 1. Fiecare rând a fost verificat în fișier, nu presupus.

**`server/src/migrations/002_create_user_profiles.sql`** creează `user_profiles` cu exact aceste coloane:
`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `full_name TEXT NOT NULL`, `birth_date DATE NOT NULL`, `birth_time TIME`, `birth_place TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`, plus `UNIQUE(user_id)`.

**`server/src/migrations/003_add_multiple_profiles.sql`** scoate `user_profiles_user_id_key`, adaugă `is_active BOOLEAN NOT NULL DEFAULT false`, indexul `idx_user_profiles_is_active` și indexul unic parțial `idx_user_profiles_one_active ON user_profiles(user_id) WHERE is_active = true`.

**Concluzie: nu există nicio coloană care să poată purta o categorie.** Nu există `category`, nu există `notes`, nu există o coloană JSON. E nevoie de o migrație nouă: `012_profile_categories.sql`.

**`server/src/routes/profiles.ts`** are cinci endpoint-uri (`GET /me`, `GET /all`, `POST /me`, `PUT /:id`, `DELETE /:id`, `POST /:id/activate`), montate la `/api/profiles` în `server/src/app.ts:84`. Fiecare repetă aceeași listă de coloane și aceeași mapare `snake_case` → `camelCase`, de cinci ori. Validarea de intrare e un `if (!fullName || !birthDate)` — nu folosește `zod`, deși `journal.ts`, `notifications.ts` și `ai.ts` îl folosesc.

**`POST /me`** decide activarea așa: `const shouldBeActive = setAsActive !== false && (isFirstProfile || setAsActive === true);`. Adică orice hartă salvată cu `setAsActive: true` devine profilul activ — inclusiv, azi, harta unui copil salvată din `SaveMapButton`, care trimite `setAsActive: true` necondiționat (`src/components/numerology/SaveMapButton.tsx:70`). Profilul activ alimentează prefill-urile din `/unelte` (`src/pages/Tools.tsx:75`) și din `/doi` (`src/pages/Compatibility.tsx:54`). Task 2 închide asta.

**`src/services/api.ts:105-137`** expune `getProfile`, `getAllProfiles`, `createProfile`, `updateProfile`, `deleteProfile`, `setActiveProfile`. Tipurile de payload sunt scrise inline; răspunsurile sunt `unknown`.

**`src/hooks/use-profiles.ts`** exportă `interface Profile` cu `id, userId, fullName, birthDate, birthTime?, birthPlace?, isActive, createdAt, updatedAt` și hook-ul `useProfiles()`. `src/hooks/use-profile.ts` e un wrapper legacy peste el.

**`src/pages/Profile.tsx`** (ruta `/eu`) listează profilurile într-o singură listă plată, fără grupare. Are deja editare, ștergere cu `AlertDialog`, și `ProfileSwitcher`.

**`src/pages/Tools.tsx`** (749 linii) are tab-urile `calendar`, `loshu`, `angel`, `name-change`, `business`, `forecast`, `matrix`, `optimizer`, comutate prin `?s=`. `name-change`, `business` și `optimizer` calculează și afișează, dar nu rețin nimic.

**`src/lib/compatibility.ts`** exportă `getCompatibilityScore(num1, num2): number` (citește `COMPATIBILITY_MATRIX`, întoarce 40-100), `calculateCompatibility(p1, p2): CompatibilityResult` (ponderile 50/30/20) și `getCompatibilityLevel(score): "excellent" | "good" | "moderate" | "challenging"` cu pragurile 85 / 70 / 55.

**`src/lib/numerology.ts:39`** exportă `calculatePersonalYearNumber(birthDate: Date, year?: number): number`.
**`src/lib/personalCycles.ts:28`** exportă `calculatePersonalMonthNumber(birthDate: Date, year?: number, month?: number): number`.

**`tailwind.config.ts:45-52`** mapează `tension` → `hsl(var(--tension))`, `tension.soft` → `hsl(var(--tension-soft))`, `harmony` → `hsl(var(--harmony))`, `harmony.soft` → `hsl(var(--harmony-soft))`. Deci `text-tension`, `bg-tension-soft`, `border-harmony/30` sunt clase valide.

**Testele existente pe care nu ai voie să le strici:**
- `src/lib/__tests__/translations.test.ts` — cere paritate de chei între ro/en/ru și interzice valorile goale. Orice cheie nouă trebuie adăugată în toate trei.
- `src/lib/__tests__/design-tokens.test.ts` — pică dacă apare un `hsl()` literal în `src/components` sau `src/pages`.
- `src/lib/__tests__/compatibility.test.ts`, `compatibilityExtended.test.ts` — nu le modifica.
- Configurația Vitest din frontend rulează `jsdom` cu `src/test/setup.ts`, și există deja teste `.tsx` (`src/components/numerology/__tests__/ChapterNav.test.tsx`). Testele de componentă sunt un pattern stabilit.
- Testele de server mock-uiesc pool-ul: `vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));` — vezi `server/src/__tests__/hardening.test.ts:7`. `authenticateToken` nu atinge baza de date, deci un token semnat cu `process.env.JWT_SECRET` e de ajuns.

## Setul de categorii, și de ce ăsta

Patru valori, stocate ca text, în română (limba de bază a produsului):

| Valoare | Ce e | De ce e separată |
|---|---|---|
| `eu` | Hărțile titularului de cont, inclusiv variantele de nume | E singura care poate fi profilul activ. Separă „a mea" de „a altcuiva" — distincția pe care o cere brief-ul. |
| `apropiat` | Partener, familie, prieten — o persoană reală, cunoscută | Cazul pentru care există `/doi`. Datele sunt ale altcuiva. |
| `copil` | Un copil, sau un nume care se alege pentru unul | Cazul „ce nume dau copilului", cârligul de revenire din cercetare. Merită să fie propriu: intrarea e adesea o dată estimată, nu una trecută. |
| `afacere` | O firmă, un brand, un nume comercial | Cazul „cum îmi numesc firma". `birth_date` poartă data înființării — practica numerologică folosește exact asta pentru drumul unei firme. |

Argumentul pentru patru și nu trei: `copil` și `afacere` sunt exact cele două cazuri pe care cercetarea le numește cârlige de revenire; dacă le comasezi în „altcineva", dispare fix distincția care justifică funcția. Argumentul pentru patru și nu cinci: nu adăugăm o categorie „altcineva" generică peste `apropiat` — ar fi o găleată fără înțeles, iar `apropiat` acoperă deja orice persoană reală care nu e copil.

**Nu extindem schema pentru `afacere`.** `birth_date` e `NOT NULL` și rămâne așa. O firmă are o dată de înființare; a face coloana nullable ar rupe fiecare calcul din aval (`parseCalendarDate` ar întoarce `null`, drumul vieții ar cădea). Interfața cere data înființării cu eticheta ei, și atât.

## Datele altcuiva — ce se stochează, cine vede, cum se șterge

Brief-ul cere ca asta să fie tratată explicit, nu ca o formalitate. Iată răspunsul, și task-urile care îl duc:

- **Ce se stochează:** numai numele complet, data (nașterii sau înființării) și categoria. Nimic altceva. `birth_time` și `birth_place` rămân opționale și interfața nu le cere pentru hărțile care nu sunt `eu` (Task 6). Nu se stochează adresă, telefon, e-mail sau orice contact — nu există coloane pentru așa ceva și planul nu adaugă.
- **Cine vede:** exclusiv titularul contului. Fiecare interogare din `server/src/routes/profiles.ts` e deja filtrată pe `user_id = $1`, iar `PUT` și `DELETE` verifică apartenența înainte să scrie. Task 8 blochează comportamentul ăsta cu teste, ca să nu se piardă la o refactorizare. Nimic din planul ăsta nu expune un profil salvat către `/cercul-meu`, prieteni, invitații sau clasamente.
- **Cum se șterge:** butonul de ștergere per hartă din `/eu` există deja și rămâne (`src/pages/Profile.tsx`, `handleDelete`); Task 6 îl duce în cardul de grup. Ștergerea contului șterge tot, prin `ON DELETE CASCADE` pe `user_id` din migrația 002. Task 8 pune, lângă hărțile care nu sunt `eu`, o notă în trei limbi care spune în clar: datele sunt ale altcuiva, le vezi numai tu, le poți șterge oricând.
- **Ce nu poate face o hartă a altcuiva:** nu poate deveni profilul activ (Task 2). Altfel aplicația ar începe să afișeze previziunile copilului drept ale utilizatorului.

---

## File Structure

**Livrabilul 1 — oameni pe categorii**

| Fișier | Responsabilitate |
|---|---|
| `server/src/migrations/012_profile_categories.sql` (nou) | Adaugă `category`, constrângerea de valori, constrângerea „doar `eu` poate fi activ", indexul. |
| `server/src/routes/profiles.ts` (modificat) | Un singur `PROFILE_COLUMNS` și un singur `toProfile`; schema `zod`; categoria intră și iese; regula de activare. |
| `server/src/__tests__/profiles.categories.test.ts` (nou) | Categoria trece prin API; activarea e refuzată pentru ce nu e `eu`. |
| `server/src/__tests__/profiles.ownership.test.ts` (nou) | O hartă nu e citibilă, editabilă sau ștergibilă de alt cont. |
| `src/lib/profileCategories.ts` (nou) | Modul pur: lista categoriilor, normalizarea, gruparea. Fără React. |
| `src/lib/__tests__/profileCategories.test.ts` (nou) | Testele modulului pur. |
| `src/lib/__tests__/profileCategories.i18n.test.ts` (nou) | Fiecare categorie are etichetă în ro, en și ru. |
| `src/lib/translations.ts` (modificat) | Blocul `people` în cele trei limbi. |
| `src/services/api.ts` (modificat) | `category` în payload-urile de creare și actualizare. |
| `src/services/__tests__/api.profiles.test.ts` (nou) | Clientul chiar trimite categoria. |
| `src/hooks/use-profiles.ts` (modificat) | `category` pe `Profile` și pe semnăturile de creare/actualizare. |
| `src/components/people/PeopleGroup.tsx` (nou) | Un grup de hărți dintr-o categorie, cu nota pentru datele altcuiva. |
| `src/components/people/__tests__/PeopleGroup.test.tsx` (nou) | |
| `src/components/people/PeopleFilter.tsx` (nou) | Chip-urile de filtrare pe categorie. |
| `src/components/people/__tests__/PeopleFilter.test.tsx` (nou) | |
| `src/pages/Profile.tsx` (modificat) | Înlocuiește lista plată cu filtru + grupuri; formularul primește selectorul de categorie. |
| `src/components/people/KeepNameButton.tsx` (nou) | „Păstrează numele" din `/unelte`: dialog cu dată și categorie, salvează fără să activeze. |
| `src/components/people/__tests__/KeepNameButton.test.tsx` (nou) | |
| `src/pages/Tools.tsx` (modificat) | Butonul în tab-urile `name-change`, `business`, `optimizer`. |

**Livrabilul 2 — relația în timp**

| Fișier | Responsabilitate |
|---|---|
| `src/lib/relationshipTiming.ts` (nou) | Modul pur: anul personal al fiecăruia și alinierea celor 12 luni. Zero formule noi. |
| `src/lib/__tests__/relationshipTiming.test.ts` (nou) | |
| `src/lib/translations.ts` (modificat) | Blocul `timing` în cele trei limbi. |
| `src/components/compatibility/RelationshipTimingCard.tsx` (nou) | Desenează stratul temporal în `--harmony` / `--tension`. |
| `src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx` (nou) | |
| `src/pages/Compatibility.tsx` (modificat) | Randează cardul sub dinamica relației. |
| `src/lib/__tests__/compatibilityWeights.test.ts` (nou) | Ponderile 50/30/20 rămân exact ce erau. |

Nicio rută nouă: ambele livrabile trăiesc în `/eu`, `/unelte` și `/doi`, care există deja. `src/data/routes.json` și `src/App.tsx` nu se ating.

---

# LIVRABILUL 1 — Oameni salvați, pe categorii

### Task 1: Coloana `category` și drumul ei prin API

**Files:**
- Create: `server/src/migrations/012_profile_categories.sql`
- Modify: `server/src/routes/profiles.ts` (întreg fișierul: listele de coloane și mapările se unifică)
- Test: `server/src/__tests__/profiles.categories.test.ts`

**Interfaces:**
- Consumes: `pool` din `server/src/db`, `authenticateToken` / `AuthRequest` din `server/src/middleware/auth`, tabela `user_profiles` cu coloanele din migrațiile 002 și 003.
- Produces: coloana `user_profiles.category TEXT NOT NULL DEFAULT 'eu'` cu `CHECK (category IN ('eu','apropiat','copil','afacere'))`; câmpul `category: string` pe fiecare obiect profil întors de `/api/profiles/me`, `/api/profiles/all`, `POST /api/profiles/me`, `PUT /api/profiles/:id`, `POST /api/profiles/:id/activate`; `POST` și `PUT` acceptă `category` în body. Task 5 consumă forma asta.

- [ ] **Step 1: Scrie testul care pică**

Creează `server/src/__tests__/profiles.categories.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

/**
 * O hartă salvată are un fel: a mea, a cuiva apropiat, a unui copil, a unei
 * firme. Categoria trebuie să iasă din API la citire și să intre la scriere --
 * altfel gruparea din /eu nu are pe ce să se sprijine.
 */

const auth = `Bearer ${jwt.sign(
  { userId: 'u1', email: 'u1@test.local', role: 'user' },
  process.env.JWT_SECRET!,
)}`;

const row = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  user_id: 'u1',
  full_name: 'Ana Pop',
  birth_date: '1990-05-15',
  birth_time: null,
  birth_place: null,
  category: 'copil',
  is_active: false,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
  ...over,
});

const client = { query: vi.fn(), release: vi.fn() };

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(pool.connect).mockReset();
  client.query.mockReset();
  client.release.mockReset();
  vi.mocked(pool.connect).mockResolvedValue(client as never);
});

describe('categoria iese din API', () => {
  it('o duce pe fiecare hartă din listă', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [row()] } as never);

    const response = await request(app).get('/api/profiles/all').set('Authorization', auth);

    expect(response.status).toBe(200);
    expect(response.body.profiles[0].category).toBe('copil');
  });

  it('o duce și pe harta activă', async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [row({ category: 'eu', is_active: true })],
    } as never);

    const response = await request(app).get('/api/profiles/me').set('Authorization', auth);

    expect(response.status).toBe(200);
    expect(response.body.profile.category).toBe('eu');
  });
});

describe('categoria intră în API', () => {
  it('o scrie la creare', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '3' }] });
      if (/INSERT INTO user_profiles/.test(sql)) return Promise.resolve({ rows: [row()] });
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'copil' });

    expect(response.status).toBe(201);
    const insert = client.query.mock.calls.find(([sql]: [string]) =>
      /INSERT INTO user_profiles/.test(sql),
    );
    expect(insert![1]).toContain('copil');
  });

  it('cade pe o categorie care nu există', async () => {
    const response = await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'pisica' });

    expect(response.status).toBe(400);
  });

  it('pune eu când nu se cere nimic', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '3' }] });
      if (/INSERT INTO user_profiles/.test(sql)) return Promise.resolve({ rows: [row({ category: 'eu' })] });
      return Promise.resolve({ rows: [] });
    });

    await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({ fullName: 'Ana Pop', birthDate: '1990-05-15' });

    const insert = client.query.mock.calls.find(([sql]: [string]) =>
      /INSERT INTO user_profiles/.test(sql),
    );
    expect(insert![1]).toContain('eu');
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/profiles.categories.test.ts`
Așteptat: FAIL — `expect(received).toBe(expected)` cu `received: undefined` pe `category`, și 200/201 în loc de 400 pe categoria inventată.

- [ ] **Step 3: Scrie migrația**

Creează `server/src/migrations/012_profile_categories.sql`:

```sql
-- Fiecare hartă salvată are un fel.
--
-- O hartă salvată e ceva ce ține utilizatorul, nu o persoană cu cont. Categoria
-- spune ce fel de hartă e și, pentru tot ce nu e 'eu', marchează rândul ca
-- fiind despre altcineva.
--
--   eu        hărțile titularului, inclusiv variantele de nume
--   apropiat  partener, familie, prieten: o persoană pe care o cunoaște
--   copil     un copil, sau un nume care se alege pentru unul
--   afacere   o firmă sau un brand; birth_date poartă data înființării
--
-- Coloana e TEXT cu CHECK, nu un ENUM: un ENUM cere o migrație și un lock ca să
-- primească o valoare nouă, iar setul ăsta e făcut să crească.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'eu';

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_category_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_category_check
  CHECK (category IN ('eu', 'apropiat', 'copil', 'afacere'));

-- Numai o hartă a titularului poate fi cea activă. Profilul activ alimentează
-- /azi și prefill-urile din toată aplicația; dacă harta unui copil devine
-- activă, aplicația începe să arate previziunile copilului drept ale
-- utilizatorului, fără să spună nimănui că s-a schimbat ceva.
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_active_is_self_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_active_is_self_check
  CHECK (is_active = false OR category = 'eu');

CREATE INDEX IF NOT EXISTS idx_user_profiles_category
  ON user_profiles(user_id, category);

COMMENT ON COLUMN user_profiles.category IS
  'Ce fel de hartă e: eu | apropiat | copil | afacere. Orice altceva decât eu sunt datele altei persoane, ținute numai de acest utilizator.';
```

Rândurile existente primesc `'eu'` din `DEFAULT`, deci constrângerea a doua trece pentru orice profil deja activ.

- [ ] **Step 4: Unifică coloanele și maparea în rută**

În `server/src/routes/profiles.ts`, înlocuiește antetul fișierului (liniile 1-5, până la `const router = Router();` inclusiv) cu:

```ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Lista de coloane și maparea către camelCase erau scrise de cinci ori în
 * fișierul ăsta. Adăugarea unei coloane însemna cinci locuri de nimerit; una
 * ratată ar fi întors profiluri fără categorie de pe un singur endpoint.
 */
const PROFILE_COLUMNS =
  'id, user_id, full_name, birth_date, birth_time, birth_place, category, is_active, created_at, updated_at';

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  category: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const toProfile = (row: ProfileRow) => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  birthDate: row.birth_date,
  birthTime: row.birth_time,
  birthPlace: row.birth_place,
  category: row.category,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const PROFILE_CATEGORIES = ['eu', 'apropiat', 'copil', 'afacere'] as const;

// Validarea era `if (!fullName || !birthDate)`: numele intra de orice lungime,
// iar data intra în orice format pe care `new Date()` binevoia să-l accepte.
// journal.ts și notifications.ts folosesc deja zod pentru fix motivul ăsta.
const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  birthPlace: z.string().trim().max(200).optional().nullable(),
  category: z.enum(PROFILE_CATEGORIES).default('eu'),
  setAsActive: z.boolean().optional(),
});
```

Apoi înlocuiește, în `GET /me`, `SELECT id, user_id, full_name, birth_date, birth_time, birth_place, is_active, created_at, updated_at` cu `SELECT ${PROFILE_COLUMNS}` (template string, deci backtick-uri pe toată interogarea), și tot blocul care construiește `res.json({ success: true, profile: { ... } })` cu:

```ts
    res.json({ success: true, profile: toProfile(result.rows[0] as ProfileRow) });
```

La fel în `GET /all`: interogarea devine

```ts
      `SELECT ${PROFILE_COLUMNS}
       FROM user_profiles
       WHERE user_id = $1
       ORDER BY is_active DESC, created_at DESC`,
```

iar maparea devine

```ts
    res.json({ success: true, profiles: (result.rows as ProfileRow[]).map(toProfile) });
```

În `POST /me`, înlocuiește validarea manuală și `INSERT`-ul:

```ts
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile', details: parsed.error.issues });
    }
    const { fullName, birthDate, birthTime, birthPlace, category, setAsActive } = parsed.data;
```

și, în tranzacție:

```ts
      const result = await client.query(
        `INSERT INTO user_profiles (user_id, full_name, birth_date, birth_time, birth_place, category, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${PROFILE_COLUMNS}`,
        [userId, fullName, birthDate, birthTime || null, birthPlace || null, category, shouldBeActive],
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, profile: toProfile(result.rows[0] as ProfileRow) });
```

În `PUT /:id`, folosește aceeași schemă cu categoria opțională și păstrează valoarea existentă când lipsește:

```ts
    const parsed = profileSchema.partial({ category: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile', details: parsed.error.issues });
    }
    const { fullName, birthDate, birthTime, birthPlace, category } = parsed.data;
```

```ts
    const result = await pool.query(
      `UPDATE user_profiles
       SET full_name = $1, birth_date = $2, birth_time = $3, birth_place = $4,
           category = COALESCE($5, category), updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING ${PROFILE_COLUMNS}`,
      [fullName, birthDate, birthTime || null, birthPlace || null, category ?? null, profileId, userId],
    );

    res.json({ success: true, profile: toProfile(result.rows[0] as ProfileRow) });
```

Și în `POST /:id/activate`, `RETURNING ${PROFILE_COLUMNS}` plus `res.json({ success: true, profile: toProfile(result.rows[0] as ProfileRow) });`.

- [ ] **Step 5: Rulează testul, ca să-l vezi trecând**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/profiles.categories.test.ts`
Așteptat: PASS, 5 aserțiuni.

- [ ] **Step 6: Rulează toată suita de server, ca să vezi că n-ai stricat nimic**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test`
Așteptat: PASS pe toate fișierele existente (`admin-mcp`, `auth.middleware`, `hardening`, `health`, `subscriptions.billing`) plus cel nou.

- [ ] **Step 7: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/migrations/012_profile_categories.sql server/src/routes/profiles.ts server/src/__tests__/profiles.categories.test.ts
git commit -m "Spune ce fel de hartă e fiecare hartă salvată"
```

---

### Task 2: Numai hărțile proprii pot fi profilul activ

**Files:**
- Modify: `server/src/routes/profiles.ts` (`POST /me`, decizia `shouldBeActive`; `POST /:id/activate`, verificarea)
- Test: `server/src/__tests__/profiles.categories.test.ts` (adaugă un `describe` nou la finalul fișierului)

**Interfaces:**
- Consumes: `PROFILE_COLUMNS`, `toProfile`, `profileSchema` din Task 1.
- Produces: `POST /api/profiles/:id/activate` întoarce `400 { error: 'Only your own maps can be the active profile' }` când categoria hărții nu e `eu`; `POST /api/profiles/me` nu mai activează niciodată o hartă care nu e `eu`, oricât de tare cere `setAsActive`.

- [ ] **Step 1: Scrie testul care pică**

Adaugă la finalul lui `server/src/__tests__/profiles.categories.test.ts`:

```ts
describe('numai o hartă a mea poate fi cea activă', () => {
  it('refuză activarea hărții unui copil', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT id, category FROM user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [{ id: 'p1', category: 'copil' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', auth);

    expect(response.status).toBe(400);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('lasă activarea unei hărți proprii', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT id, category FROM user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [{ id: 'p1', category: 'eu' }] });
      }
      if (/SET is_active = true/.test(sql)) {
        return Promise.resolve({ rows: [row({ category: 'eu', is_active: true })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', auth);

    expect(response.status).toBe(200);
    expect(response.body.profile.isActive).toBe(true);
  });

  it('nu activează o firmă nici când i se cere explicit', async () => {
    client.query.mockImplementation((sql: string) => {
      if (/SELECT COUNT/.test(sql)) return Promise.resolve({ rows: [{ count: '0' }] });
      if (/INSERT INTO user_profiles/.test(sql)) {
        return Promise.resolve({ rows: [row({ category: 'afacere', is_active: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    await request(app)
      .post('/api/profiles/me')
      .set('Authorization', auth)
      .send({
        fullName: 'Lumina SRL',
        birthDate: '2019-03-02',
        category: 'afacere',
        setAsActive: true,
      });

    const insert = client.query.mock.calls.find(([sql]: [string]) =>
      /INSERT INTO user_profiles/.test(sql),
    );
    expect(insert![1][6]).toBe(false);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/profiles.categories.test.ts`
Așteptat: FAIL — primul caz întoarce 200 în loc de 400, al treilea are `insert[1][6] === true`.

- [ ] **Step 3: Scrie implementarea minimă**

În `server/src/routes/profiles.ts`, în `POST /me`, înlocuiește calculul lui `shouldBeActive`:

```ts
      const isFirstProfile = parseInt(existingCount.rows[0].count) === 0;
      // Numai o hartă proprie poate fi cea activă: profilul activ alimentează
      // /azi și prefill-urile, iar harta unui copil ajunsă activă ar arăta
      // previziunile copilului drept ale utilizatorului. Constrângerea din
      // migrația 010 spune același lucru; asta o spune înainte de INSERT, ca
      // utilizatorul să primească un răspuns și nu o eroare de bază de date.
      const shouldBeActive =
        category === 'eu' && (setAsActive === true || (isFirstProfile && setAsActive !== false));
```

Și șterge blocul de deasupra care dezactivează celelalte profiluri necondiționat, înlocuindu-l cu unul condiționat:

```ts
      if (category === 'eu' && setAsActive) {
        await client.query('UPDATE user_profiles SET is_active = false WHERE user_id = $1', [userId]);
      }
```

În `POST /:id/activate`, înlocuiește verificarea:

```ts
      const verifyResult = await client.query(
        'SELECT id, category FROM user_profiles WHERE id = $1 AND user_id = $2',
        [profileId, userId],
      );

      if (verifyResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Profile not found' });
      }

      if (verifyResult.rows[0].category !== 'eu') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only your own maps can be the active profile' });
      }
```

- [ ] **Step 4: Rulează testele, ca să le vezi trecând**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/profiles.categories.test.ts`
Așteptat: PASS, 8 aserțiuni (5 din Task 1 + 3 noi).

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/routes/profiles.ts server/src/__tests__/profiles.categories.test.ts
git commit -m "Nu lăsa harta altcuiva să devină harta mea activă"
```

---

### Task 3: Modulul pur al categoriilor

**Files:**
- Create: `src/lib/profileCategories.ts`
- Test: `src/lib/__tests__/profileCategories.test.ts`

**Interfaces:**
- Consumes: nimic. Modulul e pur, nu importă React și nu importă hook-uri.
- Produces:
  - `PROFILE_CATEGORIES: readonly ['eu', 'apropiat', 'copil', 'afacere']`
  - `type ProfileCategory = 'eu' | 'apropiat' | 'copil' | 'afacere'`
  - `DEFAULT_CATEGORY: ProfileCategory` (`'eu'`)
  - `isProfileCategory(value: unknown): value is ProfileCategory`
  - `normalizeCategory(value: unknown): ProfileCategory`
  - `isAboutSomeoneElse(value: unknown): boolean`
  - `interface CategorizedProfile { category?: string | null }`
  - `interface ProfileGroup<T> { category: ProfileCategory; profiles: T[] }`
  - `groupProfilesByCategory<T extends CategorizedProfile>(profiles: T[]): ProfileGroup<T>[]`
  Task 6, 7 și 8 consumă exact numele astea.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/profileCategories.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  PROFILE_CATEGORIES,
  DEFAULT_CATEGORY,
  isProfileCategory,
  normalizeCategory,
  isAboutSomeoneElse,
  groupProfilesByCategory,
} from '../profileCategories';

/**
 * Categoria vine de pe rețea, deci poate fi orice. Modulul ăsta e locul unde
 * „orice" devine una dintre cele patru valori, o singură dată, ca restul
 * aplicației să nu mai verifice.
 */

describe('setul de categorii', () => {
  it('are exact cele patru valori, în ordinea în care se afișează', () => {
    expect(PROFILE_CATEGORIES).toEqual(['eu', 'apropiat', 'copil', 'afacere']);
  });

  it('are eu ca implicită', () => {
    expect(DEFAULT_CATEGORY).toBe('eu');
  });
});

describe('normalizarea', () => {
  it('recunoaște fiecare valoare validă', () => {
    for (const category of PROFILE_CATEGORIES) {
      expect(isProfileCategory(category)).toBe(true);
    }
  });

  it('respinge orice altceva', () => {
    for (const value of ['pisica', '', null, undefined, 7, {}]) {
      expect(isProfileCategory(value)).toBe(false);
    }
  });

  it('cade înapoi pe eu pentru o valoare pe care n-o cunoaște', () => {
    expect(normalizeCategory('pisica')).toBe('eu');
    expect(normalizeCategory(undefined)).toBe('eu');
    expect(normalizeCategory(null)).toBe('eu');
  });

  it('lasă valorile bune neatinse', () => {
    expect(normalizeCategory('copil')).toBe('copil');
  });
});

describe('a cui e harta', () => {
  it('spune că eu nu e despre altcineva', () => {
    expect(isAboutSomeoneElse('eu')).toBe(false);
  });

  it('spune că restul sunt', () => {
    expect(isAboutSomeoneElse('apropiat')).toBe(true);
    expect(isAboutSomeoneElse('copil')).toBe(true);
    expect(isAboutSomeoneElse('afacere')).toBe(true);
  });

  it('tratează o categorie necunoscută drept a mea, nu a altcuiva', () => {
    // Un fals „e a altcuiva" ar pune nota de confidențialitate pe harta
    // proprie; căderea pe eu e cea care nu minte pe nimeni.
    expect(isAboutSomeoneElse('pisica')).toBe(false);
  });
});

describe('gruparea', () => {
  const profiles = [
    { id: '1', category: 'copil' },
    { id: '2', category: 'eu' },
    { id: '3', category: 'copil' },
    { id: '4', category: null },
  ];

  it('grupează în ordinea categoriilor, nu în cea a intrărilor', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups.map((g) => g.category)).toEqual(['eu', 'copil']);
  });

  it('duce profilurile fără categorie la eu', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups[0].profiles.map((p) => p.id)).toEqual(['2', '4']);
  });

  it('păstrează ordinea din listă înăuntrul unui grup', () => {
    const groups = groupProfilesByCategory(profiles);
    expect(groups[1].profiles.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('nu întoarce grupuri goale', () => {
    const groups = groupProfilesByCategory([{ id: '1', category: 'afacere' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('afacere');
  });

  it('întoarce o listă goală pentru nicio hartă', () => {
    expect(groupProfilesByCategory([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/lib/__tests__/profileCategories.test.ts`
Așteptat: FAIL — `Failed to resolve import "../profileCategories"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/lib/profileCategories.ts`:

```ts
/**
 * Ce fel de hartă e o hartă salvată.
 *
 * Patru valori, fiindcă patru sunt cazurile care se comportă diferit:
 * hărțile mele (singurele care pot fi cea activă), un om apropiat, un copil
 * — inclusiv unul căruia încă i se alege numele — și o firmă, unde data e cea
 * a înființării. Valorile sunt cele stocate în coloana `user_profiles.category`
 * și sunt în română fiindcă româna e limba de bază a produsului; etichetele
 * traduse stau în `translations.ts`, sub `people.categories`.
 *
 * Modulul e pur cu bună știință: nu importă React și nu importă hook-uri, ca să
 * poată fi testat direct și importat din orice strat.
 */

export const PROFILE_CATEGORIES = ['eu', 'apropiat', 'copil', 'afacere'] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export const DEFAULT_CATEGORY: ProfileCategory = 'eu';

export function isProfileCategory(value: unknown): value is ProfileCategory {
  return typeof value === 'string' && (PROFILE_CATEGORIES as readonly string[]).includes(value);
}

/** Categoria vine de pe rețea. Aici devine una dintre cele patru, o dată. */
export function normalizeCategory(value: unknown): ProfileCategory {
  return isProfileCategory(value) ? value : DEFAULT_CATEGORY;
}

/**
 * Orice nu e „eu" sunt datele altei persoane, ținute de acest utilizator.
 * O valoare necunoscută cade pe „eu": un fals pozitiv ar lipi nota despre
 * datele altcuiva pe harta proprie a omului.
 */
export function isAboutSomeoneElse(value: unknown): boolean {
  return normalizeCategory(value) !== 'eu';
}

export interface CategorizedProfile {
  category?: string | null;
}

export interface ProfileGroup<T> {
  category: ProfileCategory;
  profiles: T[];
}

/** Grupează în ordinea din PROFILE_CATEGORIES, fără grupuri goale. */
export function groupProfilesByCategory<T extends CategorizedProfile>(
  profiles: T[],
): ProfileGroup<T>[] {
  return PROFILE_CATEGORIES.map((category) => ({
    category,
    profiles: profiles.filter((profile) => normalizeCategory(profile.category) === category),
  })).filter((group) => group.profiles.length > 0);
}
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/lib/__tests__/profileCategories.test.ts`
Așteptat: PASS, 13 aserțiuni.

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/lib/profileCategories.ts src/lib/__tests__/profileCategories.test.ts
git commit -m "Definește cele patru feluri de hartă într-un singur loc"
```

---

### Task 4: Textele pentru oameni și categorii, în trei limbi

**Files:**
- Modify: `src/lib/translations.ts` (blocul `ro` după `sharing`, apoi identic în `en` și `ru`)
- Test: `src/lib/__tests__/profileCategories.i18n.test.ts`

**Interfaces:**
- Consumes: `PROFILE_CATEGORIES` din Task 3.
- Produces: `t.people` cu forma exactă de mai jos, în toate trei limbile. Task 6, 7 și 8 citesc din el:
  `t.people.title`, `t.people.subtitle`, `t.people.all`, `t.people.empty`, `t.people.aboutSomeoneElse`, `t.people.keepName`, `t.people.keepNameDone`, `t.people.dateLabel`, `t.people.foundedLabel`, `t.people.categoryLabel`, `t.people.categories.{eu,apropiat,copil,afacere}`, `t.people.categoryHints.{eu,apropiat,copil,afacere}`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/profileCategories.i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getTranslation, type Language } from '../translations';
import { PROFILE_CATEGORIES } from '../profileCategories';

/**
 * `translations.test.ts` verifică deja paritatea de chei între cele trei limbi.
 * Ce verifică fișierul ăsta e altceva: că fiecare categorie are o etichetă și
 * un indiciu, și că traducerile chiar diferă între limbi -- o cheie copiată din
 * engleză în rusă trece testul de paritate și cade pe cititor.
 */

const LANGS: Language[] = ['ro', 'en', 'ru'];

describe('fiecare categorie își spune numele în trei limbi', () => {
  it.each(LANGS)('%s are etichetă pentru fiecare categorie', (lang) => {
    const t = getTranslation(lang);
    for (const category of PROFILE_CATEGORIES) {
      expect(t.people.categories[category], `${lang}.people.categories.${category}`).toBeTruthy();
      expect(t.people.categoryHints[category], `${lang}.people.categoryHints.${category}`).toBeTruthy();
    }
  });

  it('nu repetă aceeași etichetă în toate cele trei limbi', () => {
    for (const category of PROFILE_CATEGORIES) {
      const labels = LANGS.map((lang) => getTranslation(lang).people.categories[category]);
      expect(new Set(labels).size, `categories.${category}`).toBe(3);
    }
  });

  it('spune în fiecare limbă că datele sunt ale altcuiva', () => {
    for (const lang of LANGS) {
      expect(getTranslation(lang).people.aboutSomeoneElse.length).toBeGreaterThan(20);
    }
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/lib/__tests__/profileCategories.i18n.test.ts`
Așteptat: FAIL — `TypeError: Cannot read properties of undefined (reading 'categories')`.

- [ ] **Step 3: Scrie traducerile**

În `src/lib/translations.ts`, imediat după blocul `sharing: { ... },` din `ro` (în jur de linia 31), inserează:

```ts
    people: {
      title: "Oamenii mei",
      subtitle: "Hărțile pe care le ții: ale tale, ale celor apropiați, ale copiilor, ale firmelor.",
      all: "Toate",
      empty: "Nicio hartă aici încă.",
      aboutSomeoneElse: "Datele acestei persoane le vezi numai tu. Nu sunt trimise nicăieri și le poți șterge oricând.",
      keepName: "Păstrează numele",
      keepNameDone: "Numele e păstrat",
      dateLabel: "Data nașterii",
      foundedLabel: "Data înființării",
      categoryLabel: "Ce fel de hartă e",
      categories: {
        eu: "Eu",
        apropiat: "Cineva apropiat",
        copil: "Copil",
        afacere: "Afacere",
      },
      categoryHints: {
        eu: "Tu, inclusiv variantele numelui tău.",
        apropiat: "Partener, familie, prieten.",
        copil: "Un copil, sau un nume pe care îl alegi pentru unul.",
        afacere: "O firmă sau un brand. Data e cea a înființării.",
      },
    },
```

În blocul `en` (după `sharing`, în jur de linia 450), același bloc cu:

```ts
    people: {
      title: "My people",
      subtitle: "The maps you keep: your own, the people close to you, children, businesses.",
      all: "All",
      empty: "No maps here yet.",
      aboutSomeoneElse: "This person's details are visible to you alone. They are sent nowhere, and you can delete them at any time.",
      keepName: "Keep this name",
      keepNameDone: "Name kept",
      dateLabel: "Date of birth",
      foundedLabel: "Date founded",
      categoryLabel: "What kind of map this is",
      categories: {
        eu: "Me",
        apropiat: "Someone close",
        copil: "Child",
        afacere: "Business",
      },
      categoryHints: {
        eu: "You, including variants of your own name.",
        apropiat: "Partner, family, friend.",
        copil: "A child, or a name you are choosing for one.",
        afacere: "A company or a brand. The date is the founding date.",
      },
    },
```

În blocul `ru` (după `sharing`, în jur de linia 868):

```ts
    people: {
      title: "Мои люди",
      subtitle: "Карты, которые вы храните: свои, близких, детей, компаний.",
      all: "Все",
      empty: "Здесь пока нет карт.",
      aboutSomeoneElse: "Данные этого человека видите только вы. Они никуда не отправляются, и вы можете удалить их в любой момент.",
      keepName: "Сохранить это имя",
      keepNameDone: "Имя сохранено",
      dateLabel: "Дата рождения",
      foundedLabel: "Дата основания",
      categoryLabel: "Какая это карта",
      categories: {
        eu: "Я",
        apropiat: "Близкий человек",
        copil: "Ребёнок",
        afacere: "Бизнес",
      },
      categoryHints: {
        eu: "Вы, включая варианты вашего имени.",
        apropiat: "Партнёр, семья, друг.",
        copil: "Ребёнок или имя, которое вы для него выбираете.",
        afacere: "Компания или бренд. Дата — дата основания.",
      },
    },
```

- [ ] **Step 4: Rulează testul nou și pe cel de paritate**

Rulează: `npm run test:run -- src/lib/__tests__/profileCategories.i18n.test.ts src/lib/__tests__/translations.test.ts`
Așteptat: PASS pe ambele — 3 aserțiuni noi plus cele 6 de paritate.

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/lib/translations.ts src/lib/__tests__/profileCategories.i18n.test.ts
git commit -m "Spune în toate trei limbile ce fel de hartă e fiecare"
```

---

### Task 5: Clientul și hook-ul duc categoria

**Files:**
- Modify: `src/services/api.ts:114-127` (`createProfile`, `updateProfile`)
- Modify: `src/hooks/use-profiles.ts` (`interface Profile`, semnăturile `createProfile` și `updateProfile`)
- Test: `src/services/__tests__/api.profiles.test.ts`

**Interfaces:**
- Consumes: `ProfileCategory` din Task 3; forma de răspuns cu `category` din Task 1.
- Produces:
  - `api.createProfile(data: { fullName: string; birthDate: string; birthTime?: string; birthPlace?: string; category?: ProfileCategory; setAsActive?: boolean })`
  - `api.updateProfile(profileId: string, data: { fullName: string; birthDate: string; birthTime?: string; birthPlace?: string; category?: ProfileCategory })`
  - `Profile` din `use-profiles.ts` capătă `category: ProfileCategory`.
  Task 6, 7 și 8 consumă tipurile astea.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/services/__tests__/api.profiles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../api';

/**
 * Serverul acceptă categoria de la Task 1 încoace. Aici se verifică singurul
 * lucru care mai poate rămâne pe dinafară: că clientul chiar o trimite.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, profile: { id: 'p1', category: 'copil' } }),
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const bodyOf = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body as string);

describe('clientul duce categoria', () => {
  it('o trimite la creare', async () => {
    await api.createProfile({
      fullName: 'Ana Pop',
      birthDate: '1990-05-15',
      category: 'copil',
    });

    expect(bodyOf(0)).toMatchObject({ fullName: 'Ana Pop', birthDate: '1990-05-15', category: 'copil' });
  });

  it('o trimite la actualizare', async () => {
    await api.updateProfile('p1', {
      fullName: 'Ana Pop',
      birthDate: '1990-05-15',
      category: 'apropiat',
    });

    expect(bodyOf(0)).toMatchObject({ category: 'apropiat' });
    expect(fetchMock.mock.calls[0][0]).toContain('/profiles/p1');
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
  });

  it('nu inventează o categorie când nu i se dă una', async () => {
    await api.createProfile({ fullName: 'Ana Pop', birthDate: '1990-05-15' });

    expect(bodyOf(0)).not.toHaveProperty('category');
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/services/__tests__/api.profiles.test.ts`
Așteptat: FAIL — `Object literal may only specify known properties, and 'category' does not exist` la typecheck, sau `toMatchObject` picând pe `category` lipsă la rulare.

- [ ] **Step 3: Scrie implementarea minimă**

În `src/services/api.ts`, adaugă importul de tip sus, sub `import { API_BASE }`:

```ts
import type { ProfileCategory } from '@/lib/profileCategories';
```

și înlocuiește cele două semnături:

```ts
  async createProfile(data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
    setAsActive?: boolean;
  }) {
    return this.request<{ success: boolean; profile: unknown }>('/profiles/me', {
      method: 'POST',
      body: data,
    });
  }

  async updateProfile(
    profileId: string,
    data: {
      fullName: string;
      birthDate: string;
      birthTime?: string;
      birthPlace?: string;
      category?: ProfileCategory;
    },
  ) {
    return this.request<{ success: boolean; profile: unknown }>(`/profiles/${profileId}`, {
      method: 'PUT',
      body: data,
    });
  }
```

În `src/hooks/use-profiles.ts`, adaugă importul de tip și câmpul, apoi lărgește cele două semnături din hook:

```ts
import type { ProfileCategory } from '@/lib/profileCategories';
```

```ts
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  category: ProfileCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

```ts
  const createProfile = useCallback(async (data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
    setAsActive?: boolean;
  }) => {
```

```ts
  const updateProfile = useCallback(async (profileId: string, data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
  }) => {
```

- [ ] **Step 4: Rulează testul și typecheck-ul**

Rulează: `npm run test:run -- src/services/__tests__/api.profiles.test.ts && npm run typecheck`
Așteptat: PASS pe 3 aserțiuni; `tsc -b --noEmit` iese cu 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/services/api.ts src/hooks/use-profiles.ts src/services/__tests__/api.profiles.test.ts
git commit -m "Du categoria hărții de la formular până la bază"
```

---

### Task 6: Cardul unui grup de oameni

**Files:**
- Create: `src/components/people/PeopleGroup.tsx`
- Test: `src/components/people/__tests__/PeopleGroup.test.tsx`

**Interfaces:**
- Consumes: `ProfileCategory`, `isAboutSomeoneElse` din Task 3; `t.people.*` din Task 4; `Profile` din Task 5.
- Produces: `<PeopleGroup category={ProfileCategory} profiles={Profile[]} onEdit={(id: string) => void} onDelete={(id: string) => void} />`. Task 7 îl folosește.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/people/__tests__/PeopleGroup.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PeopleGroup } from "../PeopleGroup";
import type { Profile } from "@/hooks/use-profiles";

/**
 * Un grup de hărți dintr-o categorie. Ce trebuie să fie adevărat aici e că
 * hărțile altcuiva își spun că sunt ale altcuiva -- brief-ul cere ca datele
 * unei persoane care n-a consimțit la nimic să fie tratate ca atare, iar locul
 * în care se vede asta e chiar lângă ele.
 */

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: "p1",
  userId: "u1",
  fullName: "Ana Pop",
  birthDate: "1990-05-15",
  category: "eu",
  isActive: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

const renderGroup = (props: Partial<React.ComponentProps<typeof PeopleGroup>> = {}) =>
  render(
    <LanguageProvider>
      <PeopleGroup
        category="eu"
        profiles={[profile()]}
        onEdit={() => {}}
        onDelete={() => {}}
        {...props}
      />
    </LanguageProvider>,
  );

describe("PeopleGroup", () => {
  it("scrie eticheta categoriei și numărul de hărți", () => {
    renderGroup({ category: "copil", profiles: [profile({ category: "copil" }), profile({ id: "p2", category: "copil" })] });

    expect(screen.getByText("Copil")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("arată numele fiecărei hărți", () => {
    renderGroup({ profiles: [profile(), profile({ id: "p2", fullName: "Ion Popescu" })] });

    expect(screen.getByText("Ana Pop")).toBeInTheDocument();
    expect(screen.getByText("Ion Popescu")).toBeInTheDocument();
  });

  it("spune, pe hărțile altcuiva, că datele sunt ale altcuiva", () => {
    renderGroup({ category: "apropiat", profiles: [profile({ category: "apropiat" })] });

    expect(screen.getByText(/vezi numai tu/i)).toBeInTheDocument();
  });

  it("nu pune nota aia pe hărțile mele", () => {
    renderGroup({ category: "eu" });

    expect(screen.queryByText(/vezi numai tu/i)).not.toBeInTheDocument();
  });

  it("cere data înființării pentru o firmă și data nașterii pentru un om", () => {
    const { unmount } = renderGroup({ category: "afacere", profiles: [profile({ category: "afacere" })] });
    expect(screen.getByText(/Data înființării/i)).toBeInTheDocument();
    unmount();

    renderGroup({ category: "apropiat", profiles: [profile({ category: "apropiat" })] });
    expect(screen.getByText(/Data nașterii/i)).toBeInTheDocument();
  });

  it("cheamă onEdit cu id-ul hărții", () => {
    const onEdit = vi.fn();
    renderGroup({ onEdit });

    fireEvent.click(screen.getByRole("button", { name: /modific/i }));

    expect(onEdit).toHaveBeenCalledWith("p1");
  });

  it("cheamă onDelete cu id-ul hărții", () => {
    const onDelete = vi.fn();
    renderGroup({ onDelete });

    fireEvent.click(screen.getByRole("button", { name: /șterge/i }));

    expect(onDelete).toHaveBeenCalledWith("p1");
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/components/people/__tests__/PeopleGroup.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../PeopleGroup"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/people/PeopleGroup.tsx`:

```tsx
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseCalendarDate } from "@/lib/calendarDate";
import { isAboutSomeoneElse, type ProfileCategory } from "@/lib/profileCategories";
import type { Profile } from "@/hooks/use-profiles";

/**
 * Un grup de hărți dintr-o categorie.
 *
 * Nota despre datele altcuiva stă aici, nu într-o pagină de politici: hărțile
 * unui copil sau ale unui partener sunt datele unei persoane care n-a consimțit
 * la nimic, și singurul loc unde propoziția aia contează e chiar deasupra lor.
 *
 * Cifrele -- numărul de hărți, datele -- poartă `.num`: e regula tipografică a
 * produsului, cifre tabulare peste tot.
 */

interface PeopleGroupProps {
  category: ProfileCategory;
  profiles: Profile[];
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
}

export const PeopleGroup = ({ category, profiles, onEdit, onDelete }: PeopleGroupProps) => {
  const { t } = useLanguage();
  const someoneElse = isAboutSomeoneElse(category);
  const dateLabel = category === "afacere" ? t.people.foundedLabel : t.people.dateLabel;

  return (
    <section className="card-mystic rounded-2xl p-6 space-y-4">
      <header className="flex items-center gap-3">
        <h3 className="font-heading text-lg text-foreground">{t.people.categories[category]}</h3>
        <Badge variant="secondary" className="num">{profiles.length}</Badge>
      </header>

      <p className="text-sm text-muted-foreground font-raleway">{t.people.categoryHints[category]}</p>

      {someoneElse && (
        <p className="text-xs text-muted-foreground font-raleway rounded-lg border border-border/40 bg-muted/30 p-3">
          {t.people.aboutSomeoneElse}
        </p>
      )}

      <ul className="space-y-2">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg border p-3",
              profile.isActive ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/30",
            )}
          >
            <div className="min-w-0">
              <div className="font-heading text-foreground truncate">{profile.fullName}</div>
              <div className="text-sm text-muted-foreground font-raleway">
                <span>{dateLabel}: </span>
                <span className="num">
                  {parseCalendarDate(profile.birthDate)?.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(profile.id)}>
                <Pencil className="mr-1 h-4 w-4" />
                {t.editProfile}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(profile.id)}>
                <Trash2 className="mr-1 h-4 w-4" />
                {t.deleteProfile}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/components/people/__tests__/PeopleGroup.test.tsx`
Așteptat: PASS, 7 aserțiuni.

Dacă butoanele nu se găsesc după `name: /modific/i` sau `/șterge/i`, citește valorile reale ale lui `t.editProfile` și `t.deleteProfile` din `src/lib/translations.ts` (blocul `ro`) și potrivește regex-urile din test cu ele — nu schimba traducerile ca să treacă testul.

- [ ] **Step 5: Rulează testul de tokeni, ca să vezi că n-ai introdus o culoare**

Rulează: `npm run test:run -- src/lib/__tests__/design-tokens.test.ts`
Așteptat: PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/components/people/PeopleGroup.tsx src/components/people/__tests__/PeopleGroup.test.tsx
git commit -m "Adună hărțile pe categorii și spune ale cui sunt datele"
```

---

### Task 7: Filtrul, și `/eu` grupat

**Files:**
- Create: `src/components/people/PeopleFilter.tsx`
- Test: `src/components/people/__tests__/PeopleFilter.test.tsx`
- Modify: `src/pages/Profile.tsx` (blocul „Profile Switcher", liniile ~247-296; plus formularul, ca să aibă selectorul de categorie)

**Interfaces:**
- Consumes: `PROFILE_CATEGORIES`, `ProfileCategory`, `groupProfilesByCategory` din Task 3; `t.people.*` din Task 4; `PeopleGroup` din Task 6.
- Produces: `<PeopleFilter selected={ProfileCategory | null} counts={Record<ProfileCategory, number>} onSelect={(c: ProfileCategory | null) => void} />`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/people/__tests__/PeopleFilter.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PeopleFilter } from "../PeopleFilter";

/**
 * Filtrul arată numai categoriile care au ceva în ele: un chip „Afacere (0)"
 * e o promisiune goală într-o listă care e deja scurtă.
 */

const counts = { eu: 2, apropiat: 1, copil: 0, afacere: 0 };

describe("PeopleFilter", () => {
  it("arată doar categoriile care au hărți, plus Toate", () => {
    render(
      <LanguageProvider>
        <PeopleFilter selected={null} counts={counts} onSelect={() => {}} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button", { name: /Toate/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Eu/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cineva apropiat/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Copil/ })).not.toBeInTheDocument();
  });

  it("cheamă onSelect cu categoria apăsată", () => {
    const onSelect = vi.fn();
    render(
      <LanguageProvider>
        <PeopleFilter selected={null} counts={counts} onSelect={onSelect} />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cineva apropiat/ }));

    expect(onSelect).toHaveBeenCalledWith("apropiat");
  });

  it("cheamă onSelect cu null pe Toate", () => {
    const onSelect = vi.fn();
    render(
      <LanguageProvider>
        <PeopleFilter selected="eu" counts={counts} onSelect={onSelect} />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Toate/ }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("marchează chip-ul ales", () => {
    render(
      <LanguageProvider>
        <PeopleFilter selected="eu" counts={counts} onSelect={() => {}} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button", { name: /Eu/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Toate/ })).toHaveAttribute("aria-pressed", "false");
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/components/people/__tests__/PeopleFilter.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../PeopleFilter"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/people/PeopleFilter.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PROFILE_CATEGORIES, type ProfileCategory } from "@/lib/profileCategories";

/**
 * Chip-urile de filtrare. Se arată numai categoriile care au hărți: un chip cu
 * zero în el ocupă un rând ca să nu spună nimic.
 */

interface PeopleFilterProps {
  selected: ProfileCategory | null;
  counts: Record<ProfileCategory, number>;
  onSelect: (category: ProfileCategory | null) => void;
}

export const PeopleFilter = ({ selected, counts, onSelect }: PeopleFilterProps) => {
  const { t } = useLanguage();
  const total = PROFILE_CATEGORIES.reduce((sum, category) => sum + counts[category], 0);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className="font-raleway"
      >
        {t.people.all} <span className="num ml-2">{total}</span>
      </Button>

      {PROFILE_CATEGORIES.filter((category) => counts[category] > 0).map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className="font-raleway"
        >
          {t.people.categories[category]} <span className="num ml-2">{counts[category]}</span>
        </Button>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/components/people/__tests__/PeopleFilter.test.tsx`
Așteptat: PASS, 4 aserțiuni.

- [ ] **Step 5: Leagă-le în `/eu`**

În `src/pages/Profile.tsx`:

1. Adaugă importurile, lângă celelalte importuri interne:

```tsx
import { PeopleFilter } from '@/components/people/PeopleFilter';
import { PeopleGroup } from '@/components/people/PeopleGroup';
import {
  PROFILE_CATEGORIES,
  groupProfilesByCategory,
  normalizeCategory,
  type ProfileCategory,
} from '@/lib/profileCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

2. Adaugă starea filtrului și a categoriei din formular, lângă `const [editingProfileId, ...]`:

```tsx
  const [filter, setFilter] = useState<ProfileCategory | null>(null);
```

și extinde `formData` cu `category`:

```tsx
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: undefined as Date | undefined,
    birthTime: '',
    birthPlace: '',
    category: 'eu' as ProfileCategory,
  });
```

3. Adaugă `category` în cele trei locuri unde se rescrie `formData`: în `useEffect`-ul care încarcă profilul activ (`category: normalizeCategory(activeProfile.category)`), în `startEditing` (`category: normalizeCategory(profile.category)`) și în `startCreating` (`category: 'eu'`). În ramura care golește formularul când nu există profil activ, pune și acolo `category: 'eu'`.

4. În `handleSave`, adaugă `category: formData.category` în obiectul `data`. La creare, înlocuiește `setAsActive: profiles.length === 0` cu:

```tsx
          setAsActive: formData.category === 'eu' && profiles.length === 0,
```

5. Calculează grupurile și numărătoarea, imediat sub declarațiile de stare:

```tsx
  const counts = Object.fromEntries(
    PROFILE_CATEGORIES.map((category) => [
      category,
      profiles.filter((p) => normalizeCategory(p.category) === category).length,
    ]),
  ) as Record<ProfileCategory, number>;

  const groups = groupProfilesByCategory(profiles).filter(
    (group) => filter === null || group.category === filter,
  );
```

6. Înlocuiește tot blocul „Profile Switcher" (de la `{profiles.length > 0 && (` până la `)}` care îl închide, inclusiv lista plată de profiluri și butonul de creare) cu:

```tsx
          {profiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-heading text-xl text-foreground">{t.people.title}</h2>
                <ProfileSwitcher onProfileSwitch={(id) => startEditing(id)} />
              </div>
              <p className="text-sm text-muted-foreground font-raleway">{t.people.subtitle}</p>

              <PeopleFilter selected={filter} counts={counts} onSelect={setFilter} />

              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground font-raleway">{t.people.empty}</p>
              ) : (
                groups.map((group) => (
                  <PeopleGroup
                    key={group.category}
                    category={group.category}
                    profiles={group.profiles}
                    onEdit={startEditing}
                    onDelete={(id) => {
                      setDeletingProfileId(id);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))
              )}

              <Button variant="outline" className="w-full" onClick={startCreating}>
                {t.createNewProfile}
              </Button>
            </div>
          )}
```

7. În formular, imediat sub câmpul de nume, adaugă selectorul de categorie:

```tsx
              <div className="space-y-2">
                <Label className="text-foreground/90 font-raleway text-sm tracking-wide">
                  {t.people.categoryLabel}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as ProfileCategory })
                  }
                >
                  <SelectTrigger className="input-mystic h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t.people.categories[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.people.categoryHints[formData.category]}
                </p>
              </div>
```

8. Schimbă eticheta datei ca să se potrivească cu categoria: înlocuiește `{t.birthDateLabel}` din formular cu:

```tsx
                  {formData.category === 'afacere' ? t.people.foundedLabel : t.birthDateLabel}
```

- [ ] **Step 6: Rulează testele, typecheck-ul și lint-ul**

Rulează: `npm run test:run -- src/components/people src/lib/__tests__/design-tokens.test.ts && npm run typecheck && npm run lint`
Așteptat: PASS pe teste, 0 erori de tip, 0 erori de lint.

- [ ] **Step 7: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/components/people/PeopleFilter.tsx src/components/people/__tests__/PeopleFilter.test.tsx src/pages/Profile.tsx
git commit -m "Arată hărțile mele pe categorii, nu într-o listă lungă"
```

---

### Task 8: Datele altcuiva rămân ale altcuiva

**Files:**
- Test: `server/src/__tests__/profiles.ownership.test.ts`
- Modify: `src/pages/Profile.tsx` (textul din `AlertDialogDescription`, care e azi în engleză hardcodată la linia ~470)
- Modify: `src/lib/translations.ts` (o cheie nouă, `people.deleteConfirm`, în cele trei limbi)

**Interfaces:**
- Consumes: rutele din Task 1 și 2; `t.people` din Task 4.
- Produces: `t.people.deleteConfirm` în ro/en/ru. Nicio interfață de cod nouă — task-ul blochează comportament existent și scoate un text netradus.

- [ ] **Step 1: Scrie testul care pică**

Creează `server/src/__tests__/profiles.ownership.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn(), connect: vi.fn() } }));

/**
 * Ce se stochează pe o hartă a altcuiva sunt numele și data unei persoane care
 * n-a consimțit la nimic. Garanția pe care o dă produsul e că le vede numai
 * contul care le-a scris. Garanția aia stă azi în câte un `AND user_id = $1`
 * scris de mână în fiecare interogare -- adică exact genul de lucru care se
 * pierde la prima refactorizare. Testele astea o țin pe loc.
 */

const tokenFor = (userId: string) =>
  `Bearer ${jwt.sign({ userId, email: `${userId}@test.local`, role: 'user' }, process.env.JWT_SECRET!)}`;

const intruder = tokenFor('u2');

const client = { query: vi.fn(), release: vi.fn() };

beforeEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(pool.connect).mockReset();
  client.query.mockReset();
  client.release.mockReset();
  vi.mocked(pool.connect).mockResolvedValue(client as never);
});

describe('o hartă e a contului care a scris-o', () => {
  it('nu se lasă citită de alt cont', async () => {
    // Baza nu întoarce nimic pentru u2, fiindcă interogarea filtrează pe user_id.
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app).get('/api/profiles/all').set('Authorization', intruder);

    expect(response.status).toBe(200);
    expect(response.body.profiles).toEqual([]);
    const [, params] = vi.mocked(pool.query).mock.calls[0];
    expect(params).toEqual(['u2']);
  });

  it('nu se lasă modificată de alt cont', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app)
      .put('/api/profiles/p1')
      .set('Authorization', intruder)
      .send({ fullName: 'Altcineva', birthDate: '1990-05-15' });

    expect(response.status).toBe(404);
  });

  it('nu se lasă ștearsă de alt cont', async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const response = await request(app).delete('/api/profiles/p1').set('Authorization', intruder);

    expect(response.status).toBe(404);
  });

  it('nu se lasă activată de alt cont', async () => {
    client.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .post('/api/profiles/p1/activate')
      .set('Authorization', intruder);

    expect(response.status).toBe(404);
  });

  it('nu răspunde deloc fără token', async () => {
    const response = await request(app).get('/api/profiles/all');

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să vezi ce spune**

Rulează: `cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/profiles.ownership.test.ts`
Așteptat: PASS pe toate cinci. Dacă vreunul pică, ai găsit o gaură reală de proprietate — repar-o în `server/src/routes/profiles.ts` înainte să treci mai departe, și scrie în mesajul de commit ce anume nu era filtrat.

- [ ] **Step 3: Scoate textul englezesc din dialogul de ștergere**

În `src/lib/translations.ts`, adaugă în blocul `people` din fiecare limbă, după `aboutSomeoneElse`:

- `ro`: `deleteConfirm: "Ștergi harta asta? Numele și data pe care le-ai salvat dispar definitiv.",`
- `en`: `deleteConfirm: "Delete this map? The name and date you saved are gone for good.",`
- `ru`: `deleteConfirm: "Удалить эту карту? Сохранённые имя и дата исчезнут навсегда.",`

În `src/pages/Profile.tsx`, înlocuiește:

```tsx
            <AlertDialogDescription>
              Are you sure you want to delete your profile? This action cannot be undone.
            </AlertDialogDescription>
```

cu:

```tsx
            <AlertDialogDescription>{t.people.deleteConfirm}</AlertDialogDescription>
```

- [ ] **Step 4: Rulează testele de traduceri și typecheck-ul**

Rulează: `npm run test:run -- src/lib/__tests__/translations.test.ts src/lib/__tests__/profileCategories.i18n.test.ts && npm run typecheck`
Așteptat: PASS; 0 erori de tip.

- [ ] **Step 5: Rulează toată suita, ca să închizi livrabilul**

Rulează: `npm run test:run && cd server && npm run test`
Așteptat: PASS pe ambele suite.

- [ ] **Step 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/__tests__/profiles.ownership.test.ts src/lib/translations.ts src/pages/Profile.tsx
git commit -m "Ține datele altcuiva la contul care le-a salvat, și spune-o pe limba lui"
```

---

### Task 9: „Păstrează numele" din unelte

**Files:**
- Create: `src/components/people/KeepNameButton.tsx`
- Test: `src/components/people/__tests__/KeepNameButton.test.tsx`
- Modify: `src/pages/Tools.tsx` (tab-urile `name-change`, `business`, `optimizer`)

**Interfaces:**
- Consumes: `useProfiles().createProfile` din Task 5; `PROFILE_CATEGORIES`, `ProfileCategory` din Task 3; `t.people.*` din Task 4; `formatCalendarDate` din `src/lib/calendarDate.ts`.
- Produces: `<KeepNameButton name={string} defaultCategory={ProfileCategory} />`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/people/__tests__/KeepNameButton.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KeepNameButton } from "../KeepNameButton";

/**
 * Uneltele de nume calculează și uită. Butonul ăsta e singurul drum de la un
 * nume calculat la o hartă păstrată -- și trebuie să nu fure profilul activ pe
 * drum: numele unei firme nu e omul care e conectat.
 */

const createProfile = vi.fn();

vi.mock("@/hooks/use-profiles", () => ({
  useProfiles: () => ({ createProfile }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

beforeEach(() => {
  createProfile.mockReset();
  createProfile.mockResolvedValue({ success: true });
});

const renderButton = (name = "Lumina SRL", defaultCategory: "eu" | "afacere" = "afacere") =>
  render(
    <LanguageProvider>
      <KeepNameButton name={name} defaultCategory={defaultCategory} />
    </LanguageProvider>,
  );

describe("KeepNameButton", () => {
  it("nu se lasă apăsat fără un nume", () => {
    renderButton("");

    expect(screen.getByRole("button", { name: /Păstrează numele/i })).toBeDisabled();
  });

  it("cere o dată înainte să salveze", () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));

    expect(screen.getByLabelText(/Data înființării/i)).toBeInTheDocument();
    expect(createProfile).not.toHaveBeenCalled();
  });

  it("salvează numele cu data și categoria, fără să activeze nimic", async () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));
    fireEvent.change(screen.getByLabelText(/Data înființării/i), {
      target: { value: "2019-03-02" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Salvează$/i }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile).toHaveBeenCalledWith({
      fullName: "Lumina SRL",
      birthDate: "2019-03-02",
      category: "afacere",
      setAsActive: false,
    });
  });

  it("cere data nașterii, nu a înființării, pentru o hartă de om", () => {
    renderButton("Ana Pop", "eu");

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));

    expect(screen.getByLabelText(/Data nașterii/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/components/people/__tests__/KeepNameButton.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../KeepNameButton"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/people/KeepNameButton.tsx`:

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfiles } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { PROFILE_CATEGORIES, type ProfileCategory } from "@/lib/profileCategories";

/**
 * Ce se întâmplă cu un nume după ce a fost calculat.
 *
 * Uneltele din /unelte calculează și uită: numele de firmă, varianta de nume,
 * sugestia optimizatorului -- toate dispar la reîncărcare. Butonul ăsta e
 * drumul către o hartă păstrată.
 *
 * `setAsActive: false`, mereu. Numele unei firme sau al unui copil nu e omul
 * care e conectat, iar profilul activ alimentează /azi și prefill-urile.
 * Serverul refuză oricum activarea a ce nu e „eu"; nu i-o cerem.
 */

interface KeepNameButtonProps {
  name: string;
  defaultCategory: ProfileCategory;
}

export const KeepNameButton = ({ name, defaultCategory }: KeepNameButtonProps) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { createProfile } = useProfiles();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ProfileCategory>(defaultCategory);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dateLabel = category === "afacere" ? t.people.foundedLabel : t.people.dateLabel;

  const start = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/unelte")}`);
      return;
    }
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const result = await createProfile({
      fullName: name.trim(),
      birthDate: date,
      category,
      setAsActive: false,
    });
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setOpen(false);
      toast({ title: t.people.keepNameDone });
      return;
    }

    toast({ title: t.error, description: result.error, variant: "destructive" });
  };

  return (
    <>
      <Button variant="outline" onClick={start} disabled={!name.trim() || saved} className="gap-2">
        {saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        {saved ? t.people.keepNameDone : t.people.keepName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{t.people.keepName}</DialogTitle>
            <DialogDescription>{t.people.categoryHints[category]}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keep-name-value">{t.fullNameLabel}</Label>
              <Input id="keep-name-value" value={name} readOnly className="input-mystic" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keep-name-category">{t.people.categoryLabel}</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ProfileCategory)}>
                <SelectTrigger id="keep-name-category" className="input-mystic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t.people.categories[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keep-name-date">{dateLabel}</Label>
              <Input
                id="keep-name-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input-mystic num"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={save} disabled={!date || saving} className="btn-mystic gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

Dacă `t.save` nu există în `translations.ts`, folosește cheia existentă pentru „Salvează" pe care o găsești cu `grep -n '"Salvează"' src/lib/translations.ts` și potrivește regex-ul `/^Salvează$/i` din test cu ea. Nu adăuga o cheie nouă dacă una echivalentă există deja.

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/components/people/__tests__/KeepNameButton.test.tsx`
Așteptat: PASS, 4 aserțiuni.

- [ ] **Step 5: Pune butonul în cele trei unelte**

În `src/pages/Tools.tsx`, adaugă importul:

```tsx
import { KeepNameButton } from "@/components/people/KeepNameButton";
```

În tab-ul `name-change`, în interiorul blocului `{nameComparison && (...)}`, imediat după `<div className="grid grid-cols-2 gap-4">...</div>` care închide cele două carduri „înainte / după":

```tsx
                      <div className="flex justify-end pt-2">
                        <KeepNameButton name={newName} defaultCategory="eu" />
                      </div>
```

În tab-ul `business`, în interiorul blocului `{businessAnalysis && (...)}`, la finalul lui, înainte de `</div>`-ul care îl închide:

```tsx
                      <div className="flex justify-end pt-2">
                        <KeepNameButton name={businessName} defaultCategory="afacere" />
                      </div>
```

În tab-ul `optimizer`, în interiorul blocului `{nameSuggestions && (...)}`, la finalul lui:

```tsx
                      <div className="flex justify-end pt-2">
                        <KeepNameButton name={optimizerName} defaultCategory="eu" />
                      </div>
```

- [ ] **Step 6: Rulează testele, typecheck-ul și lint-ul**

Rulează: `npm run test:run -- src/components/people src/lib/__tests__/design-tokens.test.ts && npm run typecheck && npm run lint`
Așteptat: PASS pe teste; 0 erori de tip; 0 erori de lint.

- [ ] **Step 7: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/components/people/KeepNameButton.tsx src/components/people/__tests__/KeepNameButton.test.tsx src/pages/Tools.tsx
git commit -m "Lasă un nume calculat în unelte să rămână o hartă"
```

**Livrabilul 1 se închide aici.** Produsul e coerent: hărțile au un fel, sunt grupate și filtrabile, se pot păstra din unelte, iar datele altcuiva sunt marcate, izolate pe cont și ștergibile. Task-urile 10-13 nu importă nimic din ce s-a scris până acum.

---

# LIVRABILUL 2 — Relația în timp

### Task 10: Anul personal al fiecăruia, ca aliniere

**Files:**
- Create: `src/lib/relationshipTiming.ts`
- Test: `src/lib/__tests__/relationshipTiming.test.ts`

**Interfaces:**
- Consumes: `calculatePersonalYearNumber(birthDate: Date, year?: number): number` din `src/lib/numerology.ts`; `getCompatibilityScore(num1: number, num2: number): number` și `getCompatibilityLevel(score: number)` din `src/lib/compatibility.ts`. Niciuna nu se modifică.
- Produces:
  - `type AlignmentBand = 'harmony' | 'mixed' | 'tension'`
  - `bandForScore(score: number): AlignmentBand`
  - `interface YearAlignment { year: number; person1: number; person2: number; score: number; band: AlignmentBand }`
  - `calculateYearAlignment(birthDate1: Date, birthDate2: Date, year?: number): YearAlignment`
  Task 11, 12 și 13 consumă exact numele astea.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/relationshipTiming.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calculateYearAlignment, bandForScore } from "../relationshipTiming";
import { calculatePersonalYearNumber } from "../numerology";
import { getCompatibilityScore } from "../compatibility";

/**
 * Stratul temporal nu inventează nicio formulă. Anul personal vine din motor,
 * relația dintre două numere vine din matricea care există. Testele de aici
 * verifică exact asta: că modulul nu calculează nimic pe cont propriu.
 *
 * De aceea nu se asertează constante magice pentru anul personal -- s-ar
 * transforma într-o a doua definiție a formulei, care poate diverge de motor
 * fără să spună nimeni. Se asertează egalitatea cu motorul însuși.
 */

const ANA = new Date(1990, 4, 15);
const ION = new Date(1985, 10, 3);

describe("banda unui scor", () => {
  it("citește armonie de la 70 în sus", () => {
    // 85 e pragul „excellent" și 70 cel de „good" din getCompatibilityLevel.
    expect(bandForScore(100)).toBe("harmony");
    expect(bandForScore(85)).toBe("harmony");
    expect(bandForScore(70)).toBe("harmony");
  });

  it("citește amestec între 55 și 69", () => {
    expect(bandForScore(69)).toBe("mixed");
    expect(bandForScore(55)).toBe("mixed");
  });

  it("citește tensiune sub 55", () => {
    expect(bandForScore(54)).toBe("tension");
    expect(bandForScore(40)).toBe("tension");
  });
});

describe("alinierea anului", () => {
  it("ia anii personali direct din motor", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.person1).toBe(calculatePersonalYearNumber(ANA, 2026));
    expect(alignment.person2).toBe(calculatePersonalYearNumber(ION, 2026));
  });

  it("ia scorul din matricea existentă, nu dintr-o formulă nouă", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.score).toBe(getCompatibilityScore(alignment.person1, alignment.person2));
  });

  it("poartă anul cerut", () => {
    expect(calculateYearAlignment(ANA, ION, 2031).year).toBe(2031);
  });

  it("cade pe anul curent când nu i se dă unul", () => {
    expect(calculateYearAlignment(ANA, ION).year).toBe(new Date().getFullYear());
  });

  it("îi dă o bandă care se potrivește cu scorul", () => {
    const alignment = calculateYearAlignment(ANA, ION, 2026);

    expect(alignment.band).toBe(bandForScore(alignment.score));
  });

  it("e simetrică: cine e primul nu schimbă scorul", () => {
    const forward = calculateYearAlignment(ANA, ION, 2026);
    const backward = calculateYearAlignment(ION, ANA, 2026);

    expect(backward.score).toBe(forward.score);
    expect(backward.person1).toBe(forward.person2);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.test.ts`
Așteptat: FAIL — `Failed to resolve import "../relationshipTiming"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/lib/relationshipTiming.ts`:

```ts
import { calculatePersonalYearNumber } from "./numerology";
import { getCompatibilityScore, getCompatibilityLevel } from "./compatibility";

/**
 * Relația, în timp.
 *
 * Scorul din /doi spune cât de aproape sunt doi oameni. Nu spune nimic despre
 * *acum*: doi oameni care se potrivesc bine pot fi, anul ăsta, în ani personali
 * care trag în direcții opuse. Modulul ăsta adaugă exact stratul acela.
 *
 * Nu inventează nicio formulă. Anul personal vine din motor
 * (`calculatePersonalYearNumber`), iar relația dintre două numere vine din
 * matricea care există deja (`getCompatibilityScore`). Ponderile
 * Drum 50% / Destin 30% / Suflet 20% din `calculateCompatibility` rămân
 * neatinse -- stratul ăsta stă lângă ele, nu în ele.
 */

export type AlignmentBand = "harmony" | "mixed" | "tension";

/**
 * Trei benzi, nu patru: pragurile sunt cele din `getCompatibilityLevel`, ca să
 * nu apară un al doilea set de praguri care poate să dea alt răspuns decât
 * scorul de deasupra. „excellent" și „good" citesc amândouă ca armonie.
 */
export const bandForScore = (score: number): AlignmentBand => {
  const level = getCompatibilityLevel(score);
  if (level === "excellent" || level === "good") return "harmony";
  if (level === "moderate") return "mixed";
  return "tension";
};

export interface YearAlignment {
  year: number;
  person1: number;
  person2: number;
  score: number;
  band: AlignmentBand;
}

export const calculateYearAlignment = (
  birthDate1: Date,
  birthDate2: Date,
  year: number = new Date().getFullYear(),
): YearAlignment => {
  const person1 = calculatePersonalYearNumber(birthDate1, year);
  const person2 = calculatePersonalYearNumber(birthDate2, year);
  const score = getCompatibilityScore(person1, person2);

  return { year, person1, person2, score, band: bandForScore(score) };
};
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.test.ts`
Așteptat: PASS, 9 aserțiuni.

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/lib/relationshipTiming.ts src/lib/__tests__/relationshipTiming.test.ts
git commit -m "Citește ce spune anul personal al fiecăruia despre perioada asta"
```

---

### Task 11: Cele douăsprezece luni

**Files:**
- Modify: `src/lib/relationshipTiming.ts` (adaugă lunile și agregatul)
- Test: `src/lib/__tests__/relationshipTiming.test.ts` (adaugă două `describe`-uri)

**Interfaces:**
- Consumes: `calculatePersonalMonthNumber(birthDate: Date, year?: number, month?: number): number` din `src/lib/personalCycles.ts`; `bandForScore` și `calculateYearAlignment` din Task 10.
- Produces:
  - `interface MonthAlignment { month: number; person1: number; person2: number; score: number; band: AlignmentBand }`
  - `calculateMonthAlignments(birthDate1: Date, birthDate2: Date, year?: number): MonthAlignment[]` (exact 12, lunile 1-12)
  - `interface RelationshipTiming { year: YearAlignment; months: MonthAlignment[] }`
  - `calculateRelationshipTiming(birthDate1: Date, birthDate2: Date, year?: number): RelationshipTiming`
  Task 12 și 13 consumă exact numele astea.

- [ ] **Step 1: Scrie testul care pică**

Adaugă la finalul lui `src/lib/__tests__/relationshipTiming.test.ts`:

```ts
import { calculateMonthAlignments, calculateRelationshipTiming } from "../relationshipTiming";
import { calculatePersonalMonthNumber } from "../personalCycles";

describe("alinierea lunilor", () => {
  it("întoarce douăsprezece luni, de la 1 la 12", () => {
    const months = calculateMonthAlignments(ANA, ION, 2026);

    expect(months).toHaveLength(12);
    expect(months.map((m) => m.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("ia lunile personale direct din motor", () => {
    const months = calculateMonthAlignments(ANA, ION, 2026);

    for (const month of months) {
      expect(month.person1).toBe(calculatePersonalMonthNumber(ANA, 2026, month.month));
      expect(month.person2).toBe(calculatePersonalMonthNumber(ION, 2026, month.month));
    }
  });

  it("dă fiecărei luni banda potrivită scorului ei", () => {
    for (const month of calculateMonthAlignments(ANA, ION, 2026)) {
      expect(month.band).toBe(bandForScore(month.score));
    }
  });

  it("ține scorurile în intervalul matricei", () => {
    for (const month of calculateMonthAlignments(ANA, ION, 2026)) {
      expect(month.score).toBeGreaterThanOrEqual(40);
      expect(month.score).toBeLessThanOrEqual(100);
    }
  });

  it("nu întoarce aceeași lună de douăsprezece ori", () => {
    // Dacă indexul s-ar fi pierdut pe drum, toate lunile ar avea aceleași
    // numere -- lucru pe care o aserțiune de lungime nu-l prinde.
    const numbers = calculateMonthAlignments(ANA, ION, 2026).map((m) => `${m.person1}-${m.person2}`);
    expect(new Set(numbers).size).toBeGreaterThan(1);
  });
});

describe("întregul strat temporal", () => {
  it("adună anul și lunile într-un singur obiect", () => {
    const timing = calculateRelationshipTiming(ANA, ION, 2026);

    expect(timing.year).toEqual(calculateYearAlignment(ANA, ION, 2026));
    expect(timing.months).toHaveLength(12);
  });

  it("folosește același an pentru amândouă", () => {
    const timing = calculateRelationshipTiming(ANA, ION, 2029);

    expect(timing.year.year).toBe(2029);
    expect(timing.months[0].person1).toBe(calculatePersonalMonthNumber(ANA, 2029, 1));
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.test.ts`
Așteptat: FAIL — `calculateMonthAlignments is not a function` / `does not provide an export named 'calculateMonthAlignments'`.

- [ ] **Step 3: Scrie implementarea minimă**

Adaugă în `src/lib/relationshipTiming.ts` importul lunii personale, sus:

```ts
import { calculatePersonalMonthNumber } from "./personalCycles";
```

și la finalul fișierului:

```ts
export interface MonthAlignment {
  month: number;
  person1: number;
  person2: number;
  score: number;
  band: AlignmentBand;
}

/** Cele douăsprezece luni ale unui an, în ordine. */
export const calculateMonthAlignments = (
  birthDate1: Date,
  birthDate2: Date,
  year: number = new Date().getFullYear(),
): MonthAlignment[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const person1 = calculatePersonalMonthNumber(birthDate1, year, month);
    const person2 = calculatePersonalMonthNumber(birthDate2, year, month);
    const score = getCompatibilityScore(person1, person2);

    return { month, person1, person2, score, band: bandForScore(score) };
  });

export interface RelationshipTiming {
  year: YearAlignment;
  months: MonthAlignment[];
}

export const calculateRelationshipTiming = (
  birthDate1: Date,
  birthDate2: Date,
  year: number = new Date().getFullYear(),
): RelationshipTiming => ({
  year: calculateYearAlignment(birthDate1, birthDate2, year),
  months: calculateMonthAlignments(birthDate1, birthDate2, year),
});
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.test.ts`
Așteptat: PASS, 16 aserțiuni (9 din Task 10 + 7 noi).

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/lib/relationshipTiming.ts src/lib/__tests__/relationshipTiming.test.ts
git commit -m "Arată unde se aliniază și unde se bat cap în cap lunile lor"
```

---

### Task 12: Textele stratului temporal, în trei limbi

**Files:**
- Modify: `src/lib/translations.ts` (blocul `timing`, în ro, en și ru)
- Test: `src/lib/__tests__/relationshipTiming.i18n.test.ts`

**Interfaces:**
- Consumes: `AlignmentBand` din Task 10.
- Produces: `t.timing` cu forma: `title`, `subtitle`, `thisYear`, `monthByMonth`, `yourYear`, `theirYear`, `bands.{harmony,mixed,tension}`, `bandHints.{harmony,mixed,tension}`. Task 13 le citește.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/relationshipTiming.i18n.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getTranslation, type Language } from "../translations";
import type { AlignmentBand } from "../relationshipTiming";

/**
 * Cele trei benzi trebuie să-și spună numele în toate trei limbile, iar
 * numele alea nu au voie să sune a eroare: o lună de tensiune e o distanță
 * între doi oameni, nu o defecțiune. Testul verifică forma; tonul îl verifică
 * omul care citește textele.
 */

const LANGS: Language[] = ["ro", "en", "ru"];
const BANDS: AlignmentBand[] = ["harmony", "mixed", "tension"];

describe("stratul temporal vorbește trei limbi", () => {
  it.each(LANGS)("%s are titlu, subtitlu și cele două secțiuni", (lang) => {
    const t = getTranslation(lang);

    for (const key of ["title", "subtitle", "thisYear", "monthByMonth", "yourYear", "theirYear"] as const) {
      expect(t.timing[key], `${lang}.timing.${key}`).toBeTruthy();
    }
  });

  it.each(LANGS)("%s numește fiecare bandă și o explică", (lang) => {
    const t = getTranslation(lang);

    for (const band of BANDS) {
      expect(t.timing.bands[band], `${lang}.timing.bands.${band}`).toBeTruthy();
      expect(t.timing.bandHints[band], `${lang}.timing.bandHints.${band}`).toBeTruthy();
    }
  });

  it("nu repetă aceeași etichetă de bandă în toate trei limbile", () => {
    for (const band of BANDS) {
      const labels = LANGS.map((lang) => getTranslation(lang).timing.bands[band]);
      expect(new Set(labels).size, `bands.${band}`).toBe(3);
    }
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.i18n.test.ts`
Așteptat: FAIL — `Cannot read properties of undefined (reading 'title')`.

- [ ] **Step 3: Scrie traducerile**

În `src/lib/translations.ts`, în blocul `ro`, imediat după blocul `sharing` (sau după `people`, dacă Livrabilul 1 e deja implementat):

```ts
    timing: {
      title: "Relația în timp",
      subtitle: "Scorul spune cât de aproape sunteți. Anul și lunile spun unde vă prinde perioada asta.",
      thisYear: "Anul ăsta",
      monthByMonth: "Lună de lună",
      yourYear: "Anul tău personal",
      theirYear: "Anul lui personal",
      bands: {
        harmony: "Vă trageți în aceeași direcție",
        mixed: "Mergeți în paralel",
        tension: "Trageți în direcții diferite",
      },
      bandHints: {
        harmony: "Ce vrea unul e și ce vrea celălalt. E perioada în care lucrurile mari se fac ușor.",
        mixed: "Nici împreună, nici împotrivă. Merge orice, dacă vă spuneți unde sunteți.",
        tension: "Unul strânge, celălalt desface. Nu e o problemă între voi — e o distanță de ținut minte.",
      },
    },
```

În blocul `en`:

```ts
    timing: {
      title: "The relationship over time",
      subtitle: "The score says how close you are. The year and the months say where this stretch of time finds you.",
      thisYear: "This year",
      monthByMonth: "Month by month",
      yourYear: "Your personal year",
      theirYear: "Their personal year",
      bands: {
        harmony: "You are pulling the same way",
        mixed: "You are running in parallel",
        tension: "You are pulling different ways",
      },
      bandHints: {
        harmony: "What one of you wants is what the other wants too. This is when the big things get done easily.",
        mixed: "Neither together nor against. Anything works, as long as you say where you are.",
        tension: "One of you is gathering, the other is letting go. It is not a fault between you — it is a distance worth remembering.",
      },
    },
```

În blocul `ru`:

```ts
    timing: {
      title: "Отношения во времени",
      subtitle: "Оценка говорит, насколько вы близки. Год и месяцы говорят, где вас застаёт это время.",
      thisYear: "В этом году",
      monthByMonth: "Месяц за месяцем",
      yourYear: "Ваш личный год",
      theirYear: "Его личный год",
      bands: {
        harmony: "Вы тянете в одну сторону",
        mixed: "Вы идёте параллельно",
        tension: "Вы тянете в разные стороны",
      },
      bandHints: {
        harmony: "Чего хочет один, того хочет и другой. Это время, когда большие дела даются легко.",
        mixed: "Ни вместе, ни против. Годится что угодно, если вы говорите друг другу, где находитесь.",
        tension: "Один собирает, другой отпускает. Это не поломка между вами — это расстояние, о котором стоит помнить.",
      },
    },
```

- [ ] **Step 4: Rulează testul nou și pe cel de paritate**

Rulează: `npm run test:run -- src/lib/__tests__/relationshipTiming.i18n.test.ts src/lib/__tests__/translations.test.ts`
Așteptat: PASS pe ambele.

- [ ] **Step 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/lib/translations.ts src/lib/__tests__/relationshipTiming.i18n.test.ts
git commit -m "Spune în trei limbi ce înseamnă o lună de armonie și una de tensiune"
```

---

### Task 13: Cardul care desenează timpul

**Files:**
- Create: `src/components/compatibility/RelationshipTimingCard.tsx`
- Test: `src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx`

**Interfaces:**
- Consumes: `RelationshipTiming`, `AlignmentBand` din Task 11; `t.timing.*` din Task 12; `--harmony` / `--tension` prin clasele Tailwind `text-harmony`, `bg-harmony-soft`, `text-tension`, `bg-tension-soft`.
- Produces: `<RelationshipTimingCard timing={RelationshipTiming} name1={string} name2={string} />`. Task 14 îl randează.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RelationshipTimingCard } from "../RelationshipTimingCard";
import { calculateRelationshipTiming } from "@/lib/relationshipTiming";

/**
 * Cardul desenează stratul temporal. Ce trebuie să fie adevărat: toate cele
 * douăsprezece luni sunt acolo, cifrele poartă `.num`, iar benzile poartă
 * `--harmony` / `--tension` -- nu `--ok` / `--crit`. O lună de tensiune între
 * doi oameni e o distanță, nu o eroare, și culoarea trebuie s-o spună.
 */

const timing = calculateRelationshipTiming(new Date(1990, 4, 15), new Date(1985, 10, 3), 2026);

const renderCard = () =>
  render(
    <LanguageProvider>
      <RelationshipTimingCard timing={timing} name1="Ana" name2="Ion" />
    </LanguageProvider>,
  );

describe("RelationshipTimingCard", () => {
  it("își scrie titlul și anul", () => {
    const { container } = renderCard();

    expect(screen.getByText("Relația în timp")).toBeInTheDocument();
    expect(container.textContent).toContain("2026");
  });

  it("numește amândoi oamenii", () => {
    const { container } = renderCard();

    expect(container.textContent).toContain("Ana");
    expect(container.textContent).toContain("Ion");
  });

  it("desenează toate cele douăsprezece luni", () => {
    const { container } = renderCard();

    expect(container.querySelectorAll("[data-month]")).toHaveLength(12);
  });

  it("pune anii personali ai amândurora, cu cifre tabulare", () => {
    const { container } = renderCard();
    const yearNumbers = container.querySelectorAll("[data-year-number]");

    expect(yearNumbers).toHaveLength(2);
    for (const node of yearNumbers) {
      expect(node.className).toContain("num");
    }
    expect(yearNumbers[0].textContent).toBe(String(timing.year.person1));
    expect(yearNumbers[1].textContent).toBe(String(timing.year.person2));
  });

  it("colorează relațiile în harmony și tension, nu în ok și crit", () => {
    const { container } = renderCard();
    const banded = container.querySelectorAll("[data-band]");

    expect(banded.length).toBeGreaterThan(0);
    for (const node of banded) {
      expect(node.className).not.toMatch(/\b(bg|text|border)-(ok|crit|warn)\b/);
    }
    const classes = [...banded].map((n) => n.className).join(" ");
    expect(classes).toMatch(/harmony|tension|muted/);
  });

  it("spune banda anului în cuvinte, nu doar în culoare", () => {
    renderCard();
    const labels = [
      "Vă trageți în aceeași direcție",
      "Mergeți în paralel",
      "Trageți în direcții diferite",
    ];

    expect(labels.some((label) => screen.queryAllByText(label).length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Rulează: `npm run test:run -- src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../RelationshipTimingCard"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/compatibility/RelationshipTimingCard.tsx`:

```tsx
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AlignmentBand, RelationshipTiming } from "@/lib/relationshipTiming";

/**
 * Relația, desenată în timp.
 *
 * Culorile sunt `--harmony` și `--tension`, nu `--ok` și `--crit`: o lună în
 * care doi oameni trag în direcții diferite e o distanță, nu o defecțiune, iar
 * roșul de eroare ar spune exact lucrul greșit despre ea. Banda „mixed" nu
 * primește o culoare a ei -- e absența unei relații pronunțate, și se citește
 * cel mai onest ca neutru.
 *
 * Numele lunilor vin din locale-ul date-fns, nu din translations.ts: sunt
 * treizeci și șase de cuvinte pe care biblioteca le are deja corecte în toate
 * trei limbile.
 */

const locales = { ro, en: enUS, ru };

const BAND_CLASS: Record<AlignmentBand, string> = {
  harmony: "bg-harmony-soft text-harmony border-harmony/30",
  mixed: "bg-muted/40 text-muted-foreground border-border/40",
  tension: "bg-tension-soft text-tension border-tension/30",
};

interface RelationshipTimingCardProps {
  timing: RelationshipTiming;
  name1: string;
  name2: string;
}

export const RelationshipTimingCard = ({ timing, name1, name2 }: RelationshipTimingCardProps) => {
  const { language, t } = useLanguage();
  const dateLocale = locales[language];
  const { year, months } = timing;

  return (
    <section className="card-mystic rounded-2xl p-6 space-y-6">
      <header className="space-y-2">
        <h3 className="font-heading text-xl text-foreground">{t.timing.title}</h3>
        <p className="text-sm text-muted-foreground font-raleway">{t.timing.subtitle}</p>
      </header>

      {/* Anul */}
      <div className={cn("rounded-xl border p-5 space-y-4", BAND_CLASS[year.band])} data-band={year.band}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.15em] font-raleway">{t.timing.thisYear}</span>
          <span className="num text-lg">{year.year}</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs font-raleway opacity-80">
              {name1} — {t.timing.yourYear}
            </div>
            <div className="num text-4xl" data-year-number>
              {year.person1}
            </div>
          </div>
          <div>
            <div className="text-xs font-raleway opacity-80">
              {name2} — {t.timing.theirYear}
            </div>
            <div className="num text-4xl" data-year-number>
              {year.person2}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-heading text-base">{t.timing.bands[year.band]}</p>
          <p className="text-sm opacity-90">{t.timing.bandHints[year.band]}</p>
        </div>
      </div>

      {/* Lunile */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-raleway">
          {t.timing.monthByMonth}
        </h4>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {months.map((month) => (
            <li
              key={month.month}
              data-month={month.month}
              data-band={month.band}
              className={cn("rounded-lg border p-3 space-y-1", BAND_CLASS[month.band])}
            >
              <div className="text-xs font-raleway uppercase tracking-wide opacity-80">
                {format(new Date(year.year, month.month - 1, 1), "LLLL", { locale: dateLocale })}
              </div>
              <div className="num text-lg">
                {month.person1} &middot; {month.person2}
              </div>
              <div className="text-xs font-raleway">{t.timing.bands[month.band]}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Rulează: `npm run test:run -- src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx`
Așteptat: PASS, 7 aserțiuni.

Dacă „spune banda anului în cuvinte" pică, banda calculată pentru perechea din test poate fi alta decât te aștepți — testul acceptă oricare dintre cele trei etichete, deci o cădere înseamnă că eticheta nu e randată deloc, nu că e alta.

- [ ] **Step 5: Rulează testul de tokeni**

Rulează: `npm run test:run -- src/lib/__tests__/design-tokens.test.ts`
Așteptat: PASS — niciun `hsl()` literal nou.

- [ ] **Step 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/components/compatibility/RelationshipTimingCard.tsx src/components/compatibility/__tests__/RelationshipTimingCard.test.tsx
git commit -m "Desenează anul și lunile lor în culorile relației, nu ale erorii"
```

---

### Task 14: `/doi` primește timpul, iar ponderile rămân neatinse

**Files:**
- Modify: `src/pages/Compatibility.tsx` (starea, `handleCalculate`, `handleReset`, randarea sub `RelationshipDynamicsCard`)
- Test: `src/lib/__tests__/compatibilityWeights.test.ts`

**Interfaces:**
- Consumes: `calculateRelationshipTiming` din Task 11; `RelationshipTimingCard` din Task 13.
- Produces: nimic pentru alte task-uri. E ultimul.

- [ ] **Step 1: Scrie testul care blochează ponderile**

Creează `src/lib/__tests__/compatibilityWeights.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calculateCompatibility, getCompatibilityScore } from "../compatibility";

/**
 * Stratul temporal se adaugă peste scor, nu în el.
 *
 * Ponderile Drum 50% / Destin 30% / Suflet 20% sunt contractul pe care îl
 * citește omul în /doi -- cele trei carduri își scriu procentele pe ecran.
 * Testul ăsta le recalculează din componente, ca o schimbare a lor să cadă aici
 * și nu la primul utilizator care observă că numerele nu mai ies.
 */

const ANA = { fullName: "Ana Pop", birthDate: new Date(1990, 4, 15) };
const ION = { fullName: "Ion Popescu", birthDate: new Date(1985, 10, 3) };

describe("ponderile compatibilității", () => {
  it("rămân 50 / 30 / 20", () => {
    const result = calculateCompatibility(ANA, ION);

    const expected = Math.round(
      result.lifePathCompatibility.score * 0.5 +
        result.destinyCompatibility.score * 0.3 +
        result.soulUrgeCompatibility.score * 0.2,
    );

    expect(result.overallScore).toBe(expected);
  });

  it("citesc fiecare componentă din aceeași matrice", () => {
    const result = calculateCompatibility(ANA, ION);

    expect(result.lifePathCompatibility.score).toBe(
      getCompatibilityScore(result.lifePathCompatibility.person1, result.lifePathCompatibility.person2),
    );
    expect(result.destinyCompatibility.score).toBe(
      getCompatibilityScore(result.destinyCompatibility.person1, result.destinyCompatibility.person2),
    );
    expect(result.soulUrgeCompatibility.score).toBe(
      getCompatibilityScore(result.soulUrgeCompatibility.person1, result.soulUrgeCompatibility.person2),
    );
  });

  it("nu depinde de anul în care e rulat", () => {
    // Stratul temporal are un an implicit. Scorul de bază nu are voie să-l
    // capete: aceeași pereche trebuie să dea același număr și la anul.
    const first = calculateCompatibility(ANA, ION).overallScore;
    const second = calculateCompatibility(ANA, ION).overallScore;

    expect(second).toBe(first);
    expect(Object.keys(calculateCompatibility(ANA, ION))).toEqual([
      "overallScore",
      "lifePathCompatibility",
      "destinyCompatibility",
      "soulUrgeCompatibility",
    ]);
  });
});
```

- [ ] **Step 2: Rulează testul, ca să vezi ce spune înainte de orice modificare**

Rulează: `npm run test:run -- src/lib/__tests__/compatibilityWeights.test.ts`
Așteptat: PASS pe toate trei. Testul blochează comportamentul care există deja; dacă pică acum, `src/lib/compatibility.ts` a fost modificat pe undeva și trebuie investigat înainte de pasul următor.

- [ ] **Step 3: Leagă cardul în `/doi`**

În `src/pages/Compatibility.tsx`:

1. Adaugă importurile, lângă celelalte importuri interne:

```tsx
import { RelationshipTimingCard } from "@/components/compatibility/RelationshipTimingCard";
import { calculateRelationshipTiming, type RelationshipTiming } from "@/lib/relationshipTiming";
```

2. Adaugă starea, lângă `const [detailedResult, setDetailedResult] = ...`:

```tsx
  const [timing, setTiming] = useState<RelationshipTiming | null>(null);
```

3. În `handleCalculate`, imediat după `setResult(baseCompatibility);`:

```tsx
      // Stratul temporal stă lângă scor, nu în el: aceleași două date de
      // naștere, citite prin anul și lunile personale ale fiecăruia.
      setTiming(calculateRelationshipTiming(person1.birthDate, person2.birthDate));
```

4. În `handleReset`, adaugă `setTiming(null);` lângă `setDetailedResult(null);`.

5. În randare, imediat după blocul `{detailedResult && (<RelationshipDynamicsCard ... />)}`:

```tsx
              {timing && (
                <RelationshipTimingCard
                  timing={timing}
                  name1={person1.fullName}
                  name2={person2.fullName}
                />
              )}
```

- [ ] **Step 4: Rulează toate testele atinse, typecheck-ul și lint-ul**

Rulează: `npm run test:run -- src/lib/__tests__/compatibilityWeights.test.ts src/lib/__tests__/compatibility.test.ts src/lib/__tests__/compatibilityExtended.test.ts src/lib/__tests__/relationshipTiming.test.ts src/components/compatibility && npm run typecheck && npm run lint`
Așteptat: PASS pe toate; 0 erori de tip; 0 erori de lint.

- [ ] **Step 5: Rulează toată suita, ca să închizi livrabilul**

Rulează: `npm run test:run && cd server && npm run test`
Așteptat: PASS pe ambele suite, inclusiv cele 78 de aserțiuni ale motorului `numerology-plus`, care n-a fost atins.

- [ ] **Step 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/pages/Compatibility.tsx src/lib/__tests__/compatibilityWeights.test.ts
git commit -m "Adaugă timpul peste scorul din doi, fără să atingi ponderile"
```

---

## Verificarea de final

După Task 14, rulează în ordine și notează ieșirile:

```bash
cd /Users/victorsafta/work/numerology-compass
npm run test:run
npm run typecheck
npm run lint
npm run build
cd server && npm run test && npm run build
```

Migrația se aplică separat, pe baza de date reală, o singură dată:

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run migrate
```

`012_profile_categories.sql` e scrisă cu `ADD COLUMN IF NOT EXISTS` și cu `DROP CONSTRAINT IF EXISTS` înaintea fiecărui `ADD CONSTRAINT`, deci o rulare repetată n-o rupe — spre deosebire de 004, 006 și 007. Asta nu e o invitație s-o rulezi de două ori; e o plasă.

## Riscurile pe care le-am văzut și nu le-am eliminat

1. **Tăierea `setAsActive` schimbă un comportament pe care cineva se bazează.** `SaveMapButton` trimite azi `setAsActive: true` necondiționat, de pe pagina de calcul. După Task 2, dacă utilizatorul salvează de acolo o hartă marcată drept a altcuiva, ea nu mai devine profilul activ. Pentru harta proprie nimic nu se schimbă — categoria implicită e `eu`. Componenta nu a fost modificată în planul ăsta, ca să rămână surgical; dacă se dovedește confuz în folosire, adăugarea unui selector de categorie în `SaveMapButton` e un task separat.

2. **Trecerea pe `zod` în `POST /profiles/me` strânge validarea peste ce cerea task-ul.** E necesară — categoria trebuie validată undeva — dar aduce cu ea `birthDate` obligatoriu în format `YYYY-MM-DD` și un nume de maximum 120 de caractere. Ambele apelante actuale (`Profile.tsx` și `SaveMapButton.tsx`) trimit deja `YYYY-MM-DD` prin `formatCalendarDate`, deci nu s-ar trebui să rupă nimic. Dacă un client mai vechi trimite un ISO complet, va primi 400 în loc de o salvare tăcut greșită.
