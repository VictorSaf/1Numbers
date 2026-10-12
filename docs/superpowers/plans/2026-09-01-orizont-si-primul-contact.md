# Orizontul zilnic și primul contact — Plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Două livrabile înrudite, fiecare livrabil independent: (1) pe `/azi`, prognoza zilnică se poate citi pentru orice zi din ±90, nu doar pentru ziua curentă, iar conținutul unei zile se expune ca o funcție cu semnătură fixă pe care planul de notificări o poate consuma; (2) pe `/`, vizitatorul anonim află în două propoziții ce primește și poate ajunge la o hartă reală într-un singur clic, fără să scrie nimic și fără cont.

**Architecture:** Livrabilul 1 adaugă trei module pure mici (`dayHorizon.ts` — aritmetica orizontului; `dayContent.ts` — compunerea zilei din patru numere plus copie trilingvă; `use-selected-day.ts` — ziua aleasă trăiește în adresa paginii, ca `?zi=YYYY-MM-DD`) și o componentă de navigare, apoi deconectează `Predictions.tsx` de la `new Date()`. Motorul nu se atinge: `getDailyPrediction(birthDate, date)` primea deja data ca parametru. Livrabilul 2 nu adaugă nicio rută, niciun modal, niciun tur — o componentă cu două propoziții și un buton care umple formularul cu un exemplu fix și calculează.

**Tech Stack:** React 18 + TypeScript, Vite 6 (SWC), React Router 6, Tailwind + shadcn/ui, date-fns 3, Vitest 4 + Testing Library.

**Spec:** nu există un document de spec separat. Diagnosticul verificat în cod și deciziile de proiectare sunt în secțiunile „Diagnostic" și „Decizie" ale fiecărui livrabil de mai jos; planul argumentează din ele și le duce cu el.

## Global Constraints

- Repo: /Users/victorsafta/work/numerology-compass, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Migrații: `server/src/migrations/NNN_nume.sql`, nereplayable, niciodată editate retroactiv. Ultima existentă e `009_premium_features.sql`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = `routes.json` ȘI `PAGES` din `src/App.tsx`. Rutele existente: `/` `/doi` `/azi` `/unelte` `/invata` `/chaldean` `/remedies` `/auth` `/eu` `/jurnal` `/cercul-meu` `/raport` `/invite/:code`.
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră, etichetă sau coordonată; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY: 78 de aserțiuni trec.
- Data curentă în teste se fixează întotdeauna; un test care folosește `new Date()` fără argument devine vacuu peste un an.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA. NU folosi prefixe conventional-commits.

**Notă asupra regulii i18n, asumată:** copia *pe număr* (ce înseamnă o zi 4) stă deja lângă motor, nu în `translations.ts` — `PERSONAL_CYCLE_MEANINGS` din `src/lib/personalCycles.ts:59` e un obiect `{ ro, en, ru }` pentru fiecare din cele 9 numere. Tabelul nou de sfaturi zilnice (Task 2) urmează acel precedent și stă în `src/lib/dayContent.ts`, cu un test propriu care verifică prezența tuturor celor trei limbi pentru toate cele 9 numere. Textul de *interfață* (etichete de butoane, titluri de coloană) merge în `translations.ts`, unde îl protejează testul de paritate existent `src/lib/__tests__/translations.test.ts`.

---

## File Structure

**Create:**

| Fișier | Responsabilitate |
|---|---|
| `src/lib/dayHorizon.ts` | Aritmetica orizontului: cât de departe se poate merge, mutarea cu o zi, încadrarea unei date cerute. Fără React, fără copie. |
| `src/lib/__tests__/dayHorizon.test.ts` | Marginile orizontului, cu date fixe. |
| `src/lib/dayContent.ts` | Conținutul unei zile: cele patru numere + copia trilingvă. Singura funcție pe care o consumă și interfața, și planul de notificări. |
| `src/lib/__tests__/dayContent.test.ts` | Valorile compuse pentru o naștere și o zi fixate; paritatea celor trei limbi. |
| `src/hooks/use-selected-day.ts` | Ziua aleasă citită din și scrisă în `?zi=YYYY-MM-DD`. |
| `src/hooks/__tests__/use-selected-day.test.tsx` | Parametru valid, invalid, în afara orizontului, ștergerea lui la revenirea pe azi. |
| `src/components/predictions/DayNavigator.tsx` | Butoanele înainte/înapoi, data citită de om, întoarcerea la azi. |
| `src/components/predictions/__tests__/DayNavigator.test.tsx` | Cele trei gesturi, marginile, absența unei animații de care depinde vizibilitatea. |
| `src/components/FirstVisitPromise.tsx` | Cele două propoziții de deasupra formularului și intrarea către harta-exemplu. |
| `src/components/__tests__/FirstVisitPromise.test.tsx` | Textul în cele trei limbi, butonul, absența oricărei cereri de cont. |
| `src/lib/__tests__/first-contact.test.ts` | Invariantul: drumul anonim până la prima hartă nu cere cont. Scanare de sursă, ca `navigation.test.ts`. |

**Modify:**

| Fișier | Ce se schimbă |
|---|---|
| `src/lib/translations.ts` | Două secțiuni noi în fiecare din cele trei limbi: `today` (chrome-ul navigării pe zile) și `firstVisit` (promisiunea de pe pagina de start). |
| `src/pages/Predictions.tsx` | `const today = new Date()` (linia 59) încetează să fie și ziua citită; tabul zilnic primește `selectedDay`. |
| `src/pages/Index.tsx` | `FirstVisitPromise` deasupra formularului, pe ramura anonimă. |

**Neatins, deliberat:** `src/lib/predictions.ts`, `src/lib/personalCycles.ts`, `src/lib/numerology-plus/**`, `src/components/DailyPredictionCard.tsx`, `src/components/numerology/SaveMapButton.tsx`, `src/index.css`, `src/data/routes.json`, `src/App.tsx`.

---

# LIVRABILUL 1 — Orizontul zilnic

## Diagnostic (verificat în cod, 2026-09-01)

**Observat:**

- `src/pages/Predictions.tsx:47-48` ține `selectedMonth` și `selectedYear` ca stare — prognoza **lunară** se poate deci alege înainte și înapoi.
- `src/pages/Predictions.tsx:59` este `const today = new Date();`. La linia 147, `getDailyPrediction(birthDate, today)`; la linia 225, `<DailyPredictionCard ... date={today} />`. Prognoza **zilnică** e legată de ziua curentă și nu există niciun gest care s-o mute.
- `src/lib/predictions.ts:200` este `export const getDailyPrediction = (birthDate: Date, date: Date = new Date()): DailyPrediction`. Data e deja parametru. La fel `getDayRecommendations` (linia 246) și `getUniversalDayEnergy` (linia 230). `getFavorableDays` (linia 869) primește deja un interval `startDate`/`endDate`. **Motorul e gata; problema e strict în interfață.**
- `src/lib/numerology-plus/pythagorean.ts:176-185` — comentariul spune „Master NU se păstrează" și toate cele trei funcții cheamă `result(..., false)`. Deci ziua personală e mereu 1–9 și indexarea într-un tabel cu chei 1..9 nu poate da `undefined`.
- `src/lib/personalCycles.ts:59-188` — `PERSONAL_CYCLE_MEANINGS` are chei 1..9, fiecare cu `keywords` și `dayMeaning` complete în ro/en/ru.
- `src/lib/predictions.ts:40-198` — `dailyPredictionsData` are `advice`, `challenges`, `opportunities` **doar în engleză**, iar `Predictions.tsx:249,255,259` le pune direct pe ecran. Într-o interfață românească asta e engleză pe ecran.
- `src/lib/notifications.ts:166` — `generateDailyPredictionNotification(personalDay, language)` există deja, cu corpuri ro/en/ru pe număr, și trimite `url: '/azi'`. E consumatorul pe care planul de notificări îl va lega de funcția nouă.
- `useSearchParams` e deja folosit în `src/pages/Learn.tsx:75` și `src/pages/Tools.tsx:33` — parametrii de adresă sunt o convenție existentă a proiectului, nu una nouă.

**Reported (nu verificat de mine, luat din briefing):** aplicația World Numerology a lui Hans Decoz oferă prognoza zilnică cu până la trei luni înainte și o compune din mai mulți factori, nu dintr-o singură cifră redusă.

## Decizie 1 — orizontul e ±90 de zile, simetric

Argumentul, în patru puncte:

1. **Înainte, 90 de zile, pentru că atât dă referința.** Trei luni în față e exact ce oferă concurentul de referință. Dacă asta e distanța la care oamenii aleg deja produse din categoria asta, nu e nimic de inventat.
2. **Înapoi, tot 90, pentru un motiv al nostru, nu al lui.** `/jurnal` există. Cine scrie despre o zi trăită are nevoie să vadă numerele acelei zile. Retrospectiva nu e o copie a concurentului; e o nevoie pe care produsul nostru și-o creează singur.
3. **Simetric, pentru că o constantă e mai ieftin de ținut minte decât două**, și pentru că nu am niciun argument care să facă o direcție mai lungă decât cealaltă.
4. **Mărginit, nu infinit — și mărginirea e despre onestitate, nu despre performanță.** `getDayContent` e patru reduceri și două căutări în tabel; 181 de zile nu costă nimic. Dar un buton „înainte" fără capăt nu are stare dezactivată onestă, iar o prognoză pe un an în față e o afirmație pe care n-o putem susține într-o aplicație care îi spune omului ce să facă azi. 90 e o margine reală: parametrul `?zi=` se poate valida, iar butonul se poate dezactiva la capăt.

## Decizie 2 — ziua aleasă trăiește în adresă, nu doar în stare

`?zi=YYYY-MM-DD` pe `/azi`. Motive: butonul „înapoi" al browserului funcționează; o zi se poate trimite cuiva sau pune la favorite; iar când planul de notificări va deschide o notificare, are unde s-o ducă (`/azi?zi=2026-11-14`) fără să inventeze nimic. Formatul e `YYYY-MM-DD` pentru că `src/lib/calendarDate.ts` e deja singurul loc unde un `YYYY-MM-DD` devine `Date`, și el evită capcana de fus orar documentată acolo. Ruta `/azi` nu se schimbă — un query param nu e o rută, deci `routes.json` și `App.tsx` rămân neatinse.

## Decizie 3 — interfața pe care o expunem planului de notificări

O singură funcție, pură, fără React, fără DOM:

```ts
export const getDayContent = (
  birthDate: Date,
  date: Date,
  language: Language,
): DayContent;
```

Întoarce cele patru numere care compun ziua (personal day, personal month, personal year, universal day — răspunsul la observația că o zi nu e o singură cifră redusă) plus copia deja trilingvă, plus orele. Planul de notificări cheamă `getDayContent(birthDate, new Date(), language)` și are din prima titlu, corp și adresă de deschidere, fără să dubleze nimic. Câmpurile englezești din `dailyPredictionsData` (`challenges`, `opportunities`) **nu** intră în contract: n-au traduceri, iar un contract nu se deschide cu o datorie.

---

### Task 1: Aritmetica orizontului

**Files:**
- Create: `src/lib/dayHorizon.ts`
- Test: `src/lib/__tests__/dayHorizon.test.ts`

**Interfaces:**
- Consumes: nimic din task-urile anterioare.
- Produces:
  - `export const DAY_HORIZON_DAYS = 90;`
  - `export const shiftDay = (date: Date, delta: number): Date`
  - `export const isWithinHorizon = (date: Date, today: Date): boolean`
  - `export const clampToHorizon = (date: Date, today: Date): Date`

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/dayHorizon.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DAY_HORIZON_DAYS, shiftDay, isWithinHorizon, clampToHorizon } from "../dayHorizon";
import { formatCalendarDate } from "../calendarDate";

/**
 * Orizontul e o margine, nu o sugestie.
 *
 * Un buton "înainte" fără capăt nu are stare dezactivată onestă, iar un
 * `?zi=` venit din afară poate cere orice. Ambele au nevoie de aceeași
 * aritmetică, într-un singur loc.
 *
 * Toate datele sunt fixe: `new Date()` fără argument face testul vacuu peste
 * un an.
 */

const TODAY = new Date(2026, 8, 1); // 1 septembrie 2026

describe("shiftDay", () => {
  it("mută o zi înainte", () => {
    expect(formatCalendarDate(shiftDay(TODAY, 1))).toBe("2026-09-02");
  });

  it("mută o zi înapoi", () => {
    expect(formatCalendarDate(shiftDay(TODAY, -1))).toBe("2026-08-31");
  });

  it("trece peste capătul lunii fără să se piardă", () => {
    expect(formatCalendarDate(shiftDay(new Date(2026, 0, 31), 1))).toBe("2026-02-01");
  });

  it("nu modifică data primită", () => {
    const original = new Date(2026, 8, 1);
    shiftDay(original, 30);
    expect(formatCalendarDate(original)).toBe("2026-09-01");
  });
});

describe("isWithinHorizon", () => {
  it("acceptă ziua curentă", () => {
    expect(isWithinHorizon(TODAY, TODAY)).toBe(true);
  });

  it("acceptă exact marginea din față", () => {
    expect(isWithinHorizon(shiftDay(TODAY, DAY_HORIZON_DAYS), TODAY)).toBe(true);
  });

  it("acceptă exact marginea din spate", () => {
    expect(isWithinHorizon(shiftDay(TODAY, -DAY_HORIZON_DAYS), TODAY)).toBe(true);
  });

  it("refuză o zi peste marginea din față", () => {
    expect(isWithinHorizon(shiftDay(TODAY, DAY_HORIZON_DAYS + 1), TODAY)).toBe(false);
  });

  it("refuză o zi peste marginea din spate", () => {
    expect(isWithinHorizon(shiftDay(TODAY, -DAY_HORIZON_DAYS - 1), TODAY)).toBe(false);
  });
});

