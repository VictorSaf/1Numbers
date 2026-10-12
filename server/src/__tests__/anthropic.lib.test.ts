import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Mock la granița SDK-ului. Nicio cerere de rețea nu pleacă din această suită.
 *
 * Clasele de eroare sunt statice pe clasa exportată implicit, fiindcă exact așa
 * le folosește codul: `error instanceof Anthropic.RateLimitError`.
 */
const create = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  }
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  class BadRequestError extends APIError {}
  class APIConnectionError extends Error {}

  class Anthropic {
    messages = { create };
    static APIError = APIError;
    static AuthenticationError = AuthenticationError;
    static RateLimitError = RateLimitError;
    static BadRequestError = BadRequestError;
    static APIConnectionError = APIConnectionError;
  }

  return { default: Anthropic };
});

import { isAiConfigured, askConsultant, AiUnavailableError, CONSULT_MODEL } from '../lib/anthropic';

const SYSTEM = [{ type: 'text' as const, text: 'ești consultant' }];
const MESSAGES = [{ role: 'user' as const, content: 'o întrebare' }];

beforeEach(() => {
  create.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
});

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('disponibilitatea se citește din mediu, la fiecare apel', () => {
  it('spune că nu e configurat când cheia lipsește', () => {
    expect(isAiConfigured()).toBe(false);
  });

  it('spune că e configurat imediat ce cheia apare', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    expect(isAiConfigured()).toBe(true);
  });

  it('refuză să întrebe modelul fără cheie, în loc să inventeze', async () => {
    await expect(askConsultant({ system: SYSTEM, messages: MESSAGES })).rejects.toBeInstanceOf(
      AiUnavailableError,
    );
    expect(create).not.toHaveBeenCalled();
  });
});

describe('cererea către model', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
  });

  it('folosește modelul curent și nu cere gândire adâncă pentru o interpretare', async () => {
    create.mockResolvedValue({
      content: [{ type: 'text', text: 'răspuns' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    await askConsultant({ system: SYSTEM, messages: MESSAGES });

    expect(CONSULT_MODEL).toBe('claude-opus-5');
    const args = create.mock.calls[0][0];
    expect(args.model).toBe('claude-opus-5');
    expect(args.max_tokens).toBe(4000);
    expect(args.output_config).toEqual({ effort: 'low' });
    expect(args.system).toEqual(SYSTEM);
    expect(args.messages).toEqual(MESSAGES);
  });

  it('adună doar blocurile de text din răspuns', async () => {
    create.mockResolvedValue({
      content: [
        { type: 'thinking', thinking: '' },
        { type: 'text', text: 'prima parte. ' },
        { type: 'text', text: 'a doua parte.' },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const result = await askConsultant({ system: SYSTEM, messages: MESSAGES });

    expect(result.text).toBe('prima parte. a doua parte.');
    expect(result.truncated).toBe(false);
  });

  it('marchează un răspuns tăiat de max_tokens ca trunchiat', async () => {
    create.mockResolvedValue({
      content: [{ type: 'text', text: 'jumătate de gând' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 10, output_tokens: 4000 },
    });

    const result = await askConsultant({ system: SYSTEM, messages: MESSAGES });

    expect(result.truncated).toBe(true);
  });

  it('raportează tokenii de cache, ca să se poată verifica dacă prefixul se prinde', async () => {
    create.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 12,
        output_tokens: 7,
        cache_read_input_tokens: 800,
        cache_creation_input_tokens: 0,
      },
    });

    const result = await askConsultant({ system: SYSTEM, messages: MESSAGES });

    expect(result.usage).toEqual({
      inputTokens: 12,
      outputTokens: 7,
      cacheReadTokens: 800,
      cacheCreationTokens: 0,
    });
  });
});
