# Cele trei litere de poziție — Plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Piatra de Temelie, Piatra de Vârf și Prima Vocală — deja scrise, traduse și validate în motor — ajung pe pagina de rezultat, în capitolul 1, cu textul întors de `interpretLetters()`, în RO/EN/RU.

**Architecture:** O componentă nouă, `LetterStones.tsx`, singurul consumator al lui `interpretLetters()`. Ea randează cele trei interpretări prin `NumberCard`-ul existent (deci textul afișat *este* textul motorului, nu o copie), plus litera și trăsătura ei deasupra fiecărui card. Se montează lazy ca `Block` în capitolul 1 din `NumerologyResults.tsx`. Motorul nu se atinge; `chapterKeys.ts` nu se atinge; `LetterMap.tsx` nu se atinge.

**Tech Stack:** React 18 + TypeScript, Vite 6 (SWC), Tailwind + shadcn/ui, Vitest + Testing Library.

**Spec:** nu există un document de spec separat pentru această bucată. Problema diagnosticată și cele trei decizii de proiectare sunt în secțiunea „Problema și deciziile" de mai jos; planul argumentează din ea.

## Global Constraints

- Repo: /Users/victorsafta/work/numerology-compass, branch `feature/numerology-plus`. Aplicație de numerologie RO/EN/RU.
- Frontend: React 18 + TypeScript + Vite 6 (SWC), shadcn/ui + Tailwind. Alias `@/` → `src/`.
- Teste frontend: Vitest + Testing Library. Rulare: `npm run test:run -- <cale>`. Tipuri: `npm run typecheck`. Lint: `npm run lint`.
- Migrații: `server/src/migrations/NNN_nume.sql`, nereplayable, niciodată editate retroactiv. Ultima existentă e `009_premium_features.sql`.
- Rute: `src/data/routes.json` e sursa unică. O rută nouă = `routes.json` ȘI `PAGES` din `src/App.tsx`.
- Culori: fiecare culoare e un token în `src/index.css`. NICIUN `hsl()` literal în `src/components` sau `src/pages` — testul `src/lib/__tests__/design-tokens.test.ts` cade dacă apare.
- Tipografie: `font-heading` (Literata) pentru titluri și proză; clasa `.num` (IBM Plex Mono, cifre tabulare) pentru ORICE cifră sau etichetă numerică; `font-raleway` pentru interfață.
- i18n: tot textul prin `useLanguage()` → `t.sectiune.cheie`, în `src/lib/translations.ts`. Toate cele TREI limbi (ro/en/ru) obligatorii — fără fallback în engleză.
- Motorul `src/lib/numerology-plus/**` e READ-ONLY: 78 de aserțiuni trec. Îl consumi, nu-l modifici.
- Commit-uri: subiect în ROMÂNĂ, la imperativ, care spune INTENȚIA. NU folosi prefixe conventional-commits.

**Excepție locală, asumată, la regula i18n:** `NumerologyResults.tsx` nu ia titlurile de `Block` din `translations.ts`. Are propriile hărți `sectionLabels` și `teasers`, obiecte `{ ro, en, ru }` indexate cu `language` (liniile 161–203). Toate cele ~25 de etichete de secțiune de pe pagina de rezultat sunt acolo. Cele două chei noi din Task 2 urmează convenția fișierului pe care îl modificăm — a le pune în `translations.ts` ar face pagina să aibă două locuri pentru același tip de text. Cerința de fond rămâne respectată: toate cele trei limbi, fără fallback pe engleză. Textul *interpretărilor* vine oricum integral din motor, care e deja trilingv.

---

## Problema și deciziile

**Observat (grep + citire în cod, 2026-09-01):**

