# Sisteme paralele în capitolul 5 — Plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adu pe ecran cele trei sisteme pe care motorul `numerology-plus` le calculează deja și pe care interfața nu le-a arătat niciodată — Vedic (Ank Jyotish), Kua (Feng Shui) și Kabbalah — ca trei blocuri în capitolul 5 al paginii de rezultat.

**Architecture:** Trei componente noi în `src/components/numerology/`, fiecare cu testul ei, fiecare consumând motorul read-only și fiecare purtându-și propriile etichete RO/EN/RU — exact tiparul lui `DestinyMatrix.tsx` și `ExpressionPlanes.tsx`. Un al patrulea task le leagă în `NumerologyResults.tsx`, șterge comentariul-promisiune din capitolul 5 și retitrează blocul caldeean. Genul, de care depinde Kua, se cere ca *ramură de formulă* în componenta Kua, se ține în `localStorage` și nu atinge nici backend-ul, nici schema.

**Tech Stack:** React 18 + TypeScript, Vite 6 (SWC), Tailwind + tokeni CSS, Vitest + Testing Library.

**Spec:** acest document. Diagnosticul din care pleacă (verificat în cod la 2026-09-01):

- `grep -rn "vedicProfile\|kuaNumber\|mulank\|bhagyank\|naamank\|NAVAGRAHA\|popularKabbalah\|hebrewGematria\|VEDIC_RELATIONS" src --include="*.ts" --include="*.tsx" | grep -v "numerology-plus/"` → **zero rezultate**. Motorul le calculează, nimic nu le afișează.
- `grep -rni "gender\|sex\b" src/components src/pages src/services server/src` → **zero rezultate**. Genul nu e colectat nicăieri.
- `src/components/NumerologyResults.tsx:433-436` poartă comentariul care amână: „this is where the engine's Vedic, Kabbalah and Chaldean numbers will render inline; until then, the link is the entrance."

## Global Constraints

- Repo: /Users/victorsafta/work/numerology-compass, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Backend: Express + PostgreSQL (`pg`) + `zod`, în `server/`. Teste: `cd server && npm run test`.
- Migrații: `server/src/migrations/NNN_nume.sql`, aplicate o singură dată, în ordinea numelui, prin `cd server && npm run migrate`. NU sunt replayable: nu edita niciodată o migrație existentă, adaugă un fișier nou numerotat. Ultima existentă e `009_premium_features.sql`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = editezi `routes.json` ȘI `PAGES` din `src/App.tsx`.
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră sau etichetă numerică; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY: 78 de aserțiuni trec. Îl consumi, nu-l modifici.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA. NU folosi prefixe conventional-commits.

### O precizare la constrângerea de i18n

Constrângerea de mai sus e copiată verbatim. În practică, **niciuna** dintre componentele din `src/components/numerology/` nu trece prin `translations.ts`: `DestinyMatrix.tsx`, `ExpressionPlanes.tsx`, `SaveMapButton.tsx` și `sectionLabels`/`teasers` din `NumerologyResults.tsx` țin toate un obiect local `LABELS`/`COPY` de forma `{ ro, en, ru }` și aleg cu `language` din `useLanguage()`. Planul respectă tiparul existent — `useLanguage()` rămâne singura sursă a limbii, toate trei limbile rămân obligatorii, dar textul nou stă lângă componenta care îl folosește, nu în fișierul de 3000 de linii. A muta doar aceste trei componente în `translations.ts` ar rupe consistența capitolului fără să câștige nimic.

---

## Decizii luate înainte de cod

### 1. Genul: stare locală în componenta Kua, cu `localStorage`. Fără migrație.

`kuaNumber(year, gender)` cere `'male' | 'female'`; `fullProfile` întoarce `kua: null` fără el.

Am cântărit un câmp nou de profil (migrație `010`, plus `zod` în `server/src/routes/profiles`, plus `api.ts`, plus `use-profile`) și am renunțat, din trei motive verificabile:

1. **`NumerologyResults` nici nu vede profilul.** `src/pages/Index.tsx:182-186` îi dă exact trei prop-uri: `fullName`, `birthDate`, `onReset`. Datele vin din formularul de calculator, nu din profilul salvat. Un câmp în `user_profiles` ar cere prop drilling prin `Index.tsx` doar ca să ajungă la un bloc.
2. **Majoritatea cititorilor n-au cont.** Pagina de rezultat funcționează anonim. Un câmp în DB ar servi o minoritate și tot ar avea nevoie de un fallback local — adică de exact soluția locală, plus o migrație pe deasupra.
3. **E cea mai puțin invazivă variantă pentru datele omului.** Alegerea nu pleacă de pe dispozitiv. Pentru un câmp de gen, „nu-l trimitem nicăieri" e default-ul corect, nu o scurtătură.

Dacă produsul va vrea Kua pe harta salvată, migrația `010` e follow-up-ul evident — dar nu în acest plan (YAGNI).

### 2. Când lipsește: blocul se randează, cu o invitație discretă. Nu dispare.

Alternativa (blocul nu se randează deloc) a fost respinsă: un bloc invizibil e un bloc nedescoperibil — cititorul n-ar afla niciodată că Kua există, iar capitolul 5 ar avea un număr variabil de blocuri, ceea ce se citește ca un bug, nu ca o alegere. Invitația e două butoane și două propoziții care spun pe față ce este parametrul.

### 3. Formularea: e o ramură de formulă, nu o clasificare.

Textul spune că formula Kua din secolul trecut are exact două ramuri aritmetice — una scade din 10, cealaltă adună 5 — și că alegerea nu pleacă din browser. Butoanele păstrează numele tradiționale **și** arată aritmetica: „Ramura masculină (10 − n)" / „Ramura feminină (n + 5)". Ascunderea numelor tradiționale ar fi fost o altă formă de neonestitate, față de cititorul care știe Feng Shui.

### 4. Link-ul spre `/chaldean`: rămâne, dar retitrat.

`src/pages/ChaldeanAnalysis.tsx` poartă tabelul de 52 de numere compuse (`CHALDEAN_COMPOUND`), zilele favorabile și analiza de nume de firmă — nimic din toate astea nu intră în cele trei blocuri noi. Dacă i-am tăia link-ul, pagina ar redeveni orfană, exact starea din care a fost scoasă. Rămâne, dar blocul nu se mai numește „Sisteme paralele" (acum sunt trei blocuri reale care merită numele) ci „Numărul compus caldeean", iar teaser-ul lui, care deja vorbea despre Chaldean, rămâne neatins.

### 5. Planetele Navagraha se traduc în componentă, nu în motor.

