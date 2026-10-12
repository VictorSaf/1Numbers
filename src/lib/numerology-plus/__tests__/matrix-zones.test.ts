import { describe, it, expect } from 'vitest';
import {
  matrixZones,
  karmicTailCells,
  ageLine,
  exactAge,
  coupleMatrix,
  compareReductions,
  compareModels,
  destinyMatrix,
  type MatrixZone,
} from '../matrix';

/**
 * Zonele derivate ale Matriței Destinului, verificate pe exemplele numerice
 * publicate de surse (citate în matrix.ts), nu pe numere inventate aici.
 */

const cell = (zones: MatrixZone[], id: string, key: string) => {
  const z = zones.find((x) => x.id === id);
  if (!z) throw new Error(`no zone ${id}`);
  const c = z.cells.find((x) => x.key === key);
  if (!c) throw new Error(`no cell ${id}.${key}`);
  return c.value;
};

// matrixdestiny.io/en/love-line: 25.11.2002 → A7 B11 C4 D22 E8, love 3-18-15.
const NOV = { day: 25, month: 11, year: 2002 };

describe('canalul de bani și canalul iubirii (Ladini)', () => {
  const z = matrixZones(NOV, 'digitsum');

  it('linia iubirii = D1 → inimă → X (3-18-15, exemplul publicat)', () => {
    expect(cell(z, 'love.ladini', 'entry')).toBe(3);
    expect(cell(z, 'love.ladini', 'heart')).toBe(18);
    expect(cell(z, 'love.ladini', 'center')).toBe(15);
  });

  it('linia banilor = X → dolar → C1 (15-9-12)', () => {
    expect(cell(z, 'money.ladini', 'center')).toBe(15);
    expect(cell(z, 'money.ladini', 'dollar')).toBe(9);
    expect(cell(z, 'money.ladini', 'entry')).toBe(12);
  });

  it('varianta pe axe: banii = sus + jos, iubirea = stânga + dreapta', () => {
    expect(cell(z, 'money.axes', 'dollar')).toBe(6); // 11 + 22 = 33 → 6
    expect(cell(z, 'love.axes', 'heart')).toBe(11); // 7 + 4
  });

  it('fiecare celulă își arată pașii, iar pasul dă valoarea', () => {
    for (const zone of z)
      for (const c of zone.cells) {
        expect(c.step.terms.length, `${zone.id}.${c.key}`).toBeGreaterThan(0);
        expect(c.step.raw).toBe(c.step.terms.reduce((a, t) => a + t.value, 0));
      }
  });
});

describe('coada karmică', () => {
  it('15.06.1990 → 12, 16, 4 (synastrychart.org)', () => {
    const z = matrixZones({ day: 15, month: 6, year: 1990 }, 'digitsum');
    expect(cell(z, 'karmicTail.ladini', 'D1')).toBe(12);
    expect(cell(z, 'karmicTail.ladini', 'D2')).toBe(16);
    expect(cell(z, 'karmicTail.ladini', 'D')).toBe(4);
  });

  it('03.10.1974 → 12-19-7 în ambele modele (vratamir.com)', () => {
    const z = matrixZones({ day: 3, month: 10, year: 1974 }, 'digitsum');
    for (const id of ['karmicTail.ladini', 'karmicTail.vratamir'])
      expect([cell(z, id, 'D1'), cell(z, id, 'D2'), cell(z, id, 'D')]).toEqual([12, 19, 7]);
  });

  it('D16 E14: Ladini dă 3-19-16, vratamir (sumă nereduse) dă 3-10-16', () => {
    const ladini = karmicTailCells(16, 14, 'ladini', 'digitsum');
    const vrata = karmicTailCells(16, 14, 'vratamir', 'digitsum');
    expect(ladini.map((c) => c.value)).toEqual([3, 19, 16]);
    expect(vrata.map((c) => c.value)).toEqual([3, 10, 16]);
  });
});

