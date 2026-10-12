# Cercetare: ce funcții există în piață și ce facem cu fiecare

Scris 2026-10-12. Sursele: patru cercetări rulate azi, plus inventarul codului.
1. Aplicațiile internaționale: ~25 de produse și 96 de funcții distincte.
2. Piața rusă, ucraineană, poloneză și română.
3. Literatura de specialitate: ~95 de tehnici (Decoz, Goodwin, Javane și Bunker, Cheiro,
   Alexandrov, Ladini, Greer).
4. Inventarul aplicației, cu `fișier:linie`.

Ce poartă **[N]** n-a fost confirmat de o sursă citită: vine din search-result summaries sau
din cunoașterea domeniului. Unde un magazin de aplicații a răspuns 429, detaliile vin din
rezumate.

Completează `analiza-produs-si-piata.md` (2026-09-12), care tratează prețurile. Documentul
de față tratează **funcțiile**.

---

## 1. Ce am găsit care contează

1. **Aplicația acoperă deja aproape tot catalogul clasic occidental.**
   - Nucleul: punți, Maturity, Attitude, Balance, Rational Thought, Subconscious Self,
     Hidden Passion.
   - Ce ține de nume: Cornerstone, Capstone, First Vowel, karmicul, planurile de expresie.
   - Ce ține de timp: pinnacles cu provocările lor, cicluri, tranzite, Esența, an/lună/zi
     personală și universală, bioritmuri.
   - Celelalte sisteme: vedic, Kua, Kabbalah, caldeean, Lo Shu, Matrice (9 puncte), îngeri.

   Puține produse au atât. Pocket Numerology și OurNakshatra se apropie.
2. **Fiecare școală alege o metodă și o aplică fără să spună.** Cele care se contrazic:
   - **Anul personal** începe pe 1 ianuarie la Decoz, DeLorey și Samuels. Începe de ziua ta
     în școala kabbalistică, la Gaia și la Hartmann.
   - **Drumul vieții:** părțile se reduc separat sau se adună toate cifrele deodată.
     27.03.1988 dă 2 pe un drum și 11 pe celălalt.
   - **Litera Y** e vocală sau consoană. Asta schimbă Sufletul și Personalitatea.
   - **Matricea:** peste 22, unii fac suma cifrelor, alții scad 22.
   - **Psihomatricea** pentru cei născuți după 2000 nu are o regulă acceptată de toți.
   - **Tabelele de compatibilitate 1–9** se contrazic: trei site-uri românești dau trei
     răspunsuri pentru 1. Tabelele vedice prieten/dușman diferă și ele între surse.

   **Niciun produs găsit nu-i arată omului dezacordul.** Cel mai aproape:
   - OurNakshatra calculează patru sisteme unul lângă altul, dar nu le compară.
   - Numerologist, la nivelul de $37, scrie cum numerele „se întăresc sau se contrazic".
3. **Ce lipsește la noi și e cerut în piață:**
   - **Psihomatricea** (pătratul lui Pitagora, Alexandrov) e standardul pieței ruse și n-o
     avem deloc.
   - Din **Matricea destinului** desenăm doar 9 puncte. Lipsesc:
     - canalele de bani și de iubire;
     - coada karmică;
     - linia vârstei, deși `lifePeriods()` e deja calculată, `matrix.ts:77`, și nu e
       afișată nicăieri;
     - matricea de cuplu.
   - **Numele folosit azi** (Minor Expression) față de numele de la naștere.
   - **„Arată calculul"**, pas cu pas. La Token Rock e una dintre cele mai lăudate funcții.
     La noi e chiar regula R5.
   - **Data unui eveniment** citită pentru un scop: nuntă, lansare, contract.
   - **Cartea de tarot** a nașterii și a anului (Arrien, Greer).
   - **Intensitatea** comparată cu media așteptată (Goodwin): tabelul de incluziune
     există, comparația nu.
   - **Card de partajat** ca imagine, fără nume și fără dată în URL.
   - **Export .ics** al zilelor personale.

