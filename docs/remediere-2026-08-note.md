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

## Etapa 5

- **`offline.html` avea nevoie de un fișier, nu de un script inline.** CSP-ul din
  `serve-compass.mjs` e `script-src 'self'` fără `unsafe-inline`, iar comentariul
  de deasupra lui spune explicit că build-ul nu emite script inline. Un `<script>`
  inline plus `onclick=` ar fi fost blocate exact în momentul în care pagina e
  singura care se vede. Copy-ul a ieșit în `public/offline.js`, precache-uit
  alături de `offline.html`.

- **Tokenurile sunt copiate în `offline.html`, nu importate.** Pagina e servită
  când nimic altceva n-a putut fi adus, deci nu poate ajunge la un stylesheet cu
  hash. Valorile sunt aceleași cu cele din `src/index.css`, light și dark. Dacă
  paleta se schimbă, se schimbă în două locuri — dezavantaj acceptat, alternativa
  e o pagină offline care nu se poate stiliza deloc.

- **Limba pentru `offline.html` citește `localStorage.getItem('language')`.**
  Cheia nu e scrisă de nimeni încă — persistarea limbii e Etapa 6. Până atunci
  cade pe `navigator.language`. Etapa 6 trebuie să folosească exact cheia asta.

- **`NotificationSettings` a fost cablat, nu șters.** Intră în `/profile`, sub
  comparația de profiluri. Motivul: ruta `PUT /notifications/preferences` există
  și a fost întărită în Etapa 3; ștergerea componentei ar fi lăsat ruta orfană.
  Nu am verificat vizual randarea — vezi mai jos.

- **`notifications.ts` nu mai înregistrează SW-ul.** `registerServiceWorker` a
  devenit `getServiceWorkerRegistration`, care așteaptă `navigator.serviceWorker.ready`
  în loc să facă un al doilea `register()` pe același scope. Înregistrarea e
  acum într-un singur loc, `src/lib/serviceWorker.ts`, apelat la pornire.

