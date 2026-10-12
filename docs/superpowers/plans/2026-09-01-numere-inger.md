# Numere-înger: de la 12 intrări la 35 de secvențe compuse — Plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Înlocuiește catalogul scris de mână din `src/lib/angelNumbers.ts` (12 intrări, interpretări de ~370 de caractere) cu un modul care compune 35 de secvențe din 6 rame de tipar × arhetipurile existente ale motorului, cu `fullMeaning` de peste 600 de caractere în fiecare din cele trei limbi.

**Architecture:** Un număr-înger nu e un simbol atomic — e o *formă* aplicată unor cifre. 444 este cifra 4 văzută de trei ori; 1212 sunt cifrele 1 și 2 care se schimbă între ele. Textul se compune deci din două surse: rama tiparului (ce înseamnă forma) și arhetipul cifrei (ce înseamnă conținutul). Arhetipurile există deja în `src/lib/numerology-plus/content/archetypes.ts`, validate în trei limbi de `content.test.ts`, și sunt citite ca atare — motorul nu se modifică. Peste compunere stă un strat subțire de suprascrieri, pentru cele două secvențe a căror semnificație e culturală, nu derivabilă din cifre.

**Tech Stack:** TypeScript strict, Vitest, React 18. Zero dependențe noi.

**Spec:** acest document. Diagnosticul din care pornește: `src/lib/angelNumbers.ts` are 12 intrări cu interpretări scurte, iar aplicațiile comparabile din 2026 pornesc de la 28+ secvențe cu interpretări lungi. Argumentul arhitectural pentru compunere e cel din `src/lib/numerology-plus/README.md`, secțiunea „De ce compus și nu scris separat".

## Global Constraints

- Repo: `/Users/victorsafta/work/numerology-compass`, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = `routes.json` ȘI `PAGES` din `src/App.tsx`. Fiecare rută are un `kind`: `public` (indexabilă, cu `meta` per limbă, intră în sitemap), `app` (servită, neindexată), `internal` (scoasă din build-ul de producție).
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză de interpretare; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră — și numerele-înger sunt cifre, deci `.num` se aplică peste tot unde apare secvența; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY dacă nu argumentezi explicit contrariul într-un task dedicat; are 78 de aserțiuni care trec.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA. NU folosi prefixe conventional-commits.

### Constrângeri suplimentare, derivate din codul existent

- **Motorul se citește, nu se scrie.** Niciun task din acest plan nu atinge `src/lib/numerology-plus/**`. Singurul contact e un import din bariera publică: `import { archetypeFor, type Lang } from "@/lib/numerology-plus"`. Ambele sunt re-exportate acolo (`export * from './content/archetypes.js'`, `export * from './content/arcana.js'`). Se importă din barieră, nu din calea internă `content/archetypes`, fiindcă fișierele interne folosesc specificatori cu extensie `.js` și rezolvarea din afara pachetului nu e garantată. Costul e că întregul motor intră în chunk-ul lazy al uneltei; e acceptabil, componenta e deja `lazy()` iar motorul n-are dependențe.
- **Excepție de la convenția i18n, deliberată.** `src/components/tools/AngelNumbers.tsx` NU își ia textul din `src/lib/translations.ts`; are un obiect local `const t = {ro:…, en:…, ru:…}[language]`, cu `language` luat din `useLanguage()`. Este tiparul deja stabilit în acel fișier. Textul nou se adaugă în obiectul local. NU muta acest obiect în `translations.ts` — ar fi refactorizare în afara cererii.
- **`AngelNumberMeaning` își păstrează forma exactă.** Câmpurile `number`, `title`, `shortMessage`, `fullMeaning`, `spiritualSignificance`, `actionAdvice`, `relatedNumbers`, `keywords`, `frequency` rămân cu aceleași nume și tipuri, ca `src/components/AngelNumberCard.tsx` să nu se schimbe deloc în afara căii de import.
- **Se renunță la două exporturi moarte.** `isAngelNumber` și `getAngelNumbersByFrequency` sunt definite în `src/lib/angelNumbers.ts` și nu au niciun consumator (singurii importatori sunt `AngelNumberCard.tsx` și `tools/AngelNumbers.tsx`, care folosesc `getAllAngelNumbers`, `getAngelNumberMeaning`, `searchAngelNumbers` și tipul `AngelNumberMeaning`). Nu se poartă mai departe.

---

## Decizia centrală: hibrid, cu compunerea ca bază

**Alegerea: B, compus din arhetipuri, cu un strat de suprascriere pentru două secvențe.**

Argumentul e din natura conținutului, nu din volum:

Un număr-înger *este* un obiect compus. Nu există tradiție în care 444 să însemne ceva ce nu decurge din 4; toate sursele îl derivă din cifra 4 plus regula că repetiția amplifică. Regula de compunere nu e o scurtătură de producție — e chiar semantica domeniului. A scrie de mână 444, 4444 și 44 ca texte independente ar însemna să inventezi trei doctrine acolo unde tradiția are una singură, și să le lași libere să se contrazică. Exact problema pe care o descrie README-ul motorului.

În plus, compunerea cumpără ceva ce scrierea de mână nu poate: **rezolvarea unei secvențe pe care nu am prevăzut-o.** Cineva care caută `77777` sau `2323` primește un text corect fără ca cineva să-l fi scris. Un catalog scris de mână răspunde doar la ce e în el.

**Excepțiile — și de ce sunt exact două:**

O secvență merită text scris de mână doar dacă poartă o semnificație care **nu se poate deriva din cifrele ei**. Două trec testul:

- **666** — poartă o sarcină culturală moștenită („numărul fiarei") pe care textul trebuie s-o *respingă activ*. Intrarea actuală face exact asta („Contrar credinței populare…"). Nicio ramă de triplu nu poate produce respingerea aceea: e specifică lui 666, nu formei „cifră × 3".
- **1111** — obiceiul dorinței la 11:11 e un fenomen de ceas digital din anii optzeci, nu o proprietate a cifrei 1. Explică de ce 1111 e văzut mai des decât alte secvențe — informație reală, și nederivabilă.

