import { describe, it, expect } from "vitest";
import { buildDial, dialPosition } from "@/lib/dial";
import { findDisagreements } from "@/lib/disagreements";
import { calculateLifePathNumber } from "@/lib/numerology";

/**
 * Cadranul: harta așezată pe cele nouă cifre.
 *
 * E figura din capul paginii și ecoul care revine în capitolele 2 și 3, deci
 * datele ei nu se desenează de mână -- ies din profil. Ce se testează aici e
 * exact ce n-ar da typecheck-ul: că numerele cad pe poziția lor, că un maestru
 * nu se pierde, că absențele sunt cele pe care le raportează motorul, și că
 * coarda desenată e chiar puntea cea mai largă.
 */

const NAME = "Maria Elena Popescu";
const BIRTH = new Date(1990, 4, 15);
const TODAY = new Date(2026, 8, 2);

describe("buildDial", () => {
  it("adună numerele de bază pe poziția lor de pe inel", () => {
    const dial = buildDial(NAME, BIRTH, "ro", TODAY);

    // Harta ei e 3 / 3 / 9 / 3, plus anul personal 3: patru pe 3, unul pe 9.
    const three = dial.points.find((p) => p.n === 3);
    const nine = dial.points.find((p) => p.n === 9);

    expect(three?.weight).toBe(4);
    expect(nine?.weight).toBe(1);
    expect(nine?.labels).toEqual(["Sufletul"]);
    expect(three?.labels).toHaveLength(4);
  });

  it("nu inventează puncte pe cifrele pe care nu cade nimic", () => {
    const dial = buildDial(NAME, BIRTH, "ro", TODAY);
    expect(dial.points.map((p) => p.n).sort()).toEqual([3, 9]);
  });

  it("așază un maestru pe poziția redusă, fără să-i piardă valoarea", () => {
    // 6.1.1975 dă Drumul Vieții 11. Inelul are nouă locuri, deci 11 stă pe 2 --
    // dar dacă figura ar scrie 2, ar minți: 11 nu e 2.
    const birth = new Date(1975, 0, 6);
    expect(calculateLifePathNumber(birth)).toBe(11);

    const dial = buildDial(NAME, birth, "ro", TODAY);
    const drum = dial.points.find((p) => p.labels.includes("Drumul Vieții"));

    expect(drum?.n).toBe(2);
    expect(drum?.master).toBe(11);
  });

  it("marchează cifrele care lipsesc și din nume, și din dată", () => {
    const dial = buildDial(NAME, BIRTH, "ro", TODAY);
    // Aceeași sursă ca la „unde harta se răspunde de două ori": o a doua
    // definiție a absenței ar începe să se contrazică cu prima.
    expect(dial.missing).toEqual(findDisagreements(NAME, BIRTH, "ro", TODAY).missing.both);
    expect(dial.missing).toEqual([2, 8]);
  });

  it("desenează puntea cea mai largă, nu prima găsită", () => {
    const dial = buildDial(NAME, BIRTH, "ro", TODAY);

    // Drum 3 ↔ Destin 3 e 0; Suflet 9 ↔ Chip 3 e 6. Se desenează a doua.
    expect(dial.chord).not.toBeNull();
    expect(dial.chord?.distance).toBe(6);
    expect([dial.chord?.from, dial.chord?.to].sort()).toEqual([3, 9]);
  });

  it("nu desenează nicio coardă când ambele punți sunt închise", () => {
    // O coardă de lungime zero ar fi un punct pe un punct: zgomot, nu măsură.
    const dial = buildDial("Ana Ana", new Date(1990, 4, 15), "ro", TODAY);
    if (dial.chord) expect(dial.chord.distance).toBeGreaterThan(0);
  });
});

describe("dialPosition", () => {
  it("pune cele nouă locuri egal depărtate, cu 1 în vârf", () => {
    const one = dialPosition(1);
    expect(one.x).toBeCloseTo(0, 6);
    expect(one.y).toBeCloseTo(-1, 6);

    // Toate pe cercul unitate.
    for (let n = 1; n <= 9; n++) {
      const p = dialPosition(n);
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(1, 6);
    }

    // Egal depărtate: 360/9 = 40°.
    const a = (n: number) => (Math.atan2(dialPosition(n).y, dialPosition(n).x) * 180) / Math.PI;
    expect(((a(2) - a(1) + 360) % 360)).toBeCloseTo(40, 4);
  });
});