- `src/lib/numerology-plus/content/frames.ts` are 14 rame; `cornerstone`, `capstone` și `firstVowel` sunt la liniile 160–203.
- `interpretProfile()` din `content/interpret.ts` emite 11 chei. Cele trei litere nu sunt printre ele — sunt servite de `interpretLetters()`, funcție separată în același fișier, pentru că ies cu două câmpuri în plus: `letter` și `letterTrait`.
- `grep -rln "interpretLetters" src` → un singur fișier: `src/lib/numerology-plus/content/interpret.ts`. **Zero consumatori.**
- `src/components/numerology/LetterMap.tsx` folosește `analyzeIndividualLetters` din `src/lib/nameAnalysis.ts` și nu a fost mutat niciodată pe motor.

### Decizia 1 — unde stau cele trei

**În capitolul 1, „Cine ești".** Argumentul e întrebarea capitolului contra întrebărilor ramelor:

| | întrebarea |
|---|---|
| capitolul 1 (`NumerologyResults.tsx:116`) | „Din ce ești făcut, indiferent de an." |
| `cornerstone` (`frames.ts:162`) | „Cum intri într-o situație nouă" |
| `capstone` (`frames.ts:177`) | „Cum închei ce ai început" |
| `firstVowel` (`frames.ts:192`) | „Prima ta reacție, înainte de gând" |

Toate trei sunt reflexe permanente, derivate din litere fixe ale numelui — nu depind de an. Nu sunt tensiune (cap. 2 cere două numere care se contrazic), nu sunt lipsă (cap. 3 cere ce nu e în hartă), nu sunt „acum" (cap. 4) și nu sunt etapă de viață (cap. 5). Rămâne capitolul 1, unde stau deja Atitudinea și Maturitatea — același registru: cum ești citit, cine devii, cum începi.

**Nu merg în `LetterMap`**, deși și acolo e vorba de litere. `LetterMap` stă în capitolul 3 pentru că răspunde la „ce lipsește din harta ta" — e tabelul de incluziune desenat. A pune cele trei acolo ar fi organizare după *mecanism* (ambele sunt despre litere), nu după *întrebare* — exact ce comentariul din `Chapter.tsx` spune că s-a reparat când acordeonul a devenit capitole.

### Decizia 2 — testul de partiție rămâne neatins

`NewNumbers.test.tsx` are testul „distributes every interpretation the engine emits across the chapters": compară `ALL_CHAPTER_KEYS` cu cheile emise de `interpretProfile`. Dacă am adăuga `cornerstone`/`capstone`/`firstVowel` în `ALL_CHAPTER_KEYS`, **testul ar pica** — ele nu vin din `interpretProfile`. Și dacă le-am pasa lui `NewNumbers` prin `keys`, ar fi tăcut ignorate: `byKey.get(key)` întoarce `undefined` și `flatMap` le aruncă.

Deci: `chapterKeys.ts` și testul lui rămân exact cum sunt. Motivul de fond, nu doar cel mecanic: lista de chei există ca să prindă „o cheie adăugată în motor și uitată în capitole", iar `LetterStones` **randează tot ce întoarce `interpretLetters()`**, fără listă intermediară. Modul de eșec pe care lista îl păzește nu poate apărea acolo unde nu există listă. O a patra rămă de litere adăugată în motor ar apărea singură pe pagină. Testul nou din Task 1 („câte întoarce motorul, atâtea carduri") păzește exact asta.

### Decizia 3 — `analyzeIndividualLetters` rămâne, și nu se contrazice cu motorul

Cele două afirmă lucruri diferite:

- **`analyzeIndividualLetters` (grila din `LetterMap`)** afirmă un *inventar*: astea sunt literele numelui tău, în ordine, fiecare cu valoarea ei, vocală sau consoană. E baza graficului de distribuție. Nimic altceva de pe pagină nu face asta.
- **`interpretLetters` (cardurile noi)** afirmă un *înțeles*, pentru trei poziții anume: prima literă a prenumelui, ultima a numelui de familie, prima vocală.

Nu se contrazic pentru că citesc aceeași tabelă: `nameAnalysis.ts:462` face `PYTHAGOREAN[letter]`, iar `content/letters.ts:20` face tot `PYTHAGOREAN[ch]` — ambele din `numerology-plus/core.ts`, și ambele clasifică literele prin `classifyFullName` al motorului. Task 1 adaugă testul care blochează asta: pentru numele fixat, valoarea literei în grilă e valoarea din interpretare.

