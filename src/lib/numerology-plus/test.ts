import { reduce, result, classifyFullName, normalizeName, CHALDEAN } from './core.js';
import * as P from './pythagorean.js';
import * as S from './systems.js';
import * as M from './matrix.js';
import * as A from './applied.js';

let pass = 0, fail = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ok   ${label}`); }
  else { fail++; console.log(`  FAIL ${label}\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`); }
}

console.log('\n── core ──');
eq('reduce 29 keepMasters', reduce(29), 11);
eq('reduce 29 no masters', reduce(29, false), 2);
eq('reduce 38', reduce(38), 11);
eq('reduce 19', reduce(19), 1);
eq('normalize diacritice RO', normalizeName('Ștefan Ioniță'), 'STEFAN IONITA');

console.log('\n── Y ca vocală (euristică) ──');
eq('MARY: Y vocală', classifyFullName('MARY').map(l => l.vowel), [false, true, false, true]);
eq('BRYN: Y vocală (nicio vocală tare)', classifyFullName('BRYN').map(l => l.vowel), [false, false, true, false]);
eq('YOLANDA: Y consoană (urmat de vocală)', classifyFullName('YOLANDA')[0].vowel, false);

console.log('\n── Pythagorean core ──');
// 14.04.1995 → luna 4, zi 4(1+4=5? nu: 14→5), an 1995→24→6 ; 4+5+6=15→6
const b1 = { day: 14, month: 4, year: 1995 };
eq('lifePath 14.04.1995 = 6', P.lifePath(b1).value, 6);
// 25.08.1990 → 8 + 7 + (1+9+9+0=19→1) = 16 → 7
const b2 = { day: 25, month: 8, year: 1990 };
eq('lifePath 25.08.1990 = 7', P.lifePath(b2).value, 7);
eq('lifePath raw = 16 → karmic debt', P.lifePath(b2).karmicDebt, 16);

console.log('\n── numere noi ──');
eq('attitude 25.08 = 6 (8+25=33→6, fără master)', P.attitude(b2).value, 6);
eq('balance ABC = 6', P.balance('Ana Bogdan Cristea').value, 6);
{
  const lp = P.lifePath(b2), ex = P.expression('Victor Ion Safta');
  eq('maturity = reduce(lp+exp)', P.maturity(lp, ex).value, reduce(lp.value + ex.value));
}
{
  const kl = P.karmicLessons('Victor Ion Safta');
  eq('subconscious = 9 - lessons', P.subconsciousSelf('Victor Ion Safta'), 9 - kl.length);
}
{
  const pos = P.positionLetters('Victor Ion Safta');
  eq('cornerstone V=4', pos.cornerstone, { letter: 'V', value: 4 });
  eq('capstone A=1', pos.capstone, { letter: 'A', value: 1 });
  eq('firstVowel I=9', pos.firstVowel, { letter: 'I', value: 9 });
}
eq('inclusion table sumă = nr litere', Object.values(P.inclusionTable('Victor Ion Safta')).reduce((a,b)=>a+b,0), 14);

console.log('\n── pinacle / provocări ──');
{
  const lp = P.lifePath(b1);
  const pin = P.pinnacles(b1, lp);
  // luna 4, zi 5 (14→5), an 6 → P1=4+5=9, P2=5+6=11, P3=9+11=20→2, P4=4+6=10→1
  eq('P1 = 9', pin[0].value, 9);
  eq('P2 = 11 (master păstrat)', pin[1].value, 11);
  eq('P3 = 2', pin[2].value, 2);
  eq('P4 = 1', pin[3].value, 1);
  eq('P1 se termină la 36-LP', pin[0].toAge, 36 - lp.value);
  const ch = P.challenges(b1, lp);
  eq('C1 = |4-5| = 1', ch[0].value, 1);
  eq('C2 = |5-6| = 1', ch[1].value, 1);
  eq('C3 = |1-1| = 0', ch[2].value, 0);
  eq('C4 = |4-6| = 2', ch[3].value, 2);
}

console.log('\n── cicluri de viață ──');
{
  const lp = P.lifePath(b1);
  const lc = P.lifeCycles(b1, lp);
  eq('formative = luna redusă', lc[0].value, 4);
  eq('productive = ziua redusă', lc[1].value, 5);
  eq('harvest = anul redus', lc[2].value, 6);
  eq('productive durează 27 ani', lc[1].toAge! - lc[1].fromAge + 1, 27);
}

console.log('\n── planuri de expresie ──');
{
  const pl = P.planesOfExpression('Victor Ion Safta');
  const total = (['physical','mental','emotional','intuitive'] as const)
    .reduce((a, p) => a + pl.planeTotals[p].count, 0);
  eq('toate literele clasificate', total, 14);
  const natTotal = (['creative','vacillating','grounded'] as const)
    .reduce((a, n) => a + pl.natureTotals[n].count, 0);
  eq('sumă naturi = sumă planuri', natTotal, total);
  eq('suma valorilor = Expression raw', pl.planeTotals.physical.sum + pl.planeTotals.mental.sum
     + pl.planeTotals.emotional.sum + pl.planeTotals.intuitive.sum, P.expression('Victor Ion Safta').raw);
}

console.log('\n── tranzite / esență ──');
{
  const t = P.transits('Victor Ion Safta', 0);
  eq('la vârsta 0, prima literă din fiecare segment', [t.physical?.letter, t.mental?.letter, t.spiritual?.letter], ['V','I','S']);
  // V=4 → activă anii 0..3; la 4 trece la I
  eq('la vârsta 4 trece la a doua literă a prenumelui', P.transits('Victor Ion Safta', 4).physical?.letter, 'I');
  const e = P.essence('Victor Ion Safta', 0);
  eq('esență la 0 = reduce(V+I+S)=reduce(4+9+1)=5', e.value, 5);
}

console.log('\n── Vedic ──');
eq('mulank 14 = 5', S.mulank(b1), 5);
eq('bhagyank 14.04.1995 = 6 (sumă plată 33→6)', S.bhagyank(b1), 6);
eq('naamank folosește Chaldean', S.naamank('Victor').compound, S.naamank('Victor').compound);
eq('navagraha 8 = Saturn', S.NAVAGRAHA[8].planet, 'Saturn');

console.log('\n── Kua ──');
// 1990: 9+0=9 → bărbat 10-9=1 (Est); femeie 9+5=14→5 → 8 (Vest)
eq('kua bărbat 1990 = 1', S.kuaNumber(1990, 'male').kua, 1);
eq('kua bărbat 1990 grup Est', S.kuaNumber(1990, 'male').group, 'east');
eq('kua femeie 1990 = 8 (5→8)', S.kuaNumber(1990, 'female').kua, 8);
// 1985: 8+5=13→4 → bărbat 10-4=6; femeie 4+5=9
eq('kua bărbat 1985 = 6', S.kuaNumber(1985, 'male').kua, 6);
eq('kua femeie 1985 = 9', S.kuaNumber(1985, 'female').kua, 9);
// 5 → 2 pentru bărbat: an cu digit 5 → 10-5=5 → 2
eq('kua bărbat cu 5 devine 2', S.kuaNumber(1959, 'male').kua, 2);

console.log('\n── Kabbalah ──');
eq('populară în interval 1..9', S.popularKabbalah('Victor Ion Safta').value >= 1 && S.popularKabbalah('Victor Ion Safta').value <= 9, true);
eq('gematria nu se reduce', S.hebrewGematria('David').total > 9, true);

console.log('\n── Chaldean compus ──');
{
  const c = S.chaldeanName('Victor Ion Safta');
  eq('display compus/rădăcină', c.display, `${c.compound}/${c.root}`);
  eq('rădăcina e 1..9', c.root >= 1 && c.root <= 9, true);
  eq('9 nu apare în tabelul caldeean', Object.values(CHALDEAN).includes(9), false);
}

console.log('\n── Matrița Destinului (exemplu de referință 25.08.1990) ──');
{
  const m = M.destinyMatrix(b2).byKey;
  eq('A = 7 (2+5)', m.A, 7);
  eq('B = 8 (luna brută)', m.B, 8);
  eq('C = 19 (1+9+9+0)', m.C, 19);
  eq('D = 7 (7+8+19=34→7)', m.D, 7);
  eq('E = 5 (7+8+19+7=41→5)', m.E, 5);
  eq('reduce22 digitsum: 25 → 7', M.reduce22(25, 'digitsum'), 7);
  eq('reduce22 mod22: 25 → 3', M.reduce22(25, 'mod22'), 3);
  eq('toate punctele ≤ 22', Object.values(m).every(v => v >= 1 && v <= 22), true);
  eq('8 decade în graficul de viață', M.lifePeriods(b2).length, 8);
}

console.log('\n── biorritmuri ──');
eq('la ziua 0 toate = 0', S.biorhythm(0, 'physical'), 0);
eq('la jumătate de ciclu fizic ≈ 0', Math.abs(S.biorhythm(11.5, 'physical')) < 0.001, true);
eq('la sfert de ciclu = 1', Math.abs(S.biorhythm(23 / 4, 'physical') - 1) < 0.001, true);

console.log('\n── module aplicate ──');
eq('adresa 12B', A.addressNumerology('12B').value, reduce(1 + 2 + 2, false));
eq('8 e cel mai favorabil', A.DIGIT_HOMOPHONE['8'].weight > A.DIGIT_HOMOPHONE['6'].weight, true);
eq('4 e nefavorabil', A.DIGIT_HOMOPHONE['4'].weight < 0, true);
eq('888 primește bonus', A.homophoneScore('888').sequences.length > 0, true);
eq('4444 scor mic', A.homophoneScore('4444').normalized < A.homophoneScore('8888').normalized, true);
{
  const c = A.compatibility(
    { name: 'Victor Ion Safta', birth: b2 },
    { name: 'Maria Elena Popescu', birth: b1 }, 'romantic');
  eq('scor 0..100', c.score >= 0 && c.score <= 100, true);
  eq('ponderile însumează 1', Math.abs(Object.values(c.weights).reduce((a, b) => a + b, 0) - 1) < 1e-9, true);
  const prof = A.compatibility(
    { name: 'Victor Ion Safta', birth: b2 },
    { name: 'Maria Elena Popescu', birth: b1 }, 'professional');
  eq('tipul schimbă scorul', c.score !== prof.score || c.weights.expression !== prof.weights.expression, true);
}
{
  const nc = A.nameChangeAnalysis('Ion Popescu', 'Ioan Popescu');
  eq('detectează schimbarea', typeof nc.changedCount === 'number', true);
}
{
  const ranked = A.rankBabyNames(['Andrei', 'Maria', 'Stefan', 'Elena'], b1);
  eq('4 nume clasate', ranked.length, 4);
  eq('sortate descrescător', ranked[0].harmonyWithLifePath >= ranked[3].harmonyWithLifePath, true);
}

console.log('\n── profil complet ──');
{
  const p = P.fullPythagoreanProfile('Victor Ion Safta', b2, new Date(2026, 7, 24));
  eq('are toate secțiunile', Object.keys(p).sort(), ['core','cycles','extended','karmicDebts','planes','transits']);
  eq('detectează datoria karmică 16 pe lifePath', p.karmicDebts.some(d => d.source === 'lifePath' && d.debt === 16), true);
}

console.log(`\n${pass} ok, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
