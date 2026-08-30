import { describe, it, expect } from 'vitest';
import { reduce, classifyFullName, normalizeName, CHALDEAN } from '../core';
import * as P from '../pythagorean';
import * as S from '../systems';
import * as M from '../matrix';
import * as A from '../applied';

/**
 * The engine's own assertions. They lived in numerology-plus/test.ts with a
 * hand-rolled eq() harness and a filename vitest never picks up, so all 78 of
 * them were dead the whole time README.md and profile.test.ts were citing them.
 * Converted verbatim: every expected value here is the one the engine's author
 * wrote, so a failure is news about the engine, not about the conversion.
 */

const b1 = { day: 14, month: 4, year: 1995 };
const b2 = { day: 25, month: 8, year: 1990 };

describe('core', () => {
  it('reduce 29 keepMasters', () => expect(reduce(29)).toEqual(11));
  it('reduce 29 no masters', () => expect(reduce(29, false)).toEqual(2));
  it('reduce 38', () => expect(reduce(38)).toEqual(11));
  it('reduce 19', () => expect(reduce(19)).toEqual(1));
  it('normalize diacritice RO', () =>
    expect(normalizeName('Ștefan Ioniță')).toEqual('STEFAN IONITA'));
});

describe('Y ca vocală (euristică)', () => {
  it('MARY: Y vocală', () =>
    expect(classifyFullName('MARY').map((l) => l.vowel)).toEqual([false, true, false, true]));
  it('BRYN: Y vocală (nicio vocală tare)', () =>
    expect(classifyFullName('BRYN').map((l) => l.vowel)).toEqual([false, false, true, false]));
  it('YOLANDA: Y consoană (urmat de vocală)', () =>
    expect(classifyFullName('YOLANDA')[0].vowel).toEqual(false));
});

describe('Pythagorean core', () => {
  // 14.04.1995 → luna 4, zi 4(1+4=5? nu: 14→5), an 1995→24→6 ; 4+5+6=15→6
  it('lifePath 14.04.1995 = 6', () => expect(P.lifePath(b1).value).toEqual(6));
  // 25.08.1990 → 8 + 7 + (1+9+9+0=19→1) = 16 → 7
  it('lifePath 25.08.1990 = 7', () => expect(P.lifePath(b2).value).toEqual(7));
  it('lifePath raw = 16 → karmic debt', () => expect(P.lifePath(b2).karmicDebt).toEqual(16));
});

describe('numere noi', () => {
  it('attitude 25.08 = 6 (8+25=33→6, fără master)', () =>
    expect(P.attitude(b2).value).toEqual(6));
  it('balance ABC = 6', () => expect(P.balance('Ana Bogdan Cristea').value).toEqual(6));

  it('maturity = reduce(lp+exp)', () => {
    const lp = P.lifePath(b2), ex = P.expression('Victor Ion Safta');
    expect(P.maturity(lp, ex).value).toEqual(reduce(lp.value + ex.value));
  });

  it('subconscious = 9 - lessons', () => {
    const kl = P.karmicLessons('Victor Ion Safta');
    expect(P.subconsciousSelf('Victor Ion Safta')).toEqual(9 - kl.length);
  });

  describe('literele de poziție', () => {
    const pos = P.positionLetters('Victor Ion Safta');
    it('cornerstone V=4', () => expect(pos.cornerstone).toEqual({ letter: 'V', value: 4 }));
    it('capstone A=1', () => expect(pos.capstone).toEqual({ letter: 'A', value: 1 }));
    it('firstVowel I=9', () => expect(pos.firstVowel).toEqual({ letter: 'I', value: 9 }));
  });

  it('inclusion table sumă = nr litere', () =>
    expect(
      Object.values(P.inclusionTable('Victor Ion Safta')).reduce((a, b) => a + b, 0),
    ).toEqual(14));
});

describe('pinacle / provocări', () => {
  const lp = P.lifePath(b1);
  const pin = P.pinnacles(b1, lp);
  // luna 4, zi 5 (14→5), an 6 → P1=4+5=9, P2=5+6=11, P3=9+11=20→2, P4=4+6=10→1
  it('P1 = 9', () => expect(pin[0].value).toEqual(9));
  it('P2 = 11 (master păstrat)', () => expect(pin[1].value).toEqual(11));
  it('P3 = 2', () => expect(pin[2].value).toEqual(2));
  it('P4 = 1', () => expect(pin[3].value).toEqual(1));
  it('P1 se termină la 36-LP', () => expect(pin[0].toAge).toEqual(36 - lp.value));

  const ch = P.challenges(b1, lp);
  it('C1 = |4-5| = 1', () => expect(ch[0].value).toEqual(1));
  it('C2 = |5-6| = 1', () => expect(ch[1].value).toEqual(1));
  it('C3 = |1-1| = 0', () => expect(ch[2].value).toEqual(0));
  it('C4 = |4-6| = 2', () => expect(ch[3].value).toEqual(2));
});

