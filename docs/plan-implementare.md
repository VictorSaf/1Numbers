# Plan de implementare — Compass rearanjat

Continuă de la `8920af6`. Remedierea din `docs/remediere-2026-08.md` e **încheiată** — nu o relua.
Ce urmează e rearanjarea: structură, flux, bucla zilnică, granița plătită, grafică.

**Cum se rulează:** o etapă per sesiune. La final raportezi și te oprești.

---

## Reguli

1. **Un commit per etapă.** O propoziție la imperativ, în stilul commit-urilor existente.
2. **Poarta verde înainte de commit:** `npm run lint` → `npx tsc -b --noEmit --force` → `npm run test:run`.
3. **Build verificat în director gol:** `npx vite build --outDir /tmp/verify --emptyOutDir`. Niciodată `dist/`.
4. **Nu adaugi calcule noi.** Etapele 1–5 mută și afișează ce există deja.
5. Ce devine mort în urma unei schimbări se șterge în același commit.
6. Note pe drum în `docs/remediere-2026-08-note.md`, ca până acum.

---

## Etapa 1 — cele cinci capitole

Cea mai mare schimbare, pe cel mai puțin cod nou. Pagina de rezultat are azi 15 blocuri în ordinea în
care au fost scrise, din care 10 pliate în spatele a 10 butoane „Arată" identice. Nimic nu spune ce
merită deschis, iar tot ce e mai bun stă în blocurile 9–13.

Cinci capitole, fiecare răspunzând la o întrebare. **Toate deschise.** Fiecare cu **exact o diagramă**.

| # | Capitol | Întrebarea | Conține |
|---|---|---|---|
| 1 | Cine ești | „Din ce ești făcut, indiferent de an." | Drum, Destin, Suflet, Personalitate, Atitudine, Maturitate, Piatra de Temelie |
| 2 | Ce se contrazice în tine | „Cele două lucruri din harta ta care nu se potrivesc." | Puntea Drum–Destin, Puntea Suflet–Personalitate, Echilibru, Gândire Rațională, Sine Subconștient |
| 3 | Ce ai de învățat | „Ce lipsește din harta ta și de ce contează." | Lecții karmice, Datorii, Pasiune Ascunsă, Tabel de Incluziune, Planurile de Expresie |
| 4 | Unde ești acum | „Ce se întâmplă anul ăsta, luna asta, azi." | An/Lună/Zi personală, Esența, tranzit literă, pinnacle curent, Biorritmuri, zile favorabile |
| 5 | Ce urmează | „Harta întregii vieți, pe etape." | Pinnacles + Provocări, Cicluri de viață, Tranzite și Esență, Matrița Destinului, Sisteme paralele |

- `ResultSection` își schimbă rolul: din acordeon în antet de capitol. `defaultOpen` dispare.
- Navigație de capitole: laterală lipicioasă pe desktop, rând de cinci pastile pe mobil, cu poziția curentă marcată.
- Diagrama de distribuție a cifrelor se mută din coada paginii în capitolul 3, lângă tabelul de incluziune.
- Graficul radar: ori intră în capitolul 1 ca rezumat, ori se șterge. Nu rămâne orfan la sfârșit.
- Recharts nu se mai montează necondiționat — azi se descarcă și pentru cine nu derulează până la el.
- **Pagina se termină cu „Salvează harta asta"**, nu cu „Calculează din nou".

**Acceptare:** cinci capitole, toate deschise · navigația funcționează pe ambele lățimi · zero calcule
noi în diff · build fără chunk-uri noi mari.

---

## Etapa 2 — navigația în două

Bara are 7 destinații și s-a revărsat deja la 1900px (vezi comentariul din `AppHeader.tsx:72`).
Cinci funcții complete n-au niciun link de intrare.

**Public (5):** `/` Citește-ți harta · `/doi` Voi doi · `/azi` Azi · `/unelte` Unelte ·
`/invata` Învață (ghid + tutoriale + FAQ + articole, unite).

**Autentificat, meniu de cont (4):** `/eu` Hărțile mele · `/jurnal` Jurnal · `/cercul-meu` Cercul meu ·
`/raport` Raportul complet.

