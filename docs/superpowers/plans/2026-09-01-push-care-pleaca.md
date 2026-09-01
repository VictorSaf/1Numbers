# Push care pleacă — Plan de implementare

> **Pentru executanți agentici:** SUB-SKILL OBLIGATORIU: folosește `superpowers:subagent-driven-development` (recomandat) sau `superpowers:executing-plans` ca să execuți acest plan task cu task. Pașii folosesc sintaxa checkbox (`- [ ]`) pentru urmărire.

**Scop:** O notificare push zilnică pleacă efectiv de pe server către dispozitivul abonat, la ora aleasă de utilizator, cu numărul zilei personale calculat din data lui de naștere.

**Arhitectură:** Un dispecer în procesul `compass-api` se trezește la fiecare minut, întreabă baza cine are ora trecută și n-a primit nimic azi, *revendică* trimiterea printr-un `INSERT ... ON CONFLICT DO NOTHING` în `notification_history` (indexul unic e lacătul — nu procesul), apoi trimite prin `web-push` către fiecare subscripție a acelui utilizator, ștergând subscripțiile la care browserul răspunde `404`/`410`. Fereastra „ora a trecut, azi n-a primit" în loc de egalitate exactă pe minut face ca driftul timerului, un restart pm2 sau zece minute de downtime să nu piardă notificarea.

**Stivă:** Express 5 + PostgreSQL (`pg`) + `zod` în `server/`; `web-push` (dependință nouă, singura); Vitest + supertest pentru backend; React 18 + Vitest + Testing Library pentru client.

**Spec:** nu există un document de spec separat. Cerințele sunt în briefing-ul de la care pleacă planul, rezumate aici: chei VAPID în mediu, modul `server/src/lib/push.ts` care curăță subscripțiile moarte, un scheduler cu apărare împotriva trimiterii duble, scriere în `notification_history`, conectarea clientului existent, teste fără rețea, și un mod de probă înainte de prima rulare reală.

## Global Constraints

Copiat verbatim din contextul de proiect. Cerințele fiecărui task le includ implicit.

- Repo: /Users/victorsafta/work/numerology-compass, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Backend: Express + PostgreSQL (`pg`) + `zod`, în `server/`. Teste: `cd server && npm run test` (vitest + supertest).
- Migrații: `server/src/migrations/NNN_nume.sql`, aplicate o singură dată, în ordinea numelui, prin `cd server && npm run migrate`. NU sunt replayable: nu edita niciodată o migrație existentă, adaugă un fișier nou numerotat. Ultima existentă e `009_premium_features.sql`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = editezi `routes.json` ȘI `PAGES` din `src/App.tsx`. Nimic altceva.
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră sau etichetă numerică; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, definit în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) sunt obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY: are 78 de aserțiuni care trec.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA (ex. „Închide bucla care nu trimitea nimic"). NU folosi prefixe conventional-commits (`feat:`, `fix:`).

### Constrângeri suplimentare, specifice acestei lucrări

- **Nicio rută nouă în `routes.json`.** Nu adăugăm pagini. Singurul endpoint nou e sub `/api/notifications`, care nu trece prin registrul de rute.
- **Niciun `hsl()`, nicio clasă nouă de UI.** Singura atingere de frontend e în `src/hooks/useNotifications.ts`, care nu randează nimic.
- **Testele nu ating rețeaua.** `web-push` se mock-uiește cu `vi.mock('web-push', ...)` în fiecare test care îl atinge, iar `pool` cu `vi.mock('../db', ...)`, exact ca în `server/src/__tests__/auth.middleware.test.ts`.
- **`server/tsconfig.json` are `rootDir: "./src"`.** Serverul NU poate importa din `src/lib/**`. Aritmetica zilei personale și textele notificării se scriu din nou în `server/src/lib/`, cu teste care le fixează pe valori calculate manual din motor. Divergența e riscul asumat; testul cu tabel fix e ce o prinde.
- **Ora e ora serverului.** `dailyPredictionTime` e un `HH:MM` fără fus orar, iar nimic în schemă nu ține fusul utilizatorului. Comparația se face cu ceasul local al mașinii care rulează `compass-api`. Documentează, nu rezolva — fusul per utilizator e altă lucrare.
- **Verbele periculoase merg în spatele unui comutator.** `NOTIFICATIONS_ENABLED` nu e `'true'` ⇒ dispecerul nici nu pornește. Prima rulare reală se face cu `NOTIFICATIONS_ONLY_USER` setat.

---

## File Structure

**Creează:**

| Fișier | Responsabilitate |
|---|---|
| `server/src/migrations/010_notification_dispatch.sql` | coloana `language` pe `push_subscriptions`, coloana `dedupe_key` + indexul unic pe `notification_history` |
| `server/src/lib/push.ts` | un singur lucru: trimite un payload la o subscripție și șterge subscripția moartă. Nu știe ce e o predicție. |
| `server/src/lib/personalDay.ts` | aritmetica zilei personale, oglinda `src/lib/numerology-plus/pythagorean.ts`. Pură, fără `pg`. |
| `server/src/lib/dailyNotification.ts` | textele RO/EN/RU 1–9 și compunerea payload-ului. Pură, fără `pg`. |
| `server/src/lib/dailyDispatch.ts` | SQL-ul de selecție, revendicarea și bucla de trimitere. Singurul care atinge și baza, și `push.ts`. |
| `server/src/lib/notificationScheduler.ts` | timerul și cele două comutatoare de mediu. Nimic altceva. |
| `server/src/__tests__/push.test.ts` | 410/404 șterge subscripția; 500 nu |
| `server/src/__tests__/personalDay.test.ts` | tabel fix de valori |
| `server/src/__tests__/dailyNotification.test.ts` | payload în trei limbi |
| `server/src/__tests__/dailyDispatch.test.ts` | parametrii selecției, revendicare o singură dată, rollback la eșec total |
| `server/src/__tests__/notificationScheduler.test.ts` | nu pornește fără comutator / fără chei |
| `src/hooks/__tests__/useNotifications.preferences.test.tsx` | preferințele ajung la server |

**Modifică:**

| Fișier | Ce se schimbă |
|---|---|
| `server/package.json` | `web-push` + `@types/web-push` |
| `server/src/routes/notifications.ts` | `POST /subscribe` acceptă `language`; `POST /test-send` nou |
| `server/src/index.ts` | pornește dispecerul după `app.listen` |
| `src/hooks/useNotifications.ts` | PUT preferințele la server; trimite `language` la subscribe |
| `ecosystem.config.cjs` | comentariu: de ce `instances: 1` nu mai e o presupunere pe care se sprijină corectitudinea |
| `DEPLOY.md` | cheile VAPID în tabelul de mediu + runbook-ul de probă |

**Ce NU se atinge:** `public/sw.js` (capătul de recepție e complet și corect), `server/src/migrations/007_notifications.sql` (migrațiile nu se editează), `src/lib/notifications.ts`, `src/components/NotificationSettings.tsx`, `src/lib/numerology-plus/**`.

### Observații găsite în cod, care NU sunt task-uri aici

- `public/sw.js:196` mapează `type: 'daily-prediction'` la `/predictions`, o rută care nu există în `routes.json` (există `/azi`). Ramura aceea e moartă atâta vreme cât payload-ul poartă `data.url`, și payload-ul nostru îl poartă întotdeauna (`/azi`). Am ales să nu atingem service workerul.
- `007_notifications.sql` definește funcția `get_users_for_daily_notification(...)`, care compară ora cu egalitate exactă. Nu o folosim: egalitatea pe minut pierde notificarea la orice restart sau drift. Funcția rămâne pe loc, nefolosită.
- `scheduled_notifications` rămâne goală și nefolosită. Vezi justificarea din Task 5.

---

## Task 1: Livrarea — `web-push`, cheile VAPID și curățarea subscripțiilor moarte

**Files:**
- Modify: `server/package.json`
- Create: `server/src/lib/push.ts`
- Test: `server/src/__tests__/push.test.ts`

**Interfaces:**
- Consumes: `pool` din `server/src/db.ts` (default export, `pool.query(text, params)`).
- Produces:
  - `interface PushPayload { title: string; body: string; tag: string; data: Record<string, unknown> }`
  - `interface StoredSubscription { endpoint: string; keys: { p256dh: string; auth: string } }`
  - `type SendOutcome = 'sent' | 'gone' | 'failed'`
  - `configurePush(): boolean`
  - `sendToSubscription(sub: StoredSubscription, payload: PushPayload): Promise<SendOutcome>`

- [ ] **Pasul 1: Instalează `web-push` și tipurile lui**

```bash
cd /Users/victorsafta/work/numerology-compass/server
npm install web-push@^3.6.7
npm install --save-dev @types/web-push@^3.6.4
```

Verifică apoi că amândouă au intrat:

```bash
cd /Users/victorsafta/work/numerology-compass/server && node -e "console.log(require('./package.json').dependencies['web-push'], require('./package.json').devDependencies['@types/web-push'])"
```

Așteptat: două versiuni tipărite, niciun `undefined`.

- [ ] **Pasul 2: Generează perechea de chei VAPID și pune-o în `server/.env`**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npx web-push generate-vapid-keys --json
```

Ieșirea e un JSON cu `publicKey` și `privateKey`. Adaugă în `server/.env` (fișier negitat; dacă nu există, creează-l lângă celelalte chei descrise în `DEPLOY.md`):

```
VAPID_PUBLIC_KEY=<publicKey din ieșirea de mai sus>
VAPID_PRIVATE_KEY=<privateKey din ieșirea de mai sus>
VAPID_SUBJECT=mailto:mail@victorsafta.ro
NOTIFICATIONS_ENABLED=false
```

Și în `.env.local` de la rădăcina repo-ului, pentru client (aceeași valoare publică, niciodată cea privată):

```
VITE_VAPID_PUBLIC_KEY=<publicKey, identic cu VAPID_PUBLIC_KEY>
```

Cheia privată nu părăsește `server/.env`. Dacă ajunge în bundle, oricine poate semna push-uri către utilizatorii noștri.

- [ ] **Pasul 3: Scrie testul care pică**

Creează `server/src/__tests__/push.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import webpush from 'web-push';
import pool from '../db';
import { sendToSubscription, configurePush } from '../lib/push';

vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
}));
vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const SUB = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  keys: { p256dh: 'p', auth: 'a' },
};

