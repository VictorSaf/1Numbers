import Anthropic from '@anthropic-ai/sdk';

/**
 * Singurul loc din server care știe de SDK-ul Anthropic.
 *
 * Nu există comutator de furnizor. Furnizorul e Anthropic; ce variază e dacă
 * avem sau nu cheia. Vechiul `AI_PROVIDER` avea implicit valoarea 'mock', ceea
 * ce însemna că un server fără cheie întorcea text inventat ca și cum ar fi
 * fost răspunsul modelului. Aici, fără cheie, nu se răspunde deloc.
 */

/**
 * Ales pe criteriul calității răspunsului, nu al costului: sarcina e
 * interpretare în proză în trei limbi, cu limitări de respectat, nu aritmetică
 * -- numerele vin deja calculate în prompt. Vezi D1 din planul de implementare
 * pentru ce se pierde la un model mai ieftin.
 */
export const CONSULT_MODEL = 'claude-opus-5';

/** Promptul cere explicit răspunsuri scurte; 4000 lasă loc și taie o buclă. */
const MAX_TOKENS = 4000;

export class AiUnavailableError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY is not configured');
    this.name = 'AiUnavailableError';
  }
}

export interface ConsultUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

export interface ConsultResult {
  text: string;
  truncated: boolean;
  usage: ConsultUsage;
}

// Citit leneș, la fiecare apel: procesul poate porni fără cheie, iar testele o
// pun și o scot între cazuri.
const apiKey = (): string | undefined => process.env.ANTHROPIC_API_KEY || undefined;

export const isAiConfigured = (): boolean => Boolean(apiKey());

let client: Anthropic | null = null;

const getClient = (): Anthropic => {
  const key = apiKey();
  if (!key) throw new AiUnavailableError();
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
};

export async function askConsultant(input: {
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
}): Promise<ConsultResult> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CONSULT_MODEL,
    max_tokens: MAX_TOKENS,
    // Gândirea e pornită implicit pe acest model. `low` fiindcă numerele sunt
    // deja calculate: modelul explică, nu descoperă.
    output_config: { effort: 'low' },
    system: input.system,
    messages: input.messages,
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return {
    text,
    truncated: response.stop_reason === 'max_tokens',
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
    },
  };
}
