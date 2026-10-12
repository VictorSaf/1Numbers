# Analiza produs și piață — Numerology Compass

Scris 2026-09-12. Tot ce spune despre aplicație e verificat în cod sau în browser pe
build-ul care rulează (`dist/`, pm2 `compass`, :8090). Tot ce spune despre piață are
sursa lângă el; ce n-a putut fi confirmat e marcat ca atare.

---

## 1. Ce oferă, exact

### Gratuit, fără cont, fără email, fără plată

**Harta (`/`)** — nume complet la naștere + data nașterii → șase capitole, toate deschise:

| # | Capitol | Ce conține |
|---|---|---|
| 1 | Cine ești | Drum, Destin, Suflet, Personalitate, Atitudine, Maturitate, Piatra de Temelie |
| 2 | Ce se contrazice în tine | Puntea Drum–Destin, Puntea Suflet–Personalitate, Echilibru, Gândire Rațională, Sine Subconștient |
| 3 | Ce ai de învățat | Lecții karmice, datorii, pasiune ascunsă, tabel de incluziune, planuri de expresie |
| 4 | Unde ești acum | An/lună/zi personală, esență, tranzit de literă, pinnacle curent, zile favorabile |
| 5 | Ce urmează | Pinnacles + provocări, cicluri de viață, tranzite și esență pe 12 ani, matrița destinului |
| 6 | Aceeași hartă, alte tradiții | Vedic (mulank, bhagyank, naamank, Navagraha), Kabbalah, Chaldean compus |

Plus, în capitolul 2, blocul **„Unde harta răspunde de două ori"**: aceeași întrebare pusă
prin sisteme diferite, cu distanța dintre răspunsuri calculată și explicată.

**Alte pagini publice:** `/doi` (compatibilitate între două persoane), `/azi` (zi/lună/an
personal), `/unelte` (opt unelte: calendar numerologic, pătratul Lo Shu, numere de înger,
schimbare de nume, nume de firmă, prognoză anuală, optimizator de nume, matrice de
compatibilitate pe grup), `/invata`, `/chaldean`, `/remedies`,
`/confidentialitate`, `/termeni`.

### Cu cont (înregistrare deschisă, dar emailul nu pleacă — vezi §7)

`/eu` hărți salvate · `/jurnal` · `/cercul-meu` (prieteni, invitații) · notificări push
(VAPID configurat) · consultant AI pe Claude (15 cereri/oră/utilizator) · export PDF.

### Sub capotă

20.130 de linii de logică pură în `src/lib`, motor propriu (`numerology-plus`) cu strat de
conținut separat: arhetipuri, rame, arcane, litere (26 × 3 limbi), modul dedicat de
contradicție. Interfață și interpretări în **română, engleză și rusă**, egal.
864 de teste verzi.

---

## 2. Cum livrează

Web, nu aplicație nativă. PWA cu service worker. Rezultatul apare **instant, fără cont,
fără email, fără plată** — scrii numele și data, primești harta întreagă. Prerender per
rută cu meta pe limbă, sitemap generat din `routes.json`, canonical per rută,
Plausible fără cookie-uri (deci fără banner de consimțământ).

Infrastructură: două procese pm2 pe Mac mini în spatele unui tunel Cloudflare,
PostgreSQL local, job zilnic de retenție. `compass.oneaigency.com`.

---

## 3. Cui

Aplicația nu e construită pentru un public, ci pentru trei care nu se suprapun:

1. **Curiosul** — vine dintr-o căutare, vrea un număr, pleacă. Îl servește harta gratuită.
   E cel mai numeros și valorează zero azi, fiindcă nu există nicio cale de la el spre cont.
2. **Practicantul** — se întoarce, vrea ziua personală, jurnalul, cercul. Îl servesc
   funcțiile de cont. Ăsta e cel care ar plăti abonament.
3. **Profesionistul** — numerolog care face lecturi pentru alții. Are nevoie de mai multe
   hărți, export, marcă proprie. Nu e servit deloc azi (white-label există ca rută internă).