describe('cicluri de viață', () => {
  const lp = P.lifePath(b1);
  const lc = P.lifeCycles(b1, lp);
  it('formative = luna redusă', () => expect(lc[0].value).toEqual(4));
  it('productive = ziua redusă', () => expect(lc[1].value).toEqual(5));
  it('harvest = anul redus', () => expect(lc[2].value).toEqual(6));
  it('productive durează 27 ani', () => expect(lc[1].toAge! - lc[1].fromAge + 1).toEqual(27));
});

describe('planuri de expresie', () => {
  const pl = P.planesOfExpression('Victor Ion Safta');
  const total = (['physical', 'mental', 'emotional', 'intuitive'] as const)
    .reduce((a, p) => a + pl.planeTotals[p].count, 0);

  it('toate literele clasificate', () => expect(total).toEqual(14));
  it('sumă naturi = sumă planuri', () =>
    expect(
      (['creative', 'vacillating', 'grounded'] as const)
        .reduce((a, n) => a + pl.natureTotals[n].count, 0),
    ).toEqual(total));
  it('suma valorilor = Expression raw', () =>
    expect(
      pl.planeTotals.physical.sum + pl.planeTotals.mental.sum +
      pl.planeTotals.emotional.sum + pl.planeTotals.intuitive.sum,
    ).toEqual(P.expression('Victor Ion Safta').raw));
});

describe('tranzite / esență', () => {
  it('la vârsta 0, prima literă din fiecare segment', () => {
    const t = P.transits('Victor Ion Safta', 0);
    expect([t.physical?.letter, t.mental?.letter, t.spiritual?.letter]).toEqual(['V', 'I', 'S']);
  });
  // V=4 → activă anii 0..3; la 4 trece la I
  it('la vârsta 4 trece la a doua literă a prenumelui', () =>
    expect(P.transits('Victor Ion Safta', 4).physical?.letter).toEqual('I'));
  it('esență la 0 = reduce(V+I+S)=reduce(4+9+1)=5', () =>
    expect(P.essence('Victor Ion Safta', 0).value).toEqual(5));
});

describe('Vedic', () => {
  it('mulank 14 = 5', () => expect(S.mulank(b1)).toEqual(5));
  it('bhagyank 14.04.1995 = 6 (sumă plată 33→6)', () => expect(S.bhagyank(b1)).toEqual(6));
  it('naamank folosește Chaldean', () =>
    expect(S.naamank('Victor').compound).toEqual(S.naamank('Victor').compound));
  it('navagraha 8 = Saturn', () => expect(S.NAVAGRAHA[8].planet).toEqual('Saturn'));
});

describe('Kua', () => {
  // 1990: 9+0=9 → bărbat 10-9=1 (Est); femeie 9+5=14→5 → 8 (Vest)
  it('kua bărbat 1990 = 1', () => expect(S.kuaNumber(1990, 'male').kua).toEqual(1));
  it('kua bărbat 1990 grup Est', () => expect(S.kuaNumber(1990, 'male').group).toEqual('east'));
  it('kua femeie 1990 = 8 (5→8)', () => expect(S.kuaNumber(1990, 'female').kua).toEqual(8));
  // 1985: 8+5=13→4 → bărbat 10-4=6; femeie 4+5=9
  it('kua bărbat 1985 = 6', () => expect(S.kuaNumber(1985, 'male').kua).toEqual(6));
  it('kua femeie 1985 = 9', () => expect(S.kuaNumber(1985, 'female').kua).toEqual(9));
  // 5 → 2 pentru bărbat: an cu digit 5 → 10-5=5 → 2
  it('kua bărbat cu 5 devine 2', () => expect(S.kuaNumber(1959, 'male').kua).toEqual(2));
});

describe('Kabbalah', () => {
  it('populară în interval 1..9', () =>
    expect(
      S.popularKabbalah('Victor Ion Safta').value >= 1 &&
      S.popularKabbalah('Victor Ion Safta').value <= 9,
    ).toEqual(true));
  it('gematria nu se reduce', () => expect(S.hebrewGematria('David').total > 9).toEqual(true));
});