describe("clampToHorizon", () => {
  it("lasă neatinsă o zi dinăuntru", () => {
    expect(formatCalendarDate(clampToHorizon(new Date(2026, 8, 10), TODAY))).toBe("2026-09-10");
  });

  it("aduce la margine o zi prea departe în față", () => {
    const far = new Date(2030, 0, 1);
    expect(formatCalendarDate(clampToHorizon(far, TODAY))).toBe(
      formatCalendarDate(shiftDay(TODAY, DAY_HORIZON_DAYS)),
    );
  });

  it("aduce la margine o zi prea departe în spate", () => {
    const far = new Date(1999, 0, 1);
    expect(formatCalendarDate(clampToHorizon(far, TODAY))).toBe(
      formatCalendarDate(shiftDay(TODAY, -DAY_HORIZON_DAYS)),
    );
  });

  it("ignoră ora din datele primite", () => {
    // `today` vine din `new Date()` în pagină, deci are ore, minute, secunde.
    // Fără normalizare, o zi la exact +90 pică sau trece în funcție de ceas.
    const noon = new Date(2026, 8, 1, 13, 45, 30);
    expect(isWithinHorizon(shiftDay(noon, DAY_HORIZON_DAYS), noon)).toBe(true);
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/__tests__/dayHorizon.test.ts`
Așteptat: FAIL — `Failed to resolve import "../dayHorizon"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/lib/dayHorizon.ts`:

```ts
/**
 * Cât de departe se poate citi o zi.
 *
 * Nouăzeci de zile în fiecare direcție. În față, pentru că atât oferă
 * referința din piață. În spate, pentru că `/jurnal` există și cine scrie
 * despre o zi trăită are nevoie de numerele ei. Simetric, pentru că nu există
 * niciun argument care să facă o direcție mai lungă decât cealaltă.
 *
 * Marginea e reală, nu decorativă: butonul de navigare se dezactivează la
 * capăt și un `?zi=` venit din afară se încadrează, în loc să fie crezut.
 *
 * Toate comparațiile se fac pe zi calendaristică. `today` vine din `new Date()`
 * și poartă ora curentă; fără normalizare, o zi la exact +90 ar cădea înăuntru
 * dimineața și în afară seara.
 */

export const DAY_HORIZON_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Miezul nopții local al zilei din care face parte data primită. */
const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** O dată nouă, mutată cu `delta` zile. Data primită rămâne neatinsă. */
export const shiftDay = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);

/** Câte zile calendaristice sunt de la `today` până la `date`, cu semn. */
const daysBetween = (date: Date, today: Date): number =>
  Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / MS_PER_DAY);

export const isWithinHorizon = (date: Date, today: Date): boolean =>
  Math.abs(daysBetween(date, today)) <= DAY_HORIZON_DAYS;

export const clampToHorizon = (date: Date, today: Date): Date => {
  const delta = daysBetween(date, today);
  if (delta > DAY_HORIZON_DAYS) return shiftDay(today, DAY_HORIZON_DAYS);
  if (delta < -DAY_HORIZON_DAYS) return shiftDay(today, -DAY_HORIZON_DAYS);
  return startOfDay(date);
};
```

- [ ] **Step 4: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/__tests__/dayHorizon.test.ts`
Așteptat: PASS, 13 teste.

- [ ] **Step 5: Verifică tipurile**

Rulează: `npm run typecheck`
Așteptat: ieșire goală, cod 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/dayHorizon.ts src/lib/__tests__/dayHorizon.test.ts
git commit -m "Măsoară orizontul zilei în zile, nu în presupuneri"
```

---

### Task 2: Conținutul unei zile, în trei limbi

**Files:**
- Create: `src/lib/dayContent.ts`
- Test: `src/lib/__tests__/dayContent.test.ts`

**Interfaces:**
- Consumes: `calculatePersonalDayNumber`, `calculatePersonalMonthNumber`, `calculateUniversalDay`, `PERSONAL_CYCLE_MEANINGS` din `@/lib/personalCycles`; `calculatePersonalYearNumber` din `@/lib/numerology`; `getDailyPrediction` din `@/lib/predictions`; `formatCalendarDate` din `@/lib/calendarDate`; `Language` din `@/lib/translations`.
- Produces:
  - `export interface DayContent { date: string; personalDay: number; personalMonth: number; personalYear: number; universalDay: number; keywords: string; meaning: string; advice: string; luckyHours: string[] }`
  - `export const getDayContent = (birthDate: Date, date: Date, language: Language): DayContent`
  - `export const DAY_ADVICE: Record<number, Record<Language, string>>`

**Aceasta este funcția pe care planul de notificări o consumă.** `generateDailyPredictionNotification(personalDay, language)` din `src/lib/notifications.ts:166` va fi alimentată de aici: `title` din `keywords`, `body` din `advice`, `data.url` din `` `/azi?zi=${content.date}` ``.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/__tests__/dayContent.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getDayContent, DAY_ADVICE } from "../dayContent";
import type { Language } from "../translations";

/**
 * O zi nu e o singură cifră redusă.
 *
 * Pagina arăta ziua personală și atât. Ziua e compusă: ziua personală stă în
 * luna personală, care stă în anul personal, iar peste toate trece ziua
 * universală, care e a tuturor. Funcția asta le întoarce pe toate patru
 * împreună, plus textul, în limba cerută -- pentru că același conținut
 * pleacă și în interfață, și în notificarea de dimineață.
 *
 * Datele sunt fixe. O naștere fixă și o zi fixă dau numere fixe; `new Date()`
 * fără argument ar face aserțiunile vacue peste un an.
 */

const BIRTH = new Date(1990, 4, 15); // 15 mai 1990
const DAY = new Date(2026, 8, 1);    // 1 septembrie 2026
const LANGS: Language[] = ["ro", "en", "ru"];

describe("getDayContent", () => {
  it("compune ziua din patru numere, nu dintr-unul", () => {
    const content = getDayContent(BIRTH, DAY, "ro");
    // Luna 5 -> 5, ziua 15 -> 6, anul 2026 -> 10 -> 1; 5+6+1 = 12 -> 3.
    expect(content.personalYear).toBe(3);
    // 3 + 9 = 12 -> 3.
    expect(content.personalMonth).toBe(3);
    // 3 + 1 = 4.
    expect(content.personalDay).toBe(4);
    // Anul universal 2026 -> 10 -> 1; luna 1 + 9 = 10 -> 1; ziua 1 + 1 = 2.
    expect(content.universalDay).toBe(2);
  });

  it("întoarce ziua ca dată calendaristică, nu ca instant", () => {
    expect(getDayContent(BIRTH, DAY, "ro").date).toBe("2026-09-01");
  });

  it("ia textul zilei din motor, în limba cerută", () => {
    expect(getDayContent(BIRTH, DAY, "ro").keywords).toBe("Muncă, Fundament");
    expect(getDayContent(BIRTH, DAY, "en").keywords).toBe("Work, Foundation");
    expect(getDayContent(BIRTH, DAY, "ru").keywords).toBe("Работа, Основа");
  });

  it("dă înțelesul zilei, nu al lunii", () => {
    expect(getDayContent(BIRTH, DAY, "ro").meaning).toBe(
      "Zi pentru muncă practică, organizare și construirea fundamentelor solide.",
    );
  });

  it("dă sfatul numărului zilei", () => {
    expect(getDayContent(BIRTH, DAY, "ro").advice).toBe(DAY_ADVICE[4].ro);
    expect(getDayContent(BIRTH, DAY, "ru").advice).toBe(DAY_ADVICE[4].ru);
  });

  it("păstrează orele venite din motor", () => {
    expect(getDayContent(BIRTH, DAY, "en").luckyHours).toEqual(["7:00", "12:00", "16:00"]);
  });

  it("dă alt conținut pentru altă zi", () => {
    const first = getDayContent(BIRTH, DAY, "ro");
    const second = getDayContent(BIRTH, new Date(2026, 8, 2), "ro");
    expect(second.personalDay).toBe(5);
    expect(second.advice).not.toBe(first.advice);
  });

  it("dă alt conținut pentru altă naștere, în aceeași zi", () => {
    const other = getDayContent(new Date(1975, 10, 3), DAY, "ro");
    expect(other.personalDay).not.toBe(4);
    // Ziua universală nu depinde de naștere.
    expect(other.universalDay).toBe(2);
  });
});

describe("DAY_ADVICE", () => {
  it("acoperă toate cele nouă numere", () => {
    expect(Object.keys(DAY_ADVICE).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(LANGS)("are text în %s pentru fiecare număr", (lang) => {
    const missing = Object.entries(DAY_ADVICE)
      .filter(([, byLang]) => !byLang[lang]?.trim())
      .map(([n]) => n);
    expect(missing).toEqual([]);
  });

  it("nu repetă engleza în locul celorlalte limbi", () => {
    for (const [number, byLang] of Object.entries(DAY_ADVICE)) {
      expect(byLang.ro, `ziua ${number} în ro`).not.toBe(byLang.en);
      expect(byLang.ru, `ziua ${number} în ru`).not.toBe(byLang.en);
    }
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/__tests__/dayContent.test.ts`
Așteptat: FAIL — `Failed to resolve import "../dayContent"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/lib/dayContent.ts`:

```ts
/**
 * Ce se poate spune despre o zi.
 *
 * Un singur loc, pentru că același conținut pleacă în două direcții: pagina
 * `/azi` îl randează, iar notificarea de dimineață îl trimite. Dacă ar fi
 * compus de două ori, ar începe să difere.
 *
 * O zi nu e o cifră. Ziua personală stă în luna personală, care stă în anul
 * personal; peste toate trece ziua universală, care nu ține de naștere. Cele
 * patru se întorc împreună.
 *
 * Copia pe număr stă aici, lângă cea din `personalCycles.ts`, pentru că e
 * conținut de domeniu -- ce înseamnă o zi 4 -- nu text de interfață. Etichetele
 * butoanelor și titlurile de coloană stau în `translations.ts`, unde le
 * protejează testul de paritate.
 */

import { formatCalendarDate } from "./calendarDate";
import { calculatePersonalYearNumber } from "./numerology";
import {
  calculatePersonalDayNumber,
  calculatePersonalMonthNumber,
  calculateUniversalDay,
  PERSONAL_CYCLE_MEANINGS,
} from "./personalCycles";
import { getDailyPrediction } from "./predictions";
import type { Language } from "./translations";

export interface DayContent {
  /** Ziua, ca dată calendaristică `YYYY-MM-DD`. Merge direct în `?zi=`. */
  date: string;
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  universalDay: number;
  /** Două-trei cuvinte. Titlul unei notificări. */
  keywords: string;
  /** O propoziție despre ce e ziua. */
  meaning: string;
  /** O propoziție despre ce are omul de făcut. Corpul unei notificări. */
  advice: string;
  luckyHours: string[];
}

/**
 * Un lucru de făcut, pe număr, în trei limbi.
 *
 * `dailyPredictionsData` din `predictions.ts` are un câmp `advice`, dar numai
 * în engleză -- și pagina îl punea pe ecran ca atare, într-o interfață
 * românească. Astea sunt scrise pe limba omului: un gest concret, nu o
 * caracterizare a energiei.
 */
export const DAY_ADVICE: Record<number, Record<Language, string>> = {
  1: {
    ro: "Fă azi primul pas la lucrul pe care îl tot amâni. Nu e nevoie să-l termini, doar să-l începi.",
    en: "Take the first step today on the thing you keep postponing. You don't have to finish it, only to start.",
    ru: "Сделайте сегодня первый шаг к тому, что откладываете. Не обязательно закончить — достаточно начать.",
  },
  2: {
    ro: "Ascultă mai mult decât vorbești. Ce ai de rezolvat azi se rezolvă cu cineva, nu singur.",
    en: "Listen more than you speak. What you have to settle today gets settled with someone, not alone.",
    ru: "Слушайте больше, чем говорите. То, что нужно решить сегодня, решается с кем-то, а не в одиночку.",
  },
  3: {
    ro: "Spune ceva cu voce tare — scrie, desenează, sună pe cineva. Ideile de azi se pierd dacă rămân în cap.",
    en: "Say something out loud — write it, draw it, call someone. Today's ideas are lost if they stay in your head.",
    ru: "Скажите что-то вслух — напишите, нарисуйте, позвоните. Сегодняшние идеи пропадут, если останутся в голове.",
  },
  4: {
    ro: "Alege un lucru plictisitor și termină-l. Azi munca migăloasă îți iese mai bine decât ideile mari.",
    en: "Pick one boring thing and finish it. Patient work goes better for you today than big ideas.",
    ru: "Выберите одно скучное дело и доведите его до конца. Сегодня кропотливая работа удаётся лучше больших идей.",
  },
  5: {
    ro: "Lasă loc în program pentru ce nu ai planificat. Ziua asta aduce ceva ce nu încape în agendă.",
    en: "Leave room in your schedule for what you did not plan. This day brings something the calendar has no slot for.",
    ru: "Оставьте в расписании место для незапланированного. Этот день приносит то, для чего в календаре нет строки.",
  },
  6: {
    ro: "Sună pe cineva de acasă. Ce e de reparat azi e între oameni, nu în muncă.",
    en: "Call someone from home. What needs mending today is between people, not at work.",
    ru: "Позвоните кому-то из близких. То, что нужно починить сегодня, — между людьми, а не в работе.",
  },
  7: {
    ro: "Nu decide nimic în grabă. Stai singur o oră și lasă răspunsul să vină, în loc să-l cauți.",
    en: "Decide nothing in a hurry. Sit alone for an hour and let the answer arrive instead of hunting it.",
    ru: "Не решайте ничего второпях. Побудьте час в одиночестве и дайте ответу прийти, вместо того чтобы искать его.",
  },
  8: {
    ro: "Cere ce ți se cuvine — o mărire, o plată, un răspuns amânat. Azi ai greutate în discuție.",
    en: "Ask for what you are owed — a raise, a payment, a delayed answer. You carry weight in the room today.",
    ru: "Просите то, что вам причитается, — повышение, оплату, отложенный ответ. Сегодня ваше слово весит.",
  },
  9: {
    ro: "Termină ceva vechi și dă-i drumul. Azi o închidere face mai mult decât un început.",
    en: "Finish something old and let it go. A closing serves you better today than an opening.",
    ru: "Завершите что-то старое и отпустите. Сегодня завершение полезнее начала.",
  },
};

export const getDayContent = (
  birthDate: Date,
  date: Date,
  language: Language,
): DayContent => {
  // Ziua personală nu păstrează masterii (`result(..., false)` în
  // pythagorean.ts), deci e mereu 1..9 și indexarea de mai jos nu poate rata.
  const personalDay = calculatePersonalDayNumber(birthDate, date);
  const meanings = PERSONAL_CYCLE_MEANINGS[personalDay];

  return {
    date: formatCalendarDate(date),
    personalDay,
    personalMonth: calculatePersonalMonthNumber(birthDate, date.getFullYear(), date.getMonth() + 1),
    personalYear: calculatePersonalYearNumber(birthDate, date.getFullYear()),
    universalDay: calculateUniversalDay(date),
    keywords: meanings.keywords[language],
    meaning: meanings.dayMeaning[language],
    advice: DAY_ADVICE[personalDay][language],
    // Orele vin din motor ca atare: sunt coordonate, nu text de tradus.
    luckyHours: getDailyPrediction(birthDate, date).luckyHours,
  };
};
```

- [ ] **Step 4: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/__tests__/dayContent.test.ts`
Așteptat: PASS, 12 teste.

- [ ] **Step 5: Verifică tipurile**

Rulează: `npm run typecheck`
Așteptat: ieșire goală, cod 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/dayContent.ts src/lib/__tests__/dayContent.test.ts
git commit -m "Compune ziua din patru numere, în trei limbi"
```

---

### Task 3: Ziua aleasă trăiește în adresă

**Files:**
- Create: `src/hooks/use-selected-day.ts`
- Test: `src/hooks/__tests__/use-selected-day.test.tsx`

**Interfaces:**
- Consumes: `clampToHorizon` din `@/lib/dayHorizon` (Task 1); `parseCalendarDate`, `formatCalendarDate` din `@/lib/calendarDate`.
- Produces: `export const useSelectedDay = (today: Date): { selectedDay: Date; selectDay: (date: Date) => void }`

- [ ] **Step 1: Scrie testul care pică**

Creează `src/hooks/__tests__/use-selected-day.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useSelectedDay } from "../use-selected-day";
import { formatCalendarDate } from "@/lib/calendarDate";
import { shiftDay, DAY_HORIZON_DAYS } from "@/lib/dayHorizon";

/**
 * Ziua aleasă stă în adresă, nu doar în stare.
 *
 * Trei lucruri depind de asta: butonul "înapoi" al browserului, o zi trimisă
 * cuiva ca link, și notificarea care va deschide `/azi?zi=...`. Un `?zi=` venit
 * din afară poate cere orice, deci se încadrează, nu se crede.
 */

const TODAY = new Date(2026, 8, 1);

const Probe = () => {
  const { selectedDay, selectDay } = useSelectedDay(TODAY);
  const location = useLocation();
  return (
    <div>
      <span data-testid="day">{formatCalendarDate(selectedDay)}</span>
      <span data-testid="search">{location.search}</span>
      <button onClick={() => selectDay(new Date(2026, 8, 10))}>zece</button>
      <button onClick={() => selectDay(TODAY)}>azi</button>
    </div>
  );
};

const at = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Probe />
    </MemoryRouter>,
  );

describe("useSelectedDay", () => {
  it("fără parametru, ziua e azi", () => {
    at("/azi");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("citește ziua din parametru", () => {
    at("/azi?zi=2026-09-10");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-10");
  });

  it("cade pe azi când parametrul nu e o dată", () => {
    at("/azi?zi=maine");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("încadrează un parametru din afara orizontului", () => {
    at("/azi?zi=2031-01-01");
    expect(screen.getByTestId("day").textContent).toBe(
      formatCalendarDate(shiftDay(TODAY, DAY_HORIZON_DAYS)),
    );
  });

  it("scrie ziua aleasă în adresă", () => {
    at("/azi");
    fireEvent.click(screen.getByText("zece"));
    expect(screen.getByTestId("search").textContent).toBe("?zi=2026-09-10");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-10");
  });

  it("scoate parametrul la întoarcerea pe azi, în loc să-l lase gol", () => {
    at("/azi?zi=2026-09-10");
    fireEvent.click(screen.getByText("azi"));
    expect(screen.getByTestId("search").textContent).toBe("");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("nu pierde ceilalți parametri ai paginii", () => {
    at("/azi?tab=daily");
    fireEvent.click(screen.getByText("zece"));
    expect(screen.getByTestId("search").textContent).toContain("tab=daily");
    expect(screen.getByTestId("search").textContent).toContain("zi=2026-09-10");
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/hooks/__tests__/use-selected-day.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../use-selected-day"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/hooks/use-selected-day.ts`:

```ts
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { formatCalendarDate, parseCalendarDate } from "@/lib/calendarDate";
import { clampToHorizon } from "@/lib/dayHorizon";

/**
 * Care zi se citește pe `/azi`.
 *
 * În adresă, nu doar în stare, din trei motive: butonul "înapoi" al
 * browserului funcționează, o zi se poate trimite cuiva, iar notificarea de
 * dimineață are unde să ducă omul fără să inventeze o rută.
 *
 * `?zi=` vine din afară -- dintr-un link vechi, dintr-o notificare, dintr-o
 * bară de adresă. Se încadrează în orizont; nu se crede pe cuvânt.
 *
 * `/azi` fără parametru rămâne azi, iar întoarcerea pe azi scoate parametrul
 * în loc să-l lase pe valoarea zilei curente: adresa canonică a zilei de azi
 * e `/azi`, o singură formă, nu două.
 */
export const useSelectedDay = (today: Date) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get("zi");

  const selectedDay = useMemo(() => {
    const parsed = parseCalendarDate(asked);
    return parsed ? clampToHorizon(parsed, today) : today;
  }, [asked, today]);

  const selectDay = useCallback(
    (date: Date) => {
      const next = clampToHorizon(date, today);
      const search = new URLSearchParams(params);
      if (formatCalendarDate(next) === formatCalendarDate(today)) search.delete("zi");
      else search.set("zi", formatCalendarDate(next));
      setParams(search);
    },
    [params, setParams, today],
  );

  return { selectedDay, selectDay };
};
```

- [ ] **Step 4: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/hooks/__tests__/use-selected-day.test.tsx`
Așteptat: PASS, 7 teste.

- [ ] **Step 5: Verifică tipurile și lint-ul**

Rulează: `npm run typecheck && npm run lint`
Așteptat: ambele cod 0.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/use-selected-day.ts src/hooks/__tests__/use-selected-day.test.tsx
git commit -m "Ține ziua aleasă în adresa paginii"
```

---

### Task 4: Butoanele care mută ziua

**Files:**
- Create: `src/components/predictions/DayNavigator.tsx`
- Modify: `src/lib/translations.ts` (secțiunea `today`, în toate cele trei limbi)
- Test: `src/components/predictions/__tests__/DayNavigator.test.tsx`

**Interfaces:**
- Consumes: `shiftDay`, `isWithinHorizon` din `@/lib/dayHorizon` (Task 1); `useLanguage` din `@/contexts/LanguageContext`; `formatCalendarDate` din `@/lib/calendarDate`.
- Produces: `export const DayNavigator = ({ date, today, onChange }: { date: Date; today: Date; onChange: (date: Date) => void }) => JSX.Element`
- Produces (i18n): `t.today.previousDay`, `t.today.nextDay`, `t.today.backToToday`, `t.today.horizonEdge`, `t.today.personalDay`, `t.today.personalMonth`, `t.today.universalDay`, `t.today.advice` — folosite și de Task 5.

- [ ] **Step 1: Adaugă secțiunea `today` în cele trei limbi**

În `src/lib/translations.ts`, imediat **după** blocul `predictionsExtended: { ... }` din fiecare din cele trei limbi (ro, en, ru), inserează blocul corespunzător.

În limba `ro`:

```ts
    // Navigarea pe zile de pe /azi. Etichete de interfață; ce înseamnă o zi
    // anume stă în src/lib/dayContent.ts, lângă motor.
    today: {
      previousDay: "Ziua precedentă",
      nextDay: "Ziua următoare",
      backToToday: "Înapoi la azi",
      horizonEdge: "Se pot citi 90 de zile în fiecare direcție.",
      personalDay: "Ziua personală",
      personalMonth: "Luna personală",
      universalDay: "Ziua universală",
      advice: "Ce ai de făcut"
    },
```

În limba `en`:

```ts
    today: {
      previousDay: "Previous day",
      nextDay: "Next day",
      backToToday: "Back to today",
      horizonEdge: "You can read 90 days in each direction.",
      personalDay: "Personal day",
      personalMonth: "Personal month",
      universalDay: "Universal day",
      advice: "What to do"
    },
```

În limba `ru`:

```ts
    today: {
      previousDay: "Предыдущий день",
      nextDay: "Следующий день",
      backToToday: "Вернуться к сегодня",
      horizonEdge: "Можно читать 90 дней в каждую сторону.",
      personalDay: "Личный день",
      personalMonth: "Личный месяц",
      universalDay: "Универсальный день",
      advice: "Что делать"
    },
```

- [ ] **Step 2: Rulează testul de paritate a limbilor**

Rulează: `npm run test:run -- src/lib/__tests__/translations.test.ts`
Așteptat: PASS — cele trei limbi au aceleași chei și nicio valoare goală. Dacă pică, o limbă a rămas fără blocul `today` sau are altă listă de chei.

- [ ] **Step 3: Scrie testul componentei, care pică**

Creează `src/components/predictions/__tests__/DayNavigator.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DayNavigator } from "../DayNavigator";
import { getTranslation } from "@/lib/translations";
import { formatCalendarDate } from "@/lib/calendarDate";
import { shiftDay, DAY_HORIZON_DAYS } from "@/lib/dayHorizon";

/**
 * Prognoza zilnică era legată de `new Date()`: se vedea o singură zi și nu
 * exista niciun gest care s-o mute. Astea sunt cele trei gesturi -- înapoi,
 * înainte, și întoarcerea la azi -- plus cele două margini.
 *
 * Ultimul test e o santinelă pentru regresia din 57f095a: pagina de rezultat
 * era plină de `opacity-0 animate-fade-in`, deci invizibilă pentru cine
 * ceruse sistemului mai puțină mișcare. Nimic aici nu are voie să depindă de
 * o animație ca să fie vizibil.
 */

const TODAY = new Date(2026, 8, 1);
const t = getTranslation("ro");

const show = (date: Date, onChange = vi.fn()) => {
  const view = render(
    <LanguageProvider>
      <DayNavigator date={date} today={TODAY} onChange={onChange} />
    </LanguageProvider>,
  );
  return { ...view, onChange };
};

describe("DayNavigator", () => {
  it("arată ziua primită, cu cifrele în clasa numerică", () => {
    const { container } = show(new Date(2026, 8, 10));
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("2026")).toBeTruthy();
    const numerals = [...container.querySelectorAll(".num")].map((n) => n.textContent);
    expect(numerals).toContain("10");
    expect(numerals).toContain("2026");
  });

  it("mută o zi înapoi", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByLabelText(t.today.previousDay));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-09");
  });

  it("mută o zi înainte", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByLabelText(t.today.nextDay));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-11");
  });

  it("nu oferă întoarcerea la azi când deja e azi", () => {
    show(TODAY);
    expect(screen.queryByText(t.today.backToToday)).toBeNull();
  });

  it("oferă întoarcerea la azi din orice altă zi, și o face", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByText(t.today.backToToday));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-01");
  });

  it("închide drumul la marginea din față", () => {
    show(shiftDay(TODAY, DAY_HORIZON_DAYS));
    expect(screen.getByLabelText(t.today.nextDay)).toBeDisabled();
    expect(screen.getByLabelText(t.today.previousDay)).not.toBeDisabled();
    expect(screen.getByText(t.today.horizonEdge)).toBeTruthy();
  });

  it("închide drumul la marginea din spate", () => {
    show(shiftDay(TODAY, -DAY_HORIZON_DAYS));
    expect(screen.getByLabelText(t.today.previousDay)).toBeDisabled();
    expect(screen.getByLabelText(t.today.nextDay)).not.toBeDisabled();
  });

  it("nu spune nimic despre orizont cât timp mai e drum", () => {
    show(new Date(2026, 8, 10));
    expect(screen.queryByText(t.today.horizonEdge)).toBeNull();
  });

  it("nu ascunde nimic în spatele unei animații de intrare", () => {
    const { container } = show(new Date(2026, 8, 10));
    expect(container.querySelectorAll("[class*='opacity-0']")).toHaveLength(0);
    expect(container.querySelectorAll("[class*='animate-fade-in']")).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/components/predictions/__tests__/DayNavigator.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../DayNavigator"`.

- [ ] **Step 5: Scrie implementarea minimă**

Creează `src/components/predictions/DayNavigator.tsx`:

```tsx
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ro, enUS, ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCalendarDate } from "@/lib/calendarDate";
import { isWithinHorizon, shiftDay } from "@/lib/dayHorizon";

const locales = { ro, en: enUS, ru };

interface DayNavigatorProps {
  date: Date;
  today: Date;
  onChange: (date: Date) => void;
}

/**
 * Cele trei gesturi ale zilei.
 *
 * Prognoza lunară se putea alege înainte; cea zilnică era legată de
 * `new Date()`. Aici se mută cu o zi în fiecare direcție, până la marginea
 * orizontului, iar întoarcerea la azi e mereu la un singur clic -- omul nu
 * trebuie să numere înapoi ca să se întoarcă de unde a plecat.
 *
 * Fără animație de intrare: pe `/azi` conținutul se schimbă la fiecare clic,
 * iar ceva ce începe la `opacity: 0` și depinde de o animație ca să se vadă e
 * exact regresia reparată în 57f095a.
 *
 * Ziua și anul poartă `.num`: sunt coordonate. Ziua săptămânii și numele lunii
 * sunt cuvinte și rămân în fața de interfață.
 */
export const DayNavigator = ({ date, today, onChange }: DayNavigatorProps) => {
  const { t, language } = useLanguage();
  const dateLocale = locales[language] ?? enUS;

  const canGoBack = isWithinHorizon(shiftDay(date, -1), today);
  const canGoForward = isWithinHorizon(shiftDay(date, 1), today);
  const isToday = formatCalendarDate(date) === formatCalendarDate(today);
  const atEdge = !canGoBack || !canGoForward;

  return (
    <div className="card-mystic rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label={t.today.previousDay}
          disabled={!canGoBack}
          onClick={() => onChange(shiftDay(date, -1))}
          className="h-10 w-10 p-0 text-foreground/90"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="font-raleway text-sm capitalize text-muted-foreground">
            {format(date, "EEEE", { locale: dateLocale })}
          </p>
          <p className="font-raleway text-lg text-foreground">
            <span className="num">{date.getDate()}</span>{" "}
            {format(date, "MMMM", { locale: dateLocale })}{" "}
            <span className="num">{date.getFullYear()}</span>
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label={t.today.nextDay}
          disabled={!canGoForward}
          onClick={() => onChange(shiftDay(date, 1))}
          className="h-10 w-10 p-0 text-foreground/90"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {(atEdge || !isToday) && (
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-border/40 pt-3">
          {atEdge && (
            <p className="font-raleway text-xs text-muted-foreground">{t.today.horizonEdge}</p>
          )}
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(today)}
              className="h-8 gap-2 border-primary/30 font-raleway text-xs text-primary hover:bg-primary/10"
            >
              <RotateCcw className="h-3 w-3" />
              {t.today.backToToday}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 6: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/components/predictions/__tests__/DayNavigator.test.tsx`
Așteptat: PASS, 9 teste.

- [ ] **Step 7: Verifică tokenii de culoare, tipurile și lint-ul**

Rulează: `npm run test:run -- src/lib/__tests__/design-tokens.test.ts && npm run typecheck && npm run lint`
Așteptat: toate cod 0. Testul de tokeni scanează `src/components` și cade dacă fișierul nou ar numi vreun `hsl()`.

- [ ] **Step 8: Commit**

```bash
git add src/components/predictions/DayNavigator.tsx src/components/predictions/__tests__/DayNavigator.test.tsx src/lib/translations.ts
git commit -m "Dă zilei un înainte, un înapoi și un drum de întoarcere"
```

---

### Task 5: Scoate prognoza zilnică din ziua curentă

**Files:**
- Modify: `src/pages/Predictions.tsx` (importuri 1–24; starea 46–49; `today` la 59; calculul la 147; eticheta tabului la 68/95/122; conținutul tabului zilnic 219–265)

**Interfaces:**
- Consumes: `useSelectedDay` (Task 3), `DayNavigator` (Task 4), `getDayContent` (Task 2), `t.today.*` (Task 4).
- Produces: nimic pentru task-uri ulterioare.

- [ ] **Step 1: Adaugă importurile și starea zilei**

În `src/pages/Predictions.tsx`, extinde importul existent de la linia 1:

```tsx
import { useState, useEffect, useMemo } from 'react';
```

și adaugă trei importuri noi, după importul lui `BirthDateSelect` (linia 24):

```tsx
import { DayNavigator } from '@/components/predictions/DayNavigator';
import { useSelectedDay } from '@/hooks/use-selected-day';
import { getDayContent } from '@/lib/dayContent';
```

- [ ] **Step 2: Deconectează ziua citită de ziua curentă**

Înlocuiește linia 59, `const today = new Date();`, cu:

```tsx
  // `today` rămâne ancora: orizontul se măsoară din el, iar cardul de zi
  // universală de mai sus e despre ziua reală. Ce s-a schimbat e că ziua
  // *citită* nu mai e obligată să fie aceeași -- se alege, și alegerea stă în
  // adresă. Memoizat pentru că e dependență în `useSelectedDay`; fără asta,
  // fiecare render ar produce altă ancoră.
  const today = useMemo(() => new Date(), []);
  const { selectedDay, selectDay } = useSelectedDay(today);
```

- [ ] **Step 3: Mută calculul zilnic pe ziua aleasă**

Înlocuiește linia 147:

```tsx
  const dailyPrediction = birthDate ? getDailyPrediction(birthDate, today) : null;
```

cu:

```tsx
  const dailyPrediction = birthDate ? getDailyPrediction(birthDate, selectedDay) : null;
  const dayContent = birthDate ? getDayContent(birthDate, selectedDay, language) : null;
```

`getUniversalDayEnergy(today)` de la linia 146 rămâne pe `today`: cardul acela e despre ziua de azi a lumii, nu despre ziua citită.

- [ ] **Step 4: Redenumește eticheta tabului**

În obiectul `labels`, schimbă cheia `daily` în cele trei limbi, pentru că tabul nu mai arată neapărat ziua de azi:
- `ro`, linia 68: `daily: 'Ziua de Azi',` → `daily: 'Ziua',`
- `en`, linia 95: `daily: 'Today',` → `daily: 'The day',`
- `ru`, linia 122: `daily: 'Сегодня',` → `daily: 'День',`

- [ ] **Step 5: Pune navigatorul și cele patru numere în tabul zilnic**

În `<TabsContent value="daily" ...>`, imediat după `{dailyPrediction && birthDate && (` și `<>`, înaintea lui `<DailyPredictionCard ...>`, inserează:

```tsx
                    <DayNavigator date={selectedDay} today={today} onChange={selectDay} />

                    {dayContent && (
                      <div className="card-mystic grid grid-cols-3 gap-3 rounded-xl p-4 text-center">
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.personalDay}</p>
                          <p className="num text-2xl text-primary">{dayContent.personalDay}</p>
                        </div>
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.personalMonth}</p>
                          <p className="num text-2xl text-foreground">{dayContent.personalMonth}</p>
                        </div>
                        <div>
                          <p className="font-raleway text-xs text-muted-foreground">{t.today.universalDay}</p>
                          <p className="num text-2xl text-foreground">{dayContent.universalDay}</p>
                        </div>
                        <div className="col-span-3 border-t border-border/40 pt-3 text-left">
                          <p className="font-heading text-sm text-primary">{dayContent.keywords}</p>
                          <p className="mt-1 text-sm text-foreground/90">{dayContent.meaning}</p>
                          <p className="mt-3 font-raleway text-xs text-muted-foreground">{t.today.advice}</p>
                          <p className="text-sm text-foreground/90">{dayContent.advice}</p>
                        </div>
                      </div>
                    )}
```

Și schimbă `date={today}` din `<DailyPredictionCard>` (linia 225) în `date={selectedDay}`.

- [ ] **Step 6: Rulează toată suita**

Rulează: `npm run test:run`
Așteptat: PASS pe tot, inclusiv `design-tokens`, `translations`, `navigation` și cele 78 de aserțiuni ale motorului. Blocul nou nu numește nicio culoare și nu adaugă nicio rută, deci niciunul nu are motiv să cadă.

- [ ] **Step 7: Verifică tipurile și lint-ul**

Rulează: `npm run typecheck && npm run lint`
Așteptat: ambele cod 0.

- [ ] **Step 8: Verifică în browser**

Rulează: `npm run dev`, apoi în browser:
1. `http://localhost:8082/azi` — introdu o dată de naștere. Tabul „Ziua" arată navigatorul, cele trei numere și textul. Fără „Înapoi la azi" (ești pe azi).
2. Apasă „Ziua următoare" de trei ori. Adresa devine `?zi=`+data corespunzătoare, numerele și textul se schimbă, apare „Înapoi la azi".
3. Apasă butonul „înapoi" al browserului de trei ori — te întorci pe zilele parcurse, apoi pe `/azi` fără parametru.
4. Deschide direct `http://localhost:8082/azi?zi=2030-01-01` — pagina afișează ziua de la +90, butonul „înainte" e dezactivat și apare mesajul despre orizont.
5. Deschide `http://localhost:8082/azi?zi=nimic` — pagina afișează azi, fără eroare în consolă.
6. Schimbă limba în EN și RU: eticheta tabului, butoanele și textul zilei sunt traduse, nicio bucată de engleză în RU.

Așteptat: toate șase, exact așa. Notează în raport dacă vreuna nu s-a comportat cum scrie.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Predictions.tsx
git commit -m "Scoate prognoza zilnică din ziua curentă"
```

---

# LIVRABILUL 2 — Primul contact

## Diagnostic (verificat în cod, 2026-09-01)

**Observat:**

- `grep -rn "onboard\|welcome\|tour" src/` întoarce doar `src/pages/Auth.tsx`. Nu există niciun onboarding.
- `src/pages/Index.tsx:34` — `showDashboard` pornește `true`; `:90-92` decid între panou, formular și rezultat. Vizitatorul anonim cade întotdeauna pe `shouldShowForm`.
- Ce vede efectiv un vizitator anonim, în ordine (`Index.tsx:97-175`): `PageHeader` cu `t.title` („Numerologia") și `t.subtitle`; un card cu `t.formTitle` („Calculează Numerele Tale") și `t.formSubtitle` („Introdu datele tale pentru a descoperi profilul numerologic complet"); două câmpuri; butonul. Trei carduri informative abia dedesubt (`:158-172`).
- Deci pagina **cere înainte să ofere**. Nu spune ce iese, cât durează, sau că nu se cere nimic. „Calculează Numerele Tale" e o comandă, nu o promisiune.
- `src/components/numerology/SaveMapButton.tsx:60-65` — contul se cere **numai** la salvare, cu un toast explicit și `navigate('/auth?redirect=/')`. Comentariul din fișier spune și de ce: pagina se termina cu „Calculează din nou", adică o ofertă de a arunca lectura. **Asta e deja corect. Nu se atinge.**
- `src/components/NumerologyResults.tsx:60-78` — există deja un `localStorage` flag `seen-first-reading`, cu un comentariu care spune exact filozofia casei: „Once per device, not once per page view" și „A visitor who cannot write to localStorage simply never sees it, which is the right way for this to fail."
- Commit-ul `57f095a` („Nu ascunde pagina de cine a cerut mai puțină mișcare") a adăugat în `src/index.css`, în blocul `@media (prefers-reduced-motion: reduce)`, anularea animației pentru `.animate-fade-in`, `.animate-slide-up` și `.animate-scale-in`, cu `opacity: 1 !important`. Cauza: aproape fiecare bloc din pagina de rezultat e `opacity-0 animate-fade-in`, iar scurtarea duratei la 0,01ms nu lăsa aplicat `fill-mode: forwards` în Chromium — pagina rămânea albă. `src/lib/__tests__/design-tokens.test.ts:102-119` păzește regula.
- `src/lib/translations.ts:1262` — `getTranslation(lang)`; blocurile de limbă încep la 4 (ro), 422 (en), 840 (ru).

## Decizie — onboarding-ul potrivit e aproape nimic în plus, dar nu chiar nimic

**Ce vede omul în primele treizeci de secunde, după plan:** un titlu, două propoziții care spun ce primește și că nu costă nimic, formularul cu două câmpuri, și sub buton o intrare către o hartă de exemplu. Atât.

**De ce nu un tur.** Un tur cu bule e o descriere a produsului așezată în fața produsului. Aici produsul e lizibil dintr-un singur clic — harta de exemplu *este* explicația, și e mai bună decât orice bulă, pentru că e adevărată. Un tur ar fi opțiunea mai scumpă de construit, mai scumpă de tradus în trei limbi, mai scumpă de întreținut, și cea pe care oamenii o sar. Nu se adaugă: niciun modal, niciun coach mark, niciun contor de pași, niciun buton „sari peste", nicio rută nouă.

**De ce totuși nu chiar nimic.** Trei goluri concrete, fiecare cu o reparație de câteva rânduri:

1. **Pagina cere înainte să ofere.** „Calculează Numerele Tale" nu spune ce iese. Reparația: două propoziții deasupra formularului — ce primești, și că nu se cere cont, plată sau e-mail. Nu un card, nu un titlu, nu o iconiță; două rânduri de text.
2. **Cine nu vrea încă să-și scrie numele real n-are nicio intrare.** Reparația: un buton care umple formularul cu un exemplu fix și calculează. Într-un clic, omul citește o hartă adevărată, în cinci capitole. Exemplul e fix — un nume inventat și o dată fixă — ca să fie determinist, testabil și identic în cele trei limbi.
3. **Contul.** Nu e un gol: `SaveMapButton` îl cere deja exact unde trebuie, la salvare. Reparația e o santinelă, nu o schimbare: un test care cade dacă cineva adaugă vreodată o cerere de cont pe drumul anonim până la prima hartă.

**De ce nu un al doilea flag de „prima vizită".** `NumerologyResults` are deja `seen-first-reading` pentru scopul lui. Un al doilea flag ar însemna două stări de ascuns și de depanat pentru un câștig nul: promisiunea e utilă și la a treia vizită (spune ce e produsul), iar harta de exemplu e utilă oricui vrea s-o arate altcuiva. Textul rămâne mereu vizibil. Mai simplu, și mai bun.

**Mișcare redusă.** Blocul nou nu poartă `opacity-0` și nicio clasă `animate-*`. Regula din `index.css` există ca să salveze conținutul care *deja* depinde de o animație; a adăuga conținut nou care depinde de ea ar fi să reintroduci exact categoria de bug reparată în `57f095a`. Testul componentei o verifică direct.

---

### Task 6: Promisiunea și harta de exemplu

**Files:**
- Create: `src/components/FirstVisitPromise.tsx`
- Modify: `src/lib/translations.ts` (secțiunea `firstVisit`, în toate cele trei limbi)
- Test: `src/components/__tests__/FirstVisitPromise.test.tsx`

**Interfaces:**
- Consumes: `useLanguage` din `@/contexts/LanguageContext`.
- Produces:
  - `export const EXAMPLE_NAME = "Maria Elena Popescu";`
  - `export const EXAMPLE_BIRTH_DATE: Date` (15 mai 1990)
  - `export const FirstVisitPromise = ({ onTryExample }: { onTryExample: () => void }) => JSX.Element`

- [ ] **Step 1: Adaugă secțiunea `firstVisit` în cele trei limbi**

În `src/lib/translations.ts`, imediat **după** blocul `today: { ... }` adăugat la Task 4, în fiecare din cele trei limbi.

În `ro`:

```ts
    // Ce află vizitatorul înainte să i se ceară ceva. Pagina cerea înainte să
    // ofere: "Calculează Numerele Tale" e o comandă, nu o promisiune.
    firstVisit: {
      promise: "Scrii numele de la naștere și data nașterii. Primești o hartă în cinci capitole, de citit acum.",
      noAccount: "Fără cont, fără plată, fără adresă de e-mail.",
      tryExample: "Vezi întâi o hartă de exemplu",
      exampleNote: "Harta unei persoane inventate, ca să vezi despre ce e vorba înainte să-ți scrii numele."
    },
```

În `en`:

```ts
    firstVisit: {
      promise: "Write the name you were born with and your date of birth. You get a map in five chapters, to read now.",
      noAccount: "No account, no payment, no email address.",
      tryExample: "See an example map first",
      exampleNote: "The map of a made-up person, so you can see what this is before you type your own name."
    },
```

În `ru`:

```ts
    firstVisit: {
      promise: "Напишите имя, данное при рождении, и дату рождения. Получите карту из пяти глав — читать прямо сейчас.",
      noAccount: "Без аккаунта, без оплаты, без адреса почты.",
      tryExample: "Сначала посмотрите пример карты",
      exampleNote: "Карта вымышленного человека, чтобы понять, о чём речь, прежде чем вводить своё имя."
    },
```

- [ ] **Step 2: Rulează testul de paritate a limbilor**

Rulează: `npm run test:run -- src/lib/__tests__/translations.test.ts`
Așteptat: PASS.

- [ ] **Step 3: Scrie testul componentei, care pică**

Creează `src/components/__tests__/FirstVisitPromise.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FirstVisitPromise, EXAMPLE_NAME, EXAMPLE_BIRTH_DATE } from "../FirstVisitPromise";
import { getTranslation } from "@/lib/translations";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * Pagina cerea înainte să ofere.
 *
 * Vizitatorul anonim vedea "Calculează Numerele Tale" -- o comandă -- și două
 * câmpuri. Nimic despre ce iese, cât durează, sau că nu se cere nimic. Astea
 * sunt cele două propoziții și singura intrare care nu cere să scrii nimic.
 *
 * Fără tur, fără modal, fără contor de pași: harta de exemplu *este*
 * explicația, și e mai bună decât orice bulă pentru că e adevărată.
 */

const show = (onTryExample = vi.fn()) => {
  const view = render(
    <LanguageProvider>
      <FirstVisitPromise onTryExample={onTryExample} />
    </LanguageProvider>,
  );
  return { ...view, onTryExample };
};

describe("FirstVisitPromise", () => {
  it("spune ce primește omul înainte să i se ceară ceva", () => {
    const t = getTranslation("ro");
    show();
    expect(screen.getByText(t.firstVisit.promise)).toBeTruthy();
    expect(screen.getByText(t.firstVisit.noAccount)).toBeTruthy();
  });

  it("oferă o hartă de citit fără să scrii nimic", () => {
    const t = getTranslation("ro");
    const { onTryExample } = show();
    fireEvent.click(screen.getByText(t.firstVisit.tryExample));
    expect(onTryExample).toHaveBeenCalledTimes(1);
  });

  it("spune că exemplul e inventat, ca să nu pară al cuiva", () => {
    const t = getTranslation("ro");
    show();
    expect(screen.getByText(t.firstVisit.exampleNote)).toBeTruthy();
  });

  it("ține exemplul fix, ca să fie același pentru toți", () => {
    expect(EXAMPLE_NAME).toBe("Maria Elena Popescu");
    expect(formatCalendarDate(EXAMPLE_BIRTH_DATE)).toBe("1990-05-15");
  });

  it("nu cere cont nicăieri", () => {
    // Copia spune "Fără cont" -- deci nu se caută cuvântul, ci cererea.
    const { container } = show();
    expect(container.querySelectorAll("a[href*='/auth']")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/creează un cont|intră în cont|conectează-te/i);
  });

  it("nu ascunde nimic în spatele unei animații de intrare", () => {
    // Regresia din 57f095a: `opacity-0 animate-fade-in` face conținutul
    // invizibil pentru cine a cerut sistemului mai puțină mișcare. Regula din
    // index.css salvează ce depinde deja de o animație; conținut nou nu are
    // voie să depindă de ea.
    const { container } = show();
    expect(container.querySelectorAll("[class*='opacity-0']")).toHaveLength(0);
    expect(container.querySelectorAll("[class*='animate-']")).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/components/__tests__/FirstVisitPromise.test.tsx`
Așteptat: FAIL — `Failed to resolve import "../FirstVisitPromise"`.

- [ ] **Step 5: Scrie implementarea minimă**

Creează `src/components/FirstVisitPromise.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Ce află omul înainte să i se ceară ceva.
 *
 * Pagina de start cerea înainte să ofere: un titlu, "Calculează Numerele
 * Tale", două câmpuri. Nimic despre ce iese din ele, cât durează, sau că nu se
 * cere cont, plată sau adresă de e-mail. Cele trei carduri explicative erau
 * abia sub prima cotitură.
 *
 * Nu e un tur. Un tur e o descriere a produsului așezată în fața produsului;
 * aici produsul e lizibil dintr-un clic, iar harta de exemplu *este*
 * explicația. Fără modal, fără bule, fără contor de pași, fără "sari peste".
 *
 * Exemplul e fix -- același nume inventat și aceeași dată în toate limbile --
 * ca să fie determinist, testabil, și ca să nu semene cu al nimănui.
 *
 * Nicio clasă `animate-*` și niciun `opacity-0`: conținutul nou nu are voie să
 * depindă de o animație ca să fie vizibil (vezi 57f095a).
 */

export const EXAMPLE_NAME = "Maria Elena Popescu";
export const EXAMPLE_BIRTH_DATE = new Date(1990, 4, 15);

interface FirstVisitPromiseProps {
  onTryExample: () => void;
}

export const FirstVisitPromise = ({ onTryExample }: FirstVisitPromiseProps) => {
  const { t } = useLanguage();

  return (
    <div className="mb-6 text-center">
      <p className="text-foreground/90">{t.firstVisit.promise}</p>
      <p className="mt-1 font-raleway text-sm text-muted-foreground">{t.firstVisit.noAccount}</p>

      <div className="mt-4 border-t border-border/40 pt-4">
        <Button
          variant="outline"
          onClick={onTryExample}
          className="gap-2 border-primary/30 font-raleway text-primary hover:bg-primary/10"
        >
          {t.firstVisit.tryExample}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-2 font-raleway text-xs text-muted-foreground">{t.firstVisit.exampleNote}</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 6: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/components/__tests__/FirstVisitPromise.test.tsx`
Așteptat: PASS, 6 teste.

- [ ] **Step 7: Verifică tokenii, tipurile și lint-ul**

Rulează: `npm run test:run -- src/lib/__tests__/design-tokens.test.ts && npm run typecheck && npm run lint`
Așteptat: toate cod 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/FirstVisitPromise.tsx src/components/__tests__/FirstVisitPromise.test.tsx src/lib/translations.ts
git commit -m "Spune ce primești înainte să ceri numele"
```

---

### Task 7: Leagă promisiunea de pagina de start și blochează cererea de cont

**Files:**
- Modify: `src/pages/Index.tsx` (importuri 1–12; `handleCalculate` 77–80; blocul `shouldShowForm` 132–175)
- Test: `src/lib/__tests__/first-contact.test.ts`

**Interfaces:**
- Consumes: `FirstVisitPromise`, `EXAMPLE_NAME`, `EXAMPLE_BIRTH_DATE` (Task 6).
- Produces: nimic pentru task-uri ulterioare.

- [ ] **Step 1: Scrie testul de invariant, care pică**

Creează `src/lib/__tests__/first-contact.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Drumul anonim până la prima hartă nu cere cont.
 *
 * Contul se cere unde are ce să apere: în `SaveMapButton`, la salvarea hărții,
 * cu un toast și `/auth?redirect=`. Nicăieri înainte. Testul ăsta e o
 * santinelă -- cade dacă cineva pune vreodată un zid în fața calculatorului,
 * care e singurul motiv pentru care oamenii ajung aici.
 *
 * Scanare de sursă, ca `navigation.test.ts`: randarea lui Index.tsx ar cere
 * router, auth, query și rețea pentru a testa o afirmație care e vizibilă în
 * text.
 */

const ROOT = resolve(__dirname, "../../..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("primul contact nu cere cont", () => {
  it("pagina de start nu trimite vizitatorul la /auth", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).not.toMatch(/["'`]\/auth/);
  });

  it("formularul nu trimite vizitatorul la /auth", () => {
    expect(read("src/components/NumerologyForm.tsx")).not.toMatch(/["'`]\/auth/);
  });

  it("promisiunea de la prima vizită nu trimite vizitatorul la /auth", () => {
    expect(read("src/components/FirstVisitPromise.tsx")).not.toMatch(/["'`]\/auth/);
  });

  it("contul se cere în continuare la salvarea hărții, unde are ce apăra", () => {
    const save = read("src/components/numerology/SaveMapButton.tsx");
    expect(save).toMatch(/isAuthenticated/);
    expect(save).toMatch(/\/auth\?redirect=/);
  });

  it("pagina de start oferă o hartă de citit fără să scrii nimic", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).toMatch(/FirstVisitPromise/);
    expect(index).toMatch(/EXAMPLE_NAME/);
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/__tests__/first-contact.test.ts`
Așteptat: FAIL la ultimul test — `Index.tsx` nu conține încă `FirstVisitPromise`. Celelalte patru trec deja (invarianții sunt adevărați azi; testul îi îngheață).

- [ ] **Step 3: Adaugă importul în pagina de start**

În `src/pages/Index.tsx`, după importul lui `NumerologyForm` (linia 3), adaugă:

```tsx
import { FirstVisitPromise, EXAMPLE_NAME, EXAMPLE_BIRTH_DATE } from "@/components/FirstVisitPromise";
```

- [ ] **Step 4: Adaugă gestul care duce la harta de exemplu**

Imediat după `handleCalculate` (liniile 77–80), adaugă:

```tsx
  // Un clic până la o hartă adevărată. Nu o descriere a produsului, ci
  // produsul: aceleași cinci capitole, aceleași calcule, pe o persoană
  // inventată. Trece prin `handleCalculate`, deci nu ocolește nimic.
  const handleTryExample = () => {
    handleCalculate({ fullName: EXAMPLE_NAME, birthDate: EXAMPLE_BIRTH_DATE });
  };
```

- [ ] **Step 5: Așază promisiunea deasupra formularului**

În blocul `shouldShowForm`, înlocuiește `<NumerologyForm ... />` (liniile 148–154) cu promisiunea deasupra ei:

```tsx
                <FirstVisitPromise onTryExample={handleTryExample} />

                <NumerologyForm
                  onCalculate={handleCalculate}
                  profileData={profile ? {
                    fullName: profile.fullName,
                    birthDate: parseCalendarDate(profile.birthDate)
                  } : null}
                />
```

Restul cardului — iconița, `t.formTitle`, `t.formSubtitle`, cele trei carduri informative de dedesubt — rămâne exact cum e. Nu se șterge nimic.

- [ ] **Step 6: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/__tests__/first-contact.test.ts`
Așteptat: PASS, 5 teste.

- [ ] **Step 7: Rulează toată suita, tipurile și lint-ul**

Rulează: `npm run test:run && npm run typecheck && npm run lint`
Așteptat: toate cod 0.

- [ ] **Step 8: Verifică în browser**

Rulează: `npm run dev`, apoi:
1. `http://localhost:8082/` deconectat — deasupra celor două câmpuri stau cele două propoziții și butonul de exemplu.
2. Apasă „Vezi întâi o hartă de exemplu" — pagina trece direct pe lectura completă a Mariei Elena Popescu, cu cele cinci capitole. Nu s-a cerut nimic.
3. Derulează până jos — butonul „Salvează harta asta". Apasă-l deconectat: apare toastul „Ai nevoie de un cont" și te duce la `/auth`. Ăsta e singurul loc unde se cere contul.
4. În DevTools → Rendering, pune `prefers-reduced-motion: reduce` și reîncarcă `/`. Promisiunea, butonul și nota sunt vizibile. Apasă exemplul: lectura se vede întreagă, nu o pagină albă.
5. Comută limba pe EN și pe RU: cele patru texte noi sunt traduse, niciunul nu rămâne în română sau engleză unde nu trebuie.

Așteptat: toate cinci. Punctul 4 e cel care contează cel mai mult — e exact regresia din `57f095a`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Index.tsx src/lib/__tests__/first-contact.test.ts
git commit -m "Lasă omul să citească o hartă înainte să scrie ceva"
```

---

## Ce rămâne dator, explicit

Nu intră în acest plan, dar e văzut și numit:

1. **`dailyPredictionsData` din `src/lib/predictions.ts:40-198` e în engleză.** `Predictions.tsx` pune `advice`, `challenges` și `opportunities` direct pe ecran, deci într-o interfață românească sau rusească apar în engleză. `getDayContent` ocolește problema pentru câmpurile pe care le expune (ia din `PERSONAL_CYCLE_MEANINGS`, care e trilingv, plus `DAY_ADVICE`, care e nou și trilingv), dar blocul vechi de la liniile 247–261 rămâne cum e. Traducerea celor 27 de texte rămase e o sarcină proprie, nu o notă de subsol la asta.
2. **`calculateDayColor` din `src/lib/predictions.ts:322` întoarce hex-uri literale**, iar `DailyPredictionCard.tsx:57` le pune în `style`. Testul de tokeni nu le prinde (caută `hsl()`, și scanează `components`/`pages`, nu `lib`). Nu e în drumul acestui plan.
3. **Niciun eveniment de analytics pentru harta de exemplu.** `AnalyticsEvent` din `src/lib/analytics.ts:15` e o uniune închisă; adăugarea unui membru e o linie, dar e o schimbare în alt fișier decât cere sarcina. Merită făcut separat, ca să se poată măsura dacă exemplul chiar e folosit.
4. **Legătura cu planul de notificări nu se face aici.** `generateDailyPredictionNotification` din `src/lib/notifications.ts:166` își păstrează tabelul propriu de corpuri până când planul acela o rescrie peste `getDayContent`. Contractul e pregătit; consumarea lui aparține planului A.