`NAVAGRAHA` e românesc („Soare", „duminică", „ochi-de-pisică"). Motorul e read-only. Deci componenta ține propriul tabel RO/EN/RU, iar un test îl pinnează de `NAVAGRAHA` prin numele sanscrit pentru toate cele nouă numere — o derivă cade suita, nu ajunge pe ecran. Piatra și culoarea nu se afișează: sunt recomandări de cumpărături astrologice, nu numerologie, și ar tripla suprafața de tradus.

---

## File Structure

**Create:**

- `src/components/numerology/VedicNumbers.tsx` — Mulank / Bhagyank / Naamank, planetele lor, relațiile prieten-neutru-dușman, și explicația divergenței Bhagyank ↔ Calea Vieții. Export **named** (`export const VedicNumbers`), ca `LetterMap`; nu e lazy pentru că nu aduce Recharts și nici stratul de conținut.
- `src/components/numerology/KuaNumber.tsx` — invitația de ramură, numărul Kua, grupul Est/Vest, cele patru direcții. Singura componentă cu stare.
- `src/components/numerology/KabbalahNumbers.tsx` — cele două sisteme omonime, unul lângă altul, cu avertismentul că n-au legătură.
- `src/components/numerology/__tests__/VedicNumbers.test.tsx`
- `src/components/numerology/__tests__/KuaNumber.test.tsx`
- `src/components/numerology/__tests__/KabbalahNumbers.test.tsx`
- `src/components/__tests__/parallel-systems.wiring.test.ts` — test la nivel de sursă care verifică legarea în capitolul 5 și dispariția comentariului-promisiune. Precedentul e `src/lib/__tests__/design-tokens.test.ts`, care citește fișiere și afirmă despre textul lor.

**Modify:**

- `src/components/NumerologyResults.tsx` — trei import-uri, patru chei noi în `sectionLabels`, trei în `teasers`, o retitrare, trei `Block`-uri noi în capitolul 5, și comentariul de la liniile 433-436 înlocuit.

**Nu se atinge:** `src/lib/numerology-plus/**` (read-only), `src/data/routes.json` și `src/App.tsx` (nicio rută nouă), `server/**` (nicio migrație).

**Convenție nouă, mică:** fiecare cifră afișată poartă `data-figure="<cheie>"`, iar fiecare relație vedică `data-relation` + `data-verdict`. Testele citesc prin ele, ca să compare cu ce întoarce motorul fără să depindă de limba în care se randează suita (jsdom nu are `localStorage` de limbă și cade pe `navigator.language`). `DestinyMatrix` face același lucru prin `aria-label`; aici atributul e mai curat, pentru că cifrele nu sunt butoane.

**Fixtures fixate, o dată pentru tot planul** (valori obținute rulând motorul, nu ghicite):

| | `Victor Ion Safta` + 25.08.1990 | `Victor Ion Safta` + 04.03.1993 |
|---|---|---|
| mulank | 7 | 4 |
| bhagyank | 7 | 2 |
| naamank | compound 53, root 8 | compound 53, root 8 |
| lifePath | `{raw:16, value:7}` | `{raw:11, value:11}` |
| harmony | enemy / enemy / friend | friend / enemy / neutral |
| kua (male) | 1, grup east | 7, grup west |
| kua (female) | 8, grup west | 8, grup west |
| popularKabbalah | total 64, value 1 | (identic — depinde doar de nume) |
| hebrewGematria | `ביכטוריונסאפטא`, total 464, reduced 5 | (identic) |

Prima dată e cazul în care Bhagyank și Calea Vieții cad pe același număr; a doua e cazul în care diferă (2 față de 11) și e singura care atinge verdictul `neutral`. Amândouă sunt scrise ca `new Date(1990, 7, 25)` și `new Date(1993, 2, 4)` — literale, niciodată `new Date()` fără argumente.

---

### Task 1: Blocul vedic (Ank Jyotish)

**Files:**
- Create: `src/components/numerology/VedicNumbers.tsx`
- Test: `src/components/numerology/__tests__/VedicNumbers.test.tsx`

**Interfaces:**
- Consumes: `vedicProfile(name: string, b: BirthDate)` și `NAVAGRAHA` din `@/lib/numerology-plus/systems`; `lifePath(b: BirthDate): NumResult` din `@/lib/numerology-plus/pythagorean`; `toBirthDate(d: Date): BirthDate` din `@/lib/numerology-plus/core`; `useLanguage()` din `@/contexts/LanguageContext`.
- Produces: `export const VedicNumbers = ({ fullName, birthDate }: { fullName: string; birthDate: Date }) => JSX.Element` — folosit de Task 4.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/numerology/__tests__/VedicNumbers.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VedicNumbers } from "../VedicNumbers";
import { vedicProfile, NAVAGRAHA } from "@/lib/numerology-plus/systems";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";
import { PLANETS } from "../VedicNumbers";

/**
 * The engine's own suite proves the arithmetic. This proves the block shows
 * the numbers the engine actually computed, for a name and a date fixed here
 * -- `new Date()` with no arguments would make every assertion below expire.
 */

const NAME = "Victor Ion Safta";
const AGREE = new Date(1990, 7, 25);   // bhagyank 7, Life Path 7 -- the two agree
const DIVERGE = new Date(1993, 2, 4);  // bhagyank 2, Life Path 11 -- they do not

const draw = (birthDate: Date) =>
  render(
    <LanguageProvider>
      <VedicNumbers fullName={NAME} birthDate={birthDate} />
    </LanguageProvider>,
  );

const figure = (c: HTMLElement, key: string) =>
  Number(c.querySelector(`[data-figure="${key}"]`)?.textContent);

describe("VedicNumbers", () => {
  it("shows the three numbers the engine computed", () => {
    const { container } = draw(AGREE);
    const engine = vedicProfile(NAME, toBirthDate(AGREE));
    expect(figure(container, "mulank")).toBe(engine.mulank);
    expect(figure(container, "bhagyank")).toBe(engine.bhagyank);
    expect(figure(container, "naamank")).toBe(engine.naamank.root);
    expect(figure(container, "naamank-compound")).toBe(engine.naamank.compound);
    // The fixture, spelled out, so a change in the engine is visible here.
    expect(figure(container, "mulank")).toBe(7);
    expect(figure(container, "naamank-compound")).toBe(53);
  });

  it("names the planet the engine assigns to each number", () => {
    const { container } = draw(AGREE);
    const engine = vedicProfile(NAME, toBirthDate(AGREE));
    const text = container.textContent ?? "";
    expect(text).toContain(engine.planets.mulank.sanskrit);   // Ketu
    expect(text).toContain(engine.planets.naamank.sanskrit);  // Shani
  });

  it("keeps its planet table pinned to the engine's", () => {
    // NAVAGRAHA is Romanian-only and the engine is read-only, so the block
    // carries its own three-language table. If the two ever drift apart, this
    // fails instead of the wrong planet reaching the screen.
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(PLANETS[n].sanskrit, `planet ${n}`).toBe(NAVAGRAHA[n].sanskrit);
    }
  });

  it("marks each relation with the engine's verdict", () => {
    const { container } = draw(DIVERGE);
    const engine = vedicProfile(NAME, toBirthDate(DIVERGE));
    for (const key of ["nameToMulank", "nameToBhagyank", "mulankToBhagyank"] as const) {
      const node = container.querySelector(`[data-relation="${key}"]`);
      expect(node, key).toBeTruthy();
      expect(node!.getAttribute("data-verdict"), key).toBe(engine.harmony[key]);
    }
    // This fixture is the one that reaches all three verdicts.
    expect(container.querySelector('[data-verdict="friend"]')).toBeTruthy();
    expect(container.querySelector('[data-verdict="enemy"]')).toBeTruthy();
    expect(container.querySelector('[data-verdict="neutral"]')).toBeTruthy();
  });

  it("puts Bhagyank beside the Life Path and explains the drift", () => {
    const { container } = draw(DIVERGE);
    expect(figure(container, "drift-bhagyank")).toBe(2);
    expect(figure(container, "drift-lifepath")).toBe(lifePath(toBirthDate(DIVERGE)).value);
    expect(figure(container, "drift-lifepath")).toBe(11);
    // The reader is owed the reason, not a bare contradiction.
    expect(container.textContent ?? "").toMatch(/deodată|at once|разом/);
  });

  it("says so when the two methods agree, rather than explaining a drift that is not there", () => {
    const { container } = draw(AGREE);
    expect(figure(container, "drift-bhagyank")).toBe(figure(container, "drift-lifepath"));
    expect(container.textContent ?? "").toMatch(/același număr|the same number|одно и то же число/);
  });

  it("renders every figure through the tabular class", () => {
    const { container } = draw(AGREE);
    for (const key of ["mulank", "bhagyank", "naamank", "naamank-compound"]) {
      expect(container.querySelector(`[data-figure="${key}"]`)?.className, key).toContain("num");
    }
  });
});
```

- [ ] **Step 2: Rulează testul ca să vezi că pică**

Run: `npm run test:run -- src/components/numerology/__tests__/VedicNumbers.test.tsx`
Expected: FAIL — `Failed to resolve import "../VedicNumbers"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/numerology/VedicNumbers.tsx`:

```tsx
import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { vedicProfile } from "@/lib/numerology-plus/systems";
import { lifePath } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * Ank Jyotish: the three Vedic numbers, their Navagraha planets, and how the
 * three of them get on with each other.
 *
 * The engine computed all of this from the day it landed and none of it ever
 * reached a screen -- vedicProfile had no caller outside src/lib/numerology-plus.
 *
 * Two things this block has to be honest about:
 *
 * 1. Bhagyank is a flat digit sum of the whole date; the Pythagorean Life Path
 *    reduces day, month and year separately and only then adds. The two
 *    disagree often, and a reader who sees 2 here and 11 in chapter 1 is owed
 *    the reason rather than a contradiction.
 * 2. NAVAGRAHA in the engine is Romanian-only, and the engine is read-only, so
 *    the planet names live here in all three languages. PLANETS is pinned to
 *    NAVAGRAHA by its Sanskrit name in the test, so a drift fails the suite
 *    instead of quietly showing the wrong planet. Gem and colour are left out:
 *    they are astrological shopping advice, not numerology.
 */