Comentariul din capul lui `LetterMap.tsx` **nu contrazice planul**. El explică ce a fost scos de acolo — o citire Soul Urge/Personality, „hidden numbers", sugestii de optimizare a numelui — pentru că *duplicau* material deja prezent pe aceeași pagină („Two answers to one question, on one page"). Cele trei litere nu duplică nimic: nicio altă componentă nu le arată. Principiul lui e chiar motivul pentru care nu le înghesuim în `LetterMap`.

**Observație, nu acțiune:** `analyzeIndividualLetters` calculează un câmp `meaning` prin `getLetterMeaning()` (`nameAnalysis.ts:487`) pe care `LetterMap` nu îl randează. E cod mort de UI. Nu îl atingem în acest plan.

---

## File Structure

**Create:**
- `src/components/numerology/LetterStones.tsx` — singurul consumator al lui `interpretLetters()`. Randează cele trei litere: glifa + trăsătura, plus `NumberCard` pentru interpretare. Export default, ca să-l poată lua `React.lazy`.
- `src/components/numerology/__tests__/LetterStones.test.tsx` — textul afișat == textul motorului, în cele trei limbi; plus garda de coexistență cu grila din `LetterMap`.

**Modify:**
- `src/components/NumerologyResults.tsx` — un `lazy()` nou, două chei în `sectionLabels`/`teasers`, un `Block` în capitolul 1.
- `src/components/numerology/NewNumbers.tsx:9-14` — o propoziție din comentariu devine falsă când apare al doilea consumator al stratului de conținut; se corectează.

**Neatinse, deliberat:** tot `src/lib/numerology-plus/**` (read-only), `chapterKeys.ts`, `NewNumbers.test.tsx`, `LetterMap.tsx`, `LetterMap.test.tsx`, `nameAnalysis.ts`, `translations.ts`.

---

### Task 1: Componenta `LetterStones` și testele ei

**Files:**
- Create: `src/components/numerology/LetterStones.tsx`
- Test: `src/components/numerology/__tests__/LetterStones.test.tsx`

**Interfaces:**
- Consumes: `interpretLetters(profile, lang)` din `@/lib/numerology-plus/content/interpret` — întoarce un array de cel mult trei elemente de forma `Interpretation & { letter: string; letterTrait: string }`, posibil `null` la nivel de element (`.filter(Boolean)` nu îngustează tipul în TS 5.8, de aceea consumatorul folosește `flatMap`). `fullProfile(name, { day, month, year })` din `@/lib/numerology-plus` — se folosește `.pythagorean`. `NumberCard` din `./NumberCard` — prop obligatoriu `interpretation: Interpretation`, restul opționale.
- Produces: `export default LetterStones` cu props `{ fullName: string; birthDate: Date }` — aceeași formă ca `NewNumbers`, minus `keys`. Task 2 îl importă prin `React.lazy`.

- [ ] **Step 1: Scrie testul care pică**

