# Doctrina — mecanismul și regulile

## Ideea, în trei propoziții

Un sistem divinatoriu produce mai multe numere despre același om. Unele dintre ele
**răspund la aceeași întrebare, pe drumuri diferite**. Când drumurile nu ajung în același
loc, **distanța dintre ele e informația**.

Comentariul din `src/lib/disagreements.ts` e formularea canonică și rămâne așa:

> Dezacordul NU e o eroare de calcul. Fiecare cale e corectă în sistemul ei — ce diferă e
> din ce se citește: din dată sau din nume, prin alfabetul pitagoreic sau prin cel
> caldeean, cu componentele reduse separat sau împreună. Când două căi corecte dau
> răspunsuri diferite, diferența e chiar informația.

## Cele trei forme, așa cum sunt implementate

### 1. Punți — contradicția înăuntrul aceluiași sistem
`src/lib/numerology-plus/content/contradiction.ts`

Două perechi: Drum ↔ Destin, Suflet ↔ Personalitate. Distanța e chiar numărul punții,
care există deja în profil. Modulul nu calculează nimic nou — compune propoziția care pune
cele trei fapte unul lângă altul.

> „O punte de 0 nu e un eșec de a găsi tensiune; e răspunsul. Cele două părți sunt de
> acord, iar a spune asta valorează cât a numi un gol."

### 2. Sisteme paralele — aceeași întrebare, alt drum
`src/lib/disagreements.ts`

| Întrebarea | Calea A | Calea B |
|---|---|---|
| Despre ce e anul ăsta? | An personal — din dată | Esența — din literele numelui active la vârsta ta |
| Ce direcție are viața ta? | Drumul Vieții — părțile reduse separat | Bhagyank vedic — toate cifrele adunate deodată |
| Ce ai de făcut cu ce ți s-a dat? | Expresia — alfabet pitagoreic 1–9 | Naamank — alfabet caldeean 1–8 |
| Cum te văd oamenii? | Personalitatea — consoanele | Atitudinea — luna și ziua |

Verdictul e `agree` / `near` / `apart`, din distanța redusă la 0–8, ca la punți.

### 3. Absențe — ce lipsește, pe două drumuri
Ce lipsește din nume față de ce lipsește din dată. **Ce lipsește din amândouă e cel mai
tare semnal din hartă** — nici numele, nici data nu-l susțin.

### 4. Toate școlile — aceeași întrebare, fiecare convenție
`src/lib/models/`

Decizia din 2026-10-12: **aplicația implementează orice tehnică găsită în piață sau în
literatură**, iar unde școlile, aplicațiile sau autorii dau valori diferite pentru același
element, **le arată pe toate, cu calculul fiecăreia, și calculează distanța dintre ele**.
Judecăm nu după o singură școală, ci după diferențele dintre ele — asta e valoarea unică.

Convențiile contestate care azi se aleg în tăcere în fiecare aplicație: ordinea reducerii,
unde se păstrează masterii, Y vocală sau nu, alfabetul pitagoreic sau caldeean, anul
personal de la 1 ianuarie sau de la aniversare, reducerea peste 22 în Matrice, regula de
după 2000 în psihomatrice, formula Kua, tabelele de compatibilitate. Fiecare devine un
model, cu nume și sursă.

**Capcana de aritmetică:** rădăcina digitală nu depinde de ordinea reducerii. Două drumuri
care diferă doar prin păstrarea unui master (2 contra 11) nu sunt la distanța 9; sunt
aceeași rădăcină în alt registru — verdictul `octave`.

## Regulile de care nu ne abatem

**R1. Nu facem medii.** O medie între un 1 pitagoreic și un 5 caldeean nu înseamnă nimic:
sunt două lecturi ale aceluiași nume prin alfabete formate în locuri diferite. Un procent
de sinteză afișat mai mare decât dezacordul de dedesubt e o minciună — vezi `/doi` azi,
„86%, Excelent, energiile voastre se completează perfect", cu „ei nu sunt de acord" două
secțiuni mai jos.

**R2. Acordul e un rezultat, nu o lipsă de rezultat.** „Amândouă căile dau 3. Rar, și
înseamnă că aici n-ai ce împăca." Se scrie cu aceeași greutate ca un dezacord.

**R3. O distanță nu e o eroare și nu e un defect al omului.** De aceea tokenii de culoare
sunt `--tension` și `--harmony`, nu `--crit` și `--ok`. O punte de 6 e o distanță, nu o
avarie.

**R4. O singură voce.** Motorul, textul zilei, consultantul AI și pagina de compatibilitate
spun același lucru despre aceleași numere. Azi nu: motorul zice „9 lângă 3 nu se rezolvă,
se traversează", iar modelul zice „nu sunt numere în conflict". Modelul primește
dezacordurile calculate ca material de intrare, nu doar cifrele.

**R5. Fiecare afirmație e urmărită până la cifrele din care vine.** Dacă un text nu poate
arăta cele două numere și distanța, e text generic și nu are ce căuta în produs.

**R6. Ce nu se folosește, nu se cere.** Nu colectăm ora și locul nașterii ca să nu le
folosim nicăieri. Nu punem numele și data nașterii într-un URL de partajare. Nu arătăm un
buton care dă 403.

**R7. Simbolic, spus deschis.** Disclaimerul stă pe fiecare pagină, nu doar în Termeni.
Nu numim numerologia „știință" — azi o facem, în primul articol din `/invata`.

**R8. O singură diagramă per capitol, și numai dacă arată o relație.** O diagramă care
repetă o listă de cifre e decor.

**R9. Nicio convenție tăcută.** Unde școlile se despart, nu alegem una pentru om: o arătăm
pe fiecare, cu sursa și pașii ei, și distanța dintre ele. Unde se pun de acord, spunem și
asta (R2).

## De ce ține — și ce o poate strica

Ține pentru că **structura e imună la textul generic**: combinația de distanțe diferă de la
om la om, deci un text compus din ele nu poate fi schimbat între două persoane. Și pentru
că e greu de copiat: un concurent are nevoie de patru sisteme complete care vorbesc între
ele; toți rulează unul singur.

O strică: procentele de sinteză în capul paginii, textul de dicționar așezat deasupra
interpretării specifice, vocea de oracol („codul secret al sufletului tău"), și o funcție
nouă care alege în tăcere o singură convenție acolo unde școlile se despart.
