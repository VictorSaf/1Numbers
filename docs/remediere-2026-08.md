# Directivă de remediere — audit 30 aug 2026

Bază: `feature/numerology-plus` @ `5faad89`. 26 de defecte, grupate în 8 etape.
Etapele sunt **ordonate**: trei dintre ele deblochează sau protejează etapele de după ele.
Nu sări peste ordine.

---

## Reguli, pentru toată durata lucrului

1. **Un commit per etapă.** Mesaj în stilul ultimelor 10 commit-uri din repo: o propoziție
   la imperativ, ce face schimbarea, nu ce fișiere atinge. Fără prefixe `feat:`/`fix:`.
2. **Nicio etapă nu e „gata" cu poarta roșie.** După fiecare etapă rulează, în ordine:
   `npm run lint` → `npx tsc -b --noEmit --force` → `npm run test:run`.
   Dacă una pică, repari înainte să comiți. Nu comita cu teste roșii „ca să nu pierzi lucrul".
3. **Nu te uita niciodată în `dist/` sau `.build-check/`** ca să verifici un build.
   Amândouă sunt vechi și induc în eroare. Verifici cu:
   `npx vite build --outDir /tmp/verify --emptyOutDir` și inspectezi acolo.
4. **Nu „repara" `src/lib/routes.ts:27`.** Excluderea rutelor interne din build-ul public
   a fost verificată empiric și funcționează fără ca `VITE_INCLUDE_INTERNAL` să fie definit.
   Chunk-urile Admin/DesignSystem/WhiteLabel care există în `dist/` sunt dintr-un build vechi.
5. **Nu atinge nimic din ce nu e pe listă.** Dacă găsești altceva pe drum, notează în
   `docs/remediere-2026-08-note.md` și mergi mai departe.
6. **Când o reparație cere o decizie de produs, te oprești și întrebi.** Un singur loc de pe
   lista asta e marcat explicit așa (Etapa 4). Nu decide singur în locul meu.
7. Zero cod mort nou. Dacă o reparație face o funcție inutilă, o ștergi în același commit.

---

## Etapa 0 — fă poarta verde

Nimic de pe lista asta nu se poate verifica până nu merg lint, typecheck și teste.

- `src/lib/notifications.ts:93` — TS2322, `Uint8Array<ArrayBufferLike>` nu se potrivește cu
  `BufferSource` în `pushManager.subscribe`. Tipează corect bufferul; nu pune `as any`.
- Cele 5 erori `@typescript-eslint/no-explicit-any`:
  `numerology-plus/content/check.ts:9`, `content/demo.ts:18`, `content/interpret.ts:67` și `:90`.
  Sunt tipuri reale disponibile în modul — folosește-le, nu `unknown` cu cast.
- **Redenumește `src/lib/numerology-plus/test.ts` în `src/lib/numerology-plus/__tests__/engine.test.ts`.**
  Fișierul are 187 de linii și propriul harness `eq()`; nu se potrivește cu
  `src/**/*.{test,spec}.*` din `vite.config.ts:82`, deci cele 78 de aserțiuni pe care
  `README.md` și `profile.test.ts:7` se bazează **nu au rulat niciodată**.
  Convertește `eq(...)` în `it(...)` + `expect(...)`. **Nu schimba nicio valoare așteptată.**
  Dacă vreo aserțiune pică după conversie, **nu o repara și nu o șterge** — o raportezi
  și te oprești. E prima informație reală despre motor pe care o avem.
- Același tratament pentru `smoke.ts`, `content/check.ts`, `content/demo.ts` — sau le ștergi,
  dacă `engine.test.ts` acoperă ce fac ele. Nu le lăsa ca fișiere dev în `src/`.

**Acceptare:** lint 0 erori · typecheck exit 0 · `npm run test:run` verde, cu strict mai multe
teste decât cele 274 de acum.

---

## Etapa 1 — oprește sângerarea de bani

`POST /api/subscriptions/create`, `/upgrade` și `/purchase` scriu `status = 'active'` fără
niciun pas de plată. `/purchase` acceptă și prețul de la client. `PricingCards.tsx:163`
le apelează la click, deci butonul livrat e exploit-ul.

- Pune cele trei rute în spatele unui flag de mediu, **exact** cu tiparul care deja
  funcționează pentru înregistrare la `server/src/routes/auth.ts:67`. Flag absent = rută
  dezactivată (403 cu mesaj clar), nu 500, nu 404.
- Frontend: `PricingCards.tsx` și `SubscriptionPlans.tsx` tratează 403-ul cu un mesaj vizibil.
  Nu lăsa clickul să pară că a reușit.