Creează `src/components/numerology/__tests__/LetterStones.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretLetters } from "@/lib/numerology-plus/content/interpret";
import { analyzeIndividualLetters } from "@/lib/nameAnalysis";
import LetterStones from "../LetterStones";

/**
 * Cele trei litere de poziție, pe ecran.
 *
 * Motorul își demonstrează singur numerele; aici se demonstrează că textul
 * afișat e chiar textul lui, în fiecare limbă -- nu că s-a randat ceva. De
 * aceea fiecare aserțiune compară cu ce întoarce interpretLetters(), nu cu
 * un șir copiat în test: o copie ar putea rămâne în urmă fără să pice nimic.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
type Lang = "ro" | "en" | "ru";

const fromEngine = (lang: Lang) =>
  interpretLetters(
    fullProfile(NAME, { day: 25, month: 8, year: 1990 }).pythagorean,
    lang,
  ).flatMap((s) => (s ? [s] : []));

const renderStones = (lang: Lang) => {
  localStorage.setItem("language", lang);
  return render(
    <LanguageProvider>
      <LetterStones fullName={NAME} birthDate={BIRTH} />
    </LanguageProvider>,
  );
};

afterEach(() => {
  localStorage.clear();
});

describe("LetterStones", () => {
  it("randează un card pentru fiecare literă pe care o citește motorul", () => {
    renderStones("ro");
    // Nicio listă de chei între motor și ecran: câte întoarce, atâtea apar.
    expect(screen.getAllByRole("article")).toHaveLength(fromEngine("ro").length);
    expect(fromEngine("ro")).toHaveLength(3);
  });

  it.each<Lang>(["ro", "en", "ru"])(
    "arată litera, trăsătura ei și întrebarea ramei în %s",
    (lang) => {
      renderStones(lang);
      for (const stone of fromEngine(lang)) {
        expect(screen.getAllByText(stone.letter).length).toBeGreaterThan(0);
        expect(screen.getByText(stone.letterTrait)).toBeInTheDocument();
        expect(screen.getByText(stone.label)).toBeInTheDocument();
        expect(screen.getByText(stone.question)).toBeInTheDocument();
      }
    },
  );

  it.each<Lang>(["ro", "en", "ru"])(
    "arată interpretarea motorului, cuvânt cu cuvânt, în %s",
    (lang) => {
      renderStones(lang);
      for (const button of screen.getAllByRole("button")) fireEvent.click(button);

      for (const stone of fromEngine(lang)) {
        expect(screen.getByText(stone.lead)).toBeInTheDocument();
        expect(screen.getByText(stone.works)).toBeInTheDocument();
        expect(screen.getByText(stone.breaks)).toBeInTheDocument();
      }
    },
  );

  it("nu lasă niciun șablon nerezolvat pe ecran", () => {
    renderStones("ro");
    for (const button of screen.getAllByRole("button")) fireEvent.click(button);

    for (const article of screen.getAllByRole("article")) {
      const text = article.textContent ?? "";
      expect(text).not.toMatch(/\{(essence|strength|shadow|n|title)\}/);
      expect(text).not.toMatch(/undefined/);
    }
  });

  it("nu contrazice grila de litere despre valoarea unei litere", () => {
    // Grila din LetterMap afirmă un inventar, cardurile astea afirmă un
    // înțeles. Amândouă citesc PYTHAGOREAN din core.ts azi; dacă vreuna se
    // rupe de tabelă, aceeași literă ar apărea cu două valori pe o pagină.
    const grid = analyzeIndividualLetters(NAME);
    for (const stone of fromEngine("ro")) {
      const occurrences = grid.filter((l) => l.letter === stone.letter);
      expect(occurrences.length).toBeGreaterThan(0);
      for (const l of occurrences) expect(l.value).toBe(stone.value);
    }
  });
});
```

- [ ] **Step 2: Rulează testul, ca să-l vezi picând**

Run: `npm run test:run -- src/components/numerology/__tests__/LetterStones.test.tsx`
Expected: FAIL — `Failed to resolve import "../LetterStones"`.

- [ ] **Step 3: Scrie componenta minimă**

Creează `src/components/numerology/LetterStones.tsx`:

```tsx
import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fullProfile } from "@/lib/numerology-plus";
import { interpretLetters } from "@/lib/numerology-plus/content/interpret";
import { NumberCard } from "./NumberCard";

/**
 * Cele trei litere de poziție: Piatra de Temelie, Piatra de Vârf, Prima Vocală.
 *
 * Motorul le scrisese în trei limbi și le validase cu testul lui de conținut,
 * dar interpretLetters() nu avea niciun consumator -- textul exista și nu-l
 * vedea nimeni. Sunt servite de o funcție separată de interpretProfile pentru
 * că ies cu două câmpuri în plus, litera și trăsătura ei, iar aici sunt
 * randate: glifa deasupra, interpretarea în același NumberCard ca restul
 * numerelor, ca să nu existe o a doua formă de card care să derive.
 *
 * Nu există listă de chei între motor și ecran, spre deosebire de NewNumbers:
 * ce întoarce interpretLetters se randează. O a patra ramă de litere adăugată
 * în motor apare aici singură.
 */

interface LetterStonesProps {
  fullName: string;
  birthDate: Date;
}

const LetterStones = ({ fullName, birthDate }: LetterStonesProps) => {
  const { language } = useLanguage();

  const stones = useMemo(() => {
    const profile = fullProfile(fullName, {
      day: birthDate.getDate(),
      month: birthDate.getMonth() + 1,
      year: birthDate.getFullYear(),
    });
    // filter(Boolean) nu îngustează tipul, flatMap da.
    return interpretLetters(profile.pythagorean, language).flatMap((s) => (s ? [s] : []));
  }, [fullName, birthDate, language]);

  return (
    <div className="grid gap-3">
      {stones.map((stone) => (
        <div key={stone.key} className="space-y-2">
          <div className="flex items-baseline gap-3">
            {/* Litera poartă .num ca în grila din LetterMap: aceeași glifă
                desenată cu două fonturi pe aceeași pagină ar arăta ca două
                lucruri diferite. */}
            <span className="num text-2xl text-primary">{stone.letter}</span>
            <span className="text-sm text-muted-foreground">{stone.letterTrait}</span>
          </div>
          <NumberCard interpretation={stone} />
        </div>
      ))}
    </div>
  );
};

// Export default, ca React.lazy să-l ia fără wrapper.
export default LetterStones;
```

- [ ] **Step 4: Rulează testul, ca să-l vezi trecând**

Run: `npm run test:run -- src/components/numerology/__tests__/LetterStones.test.tsx`
Expected: PASS — 9 teste (1 + 3 + 3 + 1 + 1).

- [ ] **Step 5: Verifică tipurile și lint-ul**

Run: `npm run typecheck && npm run lint`
Expected: ambele ies cu 0. Dacă `typecheck` se plânge că `stone` nu e atribuibil lui `interpretation`, înseamnă că `flatMap` nu a îngustat — verifică să nu fi scris `filter(Boolean)`.

- [ ] **Step 6: Commit**

```bash
git add src/components/numerology/LetterStones.tsx src/components/numerology/__tests__/LetterStones.test.tsx
git commit -m "Arată cele trei litere de poziție, cu textul motorului"
```

---

### Task 2: Cablarea în capitolul 1

**Files:**
- Modify: `src/components/NumerologyResults.tsx` (import lazy lângă linia 40; `sectionLabels` linia ~161; `teasers` linia ~186; `Block` nou în capitolul 1, între blocul `newNumbers` de la linia 281 și blocul `profile` de la linia 290)
- Modify: `src/components/numerology/NewNumbers.tsx:9-14` (o propoziție din comentariu)

**Interfaces:**
- Consumes: `LetterStones` din Task 1 — export default, props `{ fullName: string; birthDate: Date }`.
- Produces: nimic pentru task-uri ulterioare. Ăsta e ultimul.

- [ ] **Step 1: Adaugă importul lazy**

În `src/components/NumerologyResults.tsx`, imediat sub linia `const NewNumbers = lazy(() => import("@/components/numerology/NewNumbers"));` (linia 40):

```tsx
const LetterStones = lazy(() => import("@/components/numerology/LetterStones"));
```

- [ ] **Step 2: Adaugă eticheta și teaser-ul, în cele trei limbi**

În obiectul `sectionLabels`, după linia `newNumbers: {...}`:

```tsx
    stones: { ro: "Cele trei litere", en: "The three letters", ru: "Три буквы" },
```

În obiectul `teasers`, după linia `newNumbers: {...}`:

```tsx
    stones: { ro: "Cum intri, cum închei, și ce simți înainte de gând.", en: "How you begin, how you finish, and what you feel before thought.", ru: "Как вы начинаете, как завершаете и что вы чувствуете до мысли." },
```