type Lang = "ro" | "en" | "ru";
type Verdict = "friend" | "neutral" | "enemy";

export const PLANETS: Record<
  number,
  { sanskrit: string; name: Record<Lang, string>; day: Record<Lang, string> | null }
> = {
  1: { sanskrit: "Surya",   name: { ro: "Soare",   en: "Sun",     ru: "Солнце" },   day: { ro: "duminică", en: "Sunday",    ru: "воскресенье" } },
  2: { sanskrit: "Chandra", name: { ro: "Lună",    en: "Moon",    ru: "Луна" },     day: { ro: "luni",     en: "Monday",    ru: "понедельник" } },
  3: { sanskrit: "Guru",    name: { ro: "Jupiter", en: "Jupiter", ru: "Юпитер" },   day: { ro: "joi",      en: "Thursday",  ru: "четверг" } },
  4: { sanskrit: "Rahu",    name: { ro: "Rahu",    en: "Rahu",    ru: "Раху" },     day: null },
  5: { sanskrit: "Budha",   name: { ro: "Mercur",  en: "Mercury", ru: "Меркурий" }, day: { ro: "miercuri", en: "Wednesday", ru: "среда" } },
  6: { sanskrit: "Shukra",  name: { ro: "Venus",   en: "Venus",   ru: "Венера" },   day: { ro: "vineri",   en: "Friday",    ru: "пятница" } },
  7: { sanskrit: "Ketu",    name: { ro: "Ketu",    en: "Ketu",    ru: "Кету" },     day: null },
  8: { sanskrit: "Shani",   name: { ro: "Saturn",  en: "Saturn",  ru: "Сатурн" },   day: { ro: "sâmbătă",  en: "Saturday",  ru: "суббота" } },
  9: { sanskrit: "Mangal",  name: { ro: "Marte",   en: "Mars",    ru: "Марс" },     day: { ro: "marți",    en: "Tuesday",   ru: "вторник" } },
};

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    mulank: "Mulank", bhagyank: "Bhagyank", naamank: "Naamank",
    mulankNote: "Numărul psihic. Doar ziua nașterii.",
    bhagyankNote: "Numărul destinului vedic. Toate cifrele datei, adunate deodată.",
    naamankNote: "Numărul numelui, citit cu tabelul caldeean.",
    compound: "compus",
    relations: "Cum se împacă cele trei",
    nameToMulank: "Naamank față de Mulank",
    nameToBhagyank: "Naamank față de Bhagyank",
    mulankToBhagyank: "Bhagyank față de Mulank",
    friend: "prieten", neutral: "neutru", enemy: "dușman",
    relationsNote: "Tabelul vedic de prieteni și dușmani se citește dintr-un număr către altul; nu e simetric.",
    lifePath: "Calea Vieții",
    driftTitle: "Bhagyank și Calea Vieții",
    driftSame: "Aici cele două metode dau același număr. Se întâmplă des, dar nu întotdeauna.",
    driftDiffer: "Nu e o greșeală. Vedic adună toate cifrele datei deodată; pitagoreic reduce separat ziua, luna și anul, apoi adună rezultatele. Metode diferite, numere diferite — fiecare valabil în sistemul lui.",
  },
  en: {
    mulank: "Mulank", bhagyank: "Bhagyank", naamank: "Naamank",
    mulankNote: "The psychic number. The day of birth alone.",
    bhagyankNote: "The Vedic destiny number. Every digit of the date, added at once.",
    naamankNote: "The name number, read from the Chaldean table.",
    compound: "compound",
    relations: "How the three get on",
    nameToMulank: "Naamank towards Mulank",
    nameToBhagyank: "Naamank towards Bhagyank",
    mulankToBhagyank: "Bhagyank towards Mulank",
    friend: "friend", neutral: "neutral", enemy: "enemy",
    relationsNote: "The Vedic friend-and-enemy table is read from one number to another; it is not symmetric.",
    lifePath: "Life Path",
    driftTitle: "Bhagyank and the Life Path",
    driftSame: "Here the two methods land on the same number. That happens often, but not always.",
    driftDiffer: "This is not an error. Vedic adds every digit of the date at once; Pythagorean reduces day, month and year separately and then adds the results. Different methods, different numbers — each valid inside its own system.",
  },
  ru: {
    mulank: "Муланк", bhagyank: "Бхагьянк", naamank: "Нааманк",
    mulankNote: "Психическое число. Только день рождения.",
    bhagyankNote: "Ведическое число судьбы. Все цифры даты, сложенные разом.",
    naamankNote: "Число имени, прочитанное по халдейской таблице.",
    compound: "составное",
    relations: "Как эти три уживаются",
    nameToMulank: "Нааманк по отношению к Муланку",
    nameToBhagyank: "Нааманк по отношению к Бхагьянку",
    mulankToBhagyank: "Бхагьянк по отношению к Муланку",
    friend: "друг", neutral: "нейтрально", enemy: "враг",
    relationsNote: "Ведическая таблица друзей и врагов читается от одного числа к другому; она не симметрична.",
    lifePath: "Число Жизненного Пути",
    driftTitle: "Бхагьянк и Число Жизненного Пути",
    driftSame: "Здесь оба метода дают одно и то же число. Так бывает часто, но не всегда.",
    driftDiffer: "Это не ошибка. Ведический метод складывает все цифры даты сразу; пифагорейский сводит день, месяц и год по отдельности, а затем складывает результаты. Разные методы — разные числа, и каждое верно внутри своей системы.",
  },
};

