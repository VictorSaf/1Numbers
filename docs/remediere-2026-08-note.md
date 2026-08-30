# Note de pe drum — remediere aug. 2026

Lucruri găsite în afara listei. Nimic din ce e aici n-a fost reparat; e doar consemnat.

## Etapa 0

- **`node_modules` nu avea binarele native pentru darwin-arm64.**
  `@rollup/rollup-darwin-arm64` și `@swc/core-darwin-arm64` existau ca directoare
  goale, deci `npm run test:run` cădea la pornire, înainte de orice test. Rezolvat
  local cu `npm i --no-save --no-package-lock @rollup/rollup-darwin-arm64@4.63.1
  @swc/core-darwin-arm64@1.16.1` — lockfile-ul și `package.json` neatinse.
  E oglinda notei de mediu din directivă, care descrie cazul invers (Linux peste
  `node_modules` de macOS). Un `npm ci` curat probabil îl rezolvă definitiv.

- **A cincea eroare de lint nu era `no-explicit-any`.** Directiva listează cinci;
  în realitate sunt patru `@typescript-eslint/no-explicit-any` (`content/check.ts:9`,
  `content/demo.ts:18`, `content/interpret.ts:67` și `:90`) plus un `prefer-const`
  în `server/src/routes/admin.ts:185`. Reparate amândouă felurile.

- **O aserțiune tautologică în cele 78.** Fostul `test.ts:107` compara
  `S.naamank('Victor').compound` cu el însuși — trece întotdeauna, indiferent ce
  face `naamank`. Convertită verbatim în `engine.test.ts`, pentru că directiva
  cere să nu se schimbe nicio valoare așteptată. Numărul real de aserțiuni cu
  conținut e 77, nu 78. Merită înlocuită cu o valoare de referință când se ajunge
  la Vedic.

- **`check.ts` și `demo.ts` erau deja acoperite.** `__tests__/content.test.ts`
  verifică exact ce verifica `check.ts` (22 de arcane, indexate, 3 limbi × 5 câmpuri,
  9 rame de poziție) plus matricea completă rame × arhetipuri × limbi din `demo.ts`,
  iar `__tests__/interpret.test.ts` acoperă `interpretProfile`/`interpretLetters`.
  `smoke.ts` n-avea nicio aserțiune — doar `console.log` peste `fullProfile`, formă
  păzită azi de `profile.test.ts` și valori păzite de `engine.test.ts`.
  Deci: șterse, nu convertite.

## Etapa 1

- **`server/node_modules` nu exista.** Suita de teste de backend (supertest,
  vitest, jsonwebtoken) era nerulabilă, deci `auth.middleware.test.ts` și
  `health.test.ts` n-au rulat nici ele. Rezolvat cu `npm ci` în `server/`.
  Ambele fișiere trec — nu erau stricate, doar neinstalate.

- **`PricingCards.tsx:404` — `handlePurchase` e un buton fals.** Nu apelează
  `/api/subscriptions/purchase`: face `console.log`, așteaptă o secundă și se
  oprește. Deci cumpărăturile one-time nu sângerau bani, dar butonul se învârte
  și apoi nu spune nimic. Neatins — e pe aceeași temă, dar cere o decizie de
  produs (se ascunde secțiunea? se marchează „în curând"?), iar Etapa 1 cere doar
  închiderea celor trei rute.

- **`ALLOW_BILLING` e documentat doar în `server/.env`**, care e în `.gitignore`,
  deci nu ajunge în repo. Nu există `.env.example` în `server/` — aceeași lipsă
  o are și `ALLOW_REGISTRATION`. Merită unul, dar e curățenie de Etapa 7.