const PAYLOAD = {
  title: 'Energia Zilei Tale',
  body: 'orice',
  tag: 'daily-prediction',
  data: { type: 'daily-prediction', url: '/azi' },
};

const failWith = (statusCode: number) => {
  const error = Object.assign(new Error('push rejected'), { statusCode });
  vi.mocked(webpush.sendNotification).mockRejectedValueOnce(error as never);
};

describe('sendToSubscription', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(webpush.sendNotification).mockReset();
    vi.mocked(pool.query).mockResolvedValue({ rows: [], rowCount: 0 } as never);
  });

  it('trimite payload-ul serializat și raportează "sent"', async () => {
    vi.mocked(webpush.sendNotification).mockResolvedValueOnce({} as never);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('sent');
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: SUB.endpoint, keys: SUB.keys },
      JSON.stringify(PAYLOAD),
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each([410, 404])('la %i șterge subscripția moartă și raportează "gone"', async (status) => {
    failWith(status);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('gone');
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM push_subscriptions WHERE endpoint = $1',
      [SUB.endpoint],
    );
  });

  it('la 500 raportează "failed" și NU șterge nimic — eșecul e al serverului de push, nu al abonatului', async () => {
    failWith(500);

    const outcome = await sendToSubscription(SUB, PAYLOAD);

    expect(outcome).toBe('failed');
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('configurePush', () => {
  it('întoarce false când lipsește o cheie', () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;

    expect(configurePush()).toBe(false);
    expect(webpush.setVapidDetails).not.toHaveBeenCalled();
  });
});
```

- [ ] **Pasul 4: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/push.test.ts
```

Așteptat: FAIL, cu `Cannot find module '../lib/push'`.

- [ ] **Pasul 5: Scrie implementarea minimă**

Creează `server/src/lib/push.ts`:

```typescript
import webpush from 'web-push';
import pool from '../db';

/**
 * Capătul care trimite.
 *
 * Restul lanțului exista de la început: sw.js ascultă 'push' și
 * 'notificationclick', routes/notifications.ts stochează subscripțiile,
 * 007 a creat tabelele. Nimic nu chema vreodată un server de push.
 *
 * Acest modul nu știe ce e o predicție. Primește un payload și o subscripție.
 */

export interface PushPayload {
  title: string;
  body: string;
  tag: string;
  data: Record<string, unknown>;
}

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export type SendOutcome = 'sent' | 'gone' | 'failed';

let configured = false;

/**
 * Citește cheile VAPID din mediu. Întoarce false dacă lipsește vreuna --
 * apelantul decide ce face cu asta; aici nu aruncăm, ca lipsa cheilor să
 * oprească dispecerul fără să oprească API-ul.
 */
export function configurePush(): boolean {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/**
 * 404 și 410 sunt singurele coduri care înseamnă „abonatul nu mai există":
 * browserul a dezinstalat PWA-ul, a golit datele sau a rotit endpoint-ul.
 * Orice altceva -- 429, 500, o rețea căzută -- e tranzitoriu, iar o subscripție
 * ștearsă acolo nu se mai întoarce niciodată singură.
 */
export async function sendToSubscription(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<SendOutcome> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(payload),
    );
    return 'sent';
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode === 404 || statusCode === 410) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
      return 'gone';
    }

    console.error('[push] trimitere eșuată', statusCode, error);
    return 'failed';
  }
}
```

- [ ] **Pasul 6: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/push.test.ts
```

Așteptat: PASS, 5 teste.

- [ ] **Pasul 7: Verifică tipurile**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run build
```

Așteptat: fără ieșire, cod 0. (Compilează în `server/dist/`, ceea ce e și ce rulează pm2.)

- [ ] **Pasul 8: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/package.json server/package-lock.json server/src/lib/push.ts server/src/__tests__/push.test.ts
git commit -m "Adaugă capătul care trimite push-ul, și care uită abonații dispăruți"
```

`server/.env` și `.env.local` sunt negitate — nu apar în `git add` și nu trebuie să apară.

---

## Task 2: Ziua personală, calculată pe server

**Files:**
- Create: `server/src/lib/personalDay.ts`
- Test: `server/src/__tests__/personalDay.test.ts`

**Interfaces:**
- Consumes: nimic.
- Produces:
  - `interface CalendarParts { year: number; month: number; day: number }`
  - `parseCalendarDate(iso: string): CalendarParts` — pentru `YYYY-MM-DD`
  - `personalDayNumber(birth: CalendarParts, on: CalendarParts): number` — întoarce 1–9

**De ce se rescrie aritmetica:** `server/tsconfig.json` are `rootDir: "./src"`, deci `tsc` refuză orice fișier din `../../src`. Motorul din `src/lib/numerology-plus/pythagorean.ts` e READ-ONLY și rămâne sursa de adevăr; aici e o oglindă de 15 linii, fixată de un tabel de valori calculate manual din formula lui. Formula, verbatim din `pythagorean.ts:177-185` și `core.ts:169-186`: `personalYear = reduce(reduce(lună) + reduce(zi) + reduce(digitSum(an)))`, `personalMonth = reduce(py + lună)`, `personalDay = reduce(pm + zi)`, toate cu `keepMasters = false`.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `server/src/__tests__/personalDay.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { personalDayNumber, parseCalendarDate } from '../lib/personalDay';

/**
 * Valorile sunt calculate din formula motorului
 * (src/lib/numerology-plus/pythagorean.ts, personalYear/Month/Day cu
 * keepMasters = false), nu din rularea acestui cod. Serverul nu poate importa
 * motorul -- rootDir e ./src -- deci acest tabel e singurul lucru care ține
 * cele două copii pe aceeași valoare.
 *
 * 1990-05-15 la 2026-09-01: an personal reduce(5)+reduce(15)+reduce(digitSum(2026)=10)
 *   = 5+6+1 = 12 -> 3; lună personală 3+9 = 12 -> 3; zi personală 3+1 = 4.
 * 1985-11-29 verifică reducerea unei zile care trece prin 11:
 *   reduce(29) = 11 -> 2, nu 11, fiindcă masterii nu se păstrează în segmente.
 */
const CASES: Array<[string, string, number]> = [
  ['1990-05-15', '2026-09-01', 4],
  ['1985-11-29', '2026-09-01', 6],
  ['2000-01-01', '2026-12-31', 1],
  ['1977-07-07', '2026-09-02', 8],
];

describe('personalDayNumber', () => {
  it.each(CASES)('naștere %s, zi %s -> %i', (birth, on, expected) => {
    expect(personalDayNumber(parseCalendarDate(birth), parseCalendarDate(on))).toBe(expected);
  });

  it('nu întoarce niciodată un master sau un zero', () => {
    for (let day = 1; day <= 28; day++) {
      const value = personalDayNumber(
        parseCalendarDate('1990-05-15'),
        parseCalendarDate(`2026-09-${String(day).padStart(2, '0')}`),
      );
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    }
  });
});

describe('parseCalendarDate', () => {
  it('citește un YYYY-MM-DD fără să treacă printr-un Date', () => {
    expect(parseCalendarDate('1990-05-15')).toEqual({ year: 1990, month: 5, day: 15 });
  });
});
```

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/personalDay.test.ts
```

Așteptat: FAIL, cu `Cannot find module '../lib/personalDay'`.

- [ ] **Pasul 3: Scrie implementarea minimă**

Creează `server/src/lib/personalDay.ts`:

```typescript
/**
 * Ziua personală, pe server.
 *
 * Oglinda lui src/lib/numerology-plus/pythagorean.ts (personalYear/Month/Day)
 * și a lui core.ts (digitSum/reduce). Nu e un import fiindcă nu poate fi:
 * server/tsconfig.json are rootDir "./src" și refuză orice fișier din afara lui.
 *
 * Masterii NU se păstrează -- exact ca în motor, unde cele trei funcții
 * cheamă result(..., false). Rezultatul e mereu în 1..9.
 *
 * Dacă modifici ceva aici, testul cu tabel fix din
 * server/src/__tests__/personalDay.test.ts e ce te oprește să diverjezi.
 */

export interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

function reduceToDigit(n: number): number {
  let x = Math.abs(n);
  while (x > 9) x = digitSum(x);
  return x;
}

/**
 * Un YYYY-MM-DD e o dată de calendar, nu un instant. db.ts dezactivează deja
 * parserul de DATE al lui node-postgres tocmai ca să ajungă aici ca șir; a-l
 * trece printr-un Date ar reintroduce fusul orar în ceva ce nu are unul.
 */
export function parseCalendarDate(iso: string): CalendarParts {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return { year, month, day };
}

export function personalDayNumber(birth: CalendarParts, on: CalendarParts): number {
  const personalYear = reduceToDigit(
    reduceToDigit(birth.month) + reduceToDigit(birth.day) + reduceToDigit(digitSum(on.year)),
  );
  const personalMonth = reduceToDigit(personalYear + on.month);
  return reduceToDigit(personalMonth + on.day);
}
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/personalDay.test.ts
```

Așteptat: PASS, 6 teste (4 din `it.each` + 2).

- [ ] **Pasul 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/lib/personalDay.ts server/src/__tests__/personalDay.test.ts
git commit -m "Dă serverului aritmetica zilei personale, fixată de un tabel"
```

---

## Task 3: Textul notificării, în trei limbi

**Files:**
- Create: `server/src/lib/dailyNotification.ts`
- Test: `server/src/__tests__/dailyNotification.test.ts`

**Interfaces:**
- Consumes: `PushPayload` din `server/src/lib/push.ts` (Task 1).
- Produces:
  - `type NotificationLanguage = 'ro' | 'en' | 'ru'`
  - `buildDailyPredictionPayload(personalDay: number, language: NotificationLanguage): PushPayload`

**Sursa textelor:** `src/lib/notifications.ts`, funcția `generateDailyPredictionNotification` — titlurile și cele 27 de corpuri sunt copiate verbatim de acolo. `src/lib/predictions.ts` (`dailyPredictionsData`) e doar în engleză și descrie zile, nu notificări; nu e potrivit pentru un push trilingv.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `server/src/__tests__/dailyNotification.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildDailyPredictionPayload } from '../lib/dailyNotification';