/** A wide bridge is a distance, not an error -- hence harmony/tension, not ok/crit. */
const TONE: Record<Verdict, string> = {
  friend: "bg-harmony-soft text-ink",
  neutral: "bg-sunken text-ink-2",
  enemy: "bg-tension-soft text-ink",
};

interface VedicNumbersProps {
  fullName: string;
  birthDate: Date;
}

export const VedicNumbers = ({ fullName, birthDate }: VedicNumbersProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const { vedic, path } = useMemo(() => {
    const b = toBirthDate(birthDate);
    return { vedic: vedicProfile(fullName, b), path: lifePath(b) };
  }, [fullName, birthDate]);

  const figures: Array<{ key: string; value: number; title: string; note: string; compound: number | null }> = [
    { key: "mulank", value: vedic.mulank, title: l.mulank, note: l.mulankNote, compound: null },
    { key: "bhagyank", value: vedic.bhagyank, title: l.bhagyank, note: l.bhagyankNote, compound: null },
    { key: "naamank", value: vedic.naamank.root, title: l.naamank, note: l.naamankNote, compound: vedic.naamank.compound },
  ];

  const relations: Array<{ key: string; label: string; verdict: Verdict }> = [
    { key: "nameToMulank", label: l.nameToMulank, verdict: vedic.harmony.nameToMulank as Verdict },
    { key: "nameToBhagyank", label: l.nameToBhagyank, verdict: vedic.harmony.nameToBhagyank as Verdict },
    { key: "mulankToBhagyank", label: l.mulankToBhagyank, verdict: vedic.harmony.mulankToBhagyank as Verdict },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {figures.map((f) => {
          const planet = PLANETS[f.value];
          return (
            <div key={f.key} className="space-y-1 rounded-xl border border-line bg-surface/60 p-4">
              <div className="flex items-baseline gap-2">
                <span className="num text-3xl text-primary" data-figure={f.key}>{f.value}</span>
                <h4 className="font-heading text-base text-foreground">{f.title}</h4>
              </div>
              {f.compound !== null && (
                <p className="text-xs text-faint">
                  {l.compound}{" "}
                  <span className="num" data-figure="naamank-compound">{f.compound}</span>
                </p>
              )}
              {planet && (
                <p className="text-sm text-ink-2">
                  {planet.name[lang]}
                  <span className="text-faint"> · {planet.sanskrit}</span>
                  {planet.day && <span className="text-faint"> · {planet.day[lang]}</span>}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{f.note}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-base text-foreground">{l.relations}</h4>
        <ul className="grid gap-2 sm:grid-cols-3">
          {relations.map((r) => (
            <li
              key={r.key}
              data-relation={r.key}
              data-verdict={r.verdict}
              className={`rounded-lg px-3 py-2 text-sm ${TONE[r.verdict]}`}
            >
              <span className="block text-xs opacity-70">{r.label}</span>
              {l[r.verdict]}
            </li>
          ))}
        </ul>
        <p className="text-xs text-faint">{l.relationsNote}</p>
      </div>

      <div className="space-y-2 rounded-xl bg-sunken p-4">
        <h4 className="font-heading text-base text-foreground">{l.driftTitle}</h4>
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="block text-xs text-muted-foreground">{l.bhagyank}</span>
            <span className="num text-2xl text-foreground" data-figure="drift-bhagyank">{vedic.bhagyank}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">{l.lifePath}</span>
            <span className="num text-2xl text-foreground" data-figure="drift-lifepath">{path.value}</span>
          </div>
        </div>
        <p className="text-sm text-foreground/85">
          {vedic.bhagyank === path.value ? l.driftSame : l.driftDiffer}
        </p>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Rulează testul ca să treacă**

Run: `npm run test:run -- src/components/numerology/__tests__/VedicNumbers.test.tsx`
Expected: PASS, 7 teste.

- [ ] **Step 5: Verifică tipurile, lint-ul și testul de tokeni**

Run: `npm run typecheck && npm run lint && npm run test:run -- src/lib/__tests__/design-tokens.test.ts`
Expected: toate PASS. Testul de tokeni trebuie să treacă pentru că blocul nu scrie niciun `hsl()` — culorile vin prin `bg-harmony-soft`, `bg-tension-soft`, `bg-sunken`, `text-ink`, `text-ink-2`, toate declarate în `tailwind.config.ts:37-52`.

- [ ] **Step 6: Commit**

```bash
git add src/components/numerology/VedicNumbers.tsx src/components/numerology/__tests__/VedicNumbers.test.tsx
git commit -m "Arată numerele vedice pe care motorul le calcula degeaba"
```

---

### Task 2: Blocul Kua (Feng Shui), cu ramura de formulă

**Files:**
- Create: `src/components/numerology/KuaNumber.tsx`
- Test: `src/components/numerology/__tests__/KuaNumber.test.tsx`

**Interfaces:**
- Consumes: `kuaNumber(year: number, gender: 'male' | 'female')` din `@/lib/numerology-plus/systems`, care întoarce `{ kua: number; group: 'east' | 'west'; favorable: { shengChi, tienYi, nienYen, fuWei }; groupDirections; convention: string }`; `useLanguage()`.
- Produces: `export const KuaNumber = ({ birthDate }: { birthDate: Date }) => JSX.Element` — folosit de Task 4. Cheia de `localStorage` e `"kua-branch"`, cu valori `"male"` / `"female"`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/numerology/__tests__/KuaNumber.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KuaNumber } from "../KuaNumber";
import { kuaNumber } from "@/lib/numerology-plus/systems";

/**
 * The Kua formula needs a branch the application has never collected. These
 * assert the two things that matter about that: the block is useful before a
 * branch is picked, and once one is picked the numbers are the engine's.
 */

const BIRTH = new Date(1990, 7, 25); // fixed: kua 1 on the male branch, 8 on the female one

const draw = () =>
  render(
    <LanguageProvider>
      <KuaNumber birthDate={BIRTH} />
    </LanguageProvider>,
  );

const branchButton = (which: "male" | "female") =>
  screen.getByRole("button", { name: new RegExp(which === "male" ? "10 −" : "\\+ 5") });

describe("KuaNumber", () => {
  beforeEach(() => localStorage.clear());

  it("asks for a branch instead of hiding the block", () => {
    const { container } = draw();
    // The block is there, discoverable, with both branches offered...
    expect(branchButton("male")).toBeTruthy();
    expect(branchButton("female")).toBeTruthy();
    // ...and no Kua number invented in the absence of an answer.
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
  });

  it("says on its face that this is a two-branch formula, not a classification", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /nu clasificăm|classify no one|никого не классифицируем/i,
    );
    expect(container.textContent ?? "").toMatch(/Feng Shui|фэн-шуй/i);
  });

  it("computes the branch that subtracts from 10", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    const engine = kuaNumber(1990, "male");
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(engine.kua);
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(1);
    for (const key of ["shengChi", "tienYi", "nienYen", "fuWei"] as const) {
      expect(container.querySelector(`[data-direction="${key}"]`)?.textContent, key).toBeTruthy();
    }
    // Kua 1 is an East-group number; the group must follow the engine, not a guess.
    expect(container.querySelector("[data-group]")?.getAttribute("data-group")).toBe(engine.group);
  });

  it("computes the branch that adds 5", () => {
    const { container } = draw();
    fireEvent.click(branchButton("female"));
    const engine = kuaNumber(1990, "female");
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(engine.kua);
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(8);
    expect(container.querySelector("[data-group]")?.getAttribute("data-group")).toBe("west");
  });

  it("keeps the choice in this browser and nowhere else", () => {
    draw();
    fireEvent.click(branchButton("female"));
    expect(localStorage.getItem("kua-branch")).toBe("female");
  });

  it("reads the remembered branch back on a fresh render", () => {
    localStorage.setItem("kua-branch", "male");
    const { container } = draw();
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(1);
  });

  it("ignores a stored value that is not a branch", () => {
    localStorage.setItem("kua-branch", "banana");
    const { container } = draw();
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
    expect(branchButton("male")).toBeTruthy();
  });

  it("lets the reader take the choice back", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    fireEvent.click(screen.getByRole("button", { name: /Schimbă ramura|Change branch|Сменить ветвь/ }));
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
    expect(localStorage.getItem("kua-branch")).toBeNull();
  });

  it("renders the number through the tabular class", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    expect(container.querySelector('[data-figure="kua"]')?.className).toContain("num");
  });
});
```

- [ ] **Step 2: Rulează testul ca să vezi că pică**

Run: `npm run test:run -- src/components/numerology/__tests__/KuaNumber.test.tsx`
Expected: FAIL — `Failed to resolve import "../KuaNumber"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/numerology/KuaNumber.tsx`:

```tsx
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { kuaNumber } from "@/lib/numerology-plus/systems";

/**
 * The Kua number, and the one parameter the application has never collected.
 *
 * kuaNumber() takes 'male' | 'female' because the Feng Shui formula it encodes
 * has exactly two arithmetic branches: one subtracts the reduced year from 10,
 * the other adds 5 to it. That is what the question is, and that is what the
 * block says -- naming the branches by their arithmetic as well as by their
 * traditional names, so neither the reader who knows Feng Shui nor the reader
 * who does not is misled about what is being asked.
 *
 * Where the answer lives: here, in component state, mirrored into localStorage.
 * Not in user_profiles. NumerologyResults receives fullName, birthDate and
 * onReset and never sees a profile (src/pages/Index.tsx), the reading page works
 * for signed-out visitors, and for a field of this kind "it never leaves the
 * device" is the right default rather than a shortcut. If a saved map ever needs
 * a Kua number, that is a migration and a backend change, and a separate piece
 * of work.
 *
 * When no branch is chosen the block still renders, with the invitation. Hiding
 * it would make Kua undiscoverable and would give chapter 5 a variable number of
 * blocks, which reads as a bug rather than as a choice.
 */

type Lang = "ro" | "en" | "ru";
type Branch = "male" | "female";

const STORAGE_KEY = "kua-branch";

const readBranch = (): Branch | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "male" || stored === "female" ? stored : null;
  } catch {
    // Private modes disable localStorage; the block simply asks every time.
    return null;
  }
};

