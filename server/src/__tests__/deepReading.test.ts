import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Citirea întreagă: harta legată, nu enumerată.
 *
 * Raportul existent spune ce înseamnă fiecare număr, separat -- douăzeci și
 * trei de blocuri care nu se cunosc între ele. Un om cu Drum 7, Destin 1 și o
 * datorie de 16 nu află niciodată ce ies astea trei împreună, deși exact acolo
 * stă tot ce e de spus despre el.
 *
 * Aceeași disciplină ca la zi: motorul dă propozițiile adevărate, modelul are
 * voie doar să le lege. Ce nu e în date nu poate intra în text.
 */

const create = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error { constructor(public status: number, m: string) { super(m); } }
  class Anthropic {
    messages = { create };
    static APIError = APIError;
    static RateLimitError = class extends APIError {};
    static APIConnectionError = class extends Error {};
  }
  return { default: Anthropic };
});

import { writeDeepReading, DEEP_MODEL, type ChartFacts } from '../lib/deepReading';

const FACTS: ChartFacts = {
  language: 'ro',
  steps: [
    { name: 'Drumul Vieții', figures: '7', say: 'Energia întrebării: nu accepți un răspuns pentru că e comod.' },
    { name: 'Destinul', figures: '1', say: 'Energia începutului și a deciziei asumate singur.' },
    { name: 'Ce se întoarce', figures: '16', say: 'Harta ta poartă o datorie: 16.' },
  ],
};

const GOOD = {
  opening: 'Ești un om care întreabă, pus să decidă singur — și cele două nu se ajută mereu.',
  chapters: [
    { title: 'Întrebarea și decizia', text: 'Drumul tău e 7 și Destinul 1: cauți până ești sigur, dar ți se cere să pornești înainte de a fi.' },
    { title: 'Ce se întoarce', text: 'Datoria de 16 revine exact acolo unde 7 amână și 1 forțează.' },
  ],
  closing: 'Harta ta nu cere să alegi între ele, ci să știi care vorbește acum.',
};
const says = (b: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(b) }], usage: { input_tokens: 900, output_tokens: 800 } });

beforeEach(() => { create.mockReset(); process.env.ANTHROPIC_API_KEY = 'sk-ant-test'; });
afterEach(() => { delete process.env.ANTHROPIC_API_KEY; delete process.env.DEEP_MODEL; });

describe('writeDeepReading', () => {
  it('leagă harta și întoarce citirea', async () => {
    create.mockResolvedValue(says(GOOD));
    const r = await writeDeepReading(FACTS);

    expect(r.source).toBe('model');
    expect(r.body.chapters.length).toBe(2);
    expect(r.model).toBe(DEEP_MODEL);
  });

  it('nu cheamă modelul fără cheie', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = await writeDeepReading(FACTS);

    expect(create).not.toHaveBeenCalled();
    expect(r.source).toBe('composed');
    // Fără model, citirea e harta însăși -- adevărată, doar nelegată.
    expect(r.body.chapters.length).toBe(FACTS.steps.length);
  });

  it('aruncă citirea care inventează o cifră care nu e în hartă', async () => {
    create.mockResolvedValue(says({
      ...GOOD,
      closing: 'Iar Sufletul tău de 3 le împacă pe amândouă.',
    }));
    const r = await writeDeepReading(FACTS);

    expect(r.source).toBe('composed');
  });

  it('acceptă o citire care folosește doar cifrele hărții', async () => {
    create.mockResolvedValue(says(GOOD));
    expect((await writeDeepReading(FACTS)).source).toBe('model');
  });

  it('cade pe hartă când modelul cade', async () => {
    create.mockRejectedValue(new Error('rețea'));
    expect((await writeDeepReading(FACTS)).source).toBe('composed');
  });

  it('cere modelului toate propozițiile motorului', async () => {
    create.mockResolvedValue(says(GOOD));
    await writeDeepReading(FACTS);

    const sent = JSON.stringify(create.mock.calls[0][0].messages);
    for (const s of FACTS.steps) expect(sent).toContain(s.say);
  });

  it('ascultă de modelul din mediu', async () => {
    process.env.DEEP_MODEL = 'claude-sonnet-5';
    create.mockResolvedValue(says(GOOD));
    await writeDeepReading(FACTS);

    expect(create.mock.calls[0][0].model).toBe('claude-sonnet-5');
  });
});
