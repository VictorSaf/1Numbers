# Filtrul — fiecare ecran prin definiție

Trei verdicte: **RĂMÂNE** (servește doctrina), **SE MUTĂ** (are substanță, dar nu locul),
**DISPARE**. Motivul e scris lângă fiecare; un verdict fără motiv se poate contesta.

Verdictele marcate **[de decis]** sunt propuneri, nu hotărâri luate.

## Suprafețe publice

| Ecran | Verdict | De ce |
|---|---|---|
| `/` Harta | **RĂMÂNE — devine coloana vertebrală** | E produsul. Dar se reordonează: vezi mai jos. |
| `/doi` Voi doi | **RĂMÂNE — a doua ca importanță** | Singura pagină care arată dezacordul dintre două sisteme pe o relație. Scoate procentul de sinteză din frontispiciu (R1). |
| `/azi` Azi | **RĂMÂNE — se rescrie ca ciocnire** | Ziua personală contra anului personal, sub litera care tranzitează. Un buletin zilnic generic nu ne diferențiază de nimeni. |
| `/invata` Învață | **SE REDUCE** | Ghidul numerelor rămâne — e vocabularul necesar ca să citești harta. Tutorialele rămân. **Articolele dispar**: au corpul de o propoziție și poartă etichetă „10 min". |
| `/unelte` Unelte | **DISPARE ca hol de opt unelte** | Vezi secțiunea următoare. |
| `/remedies` Remedii | **[de decis]** | Bogat, tradus complet, dar e alt produs — sfat vedic, nu juxtapunere. Fie devine un capitol al hărții pentru cine vrea „ce fac cu asta", fie iese. Azi oricum nu e în navigație. |
| `/chaldean` | **SE MUTĂ în capitolul 6** | E un sistem paralel. Locul lui e lângă celelalte, nu într-o pagină singură. |
| `/raport` (Premium) | **DISPARE în forma actuală** | Vinde tiere care nu există, cu butoane care dau 403. Ce urmează acolo se decide separat. |

## Cele opt unelte

| Unealtă | Verdict | De ce |
|---|---|---|
| Optimizator de nume | **DISPARE** | Algoritmul adaugă o literă la sfârșitul numelui: „Popescuh", „Popescue". Nu e reparabil prin ajustare — ideea însăși e greșită. |
| Matrice de compatibilitate | **DISPARE** | Promite „fiecare pereche dintr-un grup", cere o singură dată de naștere, întoarce nouă procente fără etichete. Grupurile sunt, eventual, o extindere a lui `/doi`, nu o unealtă. |
| Calendar numerologic | **SE MUTĂ în `/azi`** | E aceeași informație, desfășurată pe o lună. Două locuri pentru același calcul divergează. |
| Prognoză anuală | **SE MUTĂ în capitolul 4** | „Unde ești acum" are deja anul; luna cu luna îi aparține. |
| Grila Lo Shu | **SE MUTĂ în capitolul 3** | „Ce îți lipsește" e deja întrebarea capitolului. Repară întâi regula planurilor (`total <= 3` face un plan aproape gol să pară echilibrat). |
| Numere de înger | **[de decis]** | E cea mai căutată intrare din categorie pe Google, deci are valoare de achiziție — dar n-are legătură cu doctrina. Fie rămâne ca pagină de intrare declarată ca atare, fie iese. |
| Nume de firmă | **[de decis]** | Funcționează bine, dar e alt public (antreprenori). Candidat pentru mai târziu, ca produs separat. |
| Schimbare de nume | **SE MUTĂ în capitolul 1** | „Ce se schimbă dacă îți schimbi numele" e o întrebare despre identitate, exact ce e capitolul 1. |

## Harta — noua ordine

Azi: citirea întreagă, apoi capitolele 1–6, cu lista de numere prima și contradicția a doua.
Problema: **capitolul 1 e partea identică cu a oricui din piață**, iar ce ne diferențiază
stă dedesubt.

Propunere:

1. **Tensiunea** — o propoziție, cea mai ascuțită contradicție din hartă, plus dovada ei.
2. **Unde harta răspunde de două ori** — sistemele paralele, ridicate din interiorul unui capitol la rang de capitol.
3. **Cine ești** — numerele de bază, ca vocabular pentru ce s-a spus mai sus.
4. **Ce îți lipsește** — absențele, lecțiile, Lo Shu.
5. **Unde ești acum** — anul, luna, ziua, esența, tranzitul.
6. **Ce urmează** — pinnacles, cicluri, tranzite pe ani.
7. **Alte tradiții** — vedic, kabbalah, caldeean, matrița.

Regula care ține ordinea: **fiecare capitol răspunde la o întrebare pe care omul și-o pune
singur**, nu la un termen tehnic pe care i-l predăm noi.

## Zona de cont

| Ecran | Verdict | De ce |
|---|---|---|
| Crearea hărții proprii | **SE REPARĂ ÎNTÂI** | `POST /api/profiles/me` cu `category: 'eu'` răspunde 403 `admin_only`, dar formularul e afișat complet. Orice cont nou lovește un zid. Fără asta, restul zonei de cont nu există. |
| Hărți salvate (`/eu`) | **RĂMÂNE** | Mai multe hărți — a ta, a cuiva apropiat, a unui copil — e chiar cererea naturală după prima citire. |
| Consultant AI | **RĂMÂNE — repus în voce** | Primește dezacordurile calculate ca material, nu doar cifrele (R4). Are nevoie de plafon de cost. |
| Jurnal | **SE REFACE ca „ține sau nu ține"** | Un jurnal generic n-are motiv. O întrebare pe zi despre **contradicția ta numită**, cu da/nu/azi nu, are: după o lună, aplicația îți arată dacă tensiunea se vede în viața ta. Vezi `04-extinderi.md`. |
| Cercul meu (prieteni) | **[de decis], înclinat spre amânare** | Corect tehnic, inert fără oameni și fără email funcțional. Nu e blocant pentru nimic. |
| Notificări push | **AMÂNĂ** | N-are ce anunța până nu există ciocnirea zilnică. |
| Export PDF | **SE REFACE** | Singurul lucru pe care omul îl păstrează. Azi: font fără diacritice și fără chirilic, titluri hardcodate în engleză, paleta mov scoasă demult. |
| Partajare | **SE REPARĂ** | Numele complet și data nașterii stau azi în query string-ul linkului. |

## Cod care dispare odată cu ecranele

`gamification.ts` (740 de linii, zero importatori) cu rutele și migrația lui ·
`premium.ts` + `PricingCards.tsx` (structura veche pe trei tiere) ·
`pdfExport.ts` (752 de linii, importat doar de pagina internă de white-label) ·
`applied.ts` din `numerology-plus` (telefon, adresă, număr de înmatriculare — calculate,
netrimise nicăieri) · dublura `src/lib/chaldean.ts` · stratul React din `design-system/`.

Regula: **se șterge în același commit cu ecranul care îl folosea.**