Ce **nu** e excepție, deși ar părea:
- **1234** — sensul lui („pas cu pas, fără sărituri") vine din *forma* ascendentă, care e o ramă. Se compune.
- **777** ca „noroc" — „norocul" e o glosă populară peste arhetipul lui 7 (căutătorul). Rama de triplu plus arhetipul dau textul corect; a adăuga „ești norocos" ar fi conținut inventat.
- **000** — 0 are arhetip propriu în motor („Potențialul"). Se compune.

Suprascrierile nu înlocuiesc textul compus: **adaugă un paragraf în fața lui**. Așa, dacă arhetipul lui 6 se schimbă, 666 se actualizează ca toate celelalte, iar paragraful cultural rămâne. Un mecanism de înlocuire totală ar reintroduce fix divergența pe care o evităm.

## Cele 35 de secvențe acoperite

20 vin dintr-o regulă (toate cifrele 0–9, de trei și de patru ori) — nu sunt scrise nicăieri ca listă, se generează, deci nu pot avea goluri. 15 sunt enumerate explicit, fiindcă forma lor are un nume.

| Tipar | Secvențe | Câte |
|---|---|---|
| `triple` | 000 111 222 333 444 555 666 777 888 999 | 10 (generate) |
| `quad` | 0000 1111 2222 3333 4444 5555 6666 7777 8888 9999 | 10 (generate) |
| `alternating` | 1010 1212 1313 1414 1515 2121 2323 | 7 |
| `mirror` | 1221 1331 1441 1551 | 4 |
| `ascending` | 123 1234 | 2 |
| `descending` | 321 4321 | 2 |
| **Total** | | **35** |

Pornim de la 12. Dintre cele 12 actuale, toate 12 supraviețuiesc: cele zece triple, plus 1111 (`quad`) și 1234 (`ascending`).

Rezolutorul acceptă și secvențe din afara catalogului dacă se potrivesc unui tipar (`77777`, `3434`, `2332`, `2345`): le compune la cerere. Catalogul e lista pe care o *afișăm*, nu limita a ce putem *răspunde*.

## Lungimea-țintă a interpretării

`fullMeaning` se compune din patru paragrafe — `lead` + `amplify` + `works` + `breaks` — și trebuie să depășească **600 de caractere în fiecare limbă, pentru fiecare din cele 35 de secvențe**. Partea fixă a ramelor scrise mai jos e de ~900–1100 de caractere singură, deci pragul e atins cu marjă; testul îl impune ca podea, nu ca țintă. Referință: intrarea actuală pentru 111 are 372 de caractere în română.

## Decizia despre rute: nu se adaugă nicio rută

**Recomandare: fără rută nouă. Deep-link prin parametru de interogare, pe destinația existentă.**

O rută per număr ar însemna 35 de intrări în `routes.json` și 35 în `PAGES` — inacceptabil. O rută parametrizată (`/numar-inger/:secventa`) e o singură intrare, dar se lovește de scripturile de build, verificate în cod:

- `scripts/emit-routes.mjs`, bucla de sitemap, emite `${origin}${r.path}` pentru fiecare rută `public`. O rută parametrizată ar produce literal `<loc>https://compass.oneaigency.com/numar-inger/:secventa</loc>` — URL invalid în sitemap.
- `scripts/prerender-meta.mjs` face `mkdir(join(DIST, route.slice(1)))` pentru fiecare rută `public`. Ar crea un director numit literal `:secventa`.

Deci o rută parametrizată ar trebui să fie `kind: "app"` ca să nu strice build-ul — iar `app` înseamnă neindexată, fără sitemap, fără meta prerandate. Adică fix beneficiul pentru care ai vrea rute per număr dispare, și rămâne doar suprafață de URL în plus.

Ca paginile per număr să fie indexabile ar trebui ca `emit-routes.mjs` și `prerender-meta.mjs` să învețe să *expandeze* o rută parametrizată peste o listă enumerată de valori, plus 35 × 3 × 2 = 210 stringuri de `meta` scrise. Aceasta e o a doua lucrare, cu propriul plan, și are sens doar dacă cineva decide că numerele-înger merită să fie o destinație SEO separată. **Nu e problema diagnosticată aici** — problema e adâncimea conținutului.

Ce se face în schimb, la cost zero de rutare: `src/pages/Tools.tsx` citește deja tab-ul din query (`params.get("s")`), iar `/angel-numbers` face deja 301 către `/unelte?s=angel`. Se adaugă un al doilea parametru: `/unelte?s=angel&n=444` deschide unealta cu 444 deja căutat. Link partajabil, fără nicio modificare în `routes.json`, `App.tsx` sau scripturile de build.

## File Structure

`src/lib/angelNumbers.ts` (699 de linii: interfață + 12 intrări de date + 5 funcții) se desface. Motivul e că devine patru responsabilități distincte, nu că e lung: recunoașterea tiparului e logică pură și testabilă singură; ramele și sfaturile sunt conținut; compunerea e transformare. Un fișier care le ține pe toate n-ar putea fi testat pe bucăți.

| Fișier | Responsabilitate |
|---|---|
| `src/lib/angel/patterns.ts` | Din string în `{ kind, digits, sequence }` sau `null`. Fără conținut, fără limbi. Plus lista celor 35 de secvențe din catalog. |
| `src/lib/angel/advice.ts` | `DIGIT_ADVICE` — 10 cifre × 3 limbi × 3 linii de sfat. Scris de mână, al nostru, în afara motorului. |
| `src/lib/angel/frames.ts` | `PATTERN_FRAMES` — 6 rame × 3 limbi × 8 câmpuri-șablon. Inima conținutului. |
| `src/lib/angel/overrides.ts` | Paragrafele culturale pentru 666 și 1111, în trei limbi. |
| `src/lib/angel/compose.ts` | Tipar + arhetip + sfat + suprascriere → `AngelNumberMeaning`. Aici trăiește tipul. |
| `src/lib/angel/index.ts` | API-ul public: `getAngelNumberMeaning`, `getAllAngelNumbers`, `searchAngelNumbers`, tipul `AngelNumberMeaning`. |
| `src/lib/angel/__tests__/patterns.test.ts` | Recunoașterea tiparelor. |
| `src/lib/angel/__tests__/content.test.ts` | Baleiajul de completitudine, modelat după `src/lib/numerology-plus/__tests__/content.test.ts`. |

Se șterge: `src/lib/angelNumbers.ts`.
Se modifică doar calea de import în: `src/components/AngelNumberCard.tsx`, `src/components/tools/AngelNumbers.tsx`.

---

## Task 1: Recunoașterea tiparului

**Files:**
- Create: `src/lib/angel/patterns.ts`
- Test: `src/lib/angel/__tests__/patterns.test.ts`

**Interfaces:**
- Consumes: nimic.
- Produces:
  - `export type PatternKind = "triple" | "quad" | "alternating" | "mirror" | "ascending" | "descending"`
  - `export interface Pattern { kind: PatternKind; sequence: string; digitA: number; digitB: number }`
  - `export function parseSequence(input: string): Pattern | null`
  - `export const CATALOG: string[]` — cele 35 de secvențe, în ordinea de afișare.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/angel/__tests__/patterns.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseSequence, CATALOG } from "../patterns";

describe("parseSequence", () => {
  it("citește un triplu", () => {
    expect(parseSequence("444")).toEqual({ kind: "triple", sequence: "444", digitA: 4, digitB: 4 });
    expect(parseSequence("000")).toEqual({ kind: "triple", sequence: "000", digitA: 0, digitB: 0 });
  });

  it("citește un cvadruplu, și orice repetare mai lungă", () => {
    expect(parseSequence("1111")).toEqual({ kind: "quad", sequence: "1111", digitA: 1, digitB: 1 });
    expect(parseSequence("77777")).toEqual({ kind: "quad", sequence: "77777", digitA: 7, digitB: 7 });
  });

  it("citește o alternanță ABAB", () => {
    expect(parseSequence("1212")).toEqual({ kind: "alternating", sequence: "1212", digitA: 1, digitB: 2 });
    expect(parseSequence("1010")).toEqual({ kind: "alternating", sequence: "1010", digitA: 1, digitB: 0 });
  });

  it("citește o oglindă ABBA", () => {
    expect(parseSequence("1221")).toEqual({ kind: "mirror", sequence: "1221", digitA: 1, digitB: 2 });
  });

  it("citește un urcuș și o coborâre", () => {
    expect(parseSequence("123")).toEqual({ kind: "ascending", sequence: "123", digitA: 1, digitB: 3 });
    expect(parseSequence("1234")).toEqual({ kind: "ascending", sequence: "1234", digitA: 1, digitB: 4 });
    expect(parseSequence("4321")).toEqual({ kind: "descending", sequence: "4321", digitA: 4, digitB: 1 });
  });

  it("ignoră ce nu e cifră", () => {
    expect(parseSequence("11:11")).toEqual({ kind: "quad", sequence: "1111", digitA: 1, digitB: 1 });
  });

  it("nu inventează un tipar acolo unde nu e", () => {
    expect(parseSequence("4729")).toBeNull();
    expect(parseSequence("12")).toBeNull();
    expect(parseSequence("")).toBeNull();
    expect(parseSequence("abc")).toBeNull();
  });

  it("preferă repetarea în fața celorlalte forme pe care 1111 le satisface și el", () => {
    // 1111 e și ABAB, și palindrom. Repetarea are prioritate.
    expect(parseSequence("1111")!.kind).toBe("quad");
    // 111 e și palindrom.
    expect(parseSequence("111")!.kind).toBe("triple");
  });
});

describe("CATALOG", () => {
  it("are 35 de secvențe, fără duplicate", () => {
    expect(CATALOG).toHaveLength(35);
    expect(new Set(CATALOG).size).toBe(35);
  });

  it("conține toate cele 12 secvențe pe care le aveam deja", () => {
    for (const n of ["000","111","222","333","444","555","666","777","888","999","1111","1234"]) {
      expect(CATALOG, n).toContain(n);
    }
  });

  it("are un tipar recunoscut pentru fiecare intrare", () => {
    for (const seq of CATALOG) expect(parseSequence(seq), seq).not.toBeNull();
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/patterns.test.ts`
Așteptat: FAIL — `Failed to resolve import "../patterns"`.

- [ ] **Step 3: Scrie implementarea minimă**

Creează `src/lib/angel/patterns.ts`:

```ts
/**
 * Recunoașterea formei unei secvențe. Fără conținut, fără limbi.
 *
 * Un număr-înger nu e un simbol atomic: e o formă aplicată unor cifre. Aici se
 * decide doar care e forma și care sunt cele două cifre care o poartă; ce
 * înseamnă ele e treaba lui compose.ts.
 */

export type PatternKind =
  | "triple"
  | "quad"
  | "alternating"
  | "mirror"
  | "ascending"
  | "descending";

export interface Pattern {
  kind: PatternKind;
  /** Secvența curățată de tot ce nu e cifră. "11:11" -> "1111". */
  sequence: string;
  /** Cifra de la care pornește forma. Pentru repetări, cifra repetată. */
  digitA: number;
  /** A doua cifră a formei. Pentru repetări, aceeași cu digitA. */
  digitB: number;
}

const digitsOf = (s: string): number[] => [...s].map(Number);

export function parseSequence(input: string): Pattern | null {
  const sequence = (input ?? "").replace(/\D/g, "");
  if (sequence.length < 3) return null;

  const d = digitsOf(sequence);
  const first = d[0];
  const last = d[d.length - 1];

  // Repetarea se verifică prima: 1111 satisface și ABAB, și palindromul.
  if (d.every((x) => x === first)) {
    const kind: PatternKind = sequence.length === 3 ? "triple" : "quad";
    return { kind, sequence, digitA: first, digitB: first };
  }

  if (sequence.length === 4 && first !== d[1]) {
    if (d[0] === d[2] && d[1] === d[3]) {
      return { kind: "alternating", sequence, digitA: d[0], digitB: d[1] };
    }
    if (d[0] === d[3] && d[1] === d[2]) {
      return { kind: "mirror", sequence, digitA: d[0], digitB: d[1] };
    }
  }

  if (d.every((x, i) => i === 0 || x === d[i - 1] + 1)) {
    return { kind: "ascending", sequence, digitA: first, digitB: last };
  }
  if (d.every((x, i) => i === 0 || x === d[i - 1] - 1)) {
    return { kind: "descending", sequence, digitA: first, digitB: last };
  }

  return null;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Secvențele pe care le afișăm. Douăzeci dintre ele se generează din regulă,
 * deci nu pot avea goluri; cincisprezece sunt enumerate fiindcă forma lor are
 * un nume. Rezolutorul răspunde și în afara acestei liste, dacă forma se
 * potrivește — catalogul e ce arătăm, nu limita a ce putem citi.
 */
export const CATALOG: string[] = [
  ...DIGITS.map((n) => String(n).repeat(3)),
  ...DIGITS.map((n) => String(n).repeat(4)),
  "1010", "1212", "1313", "1414", "1515", "2121", "2323",
  "1221", "1331", "1441", "1551",
  "123", "1234",
  "321", "4321",
];
```

- [ ] **Step 4: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/patterns.test.ts`
Așteptat: PASS, 10 teste.

- [ ] **Step 5: Verifică tipurile**

Rulează: `npm run typecheck`
Așteptat: fără erori.

- [ ] **Step 6: Commit**

```bash
git add src/lib/angel/patterns.ts src/lib/angel/__tests__/patterns.test.ts
git commit -m "Recunoaște forma unei secvențe de cifre, nu doar numărul ei"
```

---

## Task 2: Tabelul de sfaturi per cifră

Sfaturile trebuie să fie specifice cifrei, altfel 444 și 555 ar da aceleași patru rânduri. Arhetipurile motorului nu au un câmp de sfat, iar motorul e read-only — deci tabelul e al nostru și stă aici.

**Files:**
- Create: `src/lib/angel/advice.ts`
- Test: acoperit de baleiajul din Task 3; aici doar un test propriu de completitudine.

**Interfaces:**
- Consumes: `type Lang = "ro" | "en" | "ru"` din `@/lib/numerology-plus`.
- Produces: `export const DIGIT_ADVICE: Record<number, Record<Lang, string[]>>` — cheile 0–9, exact 3 rânduri per limbă.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/angel/__tests__/advice.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DIGIT_ADVICE } from "../advice";

const LANGS = ["ro", "en", "ru"] as const;

describe("DIGIT_ADVICE", () => {
  it("acoperă toate cele zece cifre", () => {
    for (let n = 0; n <= 9; n++) expect(DIGIT_ADVICE[n], `cifra ${n}`).toBeTruthy();
  });

  it.each(LANGS)("dă exact trei sfaturi în %s, fiecare cu conținut", (lang) => {
    for (let n = 0; n <= 9; n++) {
      const lines = DIGIT_ADVICE[n][lang];
      expect(lines, `cifra ${n} / ${lang}`).toHaveLength(3);
      for (const line of lines) {
        expect(line.trim().length, `cifra ${n} / ${lang}: "${line}"`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("nu repetă același sfat la două cifre în aceeași limbă", () => {
    for (const lang of LANGS) {
      const all = Object.values(DIGIT_ADVICE).flatMap((a) => a[lang]);
      expect(new Set(all).size, lang).toBe(all.length);
    }
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/advice.test.ts`
Așteptat: FAIL — `Failed to resolve import "../advice"`.

- [ ] **Step 3: Scrie implementarea**

Creează `src/lib/angel/advice.ts`:

```ts
/**
 * Sfaturi per cifră, scrise de mână, în trei limbi.
 *
 * Nu vin din motor: arhetipurile n-au câmp de sfat, iar numerology-plus e
 * read-only. Trei rânduri per cifră; al patrulea rând al unei intrări vine din
 * rama tiparului, ca sfatul să fie și despre cifră, și despre formă.
 */

import type { Lang } from "@/lib/numerology-plus";

export const DIGIT_ADVICE: Record<number, Record<Lang, string[]>> = {
  0: {
    ro: [
      "Nu te grăbi să dai un nume la ce abia se deschide",
      "Lasă o decizie nefixată încă o săptămână",
      "Notează ce ai amânat din teamă, nu din lipsă de timp",
    ],
    en: [
      "Do not rush to name what is only beginning to open",
      "Leave one decision unfixed for another week",
      "Write down what you postponed out of fear, not lack of time",
    ],
    ru: [
      "Не спешите называть то, что только открывается",
      "Оставьте одно решение незакреплённым ещё на неделю",
      "Запишите, что вы откладывали из страха, а не из-за нехватки времени",
    ],
  },
  1: {
    ro: [
      "Fă primul pas la ceva ce amâni de o lună",
      "Ia o decizie singur, fără să întrebi în jur",
      "Scrie ce vrei tu, înainte să te uiți la ce se așteaptă de la tine",
    ],
    en: [
      "Take the first step on something you have postponed for a month",
      "Make one decision alone, without polling anyone",
      "Write what you want before looking at what is expected of you",
    ],
    ru: [
      "Сделайте первый шаг в том, что откладываете месяц",
      "Примите одно решение самостоятельно, никого не спрашивая",
      "Запишите, чего хотите вы, прежде чем смотреть, чего ждут от вас",
    ],
  },
  2: {
    ro: [
      "Spune o nemulțumire pe care ai înghițit-o ca să păstrezi pacea",
      "Cere ajutor concret unei persoane anume, nu în general",
      "Ascultă până la capăt înainte să propui soluția",
    ],
    en: [
      "Say one grievance you swallowed to keep the peace",
      "Ask one specific person for concrete help, not the room",
      "Listen all the way through before offering the solution",
    ],
    ru: [
      "Скажите об одном недовольстве, которое проглотили ради мира",
      "Попросите конкретной помощи у конкретного человека, а не у всех",
      "Дослушайте до конца, прежде чем предлагать решение",
    ],
  },
  3: {
    ro: [
      "Termină un lucru început și arată-l cuiva",
      "Spune ceva ce simți, în locul în care de obicei glumești",
      "Alege o singură direcție creativă pentru luna asta",
    ],
    en: [
      "Finish one thing you started and show it to someone",
      "Say what you feel in the place where you would normally joke",
      "Pick a single creative direction for this month",
    ],
    ru: [
      "Закончите одно начатое дело и покажите его кому-нибудь",
      "Скажите то, что чувствуете, там, где обычно шутите",
      "Выберите одно творческое направление на этот месяц",
    ],
  },
  4: {
    ro: [
      "Pune în calendar un pas mic și repetabil, nu un obiectiv mare",
      "Repară un lucru pe care îl ocolești de luni de zile",
      "Verifică dacă disciplina ta servește un scop sau te ascunde",
    ],
    en: [
      "Put a small repeatable step in the calendar, not a large goal",
      "Repair the one thing you have been walking around for months",
      "Check whether your discipline serves a purpose or hides you",
    ],
    ru: [
      "Внесите в календарь маленький повторяемый шаг, а не большую цель",
      "Почините то, что обходите месяцами",
      "Проверьте, служит ли ваша дисциплина цели или прячет вас",
    ],
  },
  5: {
    ro: [
      "Schimbă un singur obicei zilnic, nu toată rutina",
      "Spune „nu” la ceva care doar te ține ocupat",
      "Du până la capăt un lucru început, înainte să pornești altul",
    ],
    en: [
      "Change one daily habit, not the whole routine",
      "Say no to something that only keeps you busy",
      "Carry one started thing to the end before beginning another",
    ],
    ru: [
      "Измените одну ежедневную привычку, а не весь распорядок",
      "Скажите «нет» тому, что просто занимает вас",
      "Доведите начатое до конца, прежде чем браться за новое",
    ],
  },
  6: {
    ro: [
      "Întreabă pe cineva apropiat de ce are nevoie, fără să presupui",
      "Refuză o responsabilitate care nu era a ta",
      "Fă ceva pentru tine cu seriozitatea cu care faci pentru alții",
    ],
    en: [
      "Ask someone close what they need, without assuming",
      "Refuse one responsibility that was never yours to carry",
      "Do something for yourself with the seriousness you give others",
    ],
    ru: [
      "Спросите близкого, что ему нужно, ничего не предполагая",
      "Откажитесь от ответственности, которая не была вашей",
      "Сделайте для себя что-то с той же серьёзностью, что и для других",
    ],
  },
  7: {
    ro: [
      "Rezervă o oră fără ecran și fără scop declarat",
      "Verifică o convingere pe care nu ai testat-o niciodată",
      "Spune cuiva ceva ce de obicei ții pentru tine",
    ],
    en: [
      "Reserve one hour with no screen and no stated purpose",
      "Test one belief you have never actually checked",
      "Tell someone something you usually keep to yourself",
    ],
    ru: [
      "Выделите час без экрана и без заявленной цели",
      "Проверьте убеждение, которое никогда не проверяли",
      "Скажите кому-то то, что обычно держите при себе",
    ],
  },
  8: {
    ro: [
      "Uită-te la cifrele reale, nu la senzația despre ele",
      "Cere ce ți se cuvine, într-un loc în care ai tăcut",
      "Decide ce faci cu un câștig înainte să vină",
    ],
    en: [
      "Look at the actual numbers, not at your feeling about them",
      "Ask for what you are owed in the place where you stayed quiet",
      "Decide what a gain is for before it arrives",
    ],
    ru: [
      "Посмотрите на реальные цифры, а не на ощущение от них",
      "Попросите то, что вам причитается, там, где вы молчали",
      "Решите, на что пойдёт прибыль, прежде чем она придёт",
    ],
  },
  9: {
    ro: [
      "Închide oficial ceva ce s-a terminat de mult în fapt",
      "Dăruiește ceva ce nu-ți mai folosește, dar altcuiva da",
      "Scrie ce ai învățat din capitolul care se închide",
    ],
    en: [
      "Formally close something that in fact ended long ago",
      "Give away what no longer serves you but would serve someone else",
      "Write down what you learned from the chapter that is closing",
    ],
    ru: [
      "Официально закройте то, что фактически давно закончилось",
      "Отдайте то, что не нужно вам, но нужно другому",
      "Запишите, чему научила закрывающаяся глава",
    ],
  },
};
```

- [ ] **Step 4: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/advice.test.ts`
Așteptat: PASS, 5 teste (unul parametrizat pe trei limbi).

- [ ] **Step 5: Commit**

```bash
git add src/lib/angel/advice.ts src/lib/angel/__tests__/advice.test.ts
git commit -m "Dă fiecărei cifre trei sfaturi proprii, în trei limbi"
```

---

## Task 3: Ramele de repetare și compozitorul

Prima livrare cu software care funcționează: 20 de secvențe (toate triplele și cvadruplele) compuse cap-coadă, cu podeaua de lungime impusă.

**Files:**
- Create: `src/lib/angel/frames.ts`
- Create: `src/lib/angel/compose.ts`
- Create: `src/lib/angel/index.ts`
- Test: `src/lib/angel/__tests__/content.test.ts`

**Interfaces:**
- Consumes: `parseSequence`, `CATALOG`, `Pattern`, `PatternKind` din `./patterns`; `DIGIT_ADVICE` din `./advice`; `archetypeFor`, `type Lang` din `@/lib/numerology-plus`.
- Produces:
  - `export interface PatternFrame { kind: PatternKind; frequency: "common" | "uncommon" | "rare"; titleTpl: Record<Lang,string>; shortTpl: Record<Lang,string>; spiritualTpl: Record<Lang,string>; leadTpl: Record<Lang,string>; amplifyTpl: Record<Lang,string>; worksTpl: Record<Lang,string>; breaksTpl: Record<Lang,string>; adviceTpl: Record<Lang,string> }`
  - `export const PATTERN_FRAMES: Record<PatternKind, PatternFrame>`
  - `export interface AngelNumberMeaning { number: string; title: Record<Lang,string>; shortMessage: Record<Lang,string>; fullMeaning: Record<Lang,string>; spiritualSignificance: Record<Lang,string>; actionAdvice: Record<Lang,string[]>; relatedNumbers: string[]; keywords: Record<Lang,string[]>; frequency: "common" | "uncommon" | "rare" }` (în `compose.ts`)
  - `export function composeMeaning(pattern: Pattern): AngelNumberMeaning` (în `compose.ts`)
  - `export function getAngelNumberMeaning(input: string): AngelNumberMeaning | null`, `export function getAllAngelNumbers(): AngelNumberMeaning[]`, `export function searchAngelNumbers(query: string, language: Lang): AngelNumberMeaning[]` (în `index.ts`)

Ramele din acest task acoperă `triple` și `quad`. Cele patru rame relaționale vin în Task 4; până atunci `PATTERN_FRAMES` are două chei, iar `composeMeaning` returnează `null` pentru restul — de aceea baleiajul de aici filtrează catalogul la cele două tipare.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/angel/__tests__/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CATALOG, parseSequence } from "../patterns";
import { getAngelNumberMeaning } from "../index";

/**
 * Completitudinea conținutului, verificată prin baleiaj, nu prin eșantion.
 * Modelat după src/lib/numerology-plus/__tests__/content.test.ts: un text lipsă
 * într-o singură limbă a unui singur câmp e invizibil până când cineva alege
 * acea limbă, iar tot rostul compunerii era ca un gol să fie găsibil mecanic.
 */

const LANGS = ["ro", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const NO_PLACEHOLDER =
  /\{(sequence|digitA|digitB|titleA|titleB|essenceA|essenceB|strengthA|strengthB|shadowA|shadowB)\}/;

/** Interpretările scurte sunt exact critica pe care piața o aduce concurenților. */
const MIN_FULL_MEANING = 600;

// Task 4 adaugă restul; până atunci se verifică ce e implementat.
const COVERED = CATALOG.filter((s) => ["triple", "quad"].includes(parseSequence(s)!.kind));

describe("secvențele de repetare", () => {
  it("acoperă toate cele douăzeci", () => {
    expect(COVERED).toHaveLength(20);
    for (const seq of COVERED) expect(getAngelNumberMeaning(seq), seq).not.toBeNull();
  });

  it.each(LANGS)("are toate câmpurile pline în %s", (lang: Lang) => {
    for (const seq of COVERED) {
      const m = getAngelNumberMeaning(seq)!;
      for (const field of ["title", "shortMessage", "fullMeaning", "spiritualSignificance"] as const) {
        expect(m[field][lang].trim().length, `${seq}/${lang} ${field} gol`).toBeGreaterThanOrEqual(10);
        expect(m[field][lang], `${seq}/${lang} ${field} placeholder`).not.toMatch(NO_PLACEHOLDER);
      }
      expect(m.keywords[lang], `${seq}/${lang} keywords`).toHaveLength(4);
      expect(m.actionAdvice[lang], `${seq}/${lang} advice`).toHaveLength(4);
      for (const line of m.actionAdvice[lang]) {
        expect(line, `${seq}/${lang} advice placeholder`).not.toMatch(NO_PLACEHOLDER);
      }
    }
  });

  it.each(LANGS)("dă o interpretare lungă în %s, nu un rând", (lang: Lang) => {
    for (const seq of COVERED) {
      const len = getAngelNumberMeaning(seq)!.fullMeaning[lang].length;
      expect(len, `${seq}/${lang} are ${len} caractere`).toBeGreaterThanOrEqual(MIN_FULL_MEANING);
    }
  });

  it("compune și o secvență din afara catalogului", () => {
    const m = getAngelNumberMeaning("77777");
    expect(m).not.toBeNull();
    expect(m!.number).toBe("77777");
    expect(m!.fullMeaning.ro).toContain("77777");
  });

  it("returnează null când nu e niciun tipar", () => {
    expect(getAngelNumberMeaning("4729")).toBeNull();
  });

  it("leagă un triplu de rudele lui", () => {
    expect(getAngelNumberMeaning("444")!.relatedNumbers).toEqual(["4", "44", "4444"]);
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: FAIL — `Failed to resolve import "../index"`.

- [ ] **Step 3: Scrie ramele de repetare**

Creează `src/lib/angel/frames.ts`:

```ts
/**
 * Ramele de tipar — ce înseamnă FORMA unei secvențe, independent de cifrele ei.
 *
 * Interpretarea finală = ramă + arhetip. Șabloanele acceptă:
 *   {sequence} secvența · {digitA} {digitB} cifrele
 *   {titleA} {essenceA} {strengthA} {shadowA} — arhetipul primei cifre
 *   {titleB} {essenceB} {strengthB} {shadowB} — arhetipul celei de-a doua
 * Pentru repetări, B e identic cu A, ca substituția să fie uniformă.
 *
 * {essenceX} e o frază nominală care poate conține o linie de pauză, așa că
 * apare doar la final de propoziție, după „e” sau după două puncte. Oriunde
 * altundeva ar rupe fraza.
 */

import type { Lang } from "@/lib/numerology-plus";
import type { PatternKind } from "./patterns";

export interface PatternFrame {
  kind: PatternKind;
  frequency: "common" | "uncommon" | "rare";
  titleTpl: Record<Lang, string>;
  shortTpl: Record<Lang, string>;
  spiritualTpl: Record<Lang, string>;
  /** Primul paragraf din fullMeaning: ce e forma. */
  leadTpl: Record<Lang, string>;
  /** Al doilea: ce adaugă repetiția sau relația. */
  amplifyTpl: Record<Lang, string>;
  /** Al treilea: cum arată când funcționează. Folosește {strengthA}. */
  worksTpl: Record<Lang, string>;
  /** Al patrulea: cum arată când se distorsionează. Folosește {shadowA}. */
  breaksTpl: Record<Lang, string>;
  /** Al patrulea rând de sfat, cel legat de formă. */
  adviceTpl: Record<Lang, string>;
}

const TRIPLE: PatternFrame = {
  kind: "triple",
  frequency: "common",
  titleTpl: {
    ro: "{titleA}, de trei ori",
    en: "{titleA}, three times over",
    ru: "{titleA}, трижды",
  },
  shortTpl: {
    ro: "Cifra {digitA} revine până o observi: e {essenceA}.",
    en: "The digit {digitA} keeps returning until you notice it: it is {essenceA}.",
    ru: "Цифра {digitA} возвращается, пока вы её не заметите: это {essenceA}.",
  },
  spiritualTpl: {
    ro: "Pragul la care o coincidență încetează să mai fie coincidență.",
    en: "The threshold at which a coincidence stops being one.",
    ru: "Порог, на котором совпадение перестаёт быть совпадением.",
  },
  leadTpl: {
    ro: "Când aceeași cifră apare de trei ori, nu citești trei numere, ci unul singur spus mai tare. {sequence} este {digitA} adus la o intensitate la care nu-l mai poți trata ca pe un detaliu de fundal: e {essenceA}.",
    en: "When the same digit appears three times you are not reading three numbers but one said louder. {sequence} is {digitA} raised to an intensity at which you can no longer treat it as background detail: it is {essenceA}.",
    ru: "Когда одна и та же цифра появляется трижды, вы читаете не три числа, а одно, сказанное громче. {sequence} — это {digitA}, доведённая до силы, при которой её уже не спишешь на фон: это {essenceA}.",
  },
  amplifyTpl: {
    ro: "Repetiția nu schimbă înțelesul cifrei, îi schimbă urgența. Trei este numărul la care atenția se predă: prima dată treci pe lângă, a doua oară remarci, a treia oară te întorci și te uiți. De aceea tripletele sunt secvențele pe care le rețin oamenii — nu pentru că ar fi mai puternice în sine, ci pentru că trei e exact pragul la care mintea acceptă că vede un tipar, nu o întâmplare.",
    en: "Repetition does not change what the digit means; it changes how urgent it is. Three is the count at which attention gives in: the first time you walk past, the second time you notice, the third time you turn around and look. That is why triples are the sequences people remember — not because they are stronger in themselves, but because three is exactly the threshold at which the mind accepts it is seeing a pattern rather than an accident.",
    ru: "Повтор не меняет значение цифры — он меняет её срочность. Три — то самое число, на котором внимание сдаётся: в первый раз вы проходите мимо, во второй замечаете, в третий оборачиваетесь и смотрите. Поэтому тройки запоминаются — не потому, что сильнее сами по себе, а потому, что три и есть порог, на котором ум признаёт: это закономерность, а не случайность.",
  },
  worksTpl: {
    ro: "Când energia asta lucrează în favoarea ta, arată așa: {strengthA}. Perioada în care vezi {sequence} des e, de regulă, perioada în care exact această capacitate e cerută de context — nu întâmplător, ci pentru că ai ajuns în punctul unde ea face diferența.",
    en: "When this energy works in your favour it looks like this: {strengthA}. The stretch in which you keep seeing {sequence} is usually the stretch in which exactly this capacity is what the situation asks for — not by chance, but because you have reached the point where it makes the difference.",
    ru: "Когда эта энергия работает на вас, это выглядит так: {strengthA}. Период, в котором вы часто видите {sequence}, обычно и есть период, когда именно эта способность требуется обстоятельствами — не случайно, а потому, что вы дошли до точки, где она решает.",
  },
  breaksTpl: {
    ro: "Când se distorsionează, arată așa: {shadowA}. Dacă te regăsești mai degrabă aici decât în paragraful de dinainte, {sequence} nu e o confirmare, ci o corectură — aceeași energie, întoarsă împotriva ta. Întrebarea utilă nu e „ce înseamnă {sequence}”, ci „unde anume, în ultima lună, am alunecat în asta”.",
    en: "When it distorts it looks like this: {shadowA}. If you recognise yourself here rather than in the paragraph before, {sequence} is not a confirmation but a correction — the same energy turned against you. The useful question is not “what does {sequence} mean” but “where exactly, in the past month, did I slide into that”.",
    ru: "Когда она искажается, это выглядит так: {shadowA}. Если вы узнаёте себя скорее здесь, чем в предыдущем абзаце, {sequence} — не подтверждение, а поправка: та же энергия, обращённая против вас. Полезный вопрос не «что значит {sequence}», а «где именно за последний месяц я в это соскользнул».",
  },
  adviceTpl: {
    ro: "Notează unde ai văzut {sequence} — locul contează mai mult decât numărul",
    en: "Note where you saw {sequence} — the place matters more than the number",
    ru: "Запишите, где вы видели {sequence} — место важнее самого числа",
  },
};

const QUAD: PatternFrame = {
  kind: "quad",
  frequency: "uncommon",
  titleTpl: {
    ro: "{titleA}, dus până la capăt",
    en: "{titleA}, taken all the way",
    ru: "{titleA}, доведённый до предела",
  },
  shortTpl: {
    ro: "A patra repetare nu mai cere atenție, ci decizie: e {essenceA}.",
    en: "A fourth repetition asks not for attention but for a decision: it is {essenceA}.",
    ru: "Четвёртый повтор просит не внимания, а решения: это {essenceA}.",
  },
  spiritualTpl: {
    ro: "O ușă care stă deschisă un timp limitat.",
    en: "A door that stays open for a limited time.",
    ru: "Дверь, открытая ограниченное время.",
  },
  leadTpl: {
    ro: "Patru repetări ale aceleiași cifre nu mai sunt un semnal, sunt o insistență. {sequence} spune {digitA} de patru ori la rând, iar la a patra oară mesajul nu mai e „uită-te”, ci „ai văzut deja, ce faci cu asta”. Energia rămâne aceeași: e {essenceA}.",
    en: "Four repetitions of the same digit are no longer a signal but an insistence. {sequence} says {digitA} four times over, and by the fourth the message is not “look” but “you have already looked — now what”. The energy is unchanged: it is {essenceA}.",
    ru: "Четыре повтора одной цифры — уже не сигнал, а настойчивость. {sequence} произносит {digitA} четыре раза подряд, и к четвёртому послание звучит не «посмотри», а «ты уже посмотрел — и что дальше». Энергия та же: это {essenceA}.",
  },
  amplifyTpl: {
    ro: "Diferența dintre trei și patru repetări e diferența dintre a observa și a răspunde. Tripletele apar cât ceva încă se conturează; cvadruplele apar, de obicei, după ce ai amânat deja o alegere pe care o știai. De aceea secvențele de patru cifre se văd cel mai des pe ceas: la oră exactă, într-un moment în care nu faci nimic altceva decât să aștepți. Nu ceasul le produce — atenția ta liberă le observă.",
    en: "The difference between three repetitions and four is the difference between noticing and answering. Triples show up while something is still taking shape; quadruples usually show up after you have already postponed a choice you knew about. That is why four-digit sequences are most often seen on a clock: at an exact hour, in a moment when you are doing nothing but waiting. The clock does not produce them — your unoccupied attention notices them.",
    ru: "Разница между тремя и четырьмя повторами — это разница между «заметить» и «ответить». Тройки появляются, пока что-то только складывается; четвёрки — обычно после того, как вы уже отложили выбор, о котором знали. Поэтому четырёхзначные последовательности чаще всего видны на часах: в ровный час, когда вы не делаете ничего, кроме ожидания. Их создают не часы — их замечает ваше свободное внимание.",
  },
  worksTpl: {
    ro: "Dacă răspunzi, se vede așa: {strengthA}. Ce distinge o perioadă de {sequence} bine folosită de una irosită nu e intensitatea trăirii, ci dacă a rămas ceva în urma ei — o decizie luată, o conversație purtată, un lucru început efectiv.",
    en: "If you answer, it looks like this: {strengthA}. What separates a {sequence} stretch well used from one wasted is not the intensity of the feeling but whether anything remains after it — a decision taken, a conversation held, something actually begun.",
    ru: "Если вы отвечаете, это выглядит так: {strengthA}. Хорошо использованный период {sequence} отличается от растраченного не силой переживания, а тем, осталось ли что-то после: принятое решение, состоявшийся разговор, действительно начатое дело.",
  },
  breaksTpl: {
    ro: "Dacă nu răspunzi, se vede așa: {shadowA}. Riscul specific al cvadruplelor e să confunzi semnul cu fapta: să colecționezi apariții, să le fotografiezi, să le povestești — și să nu schimbi nimic. Un semn pe care îl observi de zece ori și nu îl urmezi niciodată nu mai e un semn, e un obicei.",
    en: "If you do not answer, it looks like this: {shadowA}. The specific risk of quadruples is mistaking the sign for the act: collecting sightings, photographing them, telling people about them — and changing nothing. A sign you notice ten times and never follow stops being a sign and becomes a habit.",
    ru: "Если вы не отвечаете, это выглядит так: {shadowA}. Особый риск четвёрок — спутать знак с поступком: коллекционировать появления, фотографировать их, рассказывать о них — и ничего не менять. Знак, замеченный десять раз и ни разу не исполненный, перестаёт быть знаком и становится привычкой.",
  },
  adviceTpl: {
    ro: "Alege o singură acțiune și fă-o în 48 de ore, altfel {sequence} rămâne decor",
    en: "Pick one action and do it within 48 hours, or {sequence} stays decoration",
    ru: "Выберите одно действие и сделайте его за 48 часов, иначе {sequence} останется декорацией",
  },
};

export const PATTERN_FRAMES: Partial<Record<PatternKind, PatternFrame>> = {
  triple: TRIPLE,
  quad: QUAD,
};
```

- [ ] **Step 4: Scrie compozitorul**

Creează `src/lib/angel/compose.ts`:

```ts
/**
 * Tipar + arhetip + sfaturi → interpretarea finală.
 *
 * Arhetipurile vin din motor (numerology-plus), care e citit, nu modificat.
 * Consecința practică: dacă cineva schimbă arhetipul cifrei 7, se actualizează
 * 777 și 7777 în toate limbile, fără nicio atingere aici.
 */

import { archetypeFor, type Lang } from "@/lib/numerology-plus";
import type { Pattern } from "./patterns";
import { PATTERN_FRAMES, type PatternFrame } from "./frames";
import { DIGIT_ADVICE } from "./advice";

const LANGS: Lang[] = ["ro", "en", "ru"];

export interface AngelNumberMeaning {
  number: string;
  title: Record<Lang, string>;
  shortMessage: Record<Lang, string>;
  fullMeaning: Record<Lang, string>;
  spiritualSignificance: Record<Lang, string>;
  actionAdvice: Record<Lang, string[]>;
  relatedNumbers: string[];
  keywords: Record<Lang, string[]>;
  frequency: "common" | "uncommon" | "rare";
}

const fill = (tpl: string, vars: Record<string, string | number>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

const byLang = (fn: (lang: Lang) => string): Record<Lang, string> =>
  Object.fromEntries(LANGS.map((l) => [l, fn(l)])) as Record<Lang, string>;

const byLangList = (fn: (lang: Lang) => string[]): Record<Lang, string[]> =>
  Object.fromEntries(LANGS.map((l) => [l, fn(l)])) as Record<Lang, string[]>;

/** Rudele unei secvențe: alte forme ale acelorași cifre, fără ea însăși. */
function relatives(p: Pattern): string[] {
  const d = String(p.digitA);
  if (p.digitA === p.digitB) {
    return [d, d.repeat(2), d.repeat(3), d.repeat(4)]
      .filter((n) => n !== p.sequence)
      .slice(0, 3);
  }
  return [d, String(p.digitB), [...p.sequence].reverse().join("")]
    .filter((n) => n !== p.sequence)
    .slice(0, 3);
}

export function composeMeaning(pattern: Pattern): AngelNumberMeaning | null {
  const frame: PatternFrame | undefined = PATTERN_FRAMES[pattern.kind];
  if (!frame) return null;

  const a = archetypeFor(pattern.digitA);
  const b = archetypeFor(pattern.digitB);

  const vars = (lang: Lang) => ({
    sequence: pattern.sequence,
    digitA: pattern.digitA,
    digitB: pattern.digitB,
    titleA: a.title[lang],
    essenceA: a.essence[lang],
    strengthA: a.strength[lang],
    shadowA: a.shadow[lang],
    titleB: b.title[lang],
    essenceB: b.essence[lang],
    strengthB: b.strength[lang],
    shadowB: b.shadow[lang],
  });

  return {
    number: pattern.sequence,
    title: byLang((l) => fill(frame.titleTpl[l], vars(l))),
    shortMessage: byLang((l) => fill(frame.shortTpl[l], vars(l))),
    spiritualSignificance: byLang((l) => fill(frame.spiritualTpl[l], vars(l))),
    fullMeaning: byLang((l) =>
      [frame.leadTpl[l], frame.amplifyTpl[l], frame.worksTpl[l], frame.breaksTpl[l]]
        .map((tpl) => fill(tpl, vars(l)))
        .join(" "),
    ),
    actionAdvice: byLangList((l) => [
      ...DIGIT_ADVICE[pattern.digitA][l],
      fill(frame.adviceTpl[l], vars(l)),
    ]),
    keywords: byLangList((l) =>
      pattern.digitA === pattern.digitB
        ? a.keywords[l].slice(0, 4)
        : [...a.keywords[l].slice(0, 2), ...b.keywords[l].slice(0, 2)],
    ),
    relatedNumbers: relatives(pattern),
    frequency: frame.frequency,
  };
}
```

- [ ] **Step 5: Scrie API-ul public**

Creează `src/lib/angel/index.ts`:

```ts
/**
 * Numerele-înger. API-ul public, cu aceleași nume ca vechiul angelNumbers.ts,
 * ca AngelNumberCard și unealta să nu se schimbe în afara căii de import.
 */

import type { Lang } from "@/lib/numerology-plus";
import { CATALOG, parseSequence } from "./patterns";
import { composeMeaning, type AngelNumberMeaning } from "./compose";

export type { AngelNumberMeaning };
export { CATALOG };

/**
 * Rezolvă o secvență. Răspunde și pentru numere din afara catalogului, atâta
 * timp cât forma lor e recunoscută — catalogul e ce afișăm, nu limita a ce
 * putem citi. Pentru un număr fără niciun tipar, null: nu inventăm un sens.
 */
export function getAngelNumberMeaning(input: string): AngelNumberMeaning | null {
  const pattern = parseSequence(input);
  return pattern ? composeMeaning(pattern) : null;
}

export function getAllAngelNumbers(): AngelNumberMeaning[] {
  return CATALOG.map((seq) => getAngelNumberMeaning(seq)).filter(
    (m): m is AngelNumberMeaning => m !== null,
  );
}

export function searchAngelNumbers(query: string, language: Lang): AngelNumberMeaning[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllAngelNumbers().filter(
    (m) =>
      m.number.includes(q) ||
      m.title[language].toLowerCase().includes(q) ||
      m.keywords[language].some((k) => k.toLowerCase().includes(q)),
  );
}
```

- [ ] **Step 6: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: PASS, 11 teste. Dacă vreo aserțiune de lungime pică sub 600, mărește paragraful `amplifyTpl` al ramei vinovate — el e partea fixă, deci ridică toate cele zece secvențe ale acelui tipar deodată.

- [ ] **Step 7: Verifică tipurile și lint-ul**

Rulează: `npm run typecheck && npm run lint`
Așteptat: fără erori.

- [ ] **Step 8: Commit**

```bash
git add src/lib/angel/frames.ts src/lib/angel/compose.ts src/lib/angel/index.ts src/lib/angel/__tests__/content.test.ts
git commit -m "Compune tripletele și cvadruplele din arhetipuri, cu text lung"
```

---

## Task 4: Ramele relaționale

Cele patru forme în care contează două cifre, nu una. Catalogul urcă de la 20 la 35 de secvențe acoperite.

**Files:**
- Modify: `src/lib/angel/frames.ts` — se adaugă patru constante și se completează `PATTERN_FRAMES`
- Modify: `src/lib/angel/__tests__/content.test.ts` — baleiajul nu mai filtrează catalogul

**Interfaces:**
- Consumes: `PatternFrame` din `./frames` (definit în Task 3), `PatternKind` din `./patterns`.
- Produces: `PATTERN_FRAMES` devine complet — tipul se strânge de la `Partial<Record<PatternKind, PatternFrame>>` la `Record<PatternKind, PatternFrame>`.

- [ ] **Step 1: Lărgește testul ca să pice**

În `src/lib/angel/__tests__/content.test.ts`, înlocuiește linia de filtrare

```ts
// Task 4 adaugă restul; până atunci se verifică ce e implementat.
const COVERED = CATALOG.filter((s) => ["triple", "quad"].includes(parseSequence(s)!.kind));
```

cu

```ts
const COVERED = CATALOG;
```

`parseSequence` rămâne astfel neimportat-folosit și `npm run lint` cade pe `no-unused-vars`. Restrânge deci și importul, din

```ts
import { CATALOG, parseSequence } from "../patterns";
```

în

```ts
import { CATALOG } from "../patterns";
```

Apoi înlocuiește blocul `describe("secvențele de repetare", …)` cu titlul `describe("catalogul", …)`, schimbând prima aserțiune din

```ts
    expect(COVERED).toHaveLength(20);
```

în

```ts
    expect(COVERED).toHaveLength(35);
```

Adaugă la finalul fișierului un bloc nou:

```ts
describe("formele relaționale", () => {
  it("numește ambele cifre într-o alternanță", () => {
    const m = getAngelNumberMeaning("1212")!;
    expect(m.fullMeaning.ro).toContain("1212");
    expect(m.relatedNumbers).toEqual(["1", "2", "2121"]);
  });

  it("ia câte două cuvinte-cheie din fiecare cifră", () => {
    const m = getAngelNumberMeaning("1221")!;
    expect(m.keywords.ro).toHaveLength(4);
    expect(m.keywords.en).toHaveLength(4);
    expect(m.keywords.ru).toHaveLength(4);
  });

  it("citește un urcuș de la prima la ultima cifră", () => {
    const m = getAngelNumberMeaning("1234")!;
    expect(m.fullMeaning.en).toContain("1234");
    expect(m.frequency).toBe("rare");
  });

  it("compune o alternanță care nu e în catalog", () => {
    expect(getAngelNumberMeaning("3434")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: FAIL — `expect(received).not.toBeNull()` pentru "1010" în primul test, fiindcă `PATTERN_FRAMES.alternating` e `undefined`.

- [ ] **Step 3: Adaugă cele patru rame**

În `src/lib/angel/frames.ts`, inserează înainte de exportul `PATTERN_FRAMES`:

```ts
const ALTERNATING: PatternFrame = {
  kind: "alternating",
  frequency: "rare",
  titleTpl: {
    ro: "{titleA} și {titleB}, pe rând",
    en: "{titleA} and {titleB}, taking turns",
    ru: "{titleA} и {titleB}, по очереди",
  },
  shortTpl: {
    ro: "Două energii care se schimbă între ele: {essenceA}, apoi {essenceB}.",
    en: "Two energies trading places: {essenceA}, then {essenceB}.",
    ru: "Две энергии меняются местами: {essenceA}, затем {essenceB}.",
  },
  spiritualTpl: {
    ro: "Ritm, nu conflict — două lucruri cerute alternativ.",
    en: "Rhythm rather than conflict — two things asked for in turn.",
    ru: "Ритм, а не конфликт — два требования по очереди.",
  },
  leadTpl: {
    ro: "În {sequence} nicio cifră nu câștigă. {digitA} și {digitB} se schimbă între ele, iar asta e chiar mesajul: nu ai de ales una, ai de învățat trecerea de la una la alta. Prima e {essenceA}. A doua e {essenceB}.",
    en: "In {sequence} neither digit wins. {digitA} and {digitB} trade places, and that is the message: you are not being asked to choose one but to learn the crossing between them. The first is {essenceA}. The second is {essenceB}.",
    ru: "В {sequence} ни одна цифра не побеждает. {digitA} и {digitB} меняются местами, и в этом послание: не выбрать одну, а научиться переходу между ними. Первая — {essenceA}. Вторая — {essenceB}.",
  },
  amplifyTpl: {
    ro: "Secvențele alternante apar de obicei în perioade în care oscilezi și îți reproșezi oscilația. Citite corect, spun contrariul: oscilația nu e defectul, e forma pe care o ia lucrul acesta atunci când e sănătos. Ce e greșit nu e trecerea de la una la alta, ci încercarea de a rămâne blocat într-una singură pentru că din afară pare mai coerent.",
    en: "Alternating sequences usually turn up in periods when you are swinging between two things and blaming yourself for swinging. Read correctly they say the opposite: the oscillation is not the fault, it is the shape this takes when it is healthy. What is wrong is not the crossing back and forth but the attempt to stay locked in one side because that looks more consistent from outside.",
    ru: "Чередующиеся последовательности обычно приходят в периоды, когда вы колеблетесь между двумя вещами и корите себя за это. Прочитанные верно, они говорят обратное: колебание — не изъян, а форма, которую это принимает, когда здорово. Неверно не переходить туда-обратно, а пытаться застрять в одной стороне, потому что снаружи это выглядит последовательнее.",
  },
  worksTpl: {
    ro: "Când ritmul e bun, prima energie îți dă asta: {strengthA}. Iar a doua îți dă asta: {strengthB}. Nu se anulează una pe alta — se odihnesc una pe alta, și fiecare devine posibilă pentru că cealaltă a mers înainte.",
    en: "When the rhythm is right, the first energy gives you this: {strengthA}. And the second gives you this: {strengthB}. They do not cancel each other — they rest on one another, and each becomes possible because the other went first.",
    ru: "Когда ритм верен, первая энергия даёт вот что: {strengthA}. А вторая — вот что: {strengthB}. Они не отменяют друг друга: они опираются одна на другую, и каждая становится возможной, потому что другая прошла раньше.",
  },
  breaksTpl: {
    ro: "Când ritmul se strică, prima alunecă în {shadowA}, iar a doua în {shadowB}. Semnul e simplu: treci de la una la alta din epuizare, nu din alegere — fugi din prima în a doua și înapoi, fără să te oprești în niciuna.",
    en: "When the rhythm breaks, the first slips into {shadowA} and the second into {shadowB}. The sign is simple: you move from one to the other out of exhaustion rather than choice — fleeing the first into the second and back, without settling in either.",
    ru: "Когда ритм ломается, первая соскальзывает в {shadowA}, а вторая — в {shadowB}. Признак прост: вы переходите от одной к другой от истощения, а не по выбору — бежите из первой во вторую и обратно, не задерживаясь ни в одной.",
  },
  adviceTpl: {
    ro: "Dă fiecăreia un interval clar în săptămâna asta, în loc să le amesteci",
    en: "Give each of them a clear slot this week instead of mixing them",
    ru: "Отведите каждой чёткий интервал на этой неделе, вместо того чтобы смешивать",
  },
};

const MIRROR: PatternFrame = {
  kind: "mirror",
  frequency: "rare",
  titleTpl: {
    ro: "{titleA} și {titleB}, în oglindă",
    en: "{titleA} and {titleB}, mirrored",
    ru: "{titleA} и {titleB}, зеркально",
  },
  shortTpl: {
    ro: "Secvența se citește la fel în ambele sensuri. La margini stă {essenceA}.",
    en: "The sequence reads the same both ways. At the edges stands {essenceA}.",
    ru: "Последовательность читается одинаково в обе стороны. По краям стоит {essenceA}.",
  },
  spiritualTpl: {
    ro: "Un cerc închis — sfârșitul se întoarce în început.",
    en: "A closed circle — the end returns into the beginning.",
    ru: "Замкнутый круг — конец возвращается в начало.",
  },
  leadTpl: {
    ro: "{sequence} se citește identic de la stânga la dreapta și invers. La margini stă {digitA}, care e {essenceA}. La mijloc stă {digitB}, care e {essenceB}. Forma spune că ceva se întoarce de unde a plecat.",
    en: "{sequence} reads identically left to right and right to left. At the edges stands {digitA}, which is {essenceA}. At the centre stands {digitB}, which is {essenceB}. The shape says that something is returning to where it started.",
    ru: "{sequence} читается одинаково слева направо и справа налево. По краям стоит {digitA}, а это {essenceA}. В середине — {digitB}, а это {essenceB}. Форма говорит, что нечто возвращается туда, откуда вышло.",
  },
  amplifyTpl: {
    ro: "Secvențele în oglindă apar în perioade de repetare: o situație pe care ai mai trăit-o, o persoană de tipul celei de dinainte, o alegere care seamănă suspect cu una veche. Nu e nici pedeapsă, nici buclă. Un tipar revine pentru că prima dată l-ai traversat fără să-l vezi; a doua oară ai deja materialul ca să-l recunoști, și tocmai de aceea îl poți încheia.",
    en: "Mirror sequences show up in periods of repetition: a situation you have lived before, a person of the same kind as the last one, a choice that resembles an old one a little too closely. This is neither a punishment nor a loop. A pattern comes back because the first time you crossed it without seeing it; the second time you already have the material to recognise it, which is exactly why you can end it.",
    ru: "Зеркальные последовательности появляются в периоды повторения: ситуация, которую вы уже проживали, человек того же типа, что и прежде, выбор, подозрительно похожий на старый. Это не наказание и не петля. Закономерность возвращается потому, что в первый раз вы прошли её, не увидев; во второй у вас уже есть материал, чтобы её узнать, — и именно поэтому вы можете её закрыть.",
  },
  worksTpl: {
    ro: "Când o închizi bine, marginea îți dă asta: {strengthA}, iar miezul asta: {strengthB}. Un tipar încheiat nu dispare — se transformă în ceva ce știi și pe care nu mai trebuie să-l plătești a doua oară.",
    en: "When you close it well, the edge gives you this: {strengthA}, and the centre this: {strengthB}. A pattern that is finished does not vanish — it turns into something you know and no longer have to pay for twice.",
    ru: "Когда вы закрываете её верно, край даёт вот что: {strengthA}, а сердцевина — вот что: {strengthB}. Завершённая закономерность не исчезает: она превращается в знание, за которое не нужно платить дважды.",
  },
  breaksTpl: {
    ro: "Când o ratezi, marginea alunecă în {shadowA}, iar miezul în {shadowB} — și tiparul se pregătește să revină a treia oară, în alt costum. Semnul e că povestești situația nouă cu exact cuvintele cu care ai povestit-o pe cea veche.",
    en: "When you miss it, the edge slips into {shadowA} and the centre into {shadowB} — and the pattern prepares to return a third time in a different costume. The sign is that you describe the new situation in exactly the words you used for the old one.",
    ru: "Когда вы её упускаете, край соскальзывает в {shadowA}, а сердцевина — в {shadowB}, и закономерность готовится вернуться в третий раз, в другом костюме. Признак — вы описываете новую ситуацию ровно теми же словами, что и старую.",
  },
  adviceTpl: {
    ro: "Scrie în ce a semănat situația asta cu una veche — apoi ce faci altfel",
    en: "Write down how this resembles an old situation — then what you will do differently",
    ru: "Запишите, чем это похоже на старую ситуацию, — и что вы сделаете иначе",
  },
};

const ASCENDING: PatternFrame = {
  kind: "ascending",
  frequency: "rare",
  titleTpl: {
    ro: "De la {titleA} la {titleB}",
    en: "From {titleA} to {titleB}",
    ru: "От {titleA} к {titleB}",
  },
  shortTpl: {
    ro: "O secvență care urcă. Pornește din {essenceA}.",
    en: "A sequence that climbs. It starts in {essenceA}.",
    ru: "Последовательность, идущая вверх. Она начинается в {essenceA}.",
  },
  spiritualTpl: {
    ro: "Ordine — pași în șir, fără sărituri.",
    en: "Order — steps in a row, with nothing skipped.",
    ru: "Порядок — шаги подряд, без пропусков.",
  },
  leadTpl: {
    ro: "{sequence} nu repetă nimic: urcă. Fiecare cifră o urmează pe cea dinainte fără să sară niciuna, iar asta e tot mesajul. Punctul de plecare e {digitA}, care e {essenceA}. Punctul în care ajungi e {digitB}, care e {essenceB}.",
    en: "{sequence} repeats nothing: it climbs. Each digit follows the one before without skipping any, and that is the entire message. The starting point is {digitA}, which is {essenceA}. Where you arrive is {digitB}, which is {essenceB}.",
    ru: "{sequence} ничего не повторяет: она поднимается. Каждая цифра следует за предыдущей без пропусков, и в этом всё послание. Точка выхода — {digitA}, а это {essenceA}. Точка прихода — {digitB}, а это {essenceB}.",
  },
  amplifyTpl: {
    ro: "O secvență ascendentă apare, aproape întotdeauna, în perioade în care cauți scurtătura. Forma ei o refuză: nu poți ajunge la ultima cifră fără să treci prin toate cele dinainte. Nu e o promisiune că va merge ușor — e o observație despre ordine. Ce sari acum se întoarce mai târziu ca lipsă, într-un moment în care e mai scump de reparat.",
    en: "An ascending sequence turns up, almost always, in periods when you are looking for the shortcut. Its shape refuses one: you cannot reach the last digit without passing through every digit before it. This is not a promise that things will be easy — it is an observation about order. What you skip now comes back later as a gap, at a moment when it costs more to repair.",
    ru: "Восходящая последовательность приходит почти всегда в те периоды, когда вы ищете короткий путь. Её форма отказывает в нём: нельзя дойти до последней цифры, не пройдя все предыдущие. Это не обещание, что будет легко, — это наблюдение о порядке. Пропущенное сейчас вернётся позже пробелом, в момент, когда чинить его дороже.",
  },
  worksTpl: {
    ro: "La bază, {digitA} îți dă asta: {strengthA}. La capăt, {digitB} îți dă asta: {strengthB}. Când respecți ordinea, progresul nu se simte spectaculos — se simte inevitabil, ceea ce e cu mult mai bine.",
    en: "At the base, {digitA} gives you this: {strengthA}. At the top, {digitB} gives you this: {strengthB}. When you respect the order, progress does not feel spectacular — it feels inevitable, which is considerably better.",
    ru: "В основании {digitA} даёт вот что: {strengthA}. На вершине {digitB} даёт вот что: {strengthB}. Когда порядок соблюдён, прогресс ощущается не эффектным, а неизбежным — что намного лучше.",
  },
  breaksTpl: {
    ro: "Când forțezi ritmul, baza alunecă în {shadowA} și vârful în {shadowB}. Se recunoaște ușor: ai multe lucruri începute la nivelul de sus și niciunul terminat la cel de jos.",
    en: "When you force the pace, the base slips into {shadowA} and the top into {shadowB}. It is easy to recognise: you have many things started at the upper level and nothing finished at the lower one.",
    ru: "Когда вы форсируете темп, основание соскальзывает в {shadowA}, а вершина — в {shadowB}. Узнать легко: у вас много начатого на верхнем уровне и ничего завершённого на нижнем.",
  },
  adviceTpl: {
    ro: "Scrie pașii în ordine și fă-l azi pe primul, nu pe cel mai interesant",
    en: "Write the steps in order and do the first one today, not the most interesting one",
    ru: "Запишите шаги по порядку и сделайте сегодня первый, а не самый интересный",
  },
};

const DESCENDING: PatternFrame = {
  kind: "descending",
  frequency: "rare",
  titleTpl: {
    ro: "De la {titleA} înapoi la {titleB}",
    en: "From {titleA} back to {titleB}",
    ru: "От {titleA} обратно к {titleB}",
  },
  shortTpl: {
    ro: "O secvență care coboară. Se desface din {essenceA}.",
    en: "A sequence that descends. It unwinds from {essenceA}.",
    ru: "Последовательность, идущая вниз. Она разматывается из {essenceA}.",
  },
  spiritualTpl: {
    ro: "Numărătoare inversă — ceva se apropie de capăt.",
    en: "A countdown — something is nearing its end.",
    ru: "Обратный отсчёт — нечто подходит к концу.",
  },
  leadTpl: {
    ro: "{sequence} coboară treaptă cu treaptă. Pleacă din {digitA}, care e {essenceA}, și se întoarce la {digitB}, care e {essenceB}. Numărătoarea inversă e singura formă care are un capăt încorporat în ea.",
    en: "{sequence} descends step by step. It leaves from {digitA}, which is {essenceA}, and returns to {digitB}, which is {essenceB}. A countdown is the one shape with an ending built into it.",
    ru: "{sequence} спускается ступень за ступенью. Она уходит из {digitA}, а это {essenceA}, и возвращается к {digitB}, а это {essenceB}. Обратный отсчёт — единственная форма, в которую конец встроен изначально.",
  },
  amplifyTpl: {
    ro: "Secvențele descrescătoare apar în perioade de încheiere, nu de început. Nu prevestesc o pierdere: descriu o desfacere. Ceva ce ai construit ajunge la forma lui minimă și nu mai are nevoie de tot ce ai pus în el. Greșeala obișnuită e să citești coborârea ca pe un eșec și să adaugi efort exact acolo unde ce trebuie e să scazi.",
    en: "Descending sequences show up in periods of ending, not beginning. They do not foretell a loss: they describe an unwinding. Something you built is reaching its minimal form and no longer needs everything you put into it. The usual mistake is to read the descent as failure and to add effort exactly where what is needed is subtraction.",
    ru: "Нисходящие последовательности приходят в периоды завершения, а не начала. Они не предвещают потерю — они описывают разматывание. То, что вы построили, доходит до своей минимальной формы и больше не нуждается во всём, что вы в него вложили. Обычная ошибка — прочесть спуск как провал и добавить усилий там, где нужно вычитать.",
  },
  worksTpl: {
    ro: "Făcută bine, coborârea îți lasă asta din punctul de plecare: {strengthA}, și asta din punctul de sosire: {strengthB}. Un lucru încheiat corect nu se simte gol, ci ușor.",
    en: "Done well, the descent leaves you this from where it started: {strengthA}, and this from where it lands: {strengthB}. Something ended properly does not feel empty, it feels light.",
    ru: "Сделанный верно, спуск оставляет вам вот что от точки выхода: {strengthA}, и вот что от точки прихода: {strengthB}. Правильно завершённое ощущается не пустым, а лёгким.",
  },
  breaksTpl: {
    ro: "Făcută prost, se rupe în {shadowA} la plecare și în {shadowB} la sosire. Semnul e că ții în viață ceva doar ca să nu recunoști că s-a terminat — și plătești pentru asta cu energie de care ai nevoie în altă parte.",
    en: "Done badly, it breaks into {shadowA} at the start and {shadowB} at the end. The sign is that you are keeping something alive only so as not to admit it is over — and paying for it with energy you need elsewhere.",
    ru: "Сделанный плохо, он ломается в {shadowA} на выходе и в {shadowB} на приходе. Признак — вы поддерживаете что-то живым только чтобы не признать, что оно кончилось, и платите за это энергией, нужной в другом месте.",
  },
  adviceTpl: {
    ro: "Numește lucrul care s-a terminat de fapt și închide-l oficial",
    en: "Name the thing that has actually ended and close it formally",
    ru: "Назовите то, что действительно закончилось, и закройте это официально",
  },
};
```

Apoi înlocuiește exportul:

```ts
export const PATTERN_FRAMES: Partial<Record<PatternKind, PatternFrame>> = {
  triple: TRIPLE,
  quad: QUAD,
};
```

cu

```ts
export const PATTERN_FRAMES: Record<PatternKind, PatternFrame> = {
  triple: TRIPLE,
  quad: QUAD,
  alternating: ALTERNATING,
  mirror: MIRROR,
  ascending: ASCENDING,
  descending: DESCENDING,
};
```

- [ ] **Step 4: Strânge tipul în compozitor**

În `src/lib/angel/compose.ts`, `PATTERN_FRAMES[pattern.kind]` nu mai poate fi `undefined`. Înlocuiește

```ts
  const frame: PatternFrame | undefined = PATTERN_FRAMES[pattern.kind];
  if (!frame) return null;
```

cu

```ts
  const frame: PatternFrame = PATTERN_FRAMES[pattern.kind];
```

Semnătura rămâne `composeMeaning(pattern: Pattern): AngelNumberMeaning | null` — `getAngelNumberMeaning` returnează deja `null` pentru un input fără tipar, iar păstrarea tipului de retur neschimbat înseamnă că `index.ts` nu se atinge.

- [ ] **Step 5: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: PASS, 15 teste. Podeaua de 600 de caractere se aplică acum tuturor celor 35 × 3.

- [ ] **Step 6: Verifică tipurile și lint-ul**

Rulează: `npm run typecheck && npm run lint`
Așteptat: fără erori.

- [ ] **Step 7: Commit**

```bash
git add src/lib/angel/frames.ts src/lib/angel/compose.ts src/lib/angel/__tests__/content.test.ts
git commit -m "Citește și formele în care contează două cifre, nu una"
```

---

## Task 5: Cele două suprascrieri culturale

**Files:**
- Create: `src/lib/angel/overrides.ts`
- Modify: `src/lib/angel/compose.ts` — se aplică suprascrierea peste rezultatul compus
- Modify: `src/lib/angel/__tests__/content.test.ts` — se adaugă blocul de verificare

**Interfaces:**
- Consumes: `type Lang` din `@/lib/numerology-plus`.
- Produces: `export const CULTURAL_NOTES: Record<string, Record<Lang, string>>` — chei `"666"` și `"1111"`.

Suprascrierea **adaugă un paragraf în fața** lui `fullMeaning`; nu înlocuiește nimic. Așa, dacă arhetipul lui 6 se schimbă, 666 se actualizează ca toate celelalte, iar nota culturală rămâne. Un mecanism de înlocuire totală ar reintroduce divergența pe care compunerea o evită.

- [ ] **Step 1: Scrie testul care pică**

Adaugă la finalul lui `src/lib/angel/__tests__/content.test.ts`:

```ts
describe("notele culturale", () => {
  it("respinge asocierea moștenită a lui 666, înainte de orice altceva", () => {
    const m = getAngelNumberMeaning("666")!;
    expect(m.fullMeaning.ro.startsWith("Înainte de orice altceva")).toBe(true);
    expect(m.fullMeaning.ro).toContain("616");
    expect(m.fullMeaning.en).toContain("616");
    expect(m.fullMeaning.ru).toContain("616");
  });

  it("explică de ce 1111 e văzut mai des decât altele", () => {
    const m = getAngelNumberMeaning("1111")!;
    expect(m.fullMeaning.ro).toContain("11:11");
    expect(m.fullMeaning.en).toContain("11:11");
    expect(m.fullMeaning.ru).toContain("11:11");
  });

  it("păstrează textul compus după notă, nu în locul lui", () => {
    const six = getAngelNumberMeaning("666")!;
    const seven = getAngelNumberMeaning("777")!;
    // Paragraful de amplificare al ramei de triplu apare în amândouă.
    const shared = "Repetiția nu schimbă înțelesul cifrei";
    expect(six.fullMeaning.ro).toContain(shared);
    expect(seven.fullMeaning.ro).toContain(shared);
  });

  it("nu atinge secvențele fără notă", () => {
    expect(getAngelNumberMeaning("444")!.fullMeaning.ro.startsWith("Când aceeași cifră")).toBe(true);
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: FAIL — `expect(false).toBe(true)` la prima aserțiune despre 666.

- [ ] **Step 3: Scrie notele**

Creează `src/lib/angel/overrides.ts`:

```ts
/**
 * Cele două secvențe a căror semnificație NU se poate deriva din cifrele lor.
 *
 * Testul de admitere: nota trebuie să spună ceva ce nicio ramă de formă și
 * niciun arhetip nu poate produce. Trec două. 1234 nu trece — sensul lui vine
 * din forma ascendentă, care e o ramă. „777 aduce noroc" nu trece — e o glosă
 * populară peste arhetipul lui 7, nu o informație în plus.
 *
 * Nota se adaugă ÎNAINTEA textului compus, nu în locul lui: dacă arhetipul lui
 * 6 se schimbă, 666 se actualizează ca toate celelalte.
 */

import type { Lang } from "@/lib/numerology-plus";

export const CULTURAL_NOTES: Record<string, Record<Lang, string>> = {
  "666": {
    ro: "Înainte de orice altceva: 666 nu e numărul răului. Asocierea vine dintr-un singur verset din Apocalipsă, scris despre un împărat roman, iar în cele mai vechi manuscrise cifra e 616. În numerologie, șase e cifra grijii și a responsabilității față de casă, și nimic din ea nu se schimbă pentru că apare de trei ori.",
    en: "Before anything else: 666 is not the number of evil. The association comes from a single verse in Revelation, written about a Roman emperor, and in the oldest manuscripts the figure is 616. In numerology six is the digit of care and of responsibility toward the home, and nothing about it changes because it appears three times.",
    ru: "Прежде всего: 666 — не число зла. Ассоциация идёт из одного стиха Откровения, написанного о римском императоре, а в древнейших рукописях там стоит 616. В нумерологии шесть — цифра заботы и ответственности за дом, и ничего в ней не меняется оттого, что она появляется трижды.",
  },
  "1111": {
    ro: "Dintre toate secvențele, 1111 e singura cu o poveste proprie, independentă de numerologie: obiceiul de a-ți pune o dorință când ceasul arată 11:11. Nu e o tradiție veche — s-a răspândit odată cu ceasurile digitale, în anii optzeci. Merită știut, pentru că explică de ce vezi 1111 mai des decât alte secvențe: e singura pe care destui oameni o caută activ pe ecran.",
    en: "Of all the sequences, 1111 is the only one with a story of its own, independent of numerology: the habit of making a wish when the clock reads 11:11. It is not an old tradition — it spread with digital clocks, in the eighties. It is worth knowing, because it explains why you see 1111 more often than other sequences: it is the one enough people actively watch the screen for.",
    ru: "Из всех последовательностей 1111 — единственная со своей историей, независимой от нумерологии: привычка загадывать желание, когда часы показывают 11:11. Это не древняя традиция — она распространилась вместе с электронными часами, в восьмидесятые. Это стоит знать: именно этим объясняется, почему 1111 попадается чаще других — её достаточно многие целенаправленно высматривают на экране.",
  },
};
```

- [ ] **Step 4: Aplică nota în compozitor**

În `src/lib/angel/compose.ts`, adaugă la importuri:

```ts
import { CULTURAL_NOTES } from "./overrides";
```

și înlocuiește câmpul `fullMeaning` din obiectul returnat de `composeMeaning`:

```ts
    fullMeaning: byLang((l) =>
      [frame.leadTpl[l], frame.amplifyTpl[l], frame.worksTpl[l], frame.breaksTpl[l]]
        .map((tpl) => fill(tpl, vars(l)))
        .join(" "),
    ),
```

cu

```ts
    fullMeaning: byLang((l) =>
      [
        // Nota culturală, când există, stă în față: e ce trebuie citit înainte
        // de interpretare, nu în locul ei.
        CULTURAL_NOTES[pattern.sequence]?.[l],
        frame.leadTpl[l],
        frame.amplifyTpl[l],
        frame.worksTpl[l],
        frame.breaksTpl[l],
      ]
        .filter((tpl): tpl is string => Boolean(tpl))
        .map((tpl) => fill(tpl, vars(l)))
        .join(" "),
    ),
```

- [ ] **Step 5: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/content.test.ts`
Așteptat: PASS, 19 teste.

- [ ] **Step 6: Rulează tot pachetul și verifică tipurile**

Rulează: `npm run test:run -- src/lib/angel && npm run typecheck && npm run lint`
Așteptat: PASS pentru cele trei fișiere de test; fără erori de tip sau lint.

- [ ] **Step 7: Commit**

```bash
git add src/lib/angel/overrides.ts src/lib/angel/compose.ts src/lib/angel/__tests__/content.test.ts
git commit -m "Spune despre 666 și 1111 ce cifrele lor nu pot spune"
```

---

## Task 6: Mută unealta pe modulul nou și adaugă deep-link-ul

Ultimul task: se schimbă calea de import în cei doi consumatori, se șterge fișierul vechi, se adaugă `?n=` și se corectează copia care promitea o bază de date fixă.

**Files:**
- Modify: `src/components/AngelNumberCard.tsx:4` — calea de import
- Modify: `src/components/tools/AngelNumbers.tsx` — calea de import, deep-link, lista de numere populare, copia
- Delete: `src/lib/angelNumbers.ts`
- Test: `src/lib/angel/__tests__/tool.test.tsx`

**Interfaces:**
- Consumes: `getAllAngelNumbers`, `getAngelNumberMeaning`, `searchAngelNumbers`, `type AngelNumberMeaning` din `@/lib/angel`.
- Produces: nimic nou; `AngelNumbers` rămâne `export default`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/lib/angel/__tests__/tool.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AngelNumbers from "@/components/tools/AngelNumbers";

const renderAt = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/unelte${search}`]}>
      <LanguageProvider>
        <AngelNumbers />
      </LanguageProvider>
    </MemoryRouter>,
  );

// Limba nu se fixează aici: LanguageContext o deduce din localStorage și din
// navigator.language, iar în jsdom aceea e "en-US", nu româna. Aserțiunile sunt
// deci pe secvențe și pe lungime — adevărate în oricare din cele trei limbi.
const longTexts = (min: number) =>
  screen.queryAllByText((content) => content.length >= min);

describe("unealta de numere-înger", () => {
  it("listează toate cele 35 de secvențe din catalog", () => {
    renderAt("?s=angel");
    // Fiecare card compact își afișează secvența.
    expect(screen.getAllByText("444").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1551").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4321").length).toBeGreaterThanOrEqual(1);
  });

  it("deschide direct secvența din ?n=, cu interpretarea lungă", () => {
    renderAt("?s=angel&n=444");
    expect(screen.getAllByText("444").length).toBeGreaterThanOrEqual(1);
    // Cardul extins randează fullMeaning; nimic altceva din pagină nu trece de 600.
    expect(longTexts(600).length).toBeGreaterThanOrEqual(1);
  });

  it("ignoră un ?n= fără tipar, fără să cadă", () => {
    renderAt("?s=angel&n=4729");
    expect(longTexts(600)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Rulează testul, verifică că pică**

Rulează: `npm run test:run -- src/lib/angel/__tests__/tool.test.tsx`
Așteptat: FAIL — `1551` nu se găsește, fiindcă unealta încă citește vechiul catalog de 12.

- [ ] **Step 3: Schimbă calea de import în card**

În `src/components/AngelNumberCard.tsx`, înlocuiește linia 4:

```tsx
import { AngelNumberMeaning } from "@/lib/angelNumbers";
```

cu

```tsx
import { AngelNumberMeaning } from "@/lib/angel";
```

Nimic altceva nu se schimbă în acest fișier: forma tipului e identică, iar secvența e deja randată cu `.num` în ambele componente (`<span className="num text-2xl text-gradient-gold">` și `<span className="num text-xl text-primary">`).

- [ ] **Step 4: Mută unealta pe modulul nou și adaugă `?n=`**

În `src/components/tools/AngelNumbers.tsx`:

Înlocuiește blocul de import

```tsx
import {
  getAllAngelNumbers,
  getAngelNumberMeaning,
  searchAngelNumbers,
  AngelNumberMeaning,
} from "@/lib/angelNumbers";
```

cu

```tsx
import { useSearchParams } from "react-router-dom";
import {
  getAllAngelNumbers,
  getAngelNumberMeaning,
  searchAngelNumbers,
  AngelNumberMeaning,
} from "@/lib/angel";
```

Înlocuiește inițializarea stării

```tsx
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<AngelNumberMeaning | null>(null);
```

cu

```tsx
  const { language } = useLanguage();
  // /unelte?s=angel&n=444 deschide unealta direct pe o secvență. Nu e nevoie de
  // o rută nouă: Tools.tsx citește deja tab-ul din query, iar un al doilea
  // parametru face legătura partajabilă fără nimic în routes.json.
  const [params] = useSearchParams();
  const initial = params.get("n") ?? "";
  const [searchInput, setSearchInput] = useState(initial);
  const [selectedNumber, setSelectedNumber] = useState<AngelNumberMeaning | null>(
    initial ? getAngelNumberMeaning(initial) : null,
  );
```

Înlocuiește lista de numere populare

```tsx
  const popularNumbers = ["111", "222", "333", "444", "555", "777", "888", "1111"];
```

cu

```tsx
  // Nu mai e „toate numerele pe care le avem": catalogul are 35 și crește prin
  // regulă. Astea sunt cele mai căutate, una din fiecare formă la final.
  const popularNumbers = [
    "111", "222", "333", "444", "555", "666", "777", "888", "999",
    "1111", "1234", "1212",
  ];
```

Înlocuiește, în cele trei limbi din obiectul local `t`, textele care promiteau o bază de date fixă:

```tsx
      noResults: "Nu am găsit acest număr în baza noastră de date.",
      tryAnother: "Încearcă un alt număr sau caută după cuvinte cheie.",
```
```tsx
      noResults: "Numărul acesta nu formează un tipar pe care să-l putem citi.",
      tryAnother: "Citim repetări (444, 1111), alternanțe (1212), oglinzi (1221) și șiruri (1234, 4321).",
```

```tsx
      noResults: "We couldn't find this number in our database.",
      tryAnother: "Try another number or search by keywords.",
```
```tsx
      noResults: "This number does not form a pattern we can read.",
      tryAnother: "We read repetitions (444, 1111), alternations (1212), mirrors (1221) and runs (1234, 4321).",
```

```tsx
      noResults: "Мы не нашли это число в нашей базе данных.",
      tryAnother: "Попробуйте другое число или поищите по ключевым словам.",
```
```tsx
      noResults: "Это число не образует закономерности, которую мы умеем читать.",
      tryAnother: "Мы читаем повторы (444, 1111), чередования (1212), зеркала (1221) и ряды (1234, 4321).",
```

- [ ] **Step 5: Șterge fișierul vechi**

```bash
git rm src/lib/angelNumbers.ts
```

- [ ] **Step 6: Rulează testul, verifică că trece**

Rulează: `npm run test:run -- src/lib/angel/__tests__/tool.test.tsx`
Așteptat: PASS, 3 teste.

- [ ] **Step 7: Verifică întregul lanț**

Rulează: `npm run test:run && npm run typecheck && npm run lint`
Așteptat: toate testele trec, inclusiv cele 78 de aserțiuni ale motorului (neatins) și `design-tokens.test.ts` (nu s-a introdus niciun `hsl()`). Zero referințe rămase la fișierul șters:

```bash
grep -rn "lib/angelNumbers" src/ || echo "nicio referință rămasă"
```
Așteptat: `nicio referință rămasă`.

- [ ] **Step 8: Commit**

```bash
git add src/components/AngelNumberCard.tsx src/components/tools/AngelNumbers.tsx src/lib/angel/__tests__/tool.test.tsx
git commit -m "Mută unealta pe catalogul compus și fă secvențele partajabile prin link"
```

---

## Ce rămâne deliberat nefăcut

Notat aici ca să nu fie descoperit ca omisiune:

- **Pagini indexabile per număr.** Argumentate mai sus ca a doua lucrare. Ar cere ca `scripts/emit-routes.mjs` și `scripts/prerender-meta.mjs` să expandeze o rută parametrizată peste o listă de valori, plus 210 stringuri de `meta`. `docs/superpowers/plans/` e locul potrivit pentru planul acela, dacă cineva decide că merită.
- **README-ul motorului menționează „Directorul de numere înger (000–999, 1111–9999) cu rută per număr" la „Ce urmează".** Acest plan livrează directorul, dar nu ruta. Rândul din `src/lib/numerology-plus/README.md` rămâne neatins — motorul e read-only.
- **Obiectul `t` local din `src/components/tools/AngelNumbers.tsx` nu se mută în `src/lib/translations.ts`.** Divergență de convenție preexistentă; mutarea ar fi refactorizare în afara cererii.