- Nu construi integrare de plată acum. Doar închide ușa.

**Acceptare:** cu flagul nesetat, `curl -X POST /api/subscriptions/create` cu token valid
întoarce 403 · UI-ul arată mesaj, nu redirect spre `/premium?success=true`.

---

## Etapa 2 — fă baza de date reproductibilă

Nu există `CREATE TABLE users` nicăieri în repo, deși `users(id)` e țintă de cheie externă în
migrațiile 002, 004, 005, 006, 007, 008, 009. `run-migration.ts:11` are calea hardcodată către
un singur fișier. Schema există doar pe o mașină.

- **Îmi ceri mie output-ul lui `\d users` de pe baza vie** — nu-l inventa, nu-l deduce din cod.
- Din el scrii `001_create_users.sql`, cu aceleași constrângeri, indecși și default-uri
  ca producția. Nicio îmbunătățire strecurată; e o captură, nu un redesign.
- Înlocuiește `run-migration.ts` cu un runner real: parcurge directorul în ordine
  lexicografică, ține evidența în tabelul `schema_migrations`, sare peste ce e deja aplicat,
  rulează fiecare fișier în tranzacție proprie, se oprește la prima eroare.
- `admin.ts:157` scrie `users.status`, coloană pe care nicio migrare n-o creează, iar
  `services/api.ts:390` o apelează. Ori adaugi coloana în `001`, ori scoți câmpul din
  `PATCH /users/:id` și din client. Alege în funcție de ce arată `\d users`.
- Corectează în `CLAUDE.md` instrucțiunea care spune să rulezi `npm run migrate` — acum aplică
  1 din 9.

**Acceptare:** pe o bază goală, `npm run migrate` creează schema completă · a doua rulare e
no-op · `git clone` + migrate + `npm run dev` pornește fără atingeri manuale.

---

## Etapa 3 — serverul nu mai crede clientul

Patru schimbări cu același caracter.

- **Rolul din bază, nu din token.** `middleware/auth.ts:36` compară `req.userRole`, luat din
  claim-ul JWT semnat pe 7 zile. Retrogradarea unui admin n-are efect până expiră tokenul, și
  nu există logout server-side. `requireAdmin` recitește `users.role` după `req.userId` —
  un lookup indexat pe un router cu trafic mic.
- **Plafoane la gamification.** `gamification.ts:184` acceptă `xpReward` de la client cu
  singura verificare `typeof === 'number'`; `:341` acceptă `incrementBy` fără plafon.
  Tiparul corect e deja scris la `:83-101` (tabel de plafoane + respinge tipuri necunoscute) —
  aplică-l și la `award-achievement` și la `challenge-progress`. `achievementId` se validează
  contra unui catalog.
- **Adaugă `zod` în `server/package.json`** (nu e instalat) și validează la marginea routerelor.
  Prioritatea, în ordine:
  1. `ai.ts:163` — `systemPrompt` vine **de la client** și pleacă spre provider ca mesaj system.
     E un proxy nelimitat spre cheia noastră. Scoate-l complet din input-ul clientului;
     promptul de sistem se construiește pe server. Pune și rate limit pe rută.
  2. `notifications.ts:123` — `preferences` intră nevalidat în JSONB, iar funcția de
     dispecerizare din `007` îl citește cu `preferences->>'enabled'`.
  3. `journal.ts:11` — `tags` într-un `TEXT[]` fără tipizare, `content` fără limită.
  4. `subscriptions.ts:453` — `logoUrl`, `primaryColor`, `contactInfo`, `disclaimer` ajung
     randate în rapoarte white-label.
  5. `admin.ts:141` — `role` acceptă orice string; `{"role":"superadmin"}` blochează definitiv
     utilizatorul în afara lui `requireAdmin`. Enum.
  Pune și `express.json({ limit })` explicit în `app.ts:40`.
- **`helmet` pe API + handler de 401 pe client.** API-ul are trei headere puse de mână și
  niciun CSP; serverul static din `scripts/serve-compass.mjs:81` e vizibil mai bine călit —
  ia-l ca referință. Pe client, `services/api.ts:53` aruncă un `Error` generic cu `.status`
  atașat, dar **nimic din cod nu inspectează `401`** — adaugă un interceptor care curăță
  tokenul și redirectează. Acum expirarea în timpul sesiunii lasă UI-ul logat cu toate
  cererile eșuând.

**Acceptare:** test de backend pentru fiecare din cele patru · un admin retrogradat primește
403 la următoarea cerere · `xpReward: 999999` întoarce 400.

---

## Etapa 4 — o singură convenție pentru numerele master