/** The engine speaks Romanian compass points; every language gets its own. */
const COMPASS: Record<string, Record<Lang, string>> = {
  N:  { ro: "N",  en: "N",  ru: "С"  },
  S:  { ro: "S",  en: "S",  ru: "Ю"  },
  E:  { ro: "E",  en: "E",  ru: "В"  },
  V:  { ro: "V",  en: "W",  ru: "З"  },
  NE: { ro: "NE", en: "NE", ru: "СВ" },
  NV: { ro: "NV", en: "NW", ru: "СЗ" },
  SE: { ro: "SE", en: "SE", ru: "ЮВ" },
  SV: { ro: "SV", en: "SW", ru: "ЮЗ" },
};

const DIRECTION_KEYS = ["shengChi", "tienYi", "nienYen", "fuWei"] as const;

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    ask: "Numărul Kua vine dintr-o formulă Feng Shui de secol trecut, cu două ramuri de calcul: una scade din 10, cealaltă adaugă 5. Alege ramura pe care vrei s-o calculăm.",
    askPrivacy: "Nu clasificăm pe nimeni. Alegerea rămâne în browserul tău și nu pleacă nicăieri.",
    male: "Ramura masculină (10 − n)",
    female: "Ramura feminină (n + 5)",
    kuaLabel: "Numărul Kua",
    group: "Grup", east: "Est", west: "Vest",
    groupNote: "Grupul de Est ține direcțiile N, S, E, SE. Grupul de Vest ține NE, NV, V, SV.",
    directions: "Direcțiile favorabile",
    shengChi: "Sheng Chi — prosperitate",
    tienYi: "Tien Yi — sănătate",
    nienYen: "Nien Yen — relații",
    fuWei: "Fu Wei — creștere personală",
    change: "Schimbă ramura",
    convention: "Convenție clasică (10 − / + 5). Sursele diferă pentru cei născuți după 2000.",
  },
  en: {
    ask: "The Kua number comes from a last-century Feng Shui formula with two branches: one subtracts from 10, the other adds 5. Pick the branch you want calculated.",
    askPrivacy: "We classify no one. The choice stays in your browser and goes nowhere else.",
    male: "Male branch (10 − n)",
    female: "Female branch (n + 5)",
    kuaLabel: "Kua number",
    group: "Group", east: "East", west: "West",
    groupNote: "The East group holds N, S, E, SE. The West group holds NE, NW, W, SW.",
    directions: "Favourable directions",
    shengChi: "Sheng Chi — prosperity",
    tienYi: "Tien Yi — health",
    nienYen: "Nien Yen — relationships",
    fuWei: "Fu Wei — personal growth",
    change: "Change branch",
    convention: "Classic convention (10 − / + 5). Sources differ for those born after 2000.",
  },
  ru: {
    ask: "Число Гуа происходит из формулы фэн-шуй прошлого века с двумя ветвями расчёта: одна вычитает из 10, другая прибавляет 5. Выберите ветвь, которую посчитать.",
    askPrivacy: "Мы никого не классифицируем. Выбор остаётся в вашем браузере и никуда не уходит.",
    male: "Мужская ветвь (10 − n)",
    female: "Женская ветвь (n + 5)",
    kuaLabel: "Число Гуа",
    group: "Группа", east: "Восток", west: "Запад",
    groupNote: "Восточная группа держит С, Ю, В, ЮВ. Западная — СВ, СЗ, З, ЮЗ.",
    directions: "Благоприятные направления",
    shengChi: "Шэн Ци — процветание",
    tienYi: "Тянь И — здоровье",
    nienYen: "Нянь Янь — отношения",
    fuWei: "Фу Вэй — личностный рост",
    change: "Сменить ветвь",
    convention: "Классическая конвенция (10 − / + 5). Источники расходятся для родившихся после 2000 года.",
  },
};

interface KuaNumberProps {
  birthDate: Date;
}