## 2. Matricea de decizie

Verdictele urmează `docs/produs/02-doctrina.md`.

| Verdict | Înseamnă |
|---|---|
| **A** | Servește doctrina direct: e o întrebare pusă a doua oară, pe alt drum |
| **B** | Completează ce există: date calculate și neafișate, sau o regulă a doctrinei (R5) nefăcută |
| **C** | Ergonomie și păstrarea omului, compatibile cu doctrina |
| **X** | Respins de doctrină. Motivul e scris lângă |
| **?** | Decizie deja deschisă în `03-filtru.md` |

### A — a doua cale (dezacorduri noi)

| # | Funcție (unde există în piață) | Perechea din doctrină | Unde intră |
|---|---|---|---|
| A1 | Psihomatricea Alexandrov (aplicații RU, Pocket) | „Ce îți lipsește din dată?": grila lui Alexandrov, cu cifrele de lucru, contra Lo Shu. Aceleași cifre, două grile, absențe diferite | Capitolul „Ce îți lipsește" |
| A2 | Anul personal de la ziua ta (școala kabbalistică) | „Despre ce e anul ăsta?": granița la 1 ianuarie contra granița la ziua de naștere. Între cele două date, omul are două răspunsuri | Capitolul „Unde ești acum" și `/azi` |
| A3 | Opțiunea „Y vocală" (Cafe Astrology) | „Ce vrei pe dinăuntru?": Sufletul cu Y vocală contra Sufletul cu Y consoană. Apare doar când numele are Y | Puntea Suflet–Personalitate |
| A4 | Numele folosit azi (Decoz, Token Rock) | „Ce ai făcut cu ce ți s-a dat?": Expresia numelui de la naștere contra Expresia numelui de azi. Câmpul e opțional și folosit, deci R6 e respectată | Capitolul „Cine ești" |
| A5 | Reducerea peste 22 în Matrice (calculatoarele RU diferă) | Suma cifrelor contra −22, numai unde cele două dau arcane diferite | Capitolul „Alte tradiții" |
| A6 | Mai multe metode de compatibilitate (matrice Drum, prieten/dușman vedic, grupă Kua Est/Vest, par/impar, acoperirea absențelor) | `/doi` compară azi pitagoreicul cu vedicul. Extinderea: patru-cinci metode pe aceeași relație, cu distanța dintre ele, fără medie | `/doi` |
| A7 | Acoperirea absențelor (Goodwin, [N]) | „Ce-i lipsește unuia și are celălalt": lecțiile karmice ale lui A contra abundența lui B | `/doi` |
| A8 | Matricea de cuplu (Ladini) | Al treilea sistem pe aceeași relație. Intră doar dacă A6 e făcut | `/doi` |

### B — completează ce există

| # | Funcție | Ce lipsește | Unde |
|---|---|---|---|
| B1 | „Arată calculul" (Token Rock) | Lanțul de reducere sub fiecare număr, desfăcut la cerere. R5 cere urmărirea până la cifre | Peste tot în hartă |
| B2 | Zonele derivate ale Matricei | Canalul de bani, canalul de iubire, coada karmică, linia vârstei (`lifePeriods`, `matrix.ts:77`, deja calculată) | Capitolele „Alte tradiții" și „Ce urmează" |
| B3 | Intensitatea față de media așteptată (Goodwin) | Tabelul de incluziune primește coloana „așteptat" | „Ce îți lipsește" |
| B4 | Key Number, din prenume (Spiritwalk, Goodwin) | Lipsește | „Cine ești", lângă pietrele-literă |
| B5 | Cartea de tarot a nașterii și a anului (Arrien, Greer) | Imaginile tarot există deja (`public/tarot/`) | Frontispiciu și `/azi`. Candidată și pentru A: arcanul anului din tarot contra arcanul vârstei din Matrice |
| B6 | Citirea unei date-eveniment (Cafe Astrology; alegerea datei, [N]) | Ziua universală a datei, raportată la ziua personală a fiecăruia | `/doi` (data nunții) sau `/azi` |
| B7 | Datoria karmică în ciclurile din timp ([N]) | Calculul există, marcajul pe pinnacles și perioade lipsește | „Ce urmează" |
| B8 | Textul pentru „Dualitate" în tranzite | Calculul există, textul lipsește: `04-extinderi.md` §2, „cea mai ieftină extindere" | „Ce urmează" |