> **DECIZIE DE PRODUS — oprește-te și întreabă-mă înainte să scrii cod în etapa asta.**
>
> `pythagorean.ts:18` reduce segmentele Life Path cu `keepMasters = true` (default-ul lui
> `reduce`); `pinnacles.ts:28` și `karmic.ts:44` reduc cu `false`. `NumerologyResults.tsx`
> le randează pe aceeași pagină, deci **974 din 27.216 date de naștere (3,58%) afișează două
> Life Path-uri diferite** — măsurat, nu estimat. Motorul e inconsecvent și cu el însuși:
> `challenges()` la `:137` pasează explicit `false`.
>
> Întrebarea pentru mine: segmentele (lună, zi, an) păstrează masterii sau nu?
> Convenția occidentală majoritară e **nu** — se reduce fiecare segment la o cifră și masterii
> apar doar în total. Dar e o alegere de produs, nu una tehnică. Nu o lua tu.

După ce primești răspunsul:

1. **Întâi testul.** Un tabel de referință cu cel puțin 20 de date alese să acopere cazurile
   grele: zi 11, zi 22, zi 29, luna 11, an care se reduce la master, și datele din audit
   (1930-05-11, 1930-07-11, 1930-07-22, 1975-02-09). Testul cade acum. E în regulă.
2. Apoi aplică decizia în `lifePath()` `:18`, `pinnacles()` `:123`, `lifeCycles()` `:150`.
3. `pythagorean.ts:126` și `:140` — `const end1 = 36 - lp.value` cere cifra redusă.
   Cu un Life Path 33 toate cele patru pinnacles se termină înainte de 22 de ani.
   Devine `36 - reduce(lp.value, false)`.
4. `core.ts:143-150` — `result()` caută datoria karmică doar în `raw`, care pentru nume e
   suma literelor (40–120), deci nu se declanșează practic niciodată:
   `expression("Ștefan Țîrlea")` dă `raw 49`, iar 49 → 4+9 = **13**, datorie pierdută tăcut.
   Fă `result()` să parcurgă lanțul de reducere și să raporteze ultimul pas de două cifre.
5. Odată corect în motor, `karmic.ts:36-72` devine cod de șters, nu de întreținut —
   `NumerologyResults` și `pinnacles.ts` trec pe motor.
6. `personalCycles.ts` și `predictions.ts` reimplementează ziua personală, anul personal și
   ziua universală. `businessNumerology.ts:418` o face păstrând masterii, iar lookup-ul de la
   `:443` are chei doar 1–9 — deci orice zi universală master ia tăcut scorul „incompatibil".
   O singură sursă pentru fiecare.

**Acceptare:** tabelul de referință verde · un script care compară motorul cu `pinnacles.ts` și
`karmic.ts` pe toate cele 27.216 date raportează **0 divergențe** · `engine.test.ts` din
Etapa 0 încă verde.

---

## Etapa 5 — PWA, în ordinea corectă

**Întâi strategia de update, apoi înregistrarea.** Invers, spargi tab-urile deschise la primul
deploy.

- `public/sw.js:32` face `skipWaiting()` necondiționat la install, `:50` `clients.claim()`,
  iar `:36-49` șterge orice cache cu alt nume. Aplicația e puternic despicată cu `React.lazy`,
  deci un utilizator în sesiune pe build-ul N pierde chunk-urile lui N din cache **și** de pe
  disc; următorul import lazy respinge, iar `ErrorBoundary` e doar la rădăcină, deci albește
  toată aplicația.
  - Scoate `skipWaiting` necondiționat. Handler-ul `SKIP_WAITING` de la `:225` există deja și
    e cod mort — cablează-l.
  - Păstrează cache-ul generației anterioare, șterge-l abia la următorul activate.
  - Adaugă listener `updatefound` / `controllerchange` și un prompt de reîncărcare în UI.
- Error boundary pe rută pentru chunk-urile lazy, cu retry.
- **Abia acum** înregistrează SW-ul în `src/main.tsx`. Singurul `register` din cod e la
  `notifications.ts:73`, ajuns doar prin `useNotifications` → `NotificationSettings.tsx`,
  care n-are niciun importator — deci PWA-ul comis în `5faad89` e inert azi.
- `NotificationSettings.tsx` (335 linii): ori îl cablezi într-o pagină, ori îl ștergi.
- `public/offline.html` e doar în română și hardcodează `#2d1b4e` / `#d4af37` — treci-l pe
  tokenuri și pe cele trei limbi.
- `scripts/serve-compass.mjs:166` întoarce shell-ul de la rădăcină cu **status 200** pentru
  orice cale terminată în `/`, înainte ca `isKnownRoute` să fie consultat la `:200`.
  Deci `/nonsens/` e 200, iar `/guide/` servește meta-ul paginii principale.