Geografic, lucrul relevant: **româna și rusa nu sunt traduceri, sunt limbi de prim rang** —
și asta e, conform cercetării, singurul lucru din produs pe care concurența nu-l are deloc.

---

## 4. Concurența

### Numerologie pură — prețuri publicate

| Produs | Ofertă | Preț | Model |
|---|---|---|---|
| Numerologist.com | Hidden Numbers | $17 (de la $29.99) | unic |
| | Soul's Secret Code | $37 | unic |
| | Life Timeline, 150+ pagini | $57 (de la $77) | unic |
| World Numerology (app) | gratuit: 8 unelte | $0 | — |
| | Primary | **$19/an** | abonament |
| | Full — toate cele ~20 de readinguri | **$35/an** | abonament |
| | Lifetime | **$59 o dată** | unic |
| Token Rock | Personal Report, 30+ pagini | $19.97 | unic |
| | Compatibility | $26.97 | unic |
| Secretul Numerelor (RO) | Numerogramă 110–120 pagini, PDF | **310 lei (~62 €)** | unic |
| Astro-Seek, OurNakshatra, Cafe Astrology | calculatoare și rapoarte | **$0** | gratuit |

**Banda medianei pentru un raport unic de numerologie: $20–$40.** Peste $50 se vinde doar
cu volum declarat (100+ pagini) sau ca „ultimate".

### Astrologie — de unde vin banii și tiparele

| App | Abonament | Unitar / add-on | Recenzii |
|---|---|---|---|
| Co–Star | $8.99/lună | Your Year Ahead **$11.99**, chart avansat $8.99, credite de întrebări $2.99–$6.99 | 4.8★, **206K** |
| The Pattern | $14.99/lună, $83.99/an | **sloturi de persoane**: 3/$9.99, 10/$16.99, 20/$19.99 | 4.0★, 15K |
| CHANI | $11.99/lună, $107.99/an | — | trial 14–30 zile |
| Sanctuary | $14.99/lună, $49.99/an | consultație umană 10 min **$49.99** | 4.8★, 44K |
| AstroSage / Astrotalk | conținut gratuit | banii sunt în consultația umană per minut | Astrotalk FY25: ~$145M, +85% |

### Profesional / revânzare

Decoz: desktop $159–$249 one-time; online-professional $89 + taxă per raport
($0.65–$8.65, la retail $2.75–$49.95); **drept de revânzare $99 la 50% comision sau
$299 la 70%**.

---

## 5. Unde stai bine — și e verificabil

1. **Româna nu există în nicio aplicație internațională de numerologie.** Verificat în
   listele de limbi din App Store: World Numerology, Numerology & Astrology — engleză
   exclusiv. Cea mai bine cotată din categorie (Numerology: Rediscover Yourself, 4,8★,
   2,3K recenzii) are opt limbi, printre care croata și sârba — mai mici decât româna.
   Limba e un vector care funcționează, nu o ipoteză. În română concurezi cu PDF-uri de
   310 lei livrate pe email în 24–48 de ore.
2. **Sisteme paralele ca produs.** Numerologist, World Numerology și Token Rock sunt
   exclusiv pitagoreice. Singurul care calculează toate patru sisteme (OurNakshatra) le dă
   gratis și **nu le juxtapune**. Tu calculezi distanța dintre răspunsuri și o explici.
3. **Contradicția ca subiect.** Nu s-a găsit niciun produs care să trateze explicit
   tensiunea internă a unei hărți. Rapoartele concurenței sunt liste secvențiale de numere,
   vândute la kilogram de pagini. Capitolul 2 al tău nu are echivalent observabil.
   *(Judecată după copy-ul de vânzare, nu după rapoarte cumpărate.)*
4. **Fricțiune zero.** Harta întreagă, fără cont și fără email. Doar Numerologist mai face
   ceva similar (preview fără email); restul cer măcar adresa.
5. **Ton onest.** Piața vinde „Truths" și „Soul's Secret Code", în timp ce Pew arată că 20%
   din adulții americani o fac „mostly just for fun" și doar 1% se bazează serios pe ea.
   Există o discrepanță între cum se vinde categoria și cum o consumă piața.

---

## 6. Unde stai prost

