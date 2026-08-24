import { fullPythagoreanProfile } from '../pythagorean.js';
import { interpretProfile, interpretLetters, interpret } from './interpret.js';
import { FRAMES } from './frames.js';
import { ARCHETYPES } from './archetypes.js';
import { LETTER_MEANINGS } from './letters.js';

const p = fullPythagoreanProfile('Victor Ion Safta', {day:25,month:8,year:1990}, new Date(2026,7,24));
const ro = interpretProfile(p,'ro');
console.log('interpretări generate:', ro.length, '| litere:', interpretLetters(p,'ro').length);
console.log('\n--- exemplu RO ---');
const m = ro.find(x=>x.key==='maturity')!;
console.log(m.label, '=', m.value, '·', m.title);
console.log(m.lead); console.log(m.works); console.log(m.breaks);
console.log('\n--- același, EN ---');
const me = interpret('maturity', m.value, 'en')!;
console.log(me.lead);
console.log('\n--- literă ---');
const L = interpretLetters(p,'ru')[0] as any;
console.log(L.label, L.letter, '·', L.letterTrait);
// completeness matrix
let missing=0, total=0;
for (const f of FRAMES) for (const a of ARCHETYPES) for (const lang of ['ro','en','ru'] as const) {
  total++;
  const r = interpret(f.key, a.n, lang);
  if (!r || /\{\w+\}/.test(r.lead+r.works+r.breaks) || r.lead.length<40) missing++;
}
console.log(`\nmatrice: ${total} combinații, ${missing} incomplete`);
console.log('litere:', LETTER_MEANINGS.length, '| toate cu 3 limbi:', LETTER_MEANINGS.every(l=>l.trait.ro&&l.trait.en&&l.trait.ru));
