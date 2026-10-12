import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Un singur client Anthropic pentru tot serverul.
 *
 * Consultantul, ziua și citirea întreagă își făceau fiecare clientul lui, cu
 * propriul `let client` și propria citire a cheii. Trei locuri de schimbat la
 * prima modificare de configurare, și trei conexiuni HTTP în loc de una.
 */

const create = vi.fn();
const constructed = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error { constructor(public status: number, m: string) { super(m); } }
  class Anthropic {
    messages = { create };
    static APIError = APIError;
    static RateLimitError = class extends APIError {};
    static AuthenticationError = class extends APIError {};
    static BadRequestError = class extends APIError {};
    static APIConnectionError = class extends Error {};
    constructor(opts: unknown) { constructed(opts); }
  }
  return { default: Anthropic };
});

import { askConsultant } from '../lib/anthropic';
import { writeDay } from '../lib/dayWriter';
import { writeDeepReading } from '../lib/deepReading';

const answer = { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 1, output_tokens: 1 } };

// Cheia poate veni din shell-ul celui care rulează testele; aici o controlăm noi.
beforeEach(() => { create.mockReset(); create.mockResolvedValue(answer); delete process.env.ANTHROPIC_API_KEY; });
afterEach(() => { delete process.env.ANTHROPIC_API_KEY; });

describe('clientul Anthropic', () => {
  it('fără cheie, ziua și citirea nu construiesc niciun client', async () => {
    const day = await writeDay({ language: 'ro', composed: { ziua: 'Ziua asta cere ceva.' } } as never);
    const deep = await writeDeepReading({ language: 'ro', steps: [{ name: 'D', figures: '7', say: 'x' }] });

    expect(day.source).toBe('composed');
    expect(deep.source).toBe('composed');
    expect(constructed).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('e construit o dată și folosit de toți trei', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';

    await askConsultant({ system: [{ type: 'text', text: 's' }], messages: [{ role: 'user', content: 'q' }] });
    await writeDay({ language: 'ro', composed: { ziua: 'Ziua asta cere ceva.' } } as never);
    await writeDeepReading({ language: 'ro', steps: [{ name: 'D', figures: '7', say: 'x' }] });

    expect(create).toHaveBeenCalledTimes(3);
    expect(constructed).toHaveBeenCalledOnce();
    expect(constructed).toHaveBeenCalledWith({ apiKey: 'sk-ant-test' });
  });
});