describe('linii de neam și destinații (Pribylova, 22-arkana.ru)', () => {
  const z = matrixZones(NOV, 'digitsum');
  it('linia tatălui = F + I, a mamei = G + H', () => {
    expect(cell(z, 'ancestry', 'father')).toBe(8); // 18 + 8 = 26 → 8
    expect(cell(z, 'ancestry', 'mother')).toBe(8); // 15 + 11 = 26 → 8
  });
  it('personal = cer + pământ; social = tată + mamă; spiritual; planetar', () => {
    expect(cell(z, 'purposes', 'sky')).toBe(6);
    expect(cell(z, 'purposes', 'earth')).toBe(11);
    expect(cell(z, 'purposes', 'personal')).toBe(17);
    expect(cell(z, 'purposes', 'social')).toBe(16);
    expect(cell(z, 'purposes', 'spiritual')).toBe(6);
    expect(cell(z, 'purposes', 'planetary')).toBe(22);
  });
  it('darul principal = centrul E', () => {
    expect(cell(z, 'gift', 'E')).toBe(8);
  });
});

describe('harta chakrelor (simbolică)', () => {
  const z = matrixZones(NOV, 'digitsum');
  it('numefy: Fizic / Energie / Emoții, cu totalul', () => {
    const id = 'chakras.numefy';
    expect([cell(z, id, 'sahasrara.physics'), cell(z, id, 'sahasrara.energy'), cell(z, id, 'sahasrara.emotions')]).toEqual([7, 11, 18]);
    expect([cell(z, id, 'ajna.physics'), cell(z, id, 'ajna.energy'), cell(z, id, 'ajna.emotions')]).toEqual([22, 3, 7]);
    expect([cell(z, id, 'vishuddha.physics'), cell(z, id, 'vishuddha.energy'), cell(z, id, 'vishuddha.emotions')]).toEqual([15, 19, 7]);
    expect([cell(z, id, 'anahata.physics'), cell(z, id, 'anahata.energy'), cell(z, id, 'anahata.emotions')]).toEqual([5, 9, 14]);
    expect([cell(z, id, 'manipura.physics'), cell(z, id, 'manipura.energy'), cell(z, id, 'manipura.emotions')]).toEqual([8, 8, 16]);
    expect([cell(z, id, 'svadhisthana.physics'), cell(z, id, 'svadhisthana.energy'), cell(z, id, 'svadhisthana.emotions')]).toEqual([12, 3, 15]);
    expect([cell(z, id, 'muladhara.physics'), cell(z, id, 'muladhara.energy'), cell(z, id, 'muladhara.emotions')]).toEqual([4, 22, 8]);
    expect([cell(z, id, 'total.physics'), cell(z, id, 'total.energy'), cell(z, id, 'total.emotions')]).toEqual([10, 12, 22]);
  });
  it('gadalkindom: a doua coloană e emoția, suma e energia', () => {
    const id = 'chakras.gadalkindom';
    expect(cell(z, id, 'sahasrara.physics')).toBe(7);
    expect(cell(z, id, 'sahasrara.emotions')).toBe(11);
    expect(cell(z, id, 'sahasrara.energy')).toBe(18);
  });
  it('e marcată simbolic, nu medical', () => {
    expect(z.find((x) => x.id === 'chakras.numefy')!.symbolic).toBe(true);
  });
});

describe('comparația dintre modele', () => {
  it('coada: un singur loc unde modelele diferă, cu distanța pe scara arcanelor', () => {
    const pairs = compareModels(matrixZones({ day: 3, month: 10, year: 1974 }, 'digitsum'));
    const tail = pairs.find((p) => p.family === 'karmicTail')!;
    expect(tail.cells.every((c) => c.pairs[0].distance === 0)).toBe(true);
  });
  it('chakre: fizicul e de acord, energia și emoția se despart', () => {
    const fam = compareModels(matrixZones(NOV, 'digitsum')).find((p) => p.family === 'chakras')!;
    const sah = (k: string) => fam.cells.find((c) => c.key === k)!.pairs[0];
    expect(sah('sahasrara.physics').verdict).toBe('agree');
    expect(sah('sahasrara.energy').distance).toBe(7); // 11 vs 18
  });
});