describe('buildDailyPredictionPayload', () => {
  it('compune ziua 4 în română', () => {
    expect(buildDailyPredictionPayload(4, 'ro')).toEqual({
      title: 'Energia Zilei Tale',
      body: 'O zi excelentă pentru organizare și muncă practică.',
      tag: 'daily-prediction',
      data: { type: 'daily-prediction', personalDay: 4, url: '/azi' },
    });
  });

  it('compune ziua 1 în engleză', () => {
    const payload = buildDailyPredictionPayload(1, 'en');
    expect(payload.title).toBe('Your Daily Energy');
    expect(payload.body).toBe('Today is perfect for new beginnings! Number 1 energy supports you.');
  });

  it('compune ziua 9 în rusă', () => {
    const payload = buildDailyPredictionPayload(9, 'ru');
    expect(payload.title).toBe('Ваша Энергия Дня');
    expect(payload.body).toBe('День для сострадания и завершения циклов.');
  });

  it('are un corp nevid pentru fiecare zi 1-9 în fiecare limbă', () => {
    for (const language of ['ro', 'en', 'ru'] as const) {
      for (let day = 1; day <= 9; day++) {
        expect(buildDailyPredictionPayload(day, language).body.length).toBeGreaterThan(0);
      }
    }
  });

  it('trimite mereu url-ul către /azi, ruta care există', () => {
    // sw.js citește data.url înainte de orice mapare proprie, iar maparea lui
    // pentru 'daily-prediction' arată spre /predictions, care nu e în
    // routes.json. Payload-ul nostru nu ajunge niciodată pe ramura aceea.
    expect(buildDailyPredictionPayload(7, 'ro').data.url).toBe('/azi');
  });
});
```

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/dailyNotification.test.ts
```

Așteptat: FAIL, cu `Cannot find module '../lib/dailyNotification'`.

- [ ] **Pasul 3: Scrie implementarea minimă**

Creează `server/src/lib/dailyNotification.ts`:

```typescript
import type { PushPayload } from './push';

/**
 * Textele notificării zilnice, RO/EN/RU.
 *
 * Copiate verbatim din generateDailyPredictionNotification, în
 * src/lib/notifications.ts. Acolo rămân, fiindcă acolo se folosesc pentru
 * notificarea locală de test; aici sunt fiindcă serverul nu poate importa din
 * src/ (rootDir). Dacă schimbi un text, schimbă-l în ambele locuri --
 * testul de aici fixează exact șirurile, deci o divergență cade la `npm run test`.
 */

export type NotificationLanguage = 'ro' | 'en' | 'ru';

const TITLES: Record<NotificationLanguage, string> = {
  ro: 'Energia Zilei Tale',
  en: 'Your Daily Energy',
  ru: 'Ваша Энергия Дня',
};

const BODIES: Record<NotificationLanguage, Record<number, string>> = {
  ro: {
    1: 'Astăzi este o zi perfectă pentru noi începuturi! Energia numărului 1 te susține.',
    2: 'Ziua favorizează cooperarea și relațiile armonioase. Fii diplomat!',
    3: 'Creativitatea ta este la maxim astăzi! Exprimă-te liber.',
    4: 'O zi excelentă pentru organizare și muncă practică.',
    5: 'Schimbarea și aventura sunt în aer! Fii deschis la nou.',
    6: 'Energia zilei se concentrează pe familie și iubire.',
    7: 'Zi ideală pentru introspecție și studiu profund.',
    8: 'Energia abundenței și succesului este puternică astăzi!',
    9: 'O zi pentru compasiune și încheierea ciclurilor.',
  },
  en: {
    1: 'Today is perfect for new beginnings! Number 1 energy supports you.',
    2: 'The day favors cooperation and harmonious relationships. Be diplomatic!',
    3: 'Your creativity is at its peak today! Express yourself freely.',
    4: 'An excellent day for organization and practical work.',
    5: 'Change and adventure are in the air! Be open to the new.',
    6: "Today's energy focuses on family and love.",
    7: 'An ideal day for introspection and deep study.',
    8: 'The energy of abundance and success is strong today!',
    9: 'A day for compassion and completing cycles.',
  },
  ru: {
    1: 'Сегодня идеальный день для новых начинаний! Энергия числа 1 поддерживает вас.',
    2: 'День благоприятствует сотрудничеству и гармоничным отношениям. Будьте дипломатичны!',
    3: 'Ваша креативность на пике сегодня! Выражайте себя свободно.',
    4: 'Отличный день для организации и практической работы.',
    5: 'Перемены и приключения в воздухе! Будьте открыты новому.',
    6: 'Энергия дня сосредоточена на семье и любви.',
    7: 'Идеальный день для самоанализа и глубокого изучения.',
    8: 'Энергия изобилия и успеха сильна сегодня!',
    9: 'День для сострадания и завершения циклов.',
  },
};

/**
 * data.url e mereu setat: sw.js îl citește înaintea propriei mapări, iar
 * maparea lui pentru 'daily-prediction' trimite la /predictions, o rută care
 * nu există în routes.json.
 */
export function buildDailyPredictionPayload(
  personalDay: number,
  language: NotificationLanguage,
): PushPayload {
  return {
    title: TITLES[language],
    body: BODIES[language][personalDay],
    tag: 'daily-prediction',
    data: {
      type: 'daily-prediction',
      personalDay,
      url: '/azi',
    },
  };
}
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/dailyNotification.test.ts
```

Așteptat: PASS, 5 teste.

- [ ] **Pasul 5: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/lib/dailyNotification.ts server/src/__tests__/dailyNotification.test.ts
git commit -m "Mută textele notificării zilnice acolo unde pleacă notificarea"
```

---

## Task 4: Schema — limba abonatului și lacătul care oprește trimiterea dublă

**Files:**
- Create: `server/src/migrations/010_notification_dispatch.sql`
- Modify: `server/src/routes/notifications.ts` (ruta `POST /subscribe`)
- Test: `server/src/__tests__/subscribeLanguage.test.ts`

**Interfaces:**
- Consumes: tabelele din `007_notifications.sql`.
- Produces:
  - `push_subscriptions.language TEXT NOT NULL DEFAULT 'ro'`, valori `'ro' | 'en' | 'ru'`
  - `notification_history.dedupe_key TEXT`, cu `UNIQUE (user_id, dedupe_key)`
  - `POST /api/notifications/subscribe` acceptă `{ subscription, language? }`

**De ce limba stă pe subscripție, nu pe utilizator:** `users` nu are coloană de limbă și `notification_preferences.preferences` e validat cu un `zod` `.strict()` care oglindește exact default-ul din 007 — orice câmp în plus acolo ar însemna schimbat schema, tipul din `src/lib/notifications.ts` și componenta. Limba e oricum o proprietate a browserului care s-a abonat, nu a contului: același om, două dispozitive, două limbi, e un rezultat corect.

**De ce `UNIQUE (user_id, dedupe_key)` fără `WHERE`:** în PostgreSQL, `NULL`-urile sunt distincte într-un index unic, deci rândurile vechi din `notification_history` (toate cu `dedupe_key IS NULL`) coexistă fără să se ciocnească. Un index parțial ar fi cerut repetarea predicatului în fiecare `ON CONFLICT`, degeaba.

- [ ] **Pasul 1: Scrie migrația**

Creează `server/src/migrations/010_notification_dispatch.sql`:

```sql
-- Migration: ce lipsea ca notificarea zilnică să poată pleca.
--
-- 007 a creat tabelele și le-a lăsat goale: nimic nu a trimis vreodată un push,
-- fiindcă web-push nu era instalat și nu exista niciun scheduler. Cele două
-- coloane de mai jos sunt tot ce mai trebuie în schemă.
--
-- language pe subscripție, nu pe utilizator: users nu are o coloană de limbă,
-- iar preferences e validat cu un zod .strict() care oglindește exact
-- default-ul din 007. Limba e oricum o proprietate a browserului abonat.
--
-- dedupe_key + indexul unic sunt LACĂTUL. Dispecerul face
-- INSERT ... ON CONFLICT DO NOTHING RETURNING id înainte de a trimite: dacă nu
-- se întoarce niciun rând, altcineva a revendicat deja ziua aceea pentru acel
-- utilizator și nu se trimite nimic. Asta ține chiar dacă rulează două procese
-- compass-api în paralel -- ceea ce se întâmplă, câteva secunde, la fiecare
-- `pm2 restart`.
--
-- Indexul NU e parțial: în PostgreSQL NULL-urile sunt distincte într-un index
-- unic, deci rândurile existente (toate cu dedupe_key NULL) nu se ciocnesc.

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'ro';

ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_language_check;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_language_check
  CHECK (language IN ('ro', 'en', 'ru'));

