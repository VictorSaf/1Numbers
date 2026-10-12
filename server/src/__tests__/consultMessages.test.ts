import { describe, it, expect } from 'vitest';
import { buildConsultMessages } from '../lib/consultMessages';
import { SYSTEM_PROMPTS, SCOPE_CLAUSE } from '../lib/aiPrompts';

const PROFIL = '=== PROFILUL NUMEROLOGIC ===\nDrumul Vieții: 7\nDestinul: 3';

describe('promptul de sistem rămâne al serverului', () => {
  it('conține textul serverului și clauza de scop, în limba cerută', () => {
    const { system } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [],
      question: 'ce înseamnă 7?',
    });

    expect(system).toHaveLength(1);
    expect(system[0].text).toContain(SYSTEM_PROMPTS.ro);
    expect(system[0].text).toContain(SCOPE_CLAUSE.ro);
  });

  it('nu lasă niciun text al clientului să ajungă în system', () => {
    const { system } = buildConsultMessages({
      language: 'en',
      profileContext: 'PROFIL_INJECTAT',
      history: [{ role: 'user', content: 'ISTORIC_INJECTAT' }],
      question: 'INTREBARE_INJECTATA',
    });

    const joined = system.map((b) => b.text).join('\n');
    expect(joined).not.toContain('PROFIL_INJECTAT');
    expect(joined).not.toContain('ISTORIC_INJECTAT');
    expect(joined).not.toContain('INTREBARE_INJECTATA');
  });

  it('schimbă limba promptului de sistem', () => {
    const { system } = buildConsultMessages({
      language: 'ru',
      profileContext: PROFIL,
      history: [],
      question: 'вопрос',
    });

    expect(system[0].text).toContain(SYSTEM_PROMPTS.ru);
  });
});

describe('profilul stă primul, ca date, cu punctul de cache pe el', () => {
  it('pune profilul în primul mesaj, într-un plic delimitat', () => {
    const { messages } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [],
      question: 'ce înseamnă 7?',
    });

    expect(messages[0].role).toBe('user');
    const blocks = messages[0].content as Array<{ type: string; text: string }>;
    expect(blocks[0].text).toContain('<profil_numerologic>');
    expect(blocks[0].text).toContain('Drumul Vieții: 7');
    expect(blocks[0].text).toContain('</profil_numerologic>');
  });

  it('marchează profilul drept prefix cache-abil', () => {
    const { messages } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [],
      question: 'ce înseamnă 7?',
    });

    const blocks = messages[0].content as Array<{ cache_control?: { type: string } }>;
    expect(blocks[0].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('nu pune punct de cache pe nimic din ce se schimbă la fiecare rundă', () => {
    const { messages } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [
        { role: 'user', content: 'prima întrebare' },
        { role: 'assistant', content: 'primul răspuns' },
      ],
      question: 'a doua întrebare',
    });

    const later = messages.slice(1);
    for (const message of later) {
      expect(typeof message.content).toBe('string');
    }
  });
});

describe('istoricul se trimite o singură dată, în ordine', () => {
  it('așază istoricul între profil și întrebarea curentă', () => {
    const { messages } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [
        { role: 'user', content: 'prima întrebare' },
        { role: 'assistant', content: 'primul răspuns' },
      ],
      question: 'a doua întrebare',
    });

    expect(messages).toHaveLength(4);
    expect(messages[1]).toEqual({ role: 'user', content: 'prima întrebare' });
    expect(messages[2]).toEqual({ role: 'assistant', content: 'primul răspuns' });
    expect(messages[3]).toEqual({ role: 'user', content: 'a doua întrebare' });
  });

  it('nu duplică istoricul în textul întrebării', () => {
    const { messages } = buildConsultMessages({
      language: 'ro',
      profileContext: PROFIL,
      history: [{ role: 'user', content: 'prima întrebare' }],
      question: 'a doua întrebare',
    });

    const last = messages[messages.length - 1].content as string;
    expect(last).toBe('a doua întrebare');
    expect(last).not.toContain('prima întrebare');
  });

  it('fără istoric, are exact două mesaje', () => {
    const { messages } = buildConsultMessages({
      language: 'en',
      profileContext: PROFIL,
      history: [],
      question: 'what does 7 mean?',
    });

    expect(messages).toHaveLength(2);
    expect(messages[1]).toEqual({ role: 'user', content: 'what does 7 mean?' });
  });
});
