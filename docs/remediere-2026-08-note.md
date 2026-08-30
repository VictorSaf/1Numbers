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

## Etapa 2

- **Migrațiile nu sunt reluabile — de-asta runner-ul are `--baseline`.**
  Directiva cere doar „sare peste ce e deja aplicat", ceea ce presupune
  `schema_migrations`. Baza vie n-avea tabelul, dar avea toate cele 23 de
  tabele, deci prima rulare ar fi încercat să le recreeze. Verificat empiric:
  pe o bază care are deja schema, `npm run migrate` aplică 000–003 (sunt
  idempotente) și pică pe 004, la `CREATE TRIGGER update_journal_entries_updated_at
  ... already exists`. `CREATE TRIGGER` n-are `IF NOT EXISTS` în 004, 006 și 007,
  iar 005 și 009 fac seed în `subscription_plans` fără `ON CONFLICT`.
  `--baseline` e minimul care nu strică baza existentă. N-am atins 002–009 ca să
  le fac idempotente — ar fi fost rescriere de istoric, în afara listei.

- **FK-ul circular s-a rezolvat singur.** `005:60` adaugă deja
  `users.current_subscription_id` cu `REFERENCES subscriptions(id)`, deci `001`
  creează `users` fără coloana aia și ordinea numerotării face restul. Numele
  constrângerilor generate de Postgres (`users_pkey`, `users_email_key`,
  `users_role_check`, `users_current_subscription_id_fkey`) coincid cu cele din
  producție fără să fie scrise de mână.

- **`users` n-are trigger pe `updated_at`.** Coloana are `DEFAULT now()` și nu
  se mai atinge niciodată. 004, 006 și 007 leagă `update_updated_at_column()` de
  tabelele lor; `users` n-a primit unul. Nu i-am pus — ar fi fost schimbare de
  comportament strecurată într-o captură.

- **`updateAdminUser` n-are niciun apelant** în `src/`. Am scos `status` din
  semnătură oricum, cum cere directiva, dar ruta `PATCH /admin/users/:id` e
  cablată doar dinspre server. Candidat pentru Etapa 7.

- **Captura schemei a venit prin WhatsApp, dintr-o sesiune CC de pe mașina cu
  baza.** Nu e în repo. Dacă o vrei ca dovadă, `docs/` e locul.

## Etapa 3

- **Promptul de sistem a fost mutat, nu rescris.** Cele 64 de linii din
  `src/lib/aiPrompts.ts` (`SYSTEM_PROMPTS`, RO/EN/RU) au trecut în
  `server/src/lib/aiPrompts.ts`. Textul e identic; ce s-a schimbat e cine îl
  deține. `buildAIPrompt()` întoarce acum doar `userPrompt`.

- **Proxy-ul AI nu era viu.** `AI_PROVIDER` e `'mock'` implicit și nicio cheie
  nu e setată în `server/.env`, deci exploit-ul era latent, nu activ. S-a închis
  oricum — ordinea de priorități din directivă rămâne corectă, ruta ar fi devenit
  periculoasă în clipa în care s-ar fi pus o cheie.

- **`ai.ts:138` cere `claude-3-haiku-20240307`**, un model vechi. Neatins — nu e
  pe listă și nu e problemă de securitate.

- **`AIConsultant.tsx` trimite istoricul de două ori**: `buildAIPrompt()` îl
  împachetează deja în `userPrompt`, iar componenta îl trimite și separat ca
  `conversationHistory`. De-asta plafonul pe `userPrompt` e 8000, nu 2000.
  Duplicarea e neatinsă — e risipă, nu defect.

- **`companyName` a devenit obligatoriu** la `PUT /white-label`. Înainte putea
  lipsi și se scria `NULL`. E o alegere de validare, nu una cerută explicit de
  directivă; dacă vrei configurări fără nume, se scoate `.min(1)`.

- **`admin.ts` construia lista de coloane dinamic** pentru două câmpuri. După ce
  `status` a dispărut (Etapa 2) și `role` a devenit enum obligatoriu, ramura
  „No updates provided" nu mai putea fi atinsă. Ștearsă, cu `UPDATE` direct.

- **`ipRateLimit` exista deja în repo** (`middleware/ipRateLimit.ts`, folosit de
  login și register). Nu a fost nevoie de `express-rate-limit`. `/ai/consult`
  primește 30 de cereri pe oră pe IP, peste rate limit-ul pe abonament care
  există separat în `middleware/rateLimit.ts`.

## Etapa 4

- **Life Path 33 a devenit imposibil.** Consecință directă a convenției alese:
  segmentele reduse dau maximum 9+9+9=27, deci masterii rămași sunt doar 11 și
  22. Pe 1900–2100 distribuția e 1:8155 · 2:2693 · 3:8156 · 4:6772 · 5:8159 ·
  6:8160 · 7:8158 · 8:8159 · 9:8156 · 11:5460 · 22:1386 · **33:0**.
  Conținutul pentru arhetipul 33 rămâne accesibil prin Destiny, Soul Urge și
  celelalte poziții — doar Drumul Vieții nu-l mai poate produce.
  Scris explicit ca test în `lifepath-table.test.ts`.

- **„Ultimul pas de două cifre" pierdea 19.** Directiva cere ca `result()` să
  raporteze ultimul pas de două cifre din lanț. Aplicat literal, `19 → 10 → 1`
  raportează 10, deci datoria 19 dispărea — exact opusul scopului. Regula
  implementată e „datoria găsită oriunde în lanț". Nu pot fi două: niciuna dintre
  13, 14, 16, 19 nu are suma cifrelor tot o datorie.

- **`predictions.ts` și `personalCycles.ts` erau de acord din întâmplare.**
  Prima face o sumă plată, a doua reduce în trepte; ies la fel doar pentru că
  rădăcina digitală e asociativă. Coincidență, nu construcție — de-asta au fost
  unificate chiar dacă nu diferă azi.

- **Bonusul de zi master din `businessNumerology.ts` era cod mort.** După ce ziua
  universală vine din motor (redusă, 1–9), `if ([11,22,33].includes(universalDay))
  compatibility += 15` nu se mai poate atinge. Șters.

- **`NumerologyResults.tsx` n-a fost modificat.** Trece pe motor tranzitiv:
  `pinnacles.ts` și `karmic.ts` delegă acum, iar componenta le importă pe ele.
  Zero divergențe pe toate cele 36.525 de date verificate.

- **Sweep-ul acoperă 36.525 de date** (1930–2029), nu 27.216 din audit. Superset,
  ales ca să prindă și anii care se reduc la master după 2004.