ALTER TABLE notification_history
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_history_dedupe
  ON notification_history (user_id, dedupe_key);

COMMENT ON COLUMN push_subscriptions.language IS 'Limba în care pleacă push-ul către acest dispozitiv';
COMMENT ON COLUMN notification_history.dedupe_key IS 'Cheia de revendicare, ex. daily-prediction:2026-09-01. Indexul unic pe (user_id, dedupe_key) e ce oprește trimiterea dublă.';
```

- [ ] **Pasul 2: Aplică migrația și verifică schema**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run migrate
```

Așteptat: o linie care spune că `010_notification_dispatch.sql` a fost aplicată.

```bash
psql -p 5433 -d numerology_compass -c "\d push_subscriptions" -c "\d notification_history"
```

Așteptat: `language | text | not null default 'ro'::text` la prima, `dedupe_key | text` plus indexul `idx_notification_history_dedupe` la a doua.

- [ ] **Pasul 3: Scrie testul care pică**

Creează `server/src/__tests__/subscribeLanguage.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));

const USER_ID = '00000000-0000-0000-0000-000000000042';
const token = jwt.sign(
  { userId: USER_ID, email: 'abonat@test.local', role: 'user' },
  process.env.JWT_SECRET!,
);

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
  keys: { p256dh: 'p', auth: 'a' },
};

const lastInsertParams = () => vi.mocked(pool.query).mock.calls[0][1] as unknown[];

describe('POST /api/notifications/subscribe', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(pool.query).mockResolvedValue({ rows: [], rowCount: 1 } as never);
  });

  it('stochează limba trimisă de client', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription, language: 'ru' });

    expect(response.status).toBe(200);
    expect(lastInsertParams()[3]).toBe('ru');
  });

  it('cade pe română când clientul nu trimite nicio limbă', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription });

    expect(response.status).toBe(200);
    expect(lastInsertParams()[3]).toBe('ro');
  });

  it('respinge o limbă pe care nu o avem, în loc să o scrie și să pice la CHECK', async () => {
    const response = await request(app)
      .post('/api/notifications/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscription, language: 'de' });

    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
```

- [ ] **Pasul 4: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/subscribeLanguage.test.ts
```

Așteptat: FAIL — primele două pică pe `expected undefined to be 'ru'` / `'ro'` (ruta trimite doar 3 parametri), a treia pe `expected 200 to be 400`.

- [ ] **Pasul 5: Scrie implementarea minimă**

În `server/src/routes/notifications.ts`, imediat sub `const router = Router();`, adaugă schema de limbă:

```typescript
// Limba în care pleacă push-ul spre acest dispozitiv. Coloana are un CHECK cu
// aceleași trei valori; validarea aici întoarce un 400 în loc să lase baza să
// arunce un 500.
const languageSchema = z.enum(['ro', 'en', 'ru']);
```

Apoi în handlerul `POST /subscribe`, înlocuiește blocul de la `const { subscription } = req.body;` până la sfârșitul apelului `pool.query`:

```typescript
    const { subscription, language } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    const parsedLanguage = language === undefined ? 'ro' : languageSchema.safeParse(language);
    if (parsedLanguage !== 'ro' && !parsedLanguage.success) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    const subscriptionLanguage = parsedLanguage === 'ro' ? 'ro' : parsedLanguage.data;

    // Store subscription in database
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys, language, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET keys = $3, language = $4, updated_at = NOW()`,
      [userId, subscription.endpoint, JSON.stringify(subscription.keys), subscriptionLanguage]
    );
```

- [ ] **Pasul 6: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/subscribeLanguage.test.ts
```

Așteptat: PASS, 3 teste.

- [ ] **Pasul 7: Rulează întreaga suită de backend, ca să vezi că ruta veche n-a crăpat**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test
```

Așteptat: PASS pe tot, inclusiv `health.test.ts`, `hardening.test.ts` și `subscriptions.billing.test.ts`.

- [ ] **Pasul 8: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/migrations/010_notification_dispatch.sql server/src/routes/notifications.ts server/src/__tests__/subscribeLanguage.test.ts
git commit -m "Ține minte în ce limbă vorbește dispozitivul, și pune lacătul pe trimitere"
```

---

## Task 5: Dispecerul — cine primește acum, revendicare, trimitere

**Files:**
- Create: `server/src/lib/dailyDispatch.ts`
- Test: `server/src/__tests__/dailyDispatch.test.ts`

**Interfaces:**
- Consumes: `sendToSubscription`, `PushPayload`, `StoredSubscription` (Task 1); `personalDayNumber`, `parseCalendarDate` (Task 2); `buildDailyPredictionPayload`, `NotificationLanguage` (Task 3); coloanele din Task 4.
- Produces:
  - `interface DueRow { user_id: string; endpoint: string; keys: { p256dh: string; auth: string }; language: NotificationLanguage; birth_date: string }`
  - `interface DispatchTally { claimed: number; sent: number; gone: number; failed: number }`
  - `localHhMm(now: Date): string`
  - `localIsoDate(now: Date): string`
  - `dailyDedupeKey(isoDate: string): string`
  - `DUE_ROWS_SQL: string`, `USER_ROWS_SQL: string`
  - `dispatchForUser(rows: DueRow[], isoDate: string, dedupeKey: string): Promise<DispatchTally>`
  - `runDailyDispatch(now?: Date): Promise<DispatchTally>`

**Decizia asupra dublurii, argumentată.** `ecosystem.config.cjs` are `instances: 1, exec_mode: 'fork'` pentru `compass-api`, deci *azi* rulează un singur proces. Nu construim pe asta: un `pm2 restart` are, câteva secunde, două procese vii pe același minut, iar cineva care pune cândva `instances: 2` nu va citi acest plan. Lacătul e în bază, nu în proces: `INSERT ... ON CONFLICT (user_id, dedupe_key) DO NOTHING RETURNING id` — dacă nu se întoarce niciun rând, altcineva a revendicat deja; nu se trimite nimic. E atomic pe un singur `INSERT`, deci nu are nevoie nici de tranzacție explicită, nici de advisory lock.

**Decizia timerului, argumentată.** `setInterval` la 60 s, nu `node-cron`. Singurul avantaj al lui `node-cron` e alinierea la minutul de ceas, iar alinierea contează doar dacă selecția e o egalitate pe minut. A noastră nu e: `dailyPredictionTime <= ora curentă` **ȘI** `n-a primit azi`. Cu fereastra asta, un tick pierdut, un drift de câteva secunde pe oră sau un proces mort zece minute nu pierd notificarea — următorul tick o prinde. `node-cron` ar fi o dependință în plus care cumpără o proprietate de care nu depindem. `web-push` rămâne singura dependință nouă.

**De ce nu `scheduled_notifications`.** Ar cere ca cineva să scrie rândurile în avans — încă un job, încă o sursă de adevăr despre cine ce primește, și tot fără un index unic care să oprească dubla trimitere. `notification_history` cu `dedupe_key` face aceeași treabă cu un tabel mai puțin și rezolvă în același timp cerința ca `GET /history` și `GET /unread-count` să nu mai fie goale. `scheduled_notifications` rămâne pe loc, nefolosită.

**De ce comparația de ore e un `<=` pe șiruri.** `'08:00' <= '14:37'` e adevărat lexicografic pentru orice `HH:MM` cu zero în față, iar `preferencesSchema` din `routes/notifications.ts` impune deja `^([01]\d|2[0-3]):[0-5]\d$`. Nu e nevoie de cast la `time`.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `server/src/__tests__/dailyDispatch.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../db';
import { sendToSubscription } from '../lib/push';
import {
  localHhMm,
  localIsoDate,
  dailyDedupeKey,
  runDailyDispatch,
  DUE_ROWS_SQL,
} from '../lib/dailyDispatch';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/push', () => ({ sendToSubscription: vi.fn() }));

const NOW = new Date(2026, 8, 1, 8, 5, 0); // 2026-09-01, 08:05 local

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  user_id: 'u1',
  endpoint: 'https://push.example/1',
  keys: { p256dh: 'p', auth: 'a' },
  language: 'ro',
  birth_date: '1990-05-15',
  ...over,
});

const claimed = () => ({ rows: [{ id: 'h1' }], rowCount: 1 });
const alreadyClaimed = () => ({ rows: [], rowCount: 0 });

describe('ferestre de timp', () => {
  it('formatează ora locală cu zero în față', () => {
    expect(localHhMm(new Date(2026, 8, 1, 8, 5))).toBe('08:05');
    expect(localHhMm(new Date(2026, 8, 1, 23, 59))).toBe('23:59');
  });

  it('formatează ziua locală, nu cea UTC', () => {
    expect(localIsoDate(new Date(2026, 8, 1, 0, 30))).toBe('2026-09-01');
  });

  it('cheia de revendicare poartă tipul și ziua', () => {
    expect(dailyDedupeKey('2026-09-01')).toBe('daily-prediction:2026-09-01');
  });
});