- **Verificarea în browser n-a putut fi făcută.** Extensia Chrome nu e conectată
  („Browser extension is not connected"). Logica de update e verificată în schimb
  rulând `public/sw.js` cu un `CacheStorage` fals, pe trei generații —
  `src/lib/__tests__/sw-update.test.ts`. Rămâne de confirmat manual: DevTools →
  Application arată SW activ, aplicația instalabilă, promptul de reîncărcare
  apare la al doilea deploy.

## Etapa 6

- **`strictNullChecks: false` în `tsconfig.json`, `strict: false` în
  `tsconfig.app.json`.** Deci `parseCalendarDate` care întoarce `Date | null` se
  poate pasa într-un prop tipat `Date` fără ca `tsc` să spună nimic. Verificat
  explicit: `BentoDashboard.birthDate: Date` primește `Date | null` și
  compilarea trece. Typecheck-ul din poartă nu prinde clasa asta de bug-uri
  nicăieri în proiect. Neatins — activarea ar fi un refactor separat, dar merită
  știut că poarta verde nu înseamnă „fără null-uri".

- **Transliterare, nu tabel chirilic.** Am ales romanizarea (Ш → SH) fiindcă asta
  ofereau alternativele din directivă. Metoda autentică pentru RU ar fi un tabel
  pitagoreic pe alfabetul chirilic de 33 de litere — numere diferite, sistem
  diferit. E o decizie de produs pe care n-am luat-o singur; dacă o vrei, e o
  etapă separată.

- **Regula pentru Y, decisă:** Y e consoană doar când deschide o silabă, adică
  e urmat direct de o vocală tare. În rest e vocală. O singură condiție, care
  păstrează verzi toate cele trei aserțiuni existente (MARY, BRYN, YOLANDA) și
  repară Yvonne/Yves. `hasHardVowel` și `prevIsConsonant` au dispărut — cazul
  BRYN e acoperit de regula generală.

- **`types.setTypeParser(DATE)` în `db.ts`, nu formatare per rută.** Un singur
  loc acoperă toate rutele care întorc o coloană `DATE`, nu doar
  `profiles.ts:30`. `journal_entries.date` beneficiază la fel.

- **`index.html` declara `lang="en"`** cu UI implicit RO. Trecut pe `ro`, iar
  `LanguageContext` sincronizează `document.documentElement.lang` la fiecare
  schimbare.

- **`ThemeContext` avea flash-ul reparat în trecere**, cum cerea directiva:
  citirea din `localStorage` s-a mutat din `useEffect` în initializer-ul lazy,
  cu try/catch pentru modurile private.

## Etapa 7

- **`isPathSafe` n-a fost șters în întregime.** Directiva spune că apelurile sunt
  decorative — și sunt, dar doar patru din șapte. Cele care compară o cale cu
  `PROJECT_ROOT` din care tocmai a fost construită au dispărut; cele trei care
  verifică un nume de fișier venit din `readdir` contra directorului din care a
  fost citit rămân, fiindcă alea chiar întreabă ceva.

- **`SubscriptionPlans.tsx` a fost șters, deși l-am reparat în Etapa 1.**
  Directiva cere ambele lucruri, în ordinea asta. Munca de la Etapa 1 (mesaj la
  403, tabelul de traduceri urcat deasupra handlerelor) a fost reală, dar
  componenta n-avea importator. `PricingCards` rămâne și e cea folosită.

- **Numele proceselor pm2 din `ecosystem.config.cjs` sunt alegerea mea**
  (`compass-web`, `compass-api`). Le-am dedus din `ci.yml` și din antetul lui
  `serve-compass.mjs`. Dacă pm2-ul de pe mașina vie folosește alte nume,
  `pm2 restart` din `DEPLOY.md` nu va găsi nimic — verifică cu `pm2 list` și
  spune-mi ca să le aliniez.

- **`.cjs`, nu `.js`**, fiindcă `package.json` din rădăcină e `"type": "module"`
  iar pm2 citește fișierul cu `require()`.

- **Graficele: culoarea codifică seria, nu categoria.** Cele nouă culori per
  număr dublau ce spune deja axa X. `NumberDistributionChart` are acum o singură
  culoare, `LetterAnalysisChart` trei (total / vocale / consoane), toate din
  `--chart-*`. Paleta definește șase culori în fiecare temă; un grafic care cere
  mai mult de șase categorii îți spune că acelea aparțin unei axe.

- **`withoutSecrets` a ieșit din `admin.ts` în `server/src/lib/mcpConfig.ts`.**
  Testul care o verifică importa altfel ruta întreagă, care deschide un pool
  real — și asta făcea să pice, prin interferență, un test din `hardening.test.ts`
  care trecea singur.

- **Testul de paritate a cheilor de traducere a găsit exact 23**, cum spunea
  auditul: 13 în `export.*` și 10 în `sharing.*`, toate lipsă din RO.

## Plan de implementare — Etapa 1

- **Capitolul 2 n-are diagramă.** Planul cere „exact o diagramă" per capitol, dar
  punțile, echilibrul, gândirea rațională și sinele subconștient n-au niciuna
  azi, iar regula 4 interzice calcule noi. Celelalte patru au câte una: radar (1),
  distribuția cifrelor (3), biorritmuri (4), octagrama (5). Diagrama pentru
  capitolul 2 aparține Etapei 4, care introduce chiar tokenurile `tensiune` și
  `armonie` „pentru relațiile dintre numere (punți largi…)".

- **„Piatra de Temelie" nu e încă în capitolul 1.** Tabelul planului o listează
  acolo, dar `interpretLetters` n-are apelant, iar cablarea lui e explicit
  Etapa 6. Capitolul 1 are acum Drum, Destin, Suflet, Personalitate, Atitudine
  și Maturitate.

- **`NameAnalysisCard` a fost desfăcut, nu mutat.** Nu apărea în niciun capitol
  din tabel, iar la citire a ieșit că trei din cele cinci părți ale lui erau
  răspunsuri secunde la întrebări la care pagina răspunde deja:
  `analyzeVowelsSeparately` și `analyzeConsonantsSeparately` reinterpretau
  Sufletul și Personalitatea, pe care capitolul 1 le dă din motor;
  `findHiddenNumbers` număra a doua oară Pasiunea Ascunsă, pe care capitolul 3 o
  ia din motor; iar `getNameOptimizationSuggestions` împacheta
  `generateNameSuggestions`, pe care `/unelte` îl cheamă direct din tabul
  „optimizator".

  Ce a rămas e `numerology/LetterMap.tsx`: graficul de litere plus grila de
  litere, pliată. Graficul ăla **e** distribuția cifrelor, cu împărțirea pe
  vocale și consoane în plus — strict mai multă informație din aceleași
  numărători (`analyzeIndividualLetters` și `inclusionTable` pornesc amândouă din
  `classifyFullName`, iar un test o verifică). Deci
  `NumberDistributionChart` a dispărut, nu s-a mutat: arăta un subset.

  Șterse în consecință: `NameAnalysisCard` (292 linii), `NumberDistributionChart`
  și testul lui, patru funcții din `nameAnalysis.ts` cu tipurile lor (~450 linii)
  și cele patru blocuri de test aferente, plus 13 chei de traducere × 3 limbi
  rămase fără cititor. `getLetterMeaning` a fost păstrat — e singurul lucru din
  blocul șters pe care grila de litere încă îl folosește.

  Dacă raportul plătit din Etapa 7 vrea forma lungă a optimizatorului, e la
  `git show 12a48ea~1:src/lib/nameAnalysis.ts`.

- **Capitolul 3 are acum o singură diagramă**, ca celelalte trei care au una.
  Rezultat lateral: `@radix-ui/react-tabs` s-a desprins într-un chunk de 1,1 KB
  partajat de trei pagini, fiindcă nu mai e tras în bundle-ul rezultatului.
  Total assets 2860 KB → 2852 KB, `index.js` 380 KB → 376 KB.

- **`ResultSection.tsx` a fost șters, nu convertit.** Planul spune că „își schimbă
  rolul"; rolul nou e altul destul cât un fișier numit `ResultSection` care
  exportă un antet de capitol ar minți. A devenit
  `numerology/Chapter.tsx`, cu `Chapter` și `Block`.

- **„Calculează din nou" a urcat, nu a dispărut.** Planul cere ca pagina să se
  *termine* cu „Salvează harta asta". Ștergerea butonului cu totul ar fi lăsat
  cititorul fără nicio ieșire din rezultat, fiindcă `handleNewCalculation` din
  `Index.tsx` n-are apelant. A trecut lângă Export și Share, ca acțiune secundară.

- **`Index.tsx:89` — `handleNewCalculation` e cod mort**, fără apelant. N-a
  devenit mort din schimbarea asta, deci l-am lăsat; Etapa 2 rescrie navigația
  din `Index` și e locul unde se decide.

- **`WhenVisible` chiar amână Recharts.** `vendor-charts` are 412 KB și nu e
  preîncărcat în `index.html`; se aducea doar pentru că graficele se montau
  necondiționat, iar `React.lazy` pornește importul la randare. Patru locuri sunt
  acum în spatele porții, inclusiv `NameAnalysisCard`, care își importă lazy
  propriul grafic și altfel ar fi anulat tot câștigul.

- **Build:** zero chunk-uri noi. `index.js` 380 KB → 388 KB, cele patru
  componente noi de structură.

## Plan de implementare — Etapa 2

- **`/raport` e `public`, nu `app`.** Planul îl pune în meniul de cont, dar e
  pagina de cumpărare — trebuie indexabilă. E linkată din meniul de cont și
  rămâne în sitemap. Astăzi randează `Premium`; Etapa 7 o transformă.

- **`/chaldean` n-a fost absorbit.** Planul zice că intră în capitolul 5, dar
  asta e munca Etapei 6 (sistemele paralele din motor). Ștergerea rutei acum ar
  fi scos o funcție care merge, fără nimic în loc. A primit în schimb prima ei
  intrare: un bloc în capitolul 5, exact acolo unde Etapa 6 îl va înlocui cu
  randarea inline. Era singura rută din aplicație la care nu ducea niciun link.

- **Redirecturile poartă și secțiunea.** `/faq` → `/invata?s=intrebari`, nu
  `/invata`. Un 301 care aterizează pe alt tab pierde exact motivul pentru care
  cineva a dat click. La fel `/angel-numbers` → `/unelte?s=angel`. Ambele pagini
  citesc tabul din query string, deci un link către o unealtă rămâne un link
  către acea unealtă.

- **`useInviteLink` a devenit `redeemInviteLink`.** Numele cu prefix `use` făcea
  `react-hooks/rules-of-hooks` să-l trateze ca hook și să refuze apelul dintr-un
  callback — singurul loc din care o acțiune se apelează vreodată. Funcția era
  scrisă, exportată și niciodată chemată de nimeni.

- **`api.ts` e exclus din testul de navigație.** Căile de acolo se adresează
  API-ului Express: `/friends` e endpoint, n-are legătură cu ruta care purta
  numele ăsta. Prima variantă a rescrierii automate chiar l-a stricat.

- **Cele patru pagini de învățat au ieșit din `src/pages/`** în
  `src/components/learn/`. Nu mai sunt destinații, sunt panouri de tab; un fișier
  în `pages/` care nu e rută minte despre ce e.

- **`/courses` a fost șters** — 92 de linii, fără importator și fără link.
  `AngelNumbers` a fost mutat, nu șters: e tab în `/unelte`.

- **`QuickActions` avea `grid-cols-4` fix**, fără prefix responsive, pentru opt
  acțiuni. Acum `grid-cols-2 sm:grid-cols-4`.

- **Taburile din `/unelte`** erau opt (cu Numere Înger) în `grid-cols-4
  sm:grid-cols-7` cu etichete `hidden sm:inline` — sub 640px, opt butoane
  doar-iconiță pe trei rânduri. Acum derulează lateral și își păstrează numele.

- **Build:** `Learn.js` 4,4 KB și `tabs.js` 1,1 KB apar; `Courses.js`,
  `NumberDistributionChart.js` și `use.js` dispar. Total neschimbat, un chunk
  mai puțin.

## Plan de implementare — Etapa 3

- **Separatorul după număr e două puncte, nu linie de pauză.** Forma din plan e
  „Drumul tău spune **7** — retragere, analiză", dar mai multe esențe de arhetip
  poartă ele însele o linie de pauză, iar rezultatul era „spune 7 — energia
  întrebării — nu accepți un răspuns" — o propoziție cu o cratimă în plus.
  Restul formei e neschimbat.

- **Puntea 0 numește numărul pe care cele două părți sunt de acord.** Prima
  variantă spunea doar „spun același număr", ceea ce citea ca un răspuns lipsă
  acolo unde e chiar un răspuns. Acum: „Sufletul tău și Personalitatea ta spun
  amândouă 5: energia mișcării — stagnarea te costă mai mult decât riscul."

- **Puntea Suflet–Expresie nu e folosită.** `bridges()` întoarce trei, dar
  `interpretProfile` are rame doar pentru două, iar planul cere două. A treia
  rămâne calculată și neafișată — n-am inventat o ramă pentru ea.

- **Cele cinci chei generice au fost șterse din traduceri**, nu doar din card:
  `lifePathDesc`, `destinyDesc`, `soulUrgeDesc`, `personalityDesc`,
  `personalYearDesc`, câte trei limbi. Nimic altceva nu le citea. Testul de
  paritate a cheilor trece în continuare.

- **Build:** stratul de conținut s-a desprins într-un chunk de 39,9 KB partajat
  de `NewNumbers` și `Contradictions`. Nu e preîncărcat în `index.html`, deci
  ajunge tot lazy — dar acum o singură dată pentru amândouă, în loc de duplicat.
  Total 2860 KB → 2868 KB; `Contradictions.js` are 3,2 KB.

## Plan de implementare — Etapa 4

- **Cinzel nu erau opt fișiere, erau două.** `cinzel-400-latin.woff2` până la
  `cinzel-700-latin.woff2` sunt **byte-identice** (md5 `7a5ca920…`) — același font
  variabil, redenumit de patru ori și declarat ca patru greutăți statice. La fel
  cele patru `latin-ext`. Deci comparația onestă nu e 176 KB → 204 KB, ci: un
  cititor român aducea 40 KB de Cinzel distinct (latin + latin-ext) și aduce acum
  156 KB de Literata. **+116 KB reali**, în schimbul chirilicului, pe care Cinzel
  nu-l avea deloc — fiecare titlu rusesc cădea pe un serif de sistem.

- **Cele trei teme întunecate erau una singură.** `twilight`, `midnight` și
  `celestial` sunt identice pe toate cele 37 de tokenuri și diferă doar prin
  `--accent` și `--accent-ink`. Mai mult: `.theme-twilight` era o copie verbatim
  a lui `:root[data-theme="dark"]`, iar `.theme-dawn` a blocului luminos. Patru
  nume pentru două palete și un buton de nuanță. Șterse toate patru; perechea
  luminos/întunecat exista deja sub `[data-theme]`.

  Fiecare bloc declara `--accent` și `--accent-ink` **de două ori** — prima
  declarație moartă, suprascrisă 25 de linii mai jos în același bloc.

- **Panoul de admin descria temele pe dinafară.** `celestial` era „Light ethereal
  theme" cu eșantion `#f5f5f5` — în CSS e întunecată; `dawn` era „Warm sunrise"
  cu eșantion `#1f1a24` — e singura luminoasă. Ambele etichete erau inversate.

- **Am ales ștergerea la 4d.** Motivele: selectorul de temă din `Settings` e deja
  în antet, deci nu se pierde nimic real; `--font-size-multiplier` n-avea **zero**
  cititori, iar a-l face real înseamnă `calc()` peste toată scara tipografică
  pentru un control pe care browserul îl oferă deja prin zoom; iar
  `.high-contrast` suprascria patru tokenuri, dintre care unul
  (`--foreground-muted`) **n-are niciun consumator**, și rata `--muted-foreground`,
  care are **366**. Un contrast ridicat pe bune e un proiect de design system, nu
  un petic de tokenuri — iar unul pe jumătate care *arată* ca accesibilitate e mai
  rău decât niciunul.

  Ce s-a dus odată cu ecranul: `customTheme`, `setCustomTheme`,
  `saveThemePreference`, `applyCustomTheme` și ramura `'custom'` — toate deja
  fără apelant înainte de etapa asta.

- **`.no-animations` a devenit `prefers-reduced-motion`.** Comutatorul era pe un
  ecran fără importator, deci singurii care primeau reducerea erau cei care nu
  puteau s-o ceară. Acum o primesc toți cei care au cerut-o sistemului.

- **`.star-pattern` era mort separat de `StarField`.** Componenta randează 50 de
  div-uri cu `animate-pulse-glow`; clasa `.star-pattern` nu era folosită de
  nimeni. Amândouă șterse. `pulse-glow` animează acum doar `opacity` —
  `box-shadow` într-un keyframe forțează un paint pe cadru.

- **Tensiune și armonie nu sunt roșu și verde.** Paleta are deja `--crit`,
  `--warn` și `--ok` pentru ce a mers prost, iar o punte de 6 nu e o eroare, e o
  distanță. Armonia e nuanța accentului cu un pas mai calmă — acordul e același
  lucru spus de două ori. Tensiunea e prună (322°), destul de departe de ok
  (162°), warn (34°) și crit (4°) cât să nu poată fi citită ca alarmă. Un test
  verifică distanța de nuanță.

- **25 de locuri puneau titlul serif pe cifre.** Cinzel nu e tabular, deci
  coloanele de numere nu se aliniau — într-un produs al cărui conținut sunt
  numerele. Au trecut pe `.num`, plus patru clase din `index.css`
  (`.number-display`, `.bento-card-title` și celelalte).

- **Clasa se numește `font-heading`, nu `font-cinzel`.** 150 de apariții numeau
  un font care nu mai există. Utilitarul își numește acum rolul.

- **Build:** CSS 148 KB → 132 KB, fonturi 35 → 27 de fișiere. `ResolveNumber` are
  un warning `react-refresh` fiindcă exportă și `reductionChain` pentru teste —
  aceeași categorie cu cele 16 preexistente.
