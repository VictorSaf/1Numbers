# numerology-plus

Motorul complet pentru Fazele A, B și C din specul Compass. Zero dependențe, TypeScript strict, 78 de teste care trec.

## Instalare

Copiază `src/` în proiect, de exemplu `src/lib/numerology-plus/`. Nimic de instalat.

```ts
import { fullProfile } from '@/lib/numerology-plus';

const p = fullProfile('Victor Ion Safta', { day: 25, month: 8, year: 1990 }, { gender: 'male' });
```

## Ce conține

| Fișier | Conținut |
|---|---|
| `core.ts` | Reducere cu `raw`+`value`, tabele de litere (Pitagoreic / Chaldean / Kabbalah), normalizare cu diacritice RO, tratarea lui Y, convențiile contestate ca **constante cu nume explicit** |
| `pythagorean.ts` | Faza A completă — 14 numere noi, Planurile de Expresie, Ciclurile de Viață, Tranzite + Esență („Dualities"), detecție de datorii karmice pe 6 poziții |
| `systems.ts` | Faza B — Vedic (Mulank / Bhagyank / Naamank + Navagraha + name correction), Kua, Kabbalah (ambele variante), Chaldean cu numere compuse, biorritmuri |
| `matrix.ts` | Matrița Destinului — octagrama pe 22 de arcane, grafic pe decade, compatibilitate |
| `applied.ts` | Faza C — adresă, telefon, plăcuță, nume de bebeluș, motor homofonic, schimbare de nume, compatibilitate ponderată |
| `content/arcana.ts` | 22 de arcane × RO/EN/RU × 5 câmpuri + 9 rame de poziție. 555 de stringuri, validate |
| `__tests__/engine.test.ts` | 78 de aserțiuni, inclusiv exemplele de referință publicate |

## Decizii care trebuie asumate conștient

Fiecare e o constantă exportată. Sursele din piață se contrazic real — nu există răspuns corect, doar unul documentat.

| Constantă | Fișier | Implicit | Alternativa |
|---|---|---|---|
| `Y_VOWEL_MODE` | `core.ts` | `'heuristic'` | `'never'` / `'always'` |
| `KEEP_MASTER_33` | `core.ts` | `true` | `false` (Decoz clasic reduce 33 → 6) |
| `MATRIX_REDUCTION` | `matrix.ts` | `'digitsum'` (25→7) | `'mod22'` (25→3) |
| `KUA_ERA` | `systems.ts` | `'classic'` | `'century'` (formulă diferită după 2000) |

## Ce trebuie validat înainte de producție

1. **`PLANE_OF_LETTER` și `NATURE_OF_LETTER`** (`pythagorean.ts`) — tabelul original Decoz e proprietar; acesta e reconstruit din charturi publicate. Rulează 3–5 nume pe worldnumerology.com și compară.
2. **Matrița Destinului, punctele derivate** (`destinyMatrixExperimental`) — reconstrucție dintr-o singură sursă, marcată `confidence: 'low'`. Ține-o în spatele unui flag până o validezi contra unui raport plătit. Octagrama de bază (A–I) e consens ferm, verificată pe exemplul publicat 25.08.1990 → A=7, B=8, C=19, D=7, E=5.
3. **`HARMONY_MATRIX`** (`applied.ts`) — niciun concurent nu publică valorile. Aceasta e a noastră, derivată din grupe de elemente, consecventă și documentată. Ajusteaz-o dacă vrei alt profil de scor.

## Teste

```bash
npm run test:run -- src/lib/numerology-plus   # motorul + conținutul
```

Cele 78 de aserțiuni ale motorului sunt în `__tests__/engine.test.ts`;
completitudinea conținutului e verificată de `__tests__/content.test.ts`.

## Ce urmează (nu e în pachet)

- Interpretări RO/EN/RU pentru cele 14 numere noi
- Directorul de numere înger (000–999, 1111–9999) cu rută per număr
- Randare SVG a octagramei și a grilei Planurilor de Expresie
- Generatorul de carduri partajabile (Canvas)

---

## Tranșa 2 — conținut și interpretări

| Fișier | Conținut |
|---|---|
| `content/archetypes.ts` | 13 arhetipuri (1–9, 11, 22, 33, 0) × RO/EN/RU × 5 câmpuri — **sursa unică de adevăr** pentru toate interpretările |
| `content/frames.ts` | 14 rame de context, una per calcul nou. Șabloane cu `{essence}` / `{strength}` / `{shadow}` |
| `content/letters.ts` | 26 de litere × 3 limbi — pentru Piatra de Temelie, Piatra de Vârf, Prima Vocală |
| `content/interpret.ts` | Motorul de compunere: ramă + arhetip → interpretare |
| `content/arcana.ts` | 22 de arcane pentru Matrița Destinului |

### De ce compus și nu scris separat

14 calcule × 12 valori × 3 limbi = **504 texte**. Scrise de mână, ar diverge și s-ar contrazice.
Compuse, ies din **237 de stringuri** scrise o singură dată — și dacă schimbi arhetipul „7",
se actualizează peste tot unde apare 7, în toate limbile, instantaneu.

Verificat: **546 de combinații ramă × arhetip × limbă, 0 incomplete**, niciun placeholder nerezolvat.

```ts
import { fullPythagoreanProfile, interpretProfile, interpretLetters } from '@/lib/numerology-plus';

const p = fullPythagoreanProfile('Victor Ion Safta', { day: 25, month: 8, year: 1990 });
const texte = interpretProfile(p, 'ro');   // 11 interpretări gata de randat
const litere = interpretLetters(p, 'ro');  // 3, cu trăsătura literei
```