describe('runDailyDispatch', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(sendToSubscription).mockReset();
    delete process.env.NOTIFICATIONS_ONLY_USER;
  });

  it('caută abonații cu ora trecută care n-au primit azi', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await runDailyDispatch(NOW);

    expect(vi.mocked(pool.query).mock.calls[0][0]).toBe(DUE_ROWS_SQL);
    expect(vi.mocked(pool.query).mock.calls[0][1]).toEqual([
      '08:05',
      null,
      'daily-prediction:2026-09-01',
    ]);
  });

  it('restrânge selecția la un singur utilizator când NOTIFICATIONS_ONLY_USER e setat', async () => {
    process.env.NOTIFICATIONS_ONLY_USER = 'u-test';
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await runDailyDispatch(NOW);

    expect(vi.mocked(pool.query).mock.calls[0][1]).toEqual([
      '08:05',
      'u-test',
      'daily-prediction:2026-09-01',
    ]);
  });

  it('revendică o dată și trimite payload-ul zilei către fiecare dispozitiv al utilizatorului', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row(), row({ endpoint: 'https://push.example/2' })], rowCount: 2 } as never)
      .mockResolvedValueOnce(claimed() as never);
    vi.mocked(sendToSubscription).mockResolvedValue('sent');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 1, sent: 2, gone: 0, failed: 0 });
    expect(sendToSubscription).toHaveBeenCalledTimes(2);
    // 1990-05-15 la 2026-09-01 e ziua personală 4.
    expect(vi.mocked(sendToSubscription).mock.calls[0][1]).toEqual({
      title: 'Energia Zilei Tale',
      body: 'O zi excelentă pentru organizare și muncă practică.',
      tag: 'daily-prediction',
      data: { type: 'daily-prediction', personalDay: 4, url: '/azi' },
    });
  });

  it('nu trimite nimic dacă revendicarea a fost luată de altcineva', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(alreadyClaimed() as never);

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 0, sent: 0, gone: 0, failed: 0 });
    expect(sendToSubscription).not.toHaveBeenCalled();
  });

  it('renunță la revendicare când niciun dispozitiv n-a primit din cauza unei erori tranzitorii', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(claimed() as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    vi.mocked(sendToSubscription).mockResolvedValue('failed');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 0, sent: 0, gone: 0, failed: 1 });
    expect(vi.mocked(pool.query).mock.calls[2]).toEqual([
      'DELETE FROM notification_history WHERE id = $1',
      ['h1'],
    ]);
  });

  it('păstrează revendicarea când singurul dispozitiv era mort — nu mai e cui trimite', async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [row()], rowCount: 1 } as never)
      .mockResolvedValueOnce(claimed() as never);
    vi.mocked(sendToSubscription).mockResolvedValue('gone');

    const tally = await runDailyDispatch(NOW);

    expect(tally).toEqual({ claimed: 1, sent: 0, gone: 1, failed: 0 });
    expect(vi.mocked(pool.query)).toHaveBeenCalledTimes(2);
  });
});
```

> Ce NU dovedește acest test: că SQL-ul din `DUE_ROWS_SQL` selectează rândurile corecte. Un `pool` mock-uit nu poate dovedi asta. Dovada e pasul de probă live din Task 9, iar aici se verifică doar că parametrii trimiși SQL-ului sunt cei corecți.

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/dailyDispatch.test.ts
```

Așteptat: FAIL, cu `Cannot find module '../lib/dailyDispatch'`.

- [ ] **Pasul 3: Scrie implementarea minimă**

Creează `server/src/lib/dailyDispatch.ts`:

```typescript
import pool from '../db';
import { sendToSubscription, type StoredSubscription } from './push';
import { personalDayNumber, parseCalendarDate } from './personalDay';
import { buildDailyPredictionPayload, type NotificationLanguage } from './dailyNotification';

/**
 * Dispecerul notificării zilnice.
 *
 * Selecția e o FEREASTRĂ, nu o egalitate pe minut: „ora ta a trecut ȘI n-ai
 * primit azi". Egalitatea pe minut -- care e ce face funcția
 * get_users_for_daily_notification din 007 -- pierde notificarea la orice
 * restart, drift sau minut sărit, și o pierde tăcut.
 *
 * Revendicarea e un INSERT ... ON CONFLICT DO NOTHING RETURNING id în
 * notification_history. Indexul unic (user_id, dedupe_key) din 010 e lacătul.
 * Dacă nu se întoarce niciun rând, altcineva trimite deja -- alt proces, sau
 * acelaşi proces la un tick anterior care încă rulează. Nu se trimite nimic.
 *
 * Ora se compară cu ceasul LOCAL al acestei mașini. dailyPredictionTime n-are
 * fus orar și nimic din schemă nu ține fusul utilizatorului. E o limitare
 * cunoscută, nu un accident.
 */

export interface DueRow {
  user_id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  language: NotificationLanguage;
  birth_date: string;
}

export interface DispatchTally {
  claimed: number;
  sent: number;
  gone: number;
  failed: number;
}

export function localHhMm(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function localIsoDate(now: Date): string {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

export function dailyDedupeKey(isoDate: string): string {
  return `daily-prediction:${isoDate}`;
}

/**
 * $1 ora locală HH:MM, $2 utilizatorul unic în modul de probă (sau NULL),
 * $3 cheia de revendicare a zilei.
 *
 * Comparația `<= $1` pe șiruri e corectă fiindcă preferencesSchema impune deja
 * HH:MM cu zero în față.
 */
export const DUE_ROWS_SQL = `
  SELECT ps.user_id, ps.endpoint, ps.keys, ps.language, up.birth_date
  FROM push_subscriptions ps
  JOIN notification_preferences np ON np.user_id = ps.user_id
  JOIN user_profiles up ON up.user_id = ps.user_id AND up.is_active = true
  WHERE (np.preferences->>'enabled')::boolean = true
    AND (np.preferences->>'dailyPrediction')::boolean = true
    AND np.preferences->>'dailyPredictionTime' <= $1
    AND ($2::uuid IS NULL OR ps.user_id = $2::uuid)
    AND NOT EXISTS (
      SELECT 1 FROM notification_history nh
      WHERE nh.user_id = ps.user_id AND nh.dedupe_key = $3
    )
`;

/** Toate dispozitivele unui utilizator, fără să întrebe de preferințe sau de oră. */
export const USER_ROWS_SQL = `
  SELECT ps.user_id, ps.endpoint, ps.keys, ps.language, up.birth_date
  FROM push_subscriptions ps
  JOIN user_profiles up ON up.user_id = ps.user_id AND up.is_active = true
  WHERE ps.user_id = $1::uuid
`;

const CLAIM_SQL = `
  INSERT INTO notification_history (user_id, notification_type, title, body, data, dedupe_key)
  VALUES ($1, 'daily-prediction', $2, $3, $4, $5)
  ON CONFLICT (user_id, dedupe_key) DO NOTHING
  RETURNING id
`;

/**
 * Trimite unui singur utilizator, pe toate dispozitivele lui.
 *
 * `rows` trebuie să fie toate ale aceluiaşi utilizator; prima e cea din care se
 * ia data nașterii, care e a profilului activ și e aceeași pe toate.
 */
export async function dispatchForUser(
  rows: DueRow[],
  isoDate: string,
  dedupeKey: string,
): Promise<DispatchTally> {
  const tally: DispatchTally = { claimed: 0, sent: 0, gone: 0, failed: 0 };
  if (rows.length === 0) return tally;

  const personalDay = personalDayNumber(
    parseCalendarDate(rows[0].birth_date),
    parseCalendarDate(isoDate),
  );
  const payload = buildDailyPredictionPayload(personalDay, rows[0].language);

  const claim = await pool.query<{ id: string }>(CLAIM_SQL, [
    rows[0].user_id,
    payload.title,
    payload.body,
    JSON.stringify(payload.data),
    dedupeKey,
  ]);

  if (claim.rowCount === 0) return tally;
  tally.claimed = 1;

  let delivered = 0;
  let failedHere = 0;

  for (const row of rows) {
    const subscription: StoredSubscription = { endpoint: row.endpoint, keys: row.keys };
    const outcome = await sendToSubscription(subscription, payload);

    if (outcome === 'sent') {
      delivered += 1;
      tally.sent += 1;
    } else if (outcome === 'gone') {
      tally.gone += 1;
    } else {
      failedHere += 1;
      tally.failed += 1;
    }
  }

  // Nimic n-a plecat și motivul e tranzitoriu: eliberăm revendicarea ca
  // tick-ul următor să reîncerce. Dacă toate dispozitivele erau moarte
  // ('gone'), revendicarea rămâne -- nu mai e cui trimite, iar o reîncercare
  // ar reface aceeași interogare la nesfârșit.
  if (delivered === 0 && failedHere > 0) {
    await pool.query('DELETE FROM notification_history WHERE id = $1', [claim.rows[0].id]);
    tally.claimed = 0;
  }

  return tally;
}

export async function runDailyDispatch(now: Date = new Date()): Promise<DispatchTally> {
  const isoDate = localIsoDate(now);
  const dedupeKey = dailyDedupeKey(isoDate);
  const onlyUser = process.env.NOTIFICATIONS_ONLY_USER || null;

  const { rows } = await pool.query<DueRow>(DUE_ROWS_SQL, [localHhMm(now), onlyUser, dedupeKey]);

  const byUser = new Map<string, DueRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  const total: DispatchTally = { claimed: 0, sent: 0, gone: 0, failed: 0 };

  for (const userRows of byUser.values()) {
    const tally = await dispatchForUser(userRows, isoDate, dedupeKey);
    total.claimed += tally.claimed;
    total.sent += tally.sent;
    total.gone += tally.gone;
    total.failed += tally.failed;
  }

  return total;
}
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/dailyDispatch.test.ts
```