**Acceptare:** build curat în `/tmp/verify` · site servit local, DevTools → Application arată
SW activ și aplicația instalabilă · un al doilea build cu conținut schimbat nu sparge tabul
deschis, ci oferă reîncărcare.

---

## Etapa 6 — corectitudine vizibilă utilizatorului

- **Nume chirilice → profil zero.** `core.ts:71` face `.replace(/[^A-Z\s'-]/g, '')`, deci
  `normalizeName("Анна Петрова")` întoarce `" "` și tot profilul iese 0, cu toate cele nouă
  lecții karmice „lipsă". Nicio eroare, iar `archetypeFor(0)` există, deci UI-ul randează o
  interpretare plauzibilă construită pe nimic. Aplicația e RO/EN/RU.
  Ori translitererezi (motorul are deja transliterare în `systems.ts` pentru gematria),
  ori respingi explicit cu mesaj. Nu lăsa varianta tăcută.
  Diacriticele românești sunt OK — verificate, ambele forme Unicode. Nu le atinge.
- **Limba nu se persistă.** `LanguageContext.tsx:16` e `useState("ro")` fără localStorage și
  fără `navigator.language`. `ThemeContext` persistă corect — copiază tiparul de acolo,
  inclusiv citirea în initializer-ul lazy, nu într-un `useEffect` (`ThemeContext:46` are chiar
  bug-ul ăsta, care produce un flash de temă la fiecare încărcare — repară-l în trecere).
  `index.html:2` declară `lang="en"` cu UI default RO.
- **Data nașterii traversează ca timestamp.** Coloana e `DATE`, dar `profiles.ts:30` o
  returnează neformatată, node-postgres o dă ca `Date` la miezul nopții locale serverului,
  iar clientul face `new Date(...)` în șase locuri și citește `.getDate()` local.
  Orice decalaj de fus mută ziua nașterii cu una și schimbă tot profilul.
  Serializeaz-o ca string `YYYY-MM-DD` la ieșirea din API și parseaz-o ca dată calendaristică
  pe client. Hazardul e copiat și în teste — `numerology.test.ts:67` folosește
  `new Date("1990-05-15")` cu gettere locale, deci valorile așteptate sunt corecte doar în
  fusuri UTC+. Repară și testele.
- **Y la început de cuvânt nu e niciodată vocală.** `core.ts:100-104`: `prevIsConsonant` e fals
  când `prev === undefined`, iar `nextIsVowel` pune veto pe Y dinaintea unei vocale — deci
  *Yvonne*, *Yves* și *Bryan* ies cu Y consoană. `coherence.test.ts:30` folosește chiar
  „Lynn Bryant" dar afirmă doar acordul intern, deci comportamentul e nefixat în ambele sensuri.
  Decide regula, **scrie-o într-un test explicit**, apoi implementeaz-o.
- **Meta-ul `/tools` minte.** `routes.json:87-97` descrie în trei limbi analiză de „nume,
  telefon, adresă, număr de înmatriculare"; `Tools.tsx:325-351` are calendar, loshu,
  name-change, business, forecast, optimizer, matrix. Descrierea e deja emisă în `sitemap.xml`
  și în HTML-ul prerandat. Scrie ce face pagina.

**Acceptare:** un nume chirilic produce fie profil corect, fie eroare explicită — niciodată 0 ·
schimbarea limbii supraviețuiește reload-ului · un test care rulează cu `TZ=Pacific/Auckland`
și cu `TZ=UTC` dă aceleași numere.

---

## Etapa 7 — curățenie

Nimic urgent. Fiecare punct face următoarea sesiune de lucru mai ieftină.

- **~5.000 de linii de cod mort.** Module lib fără niciun importator: `phoneAnalysis` (472),
  `businessNumerology` (708), `dateAnalysis` (584), `vehicleAnalysis` (418),
  `locationAnalysis` (380), `guides` (262), `advancedReports` (347).
  Componente fără importator: `PDFExportButton` (287), `OnboardingWizard` (385),
  `DailyEnergyCard`, `ProgressLevel`, `SubscriptionPlans`, `QuizComponent`, `StreakCounter`,
  `AchievementBadge`, `UpgradePrompt`, `SystemSelector`, `NavLink`,
  `charts/CompatibilityChart`, `charts/PersonalYearCycleChart`.
  `PDFExportButton` e singurul consumator public al lui `pdfExport.ts` (752 linii).
  **Verifică fiecare cu grep înainte să ștergi**, inclusiv importuri dinamice prin string.
  Telefon/adresă/plăcuță există de două ori — aici și în `applied.ts` din motor — și ambele
  copii sunt inaccesibile. Decide care rămâne.
  Actualizează `CLAUDE.md`, care încă listează patru din modulele astea ca vii.