- `PageLayout` la `Friends`, `Auth`, `ChaldeanAnalysis`, `Remedies` — toate patru pierd acum antetul
  complet, deci și limba, și tema, și orice cale de întoarcere.
- `/invite/:code` își ignoră parametrul: `Friends.tsx` nu cheamă niciodată `useParams`. Citește codul
  și consumă invitația.
- `/angel-numbers` devine tab în `/unelte`. `/chaldean` se absoarbe în capitolul 5. `/courses` se șterge.
- `routes.json`: redirecturi 301 de la căile vechi, sitemap regenerat.
- `/tools` pe mobil: șapte taburi în `grid-cols-4 sm:grid-cols-7` cu etichete `hidden sm:inline` —
  sub 640px rămân șapte butoane doar-iconiță pe 4+3 rânduri. Etichete sau grupare.
  `QuickActions.tsx:109` e `grid-cols-4` fix, fără prefix responsive.

**Acceptare:** fiecare rută are cel puțin un link de intrare · `grep -c PageLayout` ≥ 1 pe toate paginile ·
căile vechi redirectează.

---

## Etapa 3 — contradicția și textul specific

**3a. Capitolul 2.** Compune din arhetipurile și ramele existente în `content/` — nu e conținut nou de
scris, e conținut de compus. `frames.ts:47-52` explică deja ce înseamnă când un număr contrazice restul
profilului; aia e materia primă. Forma:

> Drumul tău spune **7** — retragere, analiză. Personalitatea ta spune **3** — cel pe care lumea îl vede
> vorbind. Puntea dintre ele e **4**: distanța se închide prin muncă vizibilă, nu prin explicații.

**3b. Textul generic de pe cardurile de bază.** `NumerologyResults.tsx:157-161` pasează `t.lifePathDesc`
ca `description` — text care descrie *conceptul*, identic pentru toți, așezat *deasupra* interpretării
specifice din `t.meanings[number]`. Scoate prop-ul. O linie.

**Acceptare:** capitolul 2 produce text diferit pentru profiluri diferite, în toate trei limbile ·
primul paragraf de sub fiecare număr e specific numărului.

---

## Etapa 4 — identitatea vizuală

**4a. Literata înlocuiește Cinzel.** Cinzel n-are chirilic — familia nu conține glifele, deci fiecare
titlu în rusă cade acum pe un font de sistem. Literata are `cyrillic U+0400–045F` și
`latin-ext U+0100–02BA` (include ș ț ă â î), e variabilă `400..700`, deci un fișier per subset în loc
de opt. Preia titlurile și textul de interpretare. IBM Plex Mono rămâne pentru cifre, etichete și
coordonate. Raleway rămâne doar pentru chrome de interfață.
Auto-găzduit ca celelalte, cu subseturile latin, latin-ext și cyrillic.

**4b. Două teme, nu patru.** `twilight`, `midnight` și `celestial` diferă între ele prin **exact două
declarații** — `--accent` și `--accent-ink`; restul de ~37 de tokenuri sunt identice, iar auriul (45°)
și galbenul (50°) sunt la cinci grade distanță. Păstrează una luminoasă și una întunecată.
Ieși din paleta cosmică: accent albastru-cerneală în locul auriului.
Adaugă două tokenuri semantice — **tensiune** și **armonie** — pentru relațiile dintre numere (punți
largi, planuri dezechilibrate, ani de dualitate), care acum se desenează tot în accent.

**4c. Șterge `StarField`.** 50 de div-uri într-un strat `fixed inset-0`, pe fiecare rută, cu
`animate-pulse-glow` care mișcă `opacity` **și `box-shadow`** — box-shadow forțează un paint la fiecare
cadru. Decor pur, plătit permanent.

**4d. Setările inerte.**
- `--font-size-multiplier` e scris pe `<html>` la fiecare schimbare și **nicio regulă nu-l citește**.
- `.high-contrast` suprascrie 4 tokenuri dar ratează `--muted-foreground`, folosit de **368 de clase** —
  exact textul cel mai greu de citit rămâne neatins.
- `Settings.tsx`, singurul ecran care le expune, **n-are importatori**.
Decide o dată: ori montezi `Settings` în `/eu` și faci cele două setări reale, ori ștergi ecranul cu tot
cu ramurile moarte din `ThemeContext`.

