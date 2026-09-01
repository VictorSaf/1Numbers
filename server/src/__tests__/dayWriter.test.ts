import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Cine scrie ziua: motorul spune adevărul, modelul îl spune altfel.
 *
 * Testat local, un model liber să scrie orice a inventat de fiecare dată
 * circumstanțe -- „la birou”, „în ședințe”, „proiectul din e-mailuri”, „cineva”
 * -- despre un om despre care nu știa nimic. Golul dintre cât știe și cât
 * trebuie să scrie se umple cu invenție.
 *
 * De aceea modelul nu primește cifre ca să compună, ci PROPOZIȚII GATA FĂCUTE
 * ca să le reformuleze. Iar ce iese e verificat: dacă a pierdut o cifră sau a
 * adăugat una care nu era, textul lui se aruncă și rămâne cel compus. Un text
 * plat e o pagubă; un text care spune altă cifră e o minciună.
 */

const create = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error { constructor(public status: number, m: string) { super(m); } }
  class Anthropic {
    messages = { create };
    static APIError = APIError;
    static RateLimitError = class extends APIError {};
    static AuthenticationError = class extends APIError {};
    static APIConnectionError = class extends Error {};
  }
  return { default: Anthropic };
});

import { writeDay, DAY_WRITER_MODEL, type DayFacts } from '../lib/dayWriter';

const FACTS: DayFacts = {
  personalDay: 8,
  language: 'ro',
  composed: {
    ziua: 'Ziua asta cere energia rezultatului măsurabil și a autorității asumate.',
    fric: 'Destinul tău e 1: energia începutului. Ziua trage în partea cealaltă.',
    aproape: 'Drumul tău e 7 — energia întrebării. Ziua cere ceva din aceeași familie.',
    intrebare: 'Destinul tău e 1, ziua cere 8. Care dintre ele a câștigat azi?',
  },
};

const modelSays = (body: Record<string, string>) => ({
  content: [{ type: 'text', text: JSON.stringify(body) }],
  usage: { input_tokens: 500, output_tokens: 200 },
});

const GOOD = {
  ziua: 'Astăzi contează rezultatul concret și autoritatea pe care ți-o asumi.',
  fric: 'Destinul tău e 1: puterea de a începe singur. Ziua trage spre altă parte.',
  aproape: 'Drumul tău e 7 — puterea întrebării. Ziua cere ceva din aceeași zonă.',
  intrebare: 'Destinul tău e 1, ziua cere 8. Care dintre ele a ieșit învingător azi?',
};

beforeEach(() => { create.mockReset(); process.env.ANTHROPIC_API_KEY = 'sk-ant-test'; });
afterEach(() => { delete process.env.ANTHROPIC_API_KEY; delete process.env.DAY_WRITER_MODEL; });

describe('o zi cu o singură relație', () => {
  // Ziua are una sau două relații cu harta. Cerându-le pe amândouă mereu,
  // clientul cădea pe aceeași propoziție de două ori, iar modelul o reformula
  // de două ori: pe ecran ieșeau două paragrafe cu același înțeles.
  const ONE: DayFacts = {
    personalDay: 3,
    language: 'ro',
    composed: {
      ziua: 'Ziua asta cere energia expresiei -- ce simți trebuie să iasă în afară.',
      aproape: 'Sufletul tău e 5 — energia mișcării. Ziua cere ceva din aceeași familie.',
      intrebare: 'Sufletul tău e 5, ziua e 3. Ce a ieșit din asta azi?',
    },
  };

  it('trimite modelului doar părțile care există', async () => {
    create.mockResolvedValue(modelSays({
      ziua: 'Astăzi, ce simți are nevoie să iasă.',
      aproape: 'Sufletul tău e 5: mișcarea. Ziua de 3 cere ceva înrudit.',
      intrebare: 'Sufletul tău e 5, ziua e 3. Ce a ieșit azi?',
    }));

    await writeDay(ONE);

    const sent = JSON.stringify(create.mock.calls[0][0].messages);
    expect(sent).not.toContain('fric:');
  });

  it('acceptă un răspuns fără partea care n-a fost cerută', async () => {
    create.mockResolvedValue(modelSays({
      ziua: 'Astăzi, ce simți are nevoie să iasă.',
      aproape: 'Sufletul tău e 5: mișcarea. Ziua de 3 cere ceva înrudit.',
      intrebare: 'Sufletul tău e 5, ziua e 3. Ce a ieșit azi?',
    }));

    const r = await writeDay(ONE);
    expect(r.source).toBe('model');
    expect(r.body.fric).toBeUndefined();
  });
});

describe('writeDay', () => {
  it('întoarce textul modelului când e bun', async () => {
    create.mockResolvedValue(modelSays(GOOD));
    const r = await writeDay(FACTS);

    expect(r.source).toBe('model');
    expect(r.body).toEqual(GOOD);
    expect(r.model).toBe(DAY_WRITER_MODEL);
  });

  it('nu cheamă modelul deloc fără cheie, și dă textul compus', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = await writeDay(FACTS);

    expect(create).not.toHaveBeenCalled();
    expect(r.source).toBe('composed');
    expect(r.body).toEqual(FACTS.composed);
  });

  it('cade pe textul compus când modelul cade', async () => {
    create.mockRejectedValue(new Error('rețea'));
    const r = await writeDay(FACTS);

    expect(r.source).toBe('composed');
    expect(r.body).toEqual(FACTS.composed);
  });

  it('cade pe textul compus când modelul nu întoarce JSON', async () => {
    create.mockResolvedValue({ content: [{ type: 'text', text: 'Sigur! Iată:' }], usage: {} });
    const r = await writeDay(FACTS);

    expect(r.source).toBe('composed');
  });

  it('aruncă textul care a pierdut o cifră din sursă', async () => {
    // „Destinul tău e 1” devenit „Destinul tău începe lucruri” citește frumos
    // și spune altceva: omul nu mai știe despre ce cifră vorbește.
    create.mockResolvedValue(modelSays({ ...GOOD, fric: 'Destinul tău vrea să înceapă singur.' }));
    const r = await writeDay(FACTS);

    expect(r.source).toBe('composed');
    expect(r.body).toEqual(FACTS.composed);
  });

  it('aruncă textul care a inventat o cifră care nu era', async () => {
    create.mockResolvedValue(modelSays({ ...GOOD, ziua: 'Astăzi, cu Sufletul tău de 3, contează rezultatul.' }));
    const r = await writeDay(FACTS);

    expect(r.source).toBe('composed');
  });

  it('aruncă textul căruia îi lipsește o bucată', async () => {
    const { intrebare, ...fara } = GOOD;
    create.mockResolvedValue(modelSays(fara));
    const r = await writeDay(FACTS);

    expect(r.source).toBe('composed');
  });

  it('ascultă de modelul din mediu, ca să se schimbe fără redeploy', async () => {
    process.env.DAY_WRITER_MODEL = 'claude-opus-5';
    create.mockResolvedValue(modelSays(GOOD));
    await writeDay(FACTS);

    expect(create.mock.calls[0][0].model).toBe('claude-opus-5');
  });

  it('dă modelului propozițiile, nu doar cifrele', async () => {
    // Dacă i-am da doar „ziua 8, destinul 1”, ar trebui să compună -- iar ce
    // compune el, când nu știe nimic despre om, e inventat.
    create.mockResolvedValue(modelSays(GOOD));
    await writeDay(FACTS);

    const sent = JSON.stringify(create.mock.calls[0][0].messages);
    for (const s of Object.values(FACTS.composed)) expect(sent).toContain(s);
  });
});
