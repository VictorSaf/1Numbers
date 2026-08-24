import { ARCANA, ARCANA_BY_N, MATRIX_POSITION_FRAME, type Lang } from './arcana.js';
const langs: Lang[] = ['ro','en','ru'];
let bad = 0;
if (ARCANA.length !== 22) { console.log('FAIL: nu sunt 22 arcane, ci', ARCANA.length); bad++; }
for (let n = 1; n <= 22; n++) if (!ARCANA_BY_N[n]) { console.log('FAIL: lipsește arcana', n); bad++; }
for (const a of ARCANA) {
  for (const l of langs) {
    for (const f of ['light','shadow','task'] as const) {
      const v = (a as any)[f][l];
      if (!v || typeof v !== 'string' || v.length < 10) { console.log(`FAIL arcana ${a.n} ${f}.${l}`); bad++; }
    }
    if (!a.title[l] || a.title[l].length < 3) { console.log(`FAIL arcana ${a.n} title.${l}`); bad++; }
    if (a.keywords[l].length !== 4) { console.log(`FAIL arcana ${a.n} keywords.${l} = ${a.keywords[l].length}`); bad++; }
  }
}
for (const k of ['A','B','C','D','E','F','G','H','I']) {
  for (const l of langs) if (!MATRIX_POSITION_FRAME[k]?.[l]) { console.log(`FAIL frame ${k}.${l}`); bad++; }
}
console.log(bad ? `\n${bad} probleme` : `\nOK — 22 arcane × 3 limbi × 5 câmpuri + 9 rame de poziție complete`);
console.log('total stringuri:', ARCANA.length*3*4 + ARCANA.length*3*4 + 9*3);