**4e. Momentul de surpriză.** La **primul** rezultat, o singură dată, 600ms: numerele se rezolvă din
totalul brut — `ȘTEFAN ȚÎRLEA → 49 → 4+9 → 13 → 4`. `NumResult.raw` există deja și nimeni din categorie
nu-l are. Respectă `prefers-reduced-motion`. Nu la fiecare reîncărcare, nu pe fiecare card.

**Acceptare:** un titlu în rusă se randează în Literata · contrastul ridicat schimbă vizibil textul
secundar (sau setarea nu mai există) · zero `hsl(` literal în `src/components` în afară de `hsl(var(--…))`.

---

## Etapa 5 — cardul zilnic pe motor

`predictions.ts` e un `Record<number, …>` plat, în engleză, cu **nouă intrări pentru 365 de zile**.
Pagina traduce un singur câmp; `advice`, `challenges`, `opportunities`, `theme`, `career`,
`relationships`, `health`, `finances` se randează în engleză brută sub titluri traduse, pentru RO și RU.

Retrage-l pe rame + arhetipuri, care vorbesc deja trei limbi. Cardul se compune din trei variabile cu
ritmuri diferite — o zi, un an, câțiva ani — deci combinația nu se repetă și nu se poate ghici:

> Azi ești în ziua **7** a unui an **3**, sub litera **R** — al treilea din cei nouă ani ai ei.
> An de expunere, zi de retragere. Ciocnirea asta e tema ta de azi.

Ziua personală, anul personal, esența și litera care tranzitează se calculează deja și se aruncă.

**Același card e și capitolul 4 din lectură, și dashboard-ul, și `/azi`. O singură sursă.**

Reparat în trecere: `BentoDashboard.tsx:119-122` — `todayInsight` e memoizat pe `[numbers.personalDay]`
dar citește `entry[language]`, deci jumătate din card nu comută la schimbarea limbii.

**Acceptare:** cardul e diferit pentru două persoane cu profiluri diferite în aceeași zi · zero engleză
în UI-ul RO și RU pe `/azi`.

---

## Etapa 6 — sisteme paralele și literele

Singura secțiune din demo care n-a ajuns niciodată în aplicație, și cel mai mare diferențiator.
**Calculele rulează deja** la fiecare deschidere a secțiunii „Numerele noi" și se aruncă.

- Componentă nouă în capitolul 5: **Vedic** (mulank, bhagyank, naamank, Navagraha),
  **Kabbalah** (gematria + varianta populară), **Chaldean compus**.
- **Kua nu se execută deloc:** `fullProfile` îl cere pe `opts.gender`, iar `NewNumbers.tsx:25` nu pasează
  opțiuni. Ori colectezi genul în formular — opțional, cu explicație de ce — ori scoți ramura.
- Chaldean are două implementări cu vocabulare diferite (`positive/negative` vs `favorabil/mixt/dificil`).
  Rămâne cea din motor; `src/lib/chaldean.ts` se retrage.
- **Piatra de Temelie / de Vârf / Prima Vocală:** `interpretLetters`, cele trei rame și `content/letters.ts`
  (26 litere × 3 limbi) sunt complete și n-au niciun apelant. Ăsta e motivul pentru care secțiunea care
  promite 14 numere livrează 11. Cablează-le în capitolul 1.
- Corectează teaser-ul: `NumerologyResults.tsx:94` spune „și încă zece" = 14; `interpretProfile` emite 11.
- `NewNumbers.tsx:39` — `extended[interpretation.key]` ratează pentru `bridgeLifePathExpression`,
  `bridgeSoulPersonality`, `universalYear` și `essence`, care stau în alte ramuri ale profilului.
  Mapează-le explicit, ca toate cardurile să poată arăta `raw`, master și datorie.
- `numerology-plus/applied.ts` — 11 exporturi, zero apelanți, iar `HARMONY_MATRIX` e un IIFE care
  construiește o matrice 12×12 la evaluarea chunk-ului doar ca s-o arunce. Ori cablezi compatibilitatea
  ponderată în `/doi`, ori ștergi fișierul.

**Acceptare:** capitolul 5 afișează cele trei sisteme paralele · numărul promis = numărul livrat ·
toate cardurile din capitolele 1–2 arată `raw` acolo unde există.