export const KuaNumber = ({ birthDate }: KuaNumberProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const [branch, setBranch] = useState<Branch | null>(readBranch);

  const choose = (next: Branch | null) => {
    setBranch(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The reading still works; only the memory of the choice is lost.
    }
  };

  const kua = useMemo(
    () => (branch ? kuaNumber(birthDate.getFullYear(), branch) : null),
    [birthDate, branch],
  );

  if (!kua) {
    return (
      <div className="space-y-3 rounded-xl border border-line bg-surface/60 p-4">
        <p className="text-sm text-foreground/85">{l.ask}</p>
        <p className="text-xs text-faint">{l.askPrivacy}</p>
        <div className="flex flex-wrap gap-2">
          {(["male", "female"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => choose(b)}
              className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              {l[b]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="num text-4xl text-primary" data-figure="kua">{kua.kua}</span>
        <div>
          <span className="block text-xs text-muted-foreground">{l.kuaLabel}</span>
          <span className="text-sm text-ink-2" data-group={kua.group}>
            {l.group}: {kua.group === "east" ? l.east : l.west}
          </span>
        </div>
        <button
          type="button"
          onClick={() => choose(null)}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {l.change}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-base text-foreground">{l.directions}</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DIRECTION_KEYS.map((key) => (
            <li key={key} className="flex items-baseline gap-3 rounded-lg bg-sunken px-3 py-2">
              <span className="num text-lg text-foreground" data-direction={key}>
                {COMPASS[kua.favorable[key]]?.[lang] ?? kua.favorable[key]}
              </span>
              <span className="text-sm text-ink-2">{l[key]}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-faint">{l.groupNote}</p>
      </div>

      <p className="text-xs text-faint">{l.convention}</p>
    </div>
  );
};
```

- [ ] **Step 4: Rulează testul ca să treacă**

Run: `npm run test:run -- src/components/numerology/__tests__/KuaNumber.test.tsx`
Expected: PASS, 9 teste.

- [ ] **Step 5: Verifică tipurile și lint-ul**

Run: `npm run typecheck && npm run lint`
Expected: ambele PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/numerology/KuaNumber.tsx src/components/numerology/__tests__/KuaNumber.test.tsx
git commit -m "Cere ramura formulei Kua, nu genul omului"
```

---

### Task 3: Blocul Kabbalah, cu cele două sisteme omonime

**Files:**
- Create: `src/components/numerology/KabbalahNumbers.tsx`
- Test: `src/components/numerology/__tests__/KabbalahNumbers.test.tsx`

**Interfaces:**
- Consumes: `popularKabbalah(name: string)` → `{ total: number; value: number; system: 'popular-mod9'; disclaimer: string }` și `hebrewGematria(name: string)` → `{ hebrew: string; total: number; reduced: number; system: 'hebrew-gematria' }`, ambele din `@/lib/numerology-plus/systems`; `useLanguage()`.
- Produces: `export const KabbalahNumbers = ({ fullName }: { fullName: string }) => JSX.Element` — folosit de Task 4.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/numerology/__tests__/KabbalahNumbers.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KabbalahNumbers } from "../KabbalahNumbers";
import { popularKabbalah, hebrewGematria } from "@/lib/numerology-plus/systems";

/**
 * Two systems that share a name and nothing else. The block's whole job is to
 * show both and to say they are unrelated, so that is what this asserts --
 * alongside the numbers being the engine's rather than something rendered
 * nearby.
 */

const NAME = "Victor Ion Safta";

const draw = () =>
  render(
    <LanguageProvider>
      <KabbalahNumbers fullName={NAME} />
    </LanguageProvider>,
  );

const figure = (c: HTMLElement, key: string) =>
  Number(c.querySelector(`[data-figure="${key}"]`)?.textContent);

describe("KabbalahNumbers", () => {
  it("shows the popular figures the engine computed", () => {
    const { container } = draw();
    const engine = popularKabbalah(NAME);
    expect(figure(container, "popular-total")).toBe(engine.total);
    expect(figure(container, "popular-value")).toBe(engine.value);
    expect(figure(container, "popular-total")).toBe(64);
    expect(figure(container, "popular-value")).toBe(1);
  });

  it("shows the gematria figures the engine computed", () => {
    const { container } = draw();
    const engine = hebrewGematria(NAME);
    expect(figure(container, "hebrew-total")).toBe(engine.total);
    expect(figure(container, "hebrew-reduced")).toBe(engine.reduced);
    expect(figure(container, "hebrew-total")).toBe(464);
    expect(figure(container, "hebrew-reduced")).toBe(5);
  });

  it("prints the transliteration the engine produced, right to left", () => {
    const { container } = draw();
    const node = container.querySelector('[data-figure="hebrew-letters"]');
    expect(node?.textContent).toBe(hebrewGematria(NAME).hebrew);
    expect(node?.textContent).toBe("ביכטוריונסאפטא");
    // Hebrew rendered left-to-right is the wrong string on screen.
    expect(node?.getAttribute("dir")).toBe("rtl");
  });

  it("says the two systems are unrelated", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /nicio legătură|nothing to do with each other|никак не связаны/i,
    );
  });

  it("admits the transliteration is approximate", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /aproximativă|approximate|приблизительна/i,
    );
  });

  it("renders every figure through the tabular class", () => {
    const { container } = draw();
    for (const key of ["popular-total", "popular-value", "hebrew-total", "hebrew-reduced"]) {
      expect(container.querySelector(`[data-figure="${key}"]`)?.className, key).toContain("num");
    }
  });
});
```

- [ ] **Step 2: Rulează testul ca să vezi că pică**

Run: `npm run test:run -- src/components/numerology/__tests__/KabbalahNumbers.test.tsx`
Expected: FAIL — `Failed to resolve import "../KabbalahNumbers"`.

- [ ] **Step 3: Scrie componenta**

Creează `src/components/numerology/KabbalahNumbers.tsx`:

```tsx
import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { popularKabbalah, hebrewGematria } from "@/lib/numerology-plus/systems";

/**
 * Two systems that share a name and nothing else.
 *
 * popularKabbalah is a modern mod-9 scheme sold under the word "Kabbalah";
 * hebrewGematria is the traditional 1-400 table applied to a transliteration of
 * the name. Showing either alone would be fine; showing both without saying they
 * are unrelated would invite the reader to treat two numbers as two
 * confirmations of one thing, which is the failure mode this block exists to
 * avoid.
 *
 * The engine ships a `disclaimer` string on popularKabbalah, but in Romanian
 * only, and the engine is read-only -- so the warning is written here, in all
 * three languages, and applies to the pair rather than to one half of it.
 */

type Lang = "ro" | "en" | "ru";

const LABELS: Record<Lang, Record<string, string>> = {
  ro: {
    popularTitle: "Kabbalah populară (mod-9)",
    popularNote: "Literele se numără ciclic, 1–9, iar totalul se ia modulo 9. E varianta care circulă pe piață.",
    hebrewTitle: "Gematria ebraică",
    hebrewNote: "Numele transliterat în alfabet ebraic, cu valorile clasice 1–400. Tradiția nu reduce totalul; îl arătăm și redus, doar ca punct de comparație.",
    total: "Total", value: "Valoare", reduced: "Redus", translit: "Transliterare",
    warning: "Cele două nu au nicio legătură între ele. Prima e o schemă modernă de piață, a doua e gematria tradițională. Nu le citi ca pe două confirmări ale aceluiași lucru.",
    translitNote: "Transliterarea latină → ebraică e aproximativă: unele sunete latine nu au corespondent exact.",
  },
  en: {
    popularTitle: "Popular Kabbalah (mod-9)",
    popularNote: "Letters are numbered cyclically 1–9 and the total is taken modulo 9. This is the version that circulates on the market.",
    hebrewTitle: "Hebrew gematria",
    hebrewNote: "The name transliterated into the Hebrew alphabet, with the classical values 1–400. Tradition does not reduce the total; the reduction is shown only as a point of comparison.",
    total: "Total", value: "Value", reduced: "Reduced", translit: "Transliteration",
    warning: "The two have nothing to do with each other. The first is a modern market scheme, the second is traditional gematria. Do not read them as two confirmations of the same thing.",
    translitNote: "The Latin-to-Hebrew transliteration is approximate: some Latin sounds have no exact counterpart.",
  },
  ru: {
    popularTitle: "Популярная каббала (мод-9)",
    popularNote: "Буквы нумеруются циклически 1–9, а сумма берётся по модулю 9. Это вариант, который ходит по рынку.",
    hebrewTitle: "Еврейская гематрия",
    hebrewNote: "Имя, транслитерированное в еврейский алфавит, с классическими значениями 1–400. Традиция не сводит сумму; свёрнутое число показано лишь для сравнения.",
    total: "Сумма", value: "Значение", reduced: "Свёрнуто", translit: "Транслитерация",
    warning: "Эти две системы никак не связаны. Первая — современная рыночная схема, вторая — традиционная гематрия. Не читайте их как два подтверждения одного и того же.",
    translitNote: "Транслитерация с латиницы на иврит приблизительна: у некоторых латинских звуков нет точного соответствия.",
  },
};