### C — ergonomie și păstrarea omului

| # | Funcție | Notă |
|---|---|---|
| C1 | Card de partajat ca imagine (Numerology & Astrology, Nums) | Conține tensiunea, nu numele și nu data (R6) |
| C2 | Export .ics al zilelor și lunilor personale | Fără server: fișierul se generează în browser |
| C3 | Mai multe profiluri și comutare rapidă (Decoz: 25) | Există deja (`/eu`). De verificat ergonomia |
| C4 | Push zilnic cu o propoziție (Co-Star) | Amânat în `03-filtru.md` până există „ciocnirea zilei" |
| C5 | „Ține sau nu ține" (fără echivalent în piață) | Deja în `04-extinderi.md` §3 |
| C6 | Widget și ceas | Imposibil pe PWA web. Nu se face |

### X — respins, cu motivul

| Funcție (unde) | Motiv |
|---|---|
| Procent de compatibilitate, „love calculator" | R1 |
| Trofee, insigne, „profil 100%", streak-uri (Grupo Precedo) | `04-extinderi.md` §5; `gamification.ts` a murit fără importatori |
| Optimizator de nume (OurNakshatra, AstroSage) | Scos din cod: „Popescuh" (`03-filtru.md`) |
| Telefon și număr auto (Decoz, OurNakshatra) | Scoase din cod azi, fără apelant |
| Cod financiar, „anti-cod", sfatul de a-l folosi la PIN (calcneo) | Sfat de securitate prost. Nicio pereche în doctrină |
| Harta chakrelor și a sănătății (numefy, cosmo-360) | Afirmații despre sănătate. R7. Nici școala nu se pune de acord asupra formulei |
| „Programe" de infidelitate, triplete cu verdict (irecommend) | Vocea de oracol care etichetează oameni. R3 |
| Găsitor de obiecte pierdute, zar și oracol da/nu, vibrația orei | Încă un calculator, fără întrebare dublă |
| Afirmația zilei și lista „fă / evită" generice | Text de dicționar, R5 |
| Baza de celebrități (The Pattern) | Altă aplicație |
| Onboarding cu chestionar, paywall dur, numărătoare inversă, ecran fals de încărcare (Nebula, matrica-sudby) | Tipare înșelătoare |
| Codul de viață Kuzdenbaeva | Cere numele tatălui: date colectate pentru un singur sistem |
| Piață de cititori umani pe minut (Nebula, Hint) | Alt business. Decizie de produs, nu funcție |
| Chat AI fără hartă | `04-extinderi.md` §5 |

### ? — decizii deja deschise în `03-filtru.md`

Numerele de înger · numele de firmă · `/remedies` · numele pentru copil și numărul casei
(calculate în `applied.ts`, neafișate) · cercul de prieteni.

## 3. Ordinea propusă, dacă doctrina rămâne filtrul

Ordinea e după valoare, apoi după cost.

1. **B1** „Arată calculul". Atinge totul și face R5 vizibilă.
2. **A2** Anul de la 1 ianuarie contra anul de la ziua ta. Ieftin: două calcule existente.
3. **A1** Psihomatricea contra Lo Shu. Deschide piața rusă, unde rusa e deja limbă de prim
   rang.
4. **B2** și **A5**: Matricea completă, plus dezacordul intern al școlii.
5. **A6** și **A7**: `/doi` cu mai multe metode.
6. **A3**, **A4**, **B3**, **B4**, **B8**: completările mici.
7. **C1** și **C2**: partajarea și calendarul.
8. **B5**, **B6**, **B7**, **A8**: după o decizie separată.