---

## Etapa 7 — raportul plătit

Produsul e **raport unic**, nu abonament. Motivul, pe scurt: abonatul săptămânal din Social & Lifestyle
are 3,4% șanse să mai fie abonat peste un an, categoria are cele mai slabe reînnoiri din piață, iar
paywall-ul pe web convertește 6% față de 2% în aplicație nativă, la ~6% comision în loc de 15–30%.

- **Gratuit, definitiv:** toate cele cinci capitole, cardul zilnic, o hartă salvată, comparația cu o persoană.
  Suprafața gratuită e canalul de achiziție. Nu o mutila.
- **Plătit, trei praguri:** **19 €** raportul de bază · **39 €** + sisteme paralele + prognoză 9 ani ·
  **69 €** + hărți nelimitate + comparații.
- Livrare: PDF + pagină permanentă la URL propriu. `pdfExport.ts` există — 752 de linii, orfan de când
  i s-a șters butonul.
- Checkout pe domeniul propriu. Garanție 30 de zile. Fără reînnoire.
- Șterge `premium.ts`, `PricingCards.tsx`, `SubscriptionPlans.tsx` și tabelele de tiere.

**Nu construi, oricât ar converti:** preț săptămânal afișat mai mare decât suma facturată · ofertă mai
ieftină pentru cine refuză · trial care ascunde reînnoirea · notificări bazate pe frică sau urgență ·
cronometre care se resetează · anulare mai grea decât abonarea. Primele trei sunt motivul pentru care
Apple a scos Cal AI din App Store în aprilie 2026; restul sunt enumerate explicit în consultarea
Digital Fairness Act.

**Acceptare:** un utilizator poate cumpăra și primi raportul fără cont de magazin · nicăieri în UI un
preț afișat diferit de cel facturat.

---

## Etapa 8 — curățenie finală și pagini care calculează

**8a. Ce a rămas mort.** Verifică fiecare cu grep înainte să ștergi.
- `gamification.ts` — 740 de linii, zero importatori în `.tsx`. Nu doar nefolosite: literatura pe
  streak-uri și clasamente n-are dovezi cauzale, iar clasamentele demotivează exact utilizatorii pe care
  vrei să-i reții. Șterge biblioteca, rutele de backend și migrarea asociată.
- Stratul React din `design-system/` — 8 componente importate doar de pagina internă de showcase.
- `Settings.tsx`, dacă etapa 4 a ales ștergerea.
- `advancedReports.ts`, `guides.ts` — verifică, o parte au dispărut deja în `8920af6`.

**8b. Data nașterii ca timestamp.** Coloana e `DATE`, dar `profiles.ts:30` o returnează neformatată;
clientul o reconstruiește cu `new Date()` în șase locuri și citește `.getDate()` local. Orice decalaj de
fus mută ziua nașterii cu una și schimbă tot profilul. Serializează `YYYY-MM-DD` la ieșirea din API și
parseaz-o ca dată calendaristică. Repară și testele — `numerology.test.ts:67` folosește
`new Date("1990-05-15")` cu gettere locale, deci valorile așteptate sunt corecte doar în fusuri UTC+.

**8c. Pagini care calculează, nu explică.** Fiecare pagină publică cere date de naștere și întoarce un
rezultat. AI Overviews apar pe ~91% din interogările informaționale și pe ~14% din cele tranzacționale:
„ce înseamnă Drumul Vieții" e conținut mort, „calculează-mi Drumul Vieții" nu poate fi servit dintr-o
casetă de sumar.
Meta-ul pentru `/tools` din `routes.json:87-97` descrie și acum analiză de telefon, adresă și număr de
înmatriculare — funcții pe care pagina nu le are, deja emise în `sitemap.xml` și în HTML-ul prerandat.

**8d. `NumerologyResults.tsx:110`** construiește titlul de share hardcodat în engleză, indiferent de limbă.

---

## Note de mediu

- `git status` poate raporta un index vechi. Folosește `git diff HEAD` sau `git --no-optional-locks`.
- Verifici build-ul într-un director gol, niciodată în `dist/` sau `.build-check/` — amândouă sunt vechi.
- Nu atinge `src/lib/routes.ts:27`: excluderea rutelor interne din build funcționează, verificat empiric.