describe('ambele reduceri', () => {
  it('fiecare celulă are digitsum, mod22 și distanța lor', () => {
    const rows = compareReductions(NOV);
    const dollar = rows.find((r) => r.id === 'money.ladini')!.cells.find((c) => c.key === 'dollar')!;
    expect(dollar.digitsum).toBe(9); // 27 → 9
    expect(dollar.mod22).toBe(2); // mod22: A=3, E=14, C1=18, X=6, 6+18=24 → 2
    expect(dollar.distance).toBe(7);
    expect(dollar.verdict).toBe('apart');
    expect(dollar.steps.digitsum.raw).toBe(27);
  });
  it('acoperă toate zonele', () => {
    expect(compareReductions(NOV).map((r) => r.id)).toEqual(matrixZones(NOV).map((z) => z.id));
  });
});

describe('linia vârstei 0–80', () => {
  const line = ageLine(NOV, 'digitsum');
  it('8 decade × 8 puncte + capătul de 80', () => {
    expect(line.points).toHaveLength(65);
    expect(line.points[0].age).toBe(0);
    expect(line.points[64].age).toBe(80);
    expect(line.points[64].arcana).toBe(destinyMatrix(NOV).byKey.A);
  });
  it('bisecție: 5 = 0 + 10, 2,5 = 0 + 5, 1–2 = 0 + 2,5 (Pribylova)', () => {
    const at = (a: number) => line.points.find((p) => p.age === a)!.arcana;
    expect(at(0)).toBe(7);
    expect(at(10)).toBe(18);
    expect(at(5)).toBe(7); // 25 → 7
    expect(at(2.5)).toBe(14);
    expect(at(7.5)).toBe(7);
    expect(at(1.25)).toBe(21);
    expect(at(3.75)).toBe(21);
    expect(at(6.25)).toBe(14);
    expect(at(8.75)).toBe(7);
    expect(at(20)).toBe(11);
    expect(at(40)).toBe(4);
    expect(at(60)).toBe(22);
  });
  it('etichetele urmează calculatoarele (1–2, 2–3, 3–4, 5, 6–7…)', () => {
    expect(line.points.slice(0, 8).map((p) => p.label)).toEqual(['0', '1–2', '2–3', '3–4', '5', '6–7', '7–8', '8–9']);
    expect(line.points[9].label).toBe('11–12');
  });
  it('marchează vârsta curentă', () => {
    expect(ageLine(NOV, 'digitsum', 23.9).current).toBe(line.points.findIndex((p) => p.age === 23.75));
    expect(ageLine(NOV, 'digitsum', 85).current).toBeNull();
    expect(exactAge(NOV, new Date(2026, 10, 24))).toBeCloseTo(23.99, 1);
  });
});

describe('matricea cuplului', () => {
  const a = { day: 25, month: 11, year: 2002 };
  const b = { day: 15, month: 6, year: 1990 };
  it('fiecare punct = suma punctelor celor doi, redusă (human-design.space)', () => {
    const m = coupleMatrix(a, b, 'digitsum');
    const pa = destinyMatrix(a).byKey, pb = destinyMatrix(b).byKey;
    expect(m.byKey.E).toBe(16); // 8 + 8
    expect(m.byKey.D).toBe(8); // 22 + 4 = 26 → 8
    for (const k of Object.keys(pa)) {
      const raw = pa[k] + pb[k];
      expect(m.byKey[k], k).toBe(raw > 22 ? String(raw).split('').reduce((s, d) => s + +d, 0) : raw);
    }
  });
  it('coada cuplului în ambele modele (vratamir: 3-10-16)', () => {
    const tail = karmicTailCells(7 + 9, 5 + 9, 'vratamir', 'digitsum');
    expect(tail.map((c) => c.value)).toEqual([3, 10, 16]);
    const m = coupleMatrix(a, b, 'digitsum');
    expect(m.zones.map((z) => z.id)).toEqual(['portrait', 'karmicTail.ladini', 'karmicTail.vratamir']);
  });
  it('ambele reduceri, cu distanța', () => {
    const m = coupleMatrix(a, b);
    expect(m.reductions.length).toBeGreaterThan(0);
    for (const r of m.reductions) for (const c of r.cells) expect(c.distance).toBe(Math.abs(c.digitsum - c.mod22));
  });
});