Așteptat: PASS, 9 teste.

- [ ] **Pasul 5: Verifică tipurile**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run build
```

Așteptat: fără ieșire, cod 0.

- [ ] **Pasul 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/lib/dailyDispatch.ts server/src/__tests__/dailyDispatch.test.ts
git commit -m "Compune notificarea zilei și o revendică înainte să o trimită"
```

---

## Task 6: Ceasul — pornește dispecerul, în spatele comutatorului

**Files:**
- Create: `server/src/lib/notificationScheduler.ts`
- Modify: `server/src/index.ts`
- Test: `server/src/__tests__/notificationScheduler.test.ts`

**Interfaces:**
- Consumes: `configurePush` (Task 1), `runDailyDispatch` (Task 5).
- Produces: `startNotificationScheduler(): NodeJS.Timeout | null` — `null` înseamnă „nu am pornit", cu motivul în log.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `server/src/__tests__/notificationScheduler.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configurePush } from '../lib/push';
import { runDailyDispatch } from '../lib/dailyDispatch';
import { startNotificationScheduler } from '../lib/notificationScheduler';

vi.mock('../lib/push', () => ({ configurePush: vi.fn() }));
vi.mock('../lib/dailyDispatch', () => ({ runDailyDispatch: vi.fn() }));

describe('startNotificationScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(configurePush).mockReset();
    vi.mocked(runDailyDispatch).mockReset().mockResolvedValue({
      claimed: 0, sent: 0, gone: 0, failed: 0,
    });
    delete process.env.NOTIFICATIONS_ENABLED;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nu pornește dacă NOTIFICATIONS_ENABLED nu e exact "true"', () => {
    process.env.NOTIFICATIONS_ENABLED = 'yes';

    expect(startNotificationScheduler()).toBeNull();
    expect(configurePush).not.toHaveBeenCalled();
  });

  it('nu pornește dacă lipsesc cheile VAPID, chiar cu comutatorul pornit', () => {
    process.env.NOTIFICATIONS_ENABLED = 'true';
    vi.mocked(configurePush).mockReturnValue(false);

    expect(startNotificationScheduler()).toBeNull();
  });

  it('pornește și cheamă dispecerul la fiecare minut', () => {
    process.env.NOTIFICATIONS_ENABLED = 'true';
    vi.mocked(configurePush).mockReturnValue(true);

    const timer = startNotificationScheduler();
    expect(timer).not.toBeNull();

    expect(runDailyDispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(runDailyDispatch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(runDailyDispatch).toHaveBeenCalledTimes(2);

    clearInterval(timer!);
  });
});
```

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/notificationScheduler.test.ts
```

Așteptat: FAIL, cu `Cannot find module '../lib/notificationScheduler'`.

- [ ] **Pasul 3: Scrie implementarea minimă**

Creează `server/src/lib/notificationScheduler.ts`:

```typescript
import { configurePush } from './push';
import { runDailyDispatch } from './dailyDispatch';

/**
 * Ceasul.
 *
 * setInterval, nu node-cron. Singurul lucru pe care node-cron îl aduce e
 * alinierea la minutul de ceas, iar alinierea contează numai dacă selecția e o
 * egalitate pe minut. A noastră e o fereastră -- „ora ta a trecut și n-ai
 * primit azi" -- deci un tick sărit, un drift de câteva secunde sau zece
 * minute de proces mort nu pierd nimic: următorul tick prinde.
 *
 * Două comutatoare, amândouă implicit închise:
 *   NOTIFICATIONS_ENABLED='true'  -- fără el, dispecerul nici nu pornește
 *   NOTIFICATIONS_ONLY_USER=<uuid> -- restrânge trimiterea la un singur cont
 *
 * O notificare zilnică trimisă greșit ajunge la toți deodată și nu se poate
 * retrage. De asta prima rulare reală se face cu ONLY_USER setat.
 */

const TICK_MS = 60_000;

export function startNotificationScheduler(): NodeJS.Timeout | null {
  if (process.env.NOTIFICATIONS_ENABLED !== 'true') {
    console.log('[notifications] dispecerul e oprit (NOTIFICATIONS_ENABLED nu e "true")');
    return null;
  }

  if (!configurePush()) {
    console.error(
      '[notifications] dispecerul NU a pornit: lipsesc VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT',
    );
    return null;
  }

  const onlyUser = process.env.NOTIFICATIONS_ONLY_USER;
  console.log(
    onlyUser
      ? `[notifications] dispecerul pornit, DOAR pentru ${onlyUser}`
      : '[notifications] dispecerul pornit, pentru toți abonații',
  );

  const timer = setInterval(() => {
    runDailyDispatch()
      .then((tally) => {
        if (tally.claimed > 0 || tally.failed > 0 || tally.gone > 0) {
          console.log('[notifications] dispecerat', tally);
        }
      })
      .catch((error) => console.error('[notifications] dispecerarea a eșuat', error));
  }, TICK_MS);

  // Listener-ul HTTP e ce ține procesul viu. Timerul nu trebuie să adauge un al
  // doilea motiv de a nu se închide.
  timer.unref();

  return timer;
}
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/notificationScheduler.test.ts
```

Așteptat: PASS, 3 teste.

- [ ] **Pasul 5: Cheamă dispecerul la pornirea serverului**

Înlocuiește conținutul lui `server/src/index.ts`:

```typescript
import app from './app';
import { startNotificationScheduler } from './lib/notificationScheduler';

const PORT = Number(process.env.PORT) || 3001;

// Start server
// Bound to loopback: the Cloudflare Tunnel connects from this machine, so the
// API never needs to be reachable on the LAN.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);

  // Nu pornește nimic dacă NOTIFICATIONS_ENABLED nu e 'true'. Tipărește motivul
  // în oricare din cazuri, ca `pm2 logs compass-api` să spună de ce tace.
  startNotificationScheduler();
});
```

- [ ] **Pasul 6: Verifică pe viu că procesul pornește și tace**

```bash
cd /Users/victorsafta/work/numerology-compass/server && NOTIFICATIONS_ENABLED= npx ts-node src/index.ts &
sleep 3 && curl -s http://localhost:3001/api/health && kill %1
```

Așteptat: în log apare `[notifications] dispecerul e oprit (NOTIFICATIONS_ENABLED nu e "true")`, iar `curl` întoarce `{"status":"ok",...}`.

- [ ] **Pasul 7: Rulează suita întreagă și compilează**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test && npm run build
```

Așteptat: PASS pe tot, build fără ieșire.

- [ ] **Pasul 8: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/lib/notificationScheduler.ts server/src/index.ts server/src/__tests__/notificationScheduler.test.ts
git commit -m "Pornește ceasul care trimite, dar numai când i se spune explicit"
```

---

## Task 7: Proba — un endpoint care trimite acum, doar pentru admin

**Files:**
- Modify: `server/src/routes/notifications.ts`
- Test: `server/src/__tests__/testSend.test.ts`

**Interfaces:**
- Consumes: `USER_ROWS_SQL`, `dispatchForUser`, `localIsoDate`, `DueRow` (Task 5); `configurePush` (Task 1); `authenticateToken`, `requireAdmin` din `server/src/middleware/auth`.
- Produces: `POST /api/notifications/test-send` → `200 { success: true, tally: DispatchTally }`, sau `403` fără admin, sau `503` fără chei VAPID.