- [ ] **Step 3: Pune blocul în capitolul 1**

În `<Chapter meta={chapters[0]} index={1}>`, între `Block`-ul `newNumbers` (care se închide la linia 285) și `Block`-ul `profile` (comentariul lui începe la linia 287), inserează:

```tsx
          {/* Cele trei litere răspund la „cum intri", „cum închei", „ce simți
              înainte de gând" -- reflexe care nu depind de an, deci capitolul
              ăsta. Nu stau lângă LetterMap, în capitolul 3, doar pentru că și
              acolo e vorba de litere: acela răspunde la ce lipsește din hartă.
              Diagrama capitolului rămâne ultima. */}
          <Block title={sectionLabels.stones[language]} icon={<Type className="h-5 w-5 text-primary" />} note={teasers.stones[language]}>
            <Suspense fallback={chartSkeleton}>
              <LetterStones fullName={fullName} birthDate={birthDate} />
            </Suspense>
          </Block>
```

`Type` e deja în importul de la linia 2 și până acum nu era folosit nicăieri în fișier — nu se adaugă niciun import.

- [ ] **Step 4: Corectează comentariul din `NewNumbers.tsx`**

Comentariul de la liniile 9–14 spune „This module is the only thing that pulls in the engine's content layer". De la Step 3 e fals: `LetterStones` importă și el `content/interpret`. Înlocuiește propoziția:

```tsx
 * This module and LetterStones are the only things that pull in the engine's
 * content layer -- archetypes, frames and arcana together run to well over a
 * thousand lines of copy in three languages. Both are loaded lazily by the
 * results page so the main bundle carries none of it until someone actually
 * asks for a reading.
```

(Restul comentariului rămâne neschimbat. E singura modificare permisă în fișierul ăsta: un comentariu care afirmă ceva neadevărat despre bundle e mai rău decât unul lipsă.)

- [ ] **Step 5: Rulează toată suita, tipurile și lint-ul**

Run: `npm run test:run && npm run typecheck && npm run lint`
Expected: toate verzi. În special `NewNumbers.test.tsx` trebuie să rămână verde — testul de partiție `ALL_CHAPTER_KEYS` vs `interpretProfile` nu a fost atins și nu are voie să pice; dacă pică, cineva a strecurat cheile de litere în `chapterKeys.ts`, ceea ce planul ăsta interzice explicit (Decizia 2).

- [ ] **Step 6: Verifică în aplicație, în cele trei limbi**

```bash
npm run dev
```

Deschide `http://localhost:8082/`, calculează pentru „Victor Ion Safta", 25.08.1990. În capitolul 1 („Cine ești"), sub „Numerele Noi", trebuie să apară blocul „Cele trei litere" cu:

- `V` — Piatra de Temelie — „Cum intri într-o situație nouă"
- `A` — Piatra de Vârf — „Cum închei ce ai început"
- `I` — Prima Vocală — „Prima ta reacție, înainte de gând"

Deschide fiecare card: trebuie să apară cuvintele-cheie plus perechea funcționează/se rupe. Schimbă limba în EN și RU din selectorul de limbă și confirmă că toate trei se traduc — inclusiv trăsătura literei de lângă glifă. Oprește serverul cu Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add src/components/NumerologyResults.tsx src/components/numerology/NewNumbers.tsx
git commit -m "Pune cele trei litere în capitolul despre cine ești"
```

---

## Ce rămâne în afara acestui plan

- `getLetterMeaning()` din `src/lib/nameAnalysis.ts:487` produce un câmp `meaning` pe care nicio componentă nu-l randează. Cod mort de UI, semnalat, neatins.
- `LetterMap` continuă să folosească `analyzeIndividualLetters` pentru grilă și pentru graficul de distribuție. Nu se mută pe motor aici: face altceva (inventar, nu înțeles), iar mutarea lui e o schimbare care nu a fost cerută.
