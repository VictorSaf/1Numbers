import { describe, it, expect } from 'vitest';
import { buildAIPrompt, type AIContext } from '../aiPrompts';

/**
 * `buildAIPrompt` împacheta istoricul în textul întrebării, în timp ce
 * componenta îl trimitea și separat, în conversationHistory. Serverul le punea
 * pe amândouă în messages: aceiași tokeni, plătiți de două ori.
 */
const context = (history?: AIContext['conversationHistory']): AIContext => ({
  profile: {
    fullName: 'Ana Popescu',
    birthDate: new Date(1990, 4, 15),
  },
  language: 'ro',
  conversationHistory: history,
  currentDate: new Date(2026, 8, 1),
});

describe('buildAIPrompt separă profilul de întrebare', () => {
  it('întoarce două câmpuri distincte', () => {
    const result = buildAIPrompt('Ce înseamnă 7?', context());

    expect(Object.keys(result).sort()).toEqual(['profileContext', 'question']);
  });

  it('pune întrebarea singură în question, fără etichete', () => {
    const result = buildAIPrompt('Ce înseamnă 7?', context());

    expect(result.question).toBe('Ce înseamnă 7?');
  });

  it('pune numerele calculate în profileContext', () => {
    const result = buildAIPrompt('Ce înseamnă 7?', context());

    expect(result.profileContext).toContain('Ana Popescu');
    expect(result.profileContext).toContain('Drumul Vieții');
    expect(result.profileContext).toContain('GRILA LO SHU');
  });

  it('nu mai împachetează istoricul în niciunul dintre câmpuri', () => {
    const result = buildAIPrompt(
      'A doua întrebare',
      context([
        { role: 'user', content: 'PRIMA_INTREBARE' },
        { role: 'assistant', content: 'PRIMUL_RASPUNS' },
      ]),
    );

    expect(result.profileContext).not.toContain('PRIMA_INTREBARE');
    expect(result.profileContext).not.toContain('PRIMUL_RASPUNS');
    expect(result.question).not.toContain('PRIMA_INTREBARE');
    expect(result.profileContext).not.toContain('CONVERSATION HISTORY');
  });

  it('nu depășește plafonul serverului pentru profil', () => {
    const result = buildAIPrompt('Ce înseamnă 7?', context());

    expect(result.profileContext.length).toBeLessThanOrEqual(6000);
  });
});