**De ce e nevoie de el:** e singurul mod de a dovedi că un push ajunge pe un dispozitiv real fără să aștepți ora setată și fără să atingi pe altcineva. Cheia de revendicare e `test:<timestamp>`, deci poate fi rulat de câte ori vrei fără să consume revendicarea zilnică — dar rândul din `notification_history` rămâne, ceea ce e și dovada că scrierea în istoric funcționează.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `server/src/__tests__/testSend.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import pool from '../db';
import { configurePush } from '../lib/push';
import { dispatchForUser, USER_ROWS_SQL } from '../lib/dailyDispatch';

vi.mock('../db', () => ({ default: { query: vi.fn() } }));
vi.mock('../lib/push', () => ({ configurePush: vi.fn() }));
vi.mock('../lib/dailyDispatch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/dailyDispatch')>();
  return { ...actual, dispatchForUser: vi.fn() };
});

const ADMIN_ID = '00000000-0000-0000-0000-0000000000ad';
const token = jwt.sign(
  { userId: ADMIN_ID, email: 'admin@test.local', role: 'admin' },
  process.env.JWT_SECRET!,
);

const asAdmin = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as never);
const asUser = () =>
  vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ role: 'user' }], rowCount: 1 } as never);

describe('POST /api/notifications/test-send', () => {
  beforeEach(() => {
    vi.mocked(pool.query).mockReset();
    vi.mocked(configurePush).mockReset().mockReturnValue(true);
    vi.mocked(dispatchForUser).mockReset().mockResolvedValue({
      claimed: 1, sent: 1, gone: 0, failed: 0,
    });
  });

  it('cere un token', async () => {
    const response = await request(app).post('/api/notifications/test-send');
    expect(response.status).toBe(401);
  });

  it('refuză un cont care nu e admin', async () => {
    asUser();
    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });

  it('răspunde 503 dacă lipsesc cheile VAPID, în loc să pretindă că a trimis', async () => {
    asAdmin();
    vi.mocked(configurePush).mockReturnValue(false);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(503);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });

  it('trimite către propriile dispozitive, cu o cheie de revendicare de test', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{
        user_id: ADMIN_ID,
        endpoint: 'https://push.example/1',
        keys: { p256dh: 'p', auth: 'a' },
        language: 'ro',
        birth_date: '1990-05-15',
      }],
      rowCount: 1,
    } as never);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tally).toEqual({ claimed: 1, sent: 1, gone: 0, failed: 0 });

    expect(vi.mocked(pool.query).mock.calls[1][0]).toBe(USER_ROWS_SQL);
    expect(vi.mocked(pool.query).mock.calls[1][1]).toEqual([ADMIN_ID]);

    const dedupeKey = vi.mocked(dispatchForUser).mock.calls[0][2];
    expect(dedupeKey.startsWith('test:')).toBe(true);
  });

  it('răspunde 404 dacă adminul n-are niciun dispozitiv abonat', async () => {
    asAdmin();
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    const response = await request(app)
      .post('/api/notifications/test-send')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(dispatchForUser).not.toHaveBeenCalled();
  });
});
```

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/testSend.test.ts
```

Așteptat: FAIL — toate cu `expected 404 to be ...`, fiindcă ruta nu există.

- [ ] **Pasul 3: Scrie implementarea minimă**

În `server/src/routes/notifications.ts`, schimbă importul de middleware și adaugă importurile noi la începutul fișierului:

```typescript
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { configurePush } from '../lib/push';
import { USER_ROWS_SQL, dispatchForUser, localIsoDate, type DueRow } from '../lib/dailyDispatch';
```

Apoi adaugă ruta imediat înainte de `export default router;`:

```typescript
/**
 * Proba.
 *
 * Trimite notificarea zilei de azi către propriile dispozitive ale adminului
 * care cheamă, ignorând ora și preferințele. Cheia de revendicare e
 * `test:<timestamp>`, deci nu consumă revendicarea zilnică și poate fi rulată
 * de câte ori e nevoie.
 *
 * Există fiindcă o notificare zilnică trimisă greșit ajunge la toți deodată și
 * nu se poate retrage: singurul mod cinstit de a dovedi lanțul e să-l parcurgi
 * o dată, către un dispozitiv al tău.
 */