describe('Chaldean compus', () => {
  const c = S.chaldeanName('Victor Ion Safta');
  it('display compus/rădăcină', () => expect(c.display).toEqual(`${c.compound}/${c.root}`));
  it('rădăcina e 1..9', () => expect(c.root >= 1 && c.root <= 9).toEqual(true));
  it('9 nu apare în tabelul caldeean', () =>
    expect(Object.values(CHALDEAN).includes(9)).toEqual(false));
});

describe('Matrița Destinului (exemplu de referință 25.08.1990)', () => {
  const m = M.destinyMatrix(b2).byKey;
  it('A = 7 (2+5)', () => expect(m.A).toEqual(7));
  it('B = 8 (luna brută)', () => expect(m.B).toEqual(8));
  it('C = 19 (1+9+9+0)', () => expect(m.C).toEqual(19));
  it('D = 7 (7+8+19=34→7)', () => expect(m.D).toEqual(7));
  it('E = 5 (7+8+19+7=41→5)', () => expect(m.E).toEqual(5));
  it('reduce22 digitsum: 25 → 7', () => expect(M.reduce22(25, 'digitsum')).toEqual(7));
  it('reduce22 mod22: 25 → 3', () => expect(M.reduce22(25, 'mod22')).toEqual(3));
  it('toate punctele ≤ 22', () =>
    expect(Object.values(m).every((v) => v >= 1 && v <= 22)).toEqual(true));
  it('8 decade în graficul de viață', () => expect(M.lifePeriods(b2).length).toEqual(8));
});

describe('biorritmuri', () => {
  it('la ziua 0 toate = 0', () => expect(S.biorhythm(0, 'physical')).toEqual(0));
  it('la jumătate de ciclu fizic ≈ 0', () =>
    expect(Math.abs(S.biorhythm(11.5, 'physical')) < 0.001).toEqual(true));
  it('la sfert de ciclu = 1', () =>
    expect(Math.abs(S.biorhythm(23 / 4, 'physical') - 1) < 0.001).toEqual(true));
});

describe('module aplicate', () => {
  it('adresa 12B', () =>
    expect(A.addressNumerology('12B').value).toEqual(reduce(1 + 2 + 2, false)));
  it('8 e cel mai favorabil', () =>
    expect(A.DIGIT_HOMOPHONE['8'].weight > A.DIGIT_HOMOPHONE['6'].weight).toEqual(true));
  it('4 e nefavorabil', () => expect(A.DIGIT_HOMOPHONE['4'].weight < 0).toEqual(true));
  it('888 primește bonus', () =>
    expect(A.homophoneScore('888').sequences.length > 0).toEqual(true));
  it('4444 scor mic', () =>
    expect(A.homophoneScore('4444').normalized < A.homophoneScore('8888').normalized).toEqual(true));

  describe('compatibilitate', () => {
    const c = A.compatibility(
      { name: 'Victor Ion Safta', birth: b2 },
      { name: 'Maria Elena Popescu', birth: b1 }, 'romantic');
    const prof = A.compatibility(
      { name: 'Victor Ion Safta', birth: b2 },
      { name: 'Maria Elena Popescu', birth: b1 }, 'professional');

    it('scor 0..100', () => expect(c.score >= 0 && c.score <= 100).toEqual(true));
    it('ponderile însumează 1', () =>
      expect(Math.abs(Object.values(c.weights).reduce((a, b) => a + b, 0) - 1) < 1e-9).toEqual(true));
    it('tipul schimbă scorul', () =>
      expect(c.score !== prof.score || c.weights.expression !== prof.weights.expression).toEqual(true));
  });

  it('detectează schimbarea', () => {
    const nc = A.nameChangeAnalysis('Ion Popescu', 'Ioan Popescu');
    expect(typeof nc.changedCount === 'number').toEqual(true);
  });

  describe('nume de bebeluș', () => {
    const ranked = A.rankBabyNames(['Andrei', 'Maria', 'Stefan', 'Elena'], b1);
    it('4 nume clasate', () => expect(ranked.length).toEqual(4));
    it('sortate descrescător', () =>
      expect(ranked[0].harmonyWithLifePath >= ranked[3].harmonyWithLifePath).toEqual(true));
  });
});

describe('profil complet', () => {
  const p = P.fullPythagoreanProfile('Victor Ion Safta', b2, new Date(2026, 7, 24));
  it('are toate secțiunile', () =>
    expect(Object.keys(p).sort()).toEqual(
      ['core', 'cycles', 'extended', 'karmicDebts', 'planes', 'transits'],
    ));
  it('detectează datoria karmică 16 pe lifePath', () =>
    expect(p.karmicDebts.some((d) => d.source === 'lifePath' && d.debt === 16)).toEqual(true));
});