interface KabbalahNumbersProps {
  fullName: string;
}

export const KabbalahNumbers = ({ fullName }: KabbalahNumbersProps) => {
  const { language } = useLanguage();
  const lang = (language as Lang) in LABELS ? (language as Lang) : "en";
  const l = LABELS[lang];

  const { popular, hebrew } = useMemo(
    () => ({ popular: popularKabbalah(fullName), hebrew: hebrewGematria(fullName) }),
    [fullName],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-line bg-surface/60 p-4">
          <h4 className="font-heading text-base text-foreground">{l.popularTitle}</h4>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="block text-xs text-muted-foreground">{l.total}</span>
              <span className="num text-2xl text-ink-2" data-figure="popular-total">{popular.total}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">{l.value}</span>
              <span className="num text-3xl text-primary" data-figure="popular-value">{popular.value}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{l.popularNote}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-line bg-surface/60 p-4">
          <h4 className="font-heading text-base text-foreground">{l.hebrewTitle}</h4>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="block text-xs text-muted-foreground">{l.total}</span>
              <span className="num text-3xl text-primary" data-figure="hebrew-total">{hebrew.total}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">{l.reduced}</span>
              <span className="num text-2xl text-ink-2" data-figure="hebrew-reduced">{hebrew.reduced}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground">{l.translit}</span>
            <span
              dir="rtl"
              lang="he"
              className="block text-xl text-foreground"
              data-figure="hebrew-letters"
            >
              {hebrew.hebrew}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{l.hebrewNote}</p>
          <p className="text-xs text-faint">{l.translitNote}</p>
        </div>
      </div>

      <p className="rounded-lg bg-warn-soft/60 p-3 text-sm text-foreground/90">{l.warning}</p>
    </div>
  );
};
```

- [ ] **Step 4: Rulează testul ca să treacă**

Run: `npm run test:run -- src/components/numerology/__tests__/KabbalahNumbers.test.tsx`
Expected: PASS, 6 teste.

- [ ] **Step 5: Verifică tipurile și lint-ul**

Run: `npm run typecheck && npm run lint`
Expected: ambele PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/numerology/KabbalahNumbers.tsx src/components/numerology/__tests__/KabbalahNumbers.test.tsx
git commit -m "Pune cele două Kabbalah una lângă alta și spune că n-au legătură"
```

---

### Task 4: Leagă-le în capitolul 5 și șterge promisiunea

**Files:**
- Modify: `src/components/NumerologyResults.tsx` (import-uri ~ liniile 26-33; `sectionLabels` liniile 161-184; `teasers` liniile 186-203; capitolul 5, liniile 424-445)
- Create: `src/components/__tests__/parallel-systems.wiring.test.ts`

**Interfaces:**
- Consumes: `VedicNumbers`, `KuaNumber`, `KabbalahNumbers` din Task-urile 1-3, cu semnăturile de acolo. `Block` din `@/components/numerology/Chapter`, deja importat, cu prop-urile `{ title: string; icon?: ReactNode; note?: string; children: ReactNode }`.
- Produces: nimic pentru task-uri ulterioare. E ultimul.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/__tests__/parallel-systems.wiring.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The wiring of chapter 5, asserted at the source.
 *
 * Rendering NumerologyResults whole would need a router, an AuthProvider that
 * calls the API on mount and a React Query client -- a brittle test for one
 * question. design-tokens.test.ts already reads source files and asserts about
 * their text; this is the same instrument aimed at the same kind of fact.
 *
 * What it protects: the engine's three parallel systems were computed and never
 * rendered for the whole life of numerology-plus, and a comment promised they
 * would be. The promise is not allowed back without the blocks.
 */

const ROOT = resolve(__dirname, "../../..");
const SOURCE = readFileSync(join(ROOT, "src/components/NumerologyResults.tsx"), "utf8");

describe("chapter 5 renders the parallel systems", () => {
  it("imports all three blocks", () => {
    for (const name of ["VedicNumbers", "KuaNumber", "KabbalahNumbers"]) {
      expect(SOURCE, name).toContain(`import { ${name} } from "@/components/numerology/${name}"`);
    }
  });

  it("renders all three", () => {
    expect(SOURCE).toContain("<VedicNumbers fullName={fullName} birthDate={birthDate} />");
    expect(SOURCE).toContain("<KuaNumber birthDate={birthDate} />");
    expect(SOURCE).toContain("<KabbalahNumbers fullName={fullName} />");
  });

  it("has stopped promising them for later", () => {
    expect(SOURCE).not.toContain("until then, the link is the entrance");
    expect(SOURCE).not.toContain("will render inline");
  });

  it("keeps the Chaldean page reachable", () => {
    // /chaldean carries the 52-entry compound table and the business-name
    // reading, which none of the three new blocks do. Cutting its only link
    // would orphan the page again.
    expect(SOURCE).toContain('to="/chaldean"');
  });

  it("names every new block in all three languages", () => {
    for (const key of ["vedic:", "kua:", "kabbalah:"]) {
      const occurrences = SOURCE.split(key).length - 1;
      // Once in sectionLabels, once in teasers.
      expect(occurrences, key).toBeGreaterThanOrEqual(2);
    }
    // No English fallback slipped in where a translation was meant to be.
    expect(SOURCE).not.toMatch(/\bkua: \{ ro: "([^"]*)", en: "\1"/);
  });
});
```

- [ ] **Step 2: Rulează testul ca să vezi că pică**

Run: `npm run test:run -- src/components/__tests__/parallel-systems.wiring.test.ts`
Expected: FAIL — patru din cinci teste pică; primul raportează `expected '…' to contain 'import { VedicNumbers } from "@/components/numerology/VedicNumbers"'`.

- [ ] **Step 3: Adaugă import-urile**

În `src/components/NumerologyResults.tsx`, imediat sub linia `import { SaveMapButton } from "@/components/numerology/SaveMapButton";`, adaugă:

```tsx
import { VedicNumbers } from "@/components/numerology/VedicNumbers";
import { KuaNumber } from "@/components/numerology/KuaNumber";
import { KabbalahNumbers } from "@/components/numerology/KabbalahNumbers";
```

Nu sunt `lazy`: niciuna nu aduce Recharts și niciuna nu atinge stratul de conținut din `numerology-plus/content`, care e motivul pentru care `Contradictions` și `NewNumbers` sunt lazy. `systems.ts` intră oricum în bundle prin `fullProfile`. Linia de import `lucide-react` rămâne neatinsă — cele trei icoane folosite (`Star`, `Compass`, `Type`) sunt deja acolo.

- [ ] **Step 4: Retitrează blocul caldeean și adaugă etichetele noi**

În `sectionLabels`, înlocuiește linia `parallel` și adaugă trei chei. Linia veche:

```tsx
    parallel: { ro: "Sisteme paralele", en: "Parallel systems", ru: "Параллельные системы" },
