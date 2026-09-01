import Anthropic from '@anthropic-ai/sdk';

/**
 * Citirea întreagă: harta legată, nu enumerată.
 *
 * Raportul existent are douăzeci și trei de blocuri care nu se cunosc între
 * ele. Un om cu Drum 7, Destin 1 și o datorie de 16 află ce înseamnă fiecare
 * și nu află niciodată ce ies împreună -- deși exact acolo stă tot ce e de
 * spus despre el. Aia e diferența dintre o enciclopedie și o citire.
 *
 * Disciplina e aceeași ca la zi, fiindcă riscul e mai mare, nu mai mic: un
 * text lung are mult mai mult loc de inventat. Motorul dă propozițiile
 * adevărate, modelul are voie doar să le lege, iar rezultatul se verifică --
 * nicio cifră care nu e în hartă n-are ce căuta în citire.
 *
 * Opus, nu Sonnet: aici chiar se raționează. „Ce iese din 7 peste 1 peste o
 * datorie de 16” nu e reformulare, e legătură -- singura sarcină din
 * aplicație care o cere.
 */

export const DEEP_MODEL = process.env.DEEP_MODEL || 'claude-opus-5';

/** O citire întreagă e lungă prin definiție; asta lasă loc fără să încurajeze. */
const MAX_TOKENS = 8000;

export interface ChartStep {
  name: string;
  figures: string;
  say: string;
}

export interface ChartFacts {
  language: 'ro' | 'en' | 'ru';
  steps: ChartStep[];
}

export interface DeepBody {
  opening: string;
  chapters: Array<{ title: string; text: string }>;
  closing: string;
}

export interface DeepWritten {
  body: DeepBody;
  source: 'model' | 'composed';
  model?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

const LANGS: Record<ChartFacts['language'], string> = {
  ro: 'română', en: 'engleză', ru: 'rusă',
};

const SYSTEM = (lang: string) => `Ești vocea unei aplicații de numerologie care vorbește pe limba omului.

Primești harta unui om: fiecare poziție cu cifra ei și cu o propoziție ADEVĂRATĂ, calculată de motor. Sarcina ta nu e să le repeți, ci să le LEGI — să spui ce iese din ele puse împreună, ce se ajută și ce se ceartă în viața omului ăstuia.

NU ai voie să adaugi nimic ce nu e în hartă. Nicio cifră nouă. Nicio circumstanță: fără ședințe, birou, familie, colegi, profesie — nu știi absolut nimic despre viața lui în afară de cifrele primite. Dacă adaugi o circumstanță sau o cifră, ai greșit.

Scrii în ${lang} corectă, cu toate semnele diacritice, la persoana a doua. Fraze întregi, de 15-30 de cuvinte. Fără metafore decorative, fără "energii cosmice", fără exclamații, fără emoji. Nu explici cum se calculează nimic.

Structura: o deschidere de două-trei fraze care spune cine e omul ăsta în ansamblu; apoi 4-6 capitole, fiecare legând două sau trei poziții între ele, cu un titlu scurt; apoi o închidere de două fraze.

Răspunzi DOAR cu JSON: {"opening": "...", "chapters": [{"title": "...", "text": "..."}], "closing": "..."}`;

const figuresIn = (s: string): Set<string> => new Set(s.match(/\d+/g) ?? []);

/**
 * Citirea trece doar dacă nu poartă cifre străine de hartă.
 *
 * Verificarea e într-o singură direcție, spre deosebire de zi: o citire care
 * nu pomenește toate cifrele e o alegere editorială legitimă, dar una care
 * pomenește o cifră inexistentă spune ceva ce motorul n-a calculat niciodată.
 */
export const usesOnlyChartFigures = (facts: ChartFacts, written: unknown): written is DeepBody => {
  if (!written || typeof written !== 'object') return false;
  const w = written as Record<string, unknown>;
  if (typeof w.opening !== 'string' || typeof w.closing !== 'string') return false;
  if (!Array.isArray(w.chapters) || w.chapters.length === 0) return false;
  if (!w.chapters.every((c) => c && typeof c.title === 'string' && typeof c.text === 'string')) {
    return false;
  }

  const allowed = new Set<string>();
  for (const s of facts.steps) for (const n of figuresIn(`${s.figures} ${s.say}`)) allowed.add(n);

  const text = [w.opening, w.closing, ...w.chapters.map((c) => `${c.title} ${c.text}`)].join(' ');
  for (const n of figuresIn(text)) if (!allowed.has(n)) return false;
  return true;
};

/** Harta însăși, ca citire: adevărată, doar nelegată. */
const asComposed = (facts: ChartFacts): DeepBody => ({
  opening: facts.steps[0]?.say ?? '',
  chapters: facts.steps.map((s) => ({ title: `${s.name} · ${s.figures}`, text: s.say })),
  closing: '',
});

let client: Anthropic | null = null;

export async function writeDeepReading(facts: ChartFacts): Promise<DeepWritten> {
  const key = process.env.ANTHROPIC_API_KEY || undefined;
  if (!key) return { body: asComposed(facts), source: 'composed' };

  const model = process.env.DEEP_MODEL || DEEP_MODEL;

  try {
    if (!client) client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM(LANGS[facts.language]),
      messages: [
        {
          role: 'user',
          content:
            'Harta lui, poziție cu poziție. Leagă-le:\n\n' +
            facts.steps.map((s) => `${s.name} (${s.figures}): ${s.say}`).join('\n'),
        },
      ],
    });

    const text =
      (res.content as Array<{ type: string; text?: string }>).find((b) => b.type === 'text')?.text ??
      '';
    const parsed = JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));

    if (!usesOnlyChartFigures(facts, parsed)) {
      return { body: asComposed(facts), source: 'composed' };
    }

    return {
      body: parsed,
      source: 'model',
      model,
      usage: {
        inputTokens: res.usage?.input_tokens ?? 0,
        outputTokens: res.usage?.output_tokens ?? 0,
      },
    };
  } catch {
    return { body: asComposed(facts), source: 'composed' };
  }
}