- **Tabele de litere supraviețuitoare**: `locationAnalysis.ts:4` și `vehicleAnalysis.ts:26`
  dispar odată cu modulele. A treia, `numerology-plus/content/letters.ts:18-93`, e identică
  azi cu `core.ts:30` dar întreținută de mână și nepăzită de niciun test — ori o derivi din
  `core`, ori scrii testul care le compară.
- **Cele cinci grafice hardcodează culori** — `fill: 'hsl(45 30% 95%)'` în
  `PersonalYearCycleChart:38,52`, `NumberDistributionChart:45`, `CompatibilityChart:69`,
  `LetterAnalysisChart:88`, `NumerologyRadarChart:62`. Anulează migrarea pe tokenuri din
  `9f8f30b`; graficele rămân colorate pentru temă întunecată sub `dawn` și `high-contrast`.
- **RO are 23 de chei lipsă** în `translations.ts` — secțiunile `export.*` (13) și `sharing.*`
  (10) există în EN și RU. Nefolosite azi, deci moarte în direcția greșită.
  Adaugă și un test care compară seturile de chei între cele trei limbi.
  Separat, `NumerologyResults.tsx:110` construiește titlul de share hardcodat în engleză.
- **`admin.ts:10`** — `path.resolve(__dirname, '../../../..')` aterizează în *părintele*
  repo-ului, pe ambele căi (ts-node și compilat). Un nivel mai puțin.
  Iar `:444` returnează `.mcp.json` integral, cu tot cu blocurile `env` care poartă tokenuri —
  filtrează sau scoate ruta. Apelurile `isPathSafe(dir, PROJECT_ROOT)` compară o cale cu
  rădăcina din care tocmai a fost construită; sunt mereu adevărate, deci decorative.
  (Nu e traversare de cale: numele de fișiere vin din `readdir`.)
- **Documentația fictivă.** `BACKEND_SETUP.md`, `DEPLOYMENT_GUIDE.md` (33KB) și setul
  `PHASE_*.md` descriu un backend FastAPI/Docker/K8s care n-a rulat niciodată — comentariul
  din `ci.yml` o spune direct. Sunt activ dăunătoare pentru orice agent care citește repo-ul.
  Șterge-le sau mută-le în `docs/istoric/` cu un antet care spune ce sunt.
  Singura descriere corectă a producției e un comentariu în `ci.yml` și antetul lui
  `serve-compass.mjs` — scrie un `DEPLOY.md` real din ele.
- **Nu există `ecosystem.config.js`** nicăieri, deși pm2 e referit în `ci.yml` și în comentarii.
  Topologia proceselor există doar în memoria hostului. Comite-o.

**Acceptare:** `npm run test:run` verde · build curat în `/tmp/verify` fără warning-uri noi ·
niciun fișier din repo nu mai descrie un sistem care nu există.

---

## Ce NU e o problemă — verificat, nu presupus

Nu pierde timp și nu „repara" astea:

- **Excluderea rutelor interne din build funcționează.** Build curat într-un director gol:
  zero chunk-uri Admin / DesignSystemShowcase / WhiteLabelSettings, zero „MCP Servers".
- **Zero SQL injection.** Toate apelurile `query()` din cele ~4.400 de linii folosesc
  placeholdere `$n`. Cele trei locuri cu SQL dinamic concatenează doar fragmente hardcodate.
- **Zero IDOR.** Fiecare rând adresat prin `:id` e filtrat pe `user_id`.
- **Gestiunea secretelor e cea mai solidă zonă din cod.** Fără fallback pentru `JWT_SECRET`;
  `.gitignore` corect; niciun fișier de mediu în istoric.
- **Consolidarea motorului chiar s-a întâmplat.** `numerology.ts`, `karmic.ts`, `chaldean.ts`,
  `nameAnalysis.ts` cheamă motorul, iar `coherence.test.ts` păzește asta.

---

## Note de mediu

- `git status` și `git diff` pot raporta un index vechi (nu se poate scrie `.git/index.lock`
  din unele shell-uri). Folosește `git diff HEAD` sau `git --no-optional-locks`.
- Dacă rulezi testele dintr-un shell Linux peste `node_modules` instalat pe macOS, îți trebuie
  binarele native: `npm i --no-save --no-package-lock @rollup/rollup-linux-arm64-gnu @swc/core-linux-arm64-gnu`.
  Nu atinge lockfile-ul.