1. **Prețurile decise sunt peste banda categoriei.** Planul cere Hartă 29 €/an și Atlas
   59 €/an. World Numerology vinde **tot** la $35/an și lifetime la $59. Atlas la 59 €/an
   costă cât lifetime-ul concurentului cel mai complet din nișă. Numerologia se vinde la o
   treime din prețul astrologiei — asta e o constrângere a categoriei, nu o alegere de
   poziționare. SKU-ul unic „Harta completă, 24 €" e, în schimb, exact în banda mediană.
2. **Categoria e mobile-first, tu ești web.** Co–Star are 206.000 de recenzii pe App Store.
   Nu ai aplicație nativă și nu ai canal de distribuție în magazine.
3. **Pâlnia nu există.** Pagina de rezultat nu are nicio chemare către cont — nici
   „salvează harta", nici captare de email. Livrezi tot ce ai mai bun, gratuit și anonim,
   și omul pleacă fără urmă. Ăsta e cel mai mare gol comercial din produs.
4. **Trafic zero.** Domeniu nou, fără istoric SEO, fără conținut de achiziție, fără
   prezență socială. Toate produsele de mai sus au ani de trafic în spate.
5. **Unde sunt banii mari nu ești.** Astrotalk face ~$145M pe an din **consultații umane**,
   nu din rapoarte. Sanctuary vinde 10 minute cu un om la $49,99. Piața plătește cel mai
   bine pentru o persoană, nu pentru un algoritm.
6. **Costul AI e neplafonat.** 15 cereri/oră/utilizator către Anthropic, pe cheia ta,
   gratuit pentru orice cont.

---

## 7. Ce blochează producția (din auditul tehnic)

1. Niciun procesator de plăți. `/api/subscriptions/purchase` are `TODO` și primește prețul
   **din client**. Toate rutele de billing răspund 403 cât `ALLOW_BILLING` e nesetat.
2. `/raport` e public și vinde Premium 99,99 €/an și Pro 199,99 €/an cu butoane care dau
   403 — și prețurile contrazic decizia din Etapa 7.
3. `RESEND_API_KEY` nesetat, dar înregistrarea e deschisă: cont fără verificare de email și
   fără resetare de parolă.
4. Zero backup pe baza compass.
5. Fără plafon de cost pe consultantul AI.

Ce e deja în regulă: HTTPS prin tunel, baza migrată complet (018 inclusiv), retenția GDPR
programată zilnic, pagini legale în trei limbi, Plausible fără cookie-uri, rate limiting pe
IP și pe utilizator, sesiuni invalidate la schimbarea parolei.

---

## 8. Ce nu știm și n-ar trebui construit pe presupuneri

- **Mărimea pieței.** Patru firme de research dau pentru 2026 cifre între $1,26 mld și
  $8,28 mld — un factor de 6,6×. Nu există o cifră credibilă.
- **Descărcări sau venituri pentru vreo aplicație din nișă.** Sursele sunt paywalled.
- **„29% dintre americani plătesc lunar pentru astrologie"** (atribuit Harris Poll 2024) —
  neverificat, și contrazis de Pew, unde doar 6% consultă săptămânal. Nu construi pe ea.
- **Dacă rapoartele concurenței chiar nu explică contradicțiile.** Judecata vine din
  descrierile de produs. Certitudinea costă $17 + $19,97 și două ore de citit.
- **Dacă cineva plătește pentru numerologie în română.** Nimeni n-a încercat la scară.
  Secretul Numerelor cere 310 lei și există în continuare, ceea ce e un semnal, nu o dovadă.

---

## Surse

Numerologist.com · World Numerology / Hans Decoz (app, software, prețuri profesionale,
program de revânzare) · Token Rock · Astro-Seek · OurNakshatra · Cafe Astrology ·
Secretul Numerelor · App Store (Co–Star, The Pattern, CHANI, Sanctuary, AstroSage,
World Numerology Collection II, Numerology: Rediscover Yourself, Numerology & Astrology,
Нумерология по дате рождения) · Pew Research Center, mai 2025 · Outlook Business
(Astrotalk FY25).