```

devine:

```tsx
    parallel: { ro: "Numărul compus caldeean", en: "The Chaldean compound number", ru: "Халдейское составное число" },
    vedic: { ro: "Numerologie vedică (Ank Jyotish)", en: "Vedic numerology (Ank Jyotish)", ru: "Ведическая нумерология (Анк Джьотиш)" },
    kua: { ro: "Numărul Kua (Feng Shui)", en: "The Kua number (Feng Shui)", ru: "Число Гуа (фэн-шуй)" },
    kabbalah: { ro: "Kabbalah", en: "Kabbalah", ru: "Каббала" },
```

„Sisteme paralele" era numele potrivit când blocul era un link; acum sunt trei blocuri reale care poartă numele, iar cel caldeean se numește după ce conține.

În `teasers`, adaugă trei chei imediat deasupra liniei `parallel:` (care rămâne exact cum e — vorbea deja doar despre Chaldean):

```tsx
    vedic: { ro: "Mulank, Bhagyank și Naamank, planetele lor și cum se împacă între ele.", en: "Mulank, Bhagyank and Naamank, their planets, and how they get on.", ru: "Муланк, Бхагьянк и Нааманк, их планеты и то, как они уживаются." },
    kua: { ro: "Un număr Feng Shui derivat din anul nașterii și cele patru direcții pe care le deschide.", en: "A Feng Shui number drawn from the birth year, and the four directions it opens.", ru: "Число фэн-шуй, выведенное из года рождения, и четыре направления, которые оно открывает." },
    kabbalah: { ro: "Două sisteme cu același nume și nicio legătură între ele, puse una lângă alta.", en: "Two systems that share a name and nothing else, set side by side.", ru: "Две системы с общим названием и без всякой связи между собой, поставленные рядом." },
```

- [ ] **Step 5: Înlocuiește comentariul-promisiune cu cele trei blocuri**

În capitolul 5, imediat după `Block`-ul matriței (`</Block>` de după `<DestinyMatrix birthDate={birthDate} />`), înlocuiește blocul de comentariu de patru linii care începe cu `{/* /chaldean had no link into it from anywhere` și tot `Block`-ul `parallel` care îi urmează, cu:

```tsx
          {/* The engine's three parallel systems, inline at last.
              fullProfile computed vedic, kua and kabbalah from the day
              numerology-plus landed and nothing rendered any of them: a grep for
              vedicProfile, kuaNumber or hebrewGematria outside
              src/lib/numerology-plus came back empty. The comment that used to
              sit here promised these blocks and pointed at /chaldean instead. */}
          <Block title={sectionLabels.vedic[language]} icon={<Star className="h-5 w-5 text-primary" />} note={teasers.vedic[language]}>
            <VedicNumbers fullName={fullName} birthDate={birthDate} />
          </Block>

          <Block title={sectionLabels.kua[language]} icon={<Compass className="h-5 w-5 text-primary" />} note={teasers.kua[language]}>
            <KuaNumber birthDate={birthDate} />
          </Block>

          <Block title={sectionLabels.kabbalah[language]} icon={<Type className="h-5 w-5 text-primary" />} note={teasers.kabbalah[language]}>
            <KabbalahNumbers fullName={fullName} />
          </Block>

          {/* The Chaldean page keeps its link: it carries the 52-entry compound
              table, the favourable days and the business-name reading, none of
              which the three blocks above do. It is depth now, not the entrance. */}
          <Block title={sectionLabels.parallel[language]} icon={<Compass className="h-5 w-5 text-primary" />} note={teasers.parallel[language]}>
            <Link
              to="/chaldean"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              {sectionLabels.openChaldean[language]}
            </Link>
          </Block>
```

- [ ] **Step 6: Rulează testul de legare ca să treacă**

Run: `npm run test:run -- src/components/__tests__/parallel-systems.wiring.test.ts`
Expected: PASS, 5 teste.

- [ ] **Step 7: Rulează toată suita, tipurile, lint-ul și build-ul**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build:check`
Expected: toate PASS. Cele patru fișiere noi de test adaugă 27 de aserțiuni; suita motorului (78) rămâne neatinsă pentru că `src/lib/numerology-plus/**` n-a fost modificat.

- [ ] **Step 8: Verifică pe ecran, o dată**

Run: `npm run dev`, deschide `http://localhost:8082`, calculează cu `Victor Ion Safta` / `25.08.1990` și derulează la capitolul 5.
Expected, de verificat cu ochii:
- „Numerologie vedică" arată 7, 7 și 8 (compus 53), planetele Ketu, Ketu și Shani, o relație verde (`friend`) și două în tonul de tensiune, iar nota de sub Bhagyank spune că cele două metode cad pe același număr.
- „Numărul Kua" arată întâi cele două butoane de ramură; după clic pe „Ramura masculină (10 − n)" arată 1, grup Est, și SE / E / S / N.
- „Kabbalah" arată 64 → 1, respectiv 464 → 5, cu `ביכטוריונסאפטא` scris de la dreapta la stânga.
- Comută limba pe EN și pe RU și confirmă că niciun bloc nu cade în engleză când e pe RU.
- Comută tema light ↔ dark și confirmă că tonurile `harmony`/`tension` rămân lizibile în amândouă.

- [ ] **Step 9: Commit**

```bash
git add src/components/NumerologyResults.tsx src/components/__tests__/parallel-systems.wiring.test.ts
git commit -m "Leagă cele trei sisteme paralele în capitolul 5"
```

---

## Self-Review

**Acoperirea cerințelor.** Cele trei blocuri: Task 1 (Vedic, cu Mulank/Bhagyank/Naamank, Navagraha, `harmony` și explicația divergenței Bhagyank ↔ Life Path), Task 2 (Kua, condiționat de ramură), Task 3 (Kabbalah, ambele variante). Genul: decis, argumentat și implementat integral în Task 2, cu textul RO/EN/RU scris. Comentariul-promisiune: șters în Task 4, cu un test care îl ține șters. Link-ul `/chaldean`: decis (rămâne, retitrat), argumentat, cu test. Fiecare componentă are testul ei, cu date fixate literal și valori comparate cu ce întoarce motorul.

**Placeholdere.** Niciun „TBD", niciun „similar to Task N", niciun pas de cod fără cod. Fiecare valoare numerică din teste vine din rularea motorului, nu din estimare.

**Consistență de tipuri.** `VedicNumbers({ fullName, birthDate })`, `KuaNumber({ birthDate })`, `KabbalahNumbers({ fullName })` — aceleași semnături în Interfaces, în cod, în teste și în JSX-ul din Task 4. Cheia de `localStorage` e `"kua-branch"` în componentă și în test. Atributele `data-figure` folosite în teste (`mulank`, `bhagyank`, `naamank`, `naamank-compound`, `drift-bhagyank`, `drift-lifepath`, `kua`, `popular-total`, `popular-value`, `hebrew-total`, `hebrew-reduced`, `hebrew-letters`) apar toate în componentele corespunzătoare.

**Riscul rămas, numit.** `KuaNumber` scrie în `localStorage` la fiecare clic; testele fac `localStorage.clear()` în `beforeEach`, dar dacă un test viitor din alt fișier rulează în același worker fără curățenie, ordinea ar putea conta. Cheia e distinctă (`kua-branch`, față de `language` și `seen-first-reading`), deci coliziunea e improbabilă, dar merită știut.