router.post('/test-send', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    if (!configurePush()) {
      return res.status(503).json({ error: 'Push is not configured (VAPID keys missing)' });
    }

    const { rows } = await pool.query<DueRow>(USER_ROWS_SQL, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No push subscription with an active profile for this user' });
    }

    const now = new Date();
    const tally = await dispatchForUser(rows, localIsoDate(now), `test:${now.toISOString()}`);

    res.json({ success: true, tally });
  } catch (error: unknown) {
    console.error('Test send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to send test notification',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test -- src/__tests__/testSend.test.ts
```

Așteptat: PASS, 5 teste.

- [ ] **Pasul 5: Rulează suita întreagă și compilează**

```bash
cd /Users/victorsafta/work/numerology-compass/server && npm run test && npm run build
```

Așteptat: PASS pe tot, build fără ieșire.

- [ ] **Pasul 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add server/src/routes/notifications.ts server/src/__tests__/testSend.test.ts
git commit -m "Dă-mi un buton prin care să văd notificarea înainte s-o vadă toți"
```

---

## Task 8: Clientul — preferințele ajung la server, și limba odată cu abonarea

**Files:**
- Modify: `src/hooks/useNotifications.ts`
- Test: `src/hooks/__tests__/useNotifications.preferences.test.tsx`

**Interfaces:**
- Consumes: `API_BASE` din `@/lib/apiBase`; `PUT /api/notifications/preferences` (existent, cere obiectul complet, validat cu `zod .strict()`); `POST /api/notifications/subscribe` cu `language` (Task 4).
- Produces: nimic nou pentru alte task-uri. Contractul public al hook-ului (`UseNotificationsReturn`) rămâne neschimbat.

**Golul, verificat în cod:** `updatePreferences` din `src/hooks/useNotifications.ts` scrie doar în `localStorage`, prin `saveNotificationPreferences`. Serverul nu află niciodată nimic, deci rândul din `notification_preferences` nu se creează niciodată, deci `preferences->>'enabled'` rămâne `false`, deci `DUE_ROWS_SQL` nu întoarce nimic — oricât de corect ar fi dispecerul. Componenta `NotificationSettings` și restul hook-ului sunt corecte și nu se ating: se conectează, nu se rescriu.

- [ ] **Pasul 1: Scrie testul care pică**

Creează `src/hooks/__tests__/useNotifications.preferences.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Preferințele trăiau numai în localStorage, deci rândul din
 * notification_preferences nu se crea niciodată și `enabled` rămânea false pe
 * server -- adică dispecerul zilnic nu găsea pe nimeni, oricât de corect ar fi
 * fost. Testul ăsta e capătul dinspre client al aceleiași bucle.
 */

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const preferencePuts = () =>
  vi.mocked(global.fetch).mock.calls.filter(([url, init]) =>
    String(url).endsWith('/notifications/preferences') && (init as RequestInit)?.method === 'PUT',
  );

describe('useNotifications — preferințele merg la server', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', 'token-de-test');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as never;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trimite obiectul complet de preferințe, nu doar câmpul schimbat', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(preferencePuts().length).toBeGreaterThan(0));

    act(() => {
      result.current.updatePreferences({ dailyPredictionTime: '07:30' });
    });

    await waitFor(() => {
      const last = preferencePuts().at(-1)!;
      const body = JSON.parse((last[1] as RequestInit).body as string);
      expect(body.preferences.dailyPredictionTime).toBe('07:30');
      // Schema serverului e .strict() și cere toate cele șapte câmpuri.
      expect(Object.keys(body.preferences).sort()).toEqual([
        'achievements',
        'dailyPrediction',
        'dailyPredictionTime',
        'enabled',
        'specialDates',
        'streakReminder',
        'streakReminderTime',
      ]);
    });
  });

  it('trimite tokenul de autentificare, altfel serverul nu știe al cui e rândul', async () => {
    renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      const headers = (preferencePuts().at(-1)![1] as RequestInit).headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer token-de-test');
    });
  });

  it('nu cheamă serverul dacă nu există niciun token', async () => {
    localStorage.removeItem('auth_token');

    renderHook(() => useNotifications(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(preferencePuts()).toHaveLength(0);
  });
});
```

- [ ] **Pasul 2: Rulează testul ca să vezi că pică**

```bash
cd /Users/victorsafta/work/numerology-compass && npm run test:run -- src/hooks/__tests__/useNotifications.preferences.test.tsx
```

Așteptat: FAIL — primele două expiră în `waitFor`, fiindcă niciun PUT nu pleacă vreodată.

- [ ] **Pasul 3: Scrie implementarea minimă**

În `src/hooks/useNotifications.ts`, adaugă funcția de trimitere imediat după blocul de importuri, înainte de `interface UseNotificationsReturn`:

```typescript
/**
 * Preferințele trăiau numai în localStorage. Serverul nu afla niciodată nimic,
 * deci rândul din notification_preferences nu se crea, deci
 * preferences->>'enabled' rămânea false și dispecerul zilnic nu găsea pe nimeni.
 *
 * PUT-ul cere obiectul întreg: schema din server/src/routes/notifications.ts e
 * un zod .strict() cu toate cele șapte câmpuri.
 */
const pushPreferencesToServer = async (preferences: NotificationPreferences): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
    });
  } catch {
    console.warn('Failed to save notification preferences to server');
  }
};
```

Apoi, imediat după `const updatePreferences = useCallback(...)`, adaugă efectul care le sincronizează:

```typescript
  // Un PUT per obiect de preferințe așezat, inclusiv cel de la montare -- acela
  // e ce creează rândul pe server pentru un cont care n-a avut niciodată unul.
  // PUT-ul e idempotent, deci o repetare nu costă nimic.
  useEffect(() => {
    void pushPreferencesToServer(preferences);
  }, [preferences]);
```

Și în `subscribe`, adaugă limba la corpul cererii:

```typescript
            body: JSON.stringify({ subscription: subscription.toJSON(), language }),
```

Adaugă `language` în lista de dependențe a lui `subscribe`:

```typescript
  }, [swRegistration, language]);
```

- [ ] **Pasul 4: Rulează testul ca să vezi că trece**

```bash
cd /Users/victorsafta/work/numerology-compass && npm run test:run -- src/hooks/__tests__/useNotifications.preferences.test.tsx
```

Așteptat: PASS, 3 teste.

- [ ] **Pasul 5: Verifică tipurile și lint-ul**

```bash
cd /Users/victorsafta/work/numerology-compass && npm run typecheck && npm run lint
```

Așteptat: amândouă curate. `react-hooks/exhaustive-deps` trebuie să tacă — dacă se plânge de `updatePreferences` în `subscribe`/`unsubscribe`, e o avertizare preexistentă, nu una introdusă aici; verifică cu `git stash` dacă apărea și înainte.

- [ ] **Pasul 6: Rulează întreaga suită de frontend**

```bash
cd /Users/victorsafta/work/numerology-compass && npm run test:run
```

Așteptat: PASS pe tot, inclusiv `design-tokens.test.ts` și cele 78 de aserțiuni ale motorului.

- [ ] **Pasul 7: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add src/hooks/useNotifications.ts src/hooks/__tests__/useNotifications.preferences.test.tsx
git commit -m "Spune-i serverului ce oră ai ales, altfel nu are cui trimite"
```

---

## Task 9: Prima trimitere reală — modul de probă, apoi deschiderea

**Files:**
- Modify: `DEPLOY.md`
- Modify: `ecosystem.config.cjs` (doar comentariu)
- Modify: `server/src/routes/notifications.ts` — nimic (rămâne ca la Task 7)

**Interfaces:**
- Consumes: tot ce s-a construit în Task 1–8.
- Produces: nimic în cod. Produce dovada.

- [ ] **Pasul 1: Scrie în `DEPLOY.md` cheile noi de mediu**

În tabelul din secțiunea „## Mediu", după rândul `AI_PROVIDER`, adaugă:

```markdown
| `VAPID_PUBLIC_KEY` | notificările push nu pleacă; dispecerul refuză să pornească și spune de ce |
| `VAPID_PRIVATE_KEY` | idem — perechea se generează cu `npx web-push generate-vapid-keys --json` |
| `VAPID_SUBJECT` | idem; un `mailto:` care identifică operatorul către serverul de push |
| `NOTIFICATIONS_ENABLED` | dispecerul zilnic nu pornește deloc. Implicit închis. |
| `NOTIFICATIONS_ONLY_USER` | dispecerul trimite tuturor abonaților. Setat pe un UUID, trimite doar acelui cont. |
```

Și după paragraful care spune „Ultimele două sunt închise în producție", adaugă:

```markdown
`VITE_VAPID_PUBLIC_KEY` trăiește în `.env.local` la rădăcină și trebuie să fie
identică cu `VAPID_PUBLIC_KEY`. Cheia privată nu părăsește `server/.env`: dacă
ajunge în bundle, oricine poate semna push-uri către utilizatorii noștri.
```

- [ ] **Pasul 2: Scrie runbook-ul de probă în `DEPLOY.md`**

Adaugă o secțiune nouă, imediat înainte de „## Verificare după deploy":

```markdown
## Prima trimitere de notificări

O notificare zilnică trimisă greșit ajunge la toți abonații deodată și nu se
poate retrage. Ordinea de mai jos există ca să nu se întâmple asta.

**1. Deploy cu dispecerul închis.** `NOTIFICATIONS_ENABLED` lipsește sau e pe
`false`. După `pm2 restart compass-api`, în log trebuie să apară:

```
[notifications] dispecerul e oprit (NOTIFICATIONS_ENABLED nu e "true")
```

**2. Abonează-te tu.** În browser, pe `/eu`, activează notificările. Verifică în
bază că au ajuns și subscripția, și preferințele:

```bash
psql -p 5433 -d numerology_compass -c \
  "SELECT user_id, language, left(endpoint, 40) FROM push_subscriptions;" -c \
  "SELECT user_id, preferences FROM notification_preferences;"
```

Un rând în fiecare, cu `enabled: true`. Dacă `notification_preferences` e goală,
clientul n-a trimis PUT-ul — nu merge mai departe.

**3. Trimite-ți ție.** Cu un token de admin:

```bash
curl -s -X POST https://compass.oneaigency.com/api/notifications/test-send \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Așteptat: `{"success":true,"tally":{"claimed":1,"sent":1,"gone":0,"failed":0}}`
**și** notificarea apare pe dispozitiv. `sent: 0` cu `failed: 1` înseamnă chei
VAPID greșite; `gone: 1` înseamnă că subscripția era deja moartă — reabonează-te.

Click pe notificare trebuie să deschidă `/azi`.

**4. Deschide dispecerul, pentru un singur cont.** În `server/.env`:

```
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_ONLY_USER=<uuid-ul tău>
```

`pm2 restart compass-api`. În log:

```
[notifications] dispecerul pornit, DOAR pentru <uuid>
```

Pune-ți ora de predicție cu două minute în viitor și așteaptă. Când sosește:

```bash
psql -p 5433 -d numerology_compass -c \
  "SELECT notification_type, title, dedupe_key, sent_at FROM notification_history ORDER BY sent_at DESC LIMIT 3;"
```

Un singur rând cu `dedupe_key = 'daily-prediction:<azi>'`. **Un singur rând** e
jumătatea care contează: dispecerul a mai bătut de zeci de ori între timp și n-a
trimis a doua oară.

**5. Deschide pentru toți.** Scoate `NOTIFICATIONS_ONLY_USER` din `server/.env`,
`pm2 restart compass-api`, confirmă în log `pentru toți abonații`. Din acest
moment orice greșeală de text pleacă la toată lumea; orice modificare la
`server/src/lib/dailyNotification.ts` se reface prin pașii 3 și 4 înainte de 5.
```

- [ ] **Pasul 3: Notează în `ecosystem.config.cjs` de ce `instances: 1` nu mai e o ipoteză portantă**

În blocul aplicației `compass-api`, deasupra liniei `instances: 1`, adaugă:

```javascript
      // instances: 1 nu mai e o presupunere pe care se sprijină corectitudinea.
      // Dispecerul de notificări revendică fiecare trimitere printr-un
      // INSERT ... ON CONFLICT DO NOTHING pe indexul unic
      // (user_id, dedupe_key) din migrația 010, deci două procese nu pot
      // trimite aceeași notificare de două ori. Ceea ce e bine, fiindcă
      // `pm2 restart` are exact asta, câteva secunde.
```

- [ ] **Pasul 4: Verifică documentația împotriva codului**

```bash
cd /Users/victorsafta/work/numerology-compass && grep -c "VAPID_PRIVATE_KEY\|NOTIFICATIONS_ONLY_USER\|NOTIFICATIONS_ENABLED" DEPLOY.md
cd /Users/victorsafta/work/numerology-compass/server && grep -rn "process.env.VAPID\|process.env.NOTIFICATIONS" src/lib/
```

Așteptat: fiecare variabilă citită în `src/lib/` apare în `DEPLOY.md`. Cinci variabile în cod, cinci în tabel.

- [ ] **Pasul 5: Rulează tot, de la capăt, în ambele proiecte**

```bash
cd /Users/victorsafta/work/numerology-compass && npm run test:run && npm run typecheck && npm run lint
cd /Users/victorsafta/work/numerology-compass/server && npm run test && npm run build
```

Așteptat: totul verde. Asta e verificarea care închide planul; până la ea, lucrarea e scrisă, nu terminată.

- [ ] **Pasul 6: Commit**

```bash
cd /Users/victorsafta/work/numerology-compass
git add DEPLOY.md ecosystem.config.cjs
git commit -m "Scrie cum se deschide robinetul, în ordinea în care nu strică nimic"
```

- [ ] **Pasul 7: Execută runbook-ul, pașii 1–4**

Urmează secțiunea „Prima trimitere de notificări" din `DEPLOY.md`, pașii 1 până la 4 inclusiv. **Nu executa pasul 5** fără să confirmi cu Victor: de acolo încolo, notificările pleacă la toți.

Dovada care se raportează: ieșirea lui `curl` de la pasul 3, faptul că notificarea a apărut pe dispozitiv, și rândul unic din `notification_history` de la pasul 4.

---

## Autoevaluare

**Acoperirea cerințelor.**

| Cerință | Task |
|---|---|
| Chei VAPID: generare, mediu, ajungerea publicului la client | 1 (pasul 2), 9 (pașii 1–2) |
| `web-push` ca dependință + modul subțire cu 410/404 | 1 |
| Scheduler cu decizia `setInterval` vs `node-cron` argumentată | 5 (argumentul), 6 (codul) |
| Trimitere dublă tratată explicit | 4 (indexul unic), 5 (revendicarea), 9 (comentariul din ecosystem) |
| Scriere în `notification_history` | 5 (revendicarea *este* scrierea) |
| Client: permisiune, `pushManager.subscribe`, POST `/subscribe` | existente, verificate în `src/hooks/useNotifications.ts`; golul real (preferințele nu ajungeau la server) e Task 8 |
| Teste pe compunerea payload-ului | 3 |
| Teste pe „cine primește la ora asta" | 5 (parametrii selecției; limita e notată explicit) |
| Test că o subscripție expirată e ștearsă | 1 |
| Fără apeluri de rețea reale | `vi.mock('web-push', ...)` în fiecare test care îl atinge |
| Mod de probă înainte de prima rulare reală | 6 (comutatoarele), 7 (endpoint-ul), 9 (runbook-ul) |
| Pas de verificare care dovedește că a ajuns | 9, pasul 7 |

**Riscul rămas, spus pe față.** `DUE_ROWS_SQL` nu e dovedit de niciun test — un `pool` mock-uit nu poate dovedi ce selectează Postgres. Singura lui dovadă e pasul 4 din runbook. De asta pasul acela e obligatoriu și nu se sare.

**Ce s-a lăsat deoparte, deliberat.** Reminder-ul de streak (`streakReminderTime` există în preferințe și nimeni nu-l citește), notificările de dată specială, fusul orar per utilizator, și `scheduled_notifications`. Fiecare e o lucrare separată, cu propriul plan. Predicția zilnică e cea care închide bucla; celelalte se adaugă pe același schelet, cu altă cheie de revendicare.
