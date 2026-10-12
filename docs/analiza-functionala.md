# Analiza funcțională — ce face aplicația și cât din ce face e util

Scris 2026-09-12, pe build-ul care rulează (pm2 `compass`, :8090) plus cod.
Fiecare afirmație de mai jos a fost verificată în browser sau în sursă. Referințele
sunt `fișier:linie`. Nimic din ce urmează nu ține de preț sau de monetizare.

---

## 1. Ce funcționează și e bun

**Motorul de calcul e corect.** Verificat manual pe „Maria Elena Popescu / 15.05.1990":
Destin 3 (75 → 12 → 3), Suflet 9 (36), Personalitate 3 (39 → 12 → 3), An personal 2026 = 3,
lună personală ianuarie = 4. Toate corecte. Numerele master se păstrează. 864 de teste trec.

**`/doi` e cea mai bună pagină din aplicație.** Nu dă doar un procent: arată dispersia dintre
componente („30 de puncte între Personalitate și Suflet — media ascunde că o parte a relației
merge singură și alta cere muncă"), pune în contradicție matricea pitagoreică cu relația vedică
(„Vedicul vede prietenie unde Pitagoreicul vede distanță"), și desfășoară anul pe luni. Asta
n-are echivalent la concurență.

**Harta principală (`/`)** — șase capitole, toate deschise, cu blocul „unde harta răspunde de
două ori" care compară sistemele între ele. Livrată instant, fără cont.

**`/azi` e complet tradus și specific.** În română: ziua personală, ce ai de făcut, patru
recomandări concrete, culoarea zilei, orele. Zero engleză scăpată. Etapa 5 din plan e închisă.

**`/remedies`** e surprinzător de bogat — culori, pietre, metal, zile, direcții, mantre, alimente,
cariere, acțiuni — și complet tradus.

**`/eu`** e serios pe partea de date: export JSON al tuturor datelor, ștergere de cont explicată,
și o alegere reală între „textul zilei scris de un model" (datele pleacă) și „compus de aplicație"
(nu pleacă nimic). Declarația către consultantul AI e onestă: se trimit cifrele hărții, nu numele
și nu data nașterii.

**Consultantul AI produce română de calitate.** Testat pe o întrebare reală: răspuns lung,
structurat, corect numerologic.

---

## 2. Defecte confirmate

### 2.1 Un cont nou nu-și poate crea harta proprie
`server/src/routes/profiles.ts:110-131` — `POST /api/profiles/me` cu `category: 'eu'` răspunde
**403 `admin_only`: „Your own map is set up by an administrator."** Verificat pe un cont nou creat
prin API. Dar `/eu` afișează formularul complet, cu „Eu" preselectat și butonul „Creează Profilul".
Orice utilizator nou lovește un zid, fără explicație în interfață.

**Consecință în lanț:** fără profil „eu", consultantul AI spune „Creează un profil pentru a primi
răspunsuri personalizate", jurnalul rămâne gol, dashboard-ul n-are ce afișa. Toată zona de cont e
inertă pentru oricine nu e administrator.

### 2.2 Traducerea prin `String.replace` — engleza și rusa ies stricate
`src/lib/compatibility.ts` și `src/lib/multiPersonCompatibility.ts` „traduc" înlocuind primele
cuvinte dintr-o frază românească: `.map(c => c.replace("Diferente majore", "Major differences"))`
(`compatibility.ts:449`). Restul frazei rămâne în română.

Pe `/doi` în engleză apare literal:
> MAJOR DIFFERENCES **ÎN ABORDAREA VIEȚII - NECESITĂ COMPROMISURI**

**24 de apariții** ale tiparului în cele două fișiere. În rusă e la fel. Bonus: șirul sursă e scris
greșit și în română — „Diferente" fără diacritică (`compatibility.ts:437`).

### 2.3 Optimizatorul de nume produce nume inexistente
`src/lib/nameAnalysis.ts:399-402` — comentariul spune tot: `// Try adding single letters`,
`const newName = originalName + letter`. Pentru „Maria Elena Popescu" sugerează, în pagină:

> Maria Elena Popescu**h** · Maria Elena Popescu**e** · Maria Elena Popescu**n** · Maria Elena Popescu**y**

Cu eticheta „Potrivire cu numărul țintă dorit". E singura unealtă din aplicație care produce
rezultate ridicole, și e expusă public.

### 2.4 Planurile din Lo Shu: un singur număr prezent e raportat „echilibrat"
`src/lib/loShuGrid.ts:223` — `if (presentCount === 2 || total <= 3) return 'balanced'`.
Pentru 15.05.1990 (cifre prezente: 1, 5, 9, fiecare de două ori), planul mental [4,9,2] are **un
singur** număr prezent, dar `total = 2 ≤ 3`, deci iese „Plan mental echilibrat - gândire clară".
În aceeași grilă, planul gândirii [4,3,8] iese „gol". Aceeași sărăcie de date, două verdicte
opuse. Regula `total <= 3` transformă un plan aproape gol într-unul echilibrat.

### 2.5 Exportul PDF e rupt pentru română și rusă
`src/lib/export.ts` folosește jsPDF cu **helvetica** și nu încarcă niciun font
(`grep addFont` → zero rezultate). Helvetica standard nu conține ș, ț, ă, â, î și nu conține
chirilic. În plus, toate titlurile sunt hardcodate în engleză indiferent de limbă —
`export.ts:88` „Numerology Report", `:108` „Core Numbers", `:218` „Pinnacles & Challenges",
`:271` „Karmic Analysis" — iar culoarea e mov `(139, 92, 246)`, paleta cosmică scoasă demult
din aplicație. Deci: singurul artefact pe care omul îl ia cu el arată prost și e în altă limbă
decât restul produsului.

### 2.6 Linkul de partajare pune numele și data nașterii în URL
`src/lib/sharing.ts:226-230` — `new URLSearchParams({ name, birthDate, type })`.
Cine partajează o hartă trimite prin WhatsApp sau Facebook **numele complet plus data nașterii**
într-un URL: intră în istoricul browserului, în header-ul de referrer, în logurile oricărei
platforme prin care trece. Aplicația are grijă să nu trimită numele și data către modelul AI, apoi
le pune într-un link public. Cele două politici nu se potrivesc.

### 2.7 Ora și locul nașterii: câmpuri care nu fac nimic
`/eu` cere „Ora nașterii (opțional)" cu explicația „poate oferi detalii suplimentare în
numerologie" și „Locul nașterii (opțional)" cu „poate influența calculele numerologice"
(`translations.ts:142` și `:145`). Ambele valori sunt stocate și plimbate prin
`use-profiles.ts` / `use-profile.ts`, dar **nu intră în niciun calcul** — nu apar nicăieri în
`src/lib` în afara tipurilor. În numerologia pitagoreică nici n-ar avea cum. Sunt date personale
colectate fără scop, cu o explicație falsă lângă câmp.

### 2.8 Articolele din `/invata` sunt rezumate de o propoziție cu timp de citire inventat
`src/lib/articles.ts` — trei articole, fiecare cu `content` de o singură frază care se termină în
„…": *„Numerologia este o știință metafizică antică ce studiază semnificațiile ascunse și
influențele numerelor..."*. În pagină, fiecare poartă eticheta **FEATURED** și un timp de citire
— „5 min", „7 min", „10 min". Nouă filtre de categorie pentru trei articole. În plus, fraza
numește numerologia „știință", ceea ce contrazice disclaimerul din subsolul fiecărei pagini.

---

## 3. Funcții care promit mai mult decât livrează

**Matricea de compatibilitate** — panoul din `/unelte` o descrie ca „Fiecare pereche dintr-un grup,
deodată". Cere **o singură** dată de naștere și întoarce nouă procente, fără etichete, fără nume,
fără nicio explicație: `1 → 90%`, `2 → 75%`… E compatibilitatea numărului tău cu cifrele 1–9, nu
un grup. `Tools.tsx:340-345`.

**„Lucky Score 100%"** din calendar — `NumerologyCalendar.tsx:401` afișează
`Math.max(...luckyScore)` sub eticheta „Lucky Score". Se citește ca „luna ta e 100% norocoasă",
când de fapt e „cea mai bună zi din lună are scor 100".

**Cercul meu** — cereri de prietenie „după email", într-o aplicație în care emailul nu pleacă
(`RESEND_API_KEY` nesetat). Funcționează doar între oameni care au deja cont și se caută reciproc.

**Ștergerea contului** — `/eu` promite „îți trimitem un email de confirmare". Fără cheia de email,
promisiunea nu se poate onora. GDPR-ul e scris corect în cod și blocat de o variabilă de mediu.

---

## 4. Ce nu ajunge niciodată la utilizator

- **`/remedies` și `/chaldean` nu apar în navigație.** Navigația publică are cinci destinații
  (`/`, `/doi`, `/azi`, `/unelte`, `/invata`). `/remedies` e linkuit doar din `QuickActions`, care
  se vede după autentificare; `/chaldean` doar din pagina de rezultat. Amândouă sunt în sitemap,
  deci singura intrare reală e Google. Cea mai bogată pagină din aplicație (remediile) e practic
  ascunsă.
- **`gamification.ts`** — 740 de linii, **zero importatori** în `.tsx`. Plus rutele de backend și
  migrația 006.
- **`pdfExport.ts`** — 752 de linii, un singur importator: `WhiteLabelSettings.tsx`, pagină internă.
  Exportul real merge prin `export.ts`, alt fișier.
- **`premium.ts` + `PricingCards.tsx`** — structura veche pe trei tiere.
- **`applied.ts`** din `numerology-plus` — analiză de telefon, adresă, număr de înmatriculare:
  calculate, netrimise nicăieri.

---

## 5. Unde e utilitatea reală

Ierarhia, după ce livrează efectiv:

1. **Harta (`/`)** — completă, corectă, instant, în trei limbi. Ăsta e produsul.
2. **`/doi`** — singura pagină care face ceva ce nimeni altcineva nu face: arată unde două
   sisteme nu sunt de acord și ce înseamnă asta.
3. **`/azi`** — bine tradus, specific, și e singurul motiv de întoarcere zilnică.
4. **`/remedies`** — bogat și util, dar ascuns.
5. **Consultantul AI** — bun, dar blocat de defectul 2.1.
6. **`/unelte`** — opt unelte de calitate foarte inegală: calendarul, Lo Shu, prognoza anuală și
   numele de firmă sunt bune; optimizatorul de nume și matricea sunt sub nivelul restului.
7. **`/invata`** — ghidul numerelor e în regulă; tutorialele sunt decente; articolele sunt un ciot.
8. **Jurnal, Cercul meu** — corecte tehnic, fără sens până nu există oameni care le folosească.

O observație de ton, nu de cod: aplicația are **două voci care se contrazic**. Motorul spune, pe
capitolul 2, că 9 și 3 e o contradicție care „nu se rezolvă, se traversează". Consultantul AI, pe
aceleași numere, spune „nu sunt numere în conflict". Iar `/doi` pune în capul paginii „86%,
Excelent, energiile voastre se completează perfect" și, două secțiuni mai jos, „ei nu sunt de
acord". Vocea onestă e cea care diferențiază produsul; cealaltă e vocea generică din categorie.

---

## 6. Ordinea în care aș repara

**Blochează folosirea produsului:**
1. `admin_only` pe harta proprie (2.1) — orice cont nou e într-un zid.
2. Traducerile prin `replace` (2.2) — jumătate din frazele de pe `/doi` sunt bilingve.

**Strică încrederea:**
3. Optimizatorul de nume (2.3) — ori îl faci serios, ori îl scoți din cele opt unelte.
4. Exportul PDF (2.5) — e singurul lucru pe care omul îl păstrează.
5. Linkul de partajare cu nume și dată în URL (2.6).
6. Ora și locul nașterii (2.7) — ori le folosești, ori le scoți din formular.

**Promisiuni de corectat:**
7. Descrierea matricei, „Lucky Score", articolele cu „10 min" (§3, 2.8).
8. Planurile Lo Shu (2.4).

**Curățenie:**
9. `/remedies` și `/chaldean` în navigație, sau absorbite unde le e locul.
10. Codul mort de la §4.
