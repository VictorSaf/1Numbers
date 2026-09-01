import Anthropic from '@anthropic-ai/sdk';

/**
 * Cine scrie ziua: motorul spune adevărul, modelul îl spune altfel.
 *
 * Măsurat pe modele locale (qwen3 8B și 30B) și pe Haiku: un model liber să
 * compună din cifre inventează de fiecare dată circumstanțe -- „la birou”,
 * „în ședințe”, „proiectul care stagnează în e-mailuri”, „cineva care nu spune
 * ce e corect” -- despre un om despre care nu i s-a dat nimic. Nu e un defect
 * al modelului, e consecința golului dintre cât știe și cât trebuie să scrie.
 *
 * De aceea aici modelul NU primește cifre ca să compună. Primește propozițiile
 * gata făcute de motor și are voie doar să le reformuleze. Ce nu e în date nu
 * poate intra în text, prin construcție -- nu prin bunăvoința modelului.
 *
 * Și ce iese e verificat: cifrele din sursă trebuie să fie toate în rezultat,
 * iar cifre noi n-au voie să apară. Un text plat e o pagubă; un text care
 * spune altă cifră decât a calculat motorul e o minciună, și se aruncă.
 */

/**
 * Sonnet, măsurat: trei rulări din trei cu română impecabilă, diacritice
 * complete, zero invenții. Haiku 4.5 a greșit în trei rulări din patru --
 * o dată fără niciun diacritic ("Astazi se cere rezultat concret si...").
 * Într-un produs care se vinde cu „vorbim pe limba omului”, asta nu se
 * publică, iar economia nu compensează.
 */
export const DAY_WRITER_MODEL = process.env.DAY_WRITER_MODEL || 'claude-sonnet-5';

/** Reformularea a patru fraze; 1500 lasă loc fără să încurajeze eseuri. */
const MAX_TOKENS = 1500;

/**
 * Ziua are una sau două relații cu harta, nu întotdeauna două.
 *
 * Când există doar un ecou și nicio fricțiune, `fric` și `aproape` primeau
 * amândouă aceeași propoziție -- clientul cădea pe `relations[0]` pentru
 * ambele -- iar modelul o reformula de două ori. Pe ecran ieșeau două
 * paragrafe care spuneau exact același lucru cu alte cuvinte.
 *
 * Deci părțile de relație sunt opționale, iar textul are exact atâtea bucăți
 * câte relații are ziua.
 */
export const DAY_PARTS = ['ziua', 'fric', 'aproape', 'intrebare'] as const;
export const REQUIRED_PARTS = ['ziua', 'intrebare'] as const;
export type DayPart = (typeof DAY_PARTS)[number];
export type DayBody = Partial<Record<DayPart, string>> & { ziua: string; intrebare: string };

export interface DayFacts {
  personalDay: number;
  language: 'ro' | 'en' | 'ru';
  /** Propozițiile adevărate, compuse de motor. Sursa, și plasa de siguranță. */
  composed: DayBody;
}

export interface DayWritten {
  body: DayBody;
  source: 'model' | 'composed';
  model?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

const LANGS: Record<DayFacts['language'], string> = {
  ro: 'română', en: 'engleză', ru: 'rusă',
};

const SYSTEM = (lang: string) => `Ești vocea unei aplicații de numerologie care vorbește pe limba omului.

Primești patru propoziții ADEVĂRATE, calculate de motor. Sarcina ta e să le rescrii altfel, mai viu, păstrând exact același înțeles și exact aceleași cifre.

NU ai voie să adaugi nimic ce nu e în ele. Fără ședințe, birou, e-mailuri, colegi, proiecte, "cineva" — nu știi absolut nimic despre viața acestui om în afară de ce ți se dă. Dacă adaugi o circumstanță, ai greșit. Nu introduci cifre noi și nu scoți niciuna din cele primite.

Scrii în ${lang} corectă, cu toate semnele diacritice, la persoana a doua. Propoziții de 12-25 de cuvinte. Fără metafore decorative, fără "energii cosmice", fără exclamații, fără emoji, fără titluri.

Răspunzi DOAR cu un obiect JSON, cu EXACT aceleași chei pe care le-ai primit — nici una în plus, nici una în minus. Fără text în jurul lui.`;

/** Cifrele dintr-un text, ca mulțime. Ordinea și repetarea nu contează. */
const figuresIn = (s: string): Set<string> => new Set(s.match(/\d+/g) ?? []);

/**
 * Regula e asimetrică, și asta e miezul ei.
 *
 * Ce e în sursă trebuie păstrat: o frază care pierde „Destinul tău e 1” spune
 * altceva decât a calculat motorul. Dar ce se ADAUGĂ e îngăduit doar din
 * mulțimea permisă -- sursa plus ziua personală, care e subiectul întregii
 * citiri și a plecat în aceeași cerere.
 *
 * Simetric, regula cerea modelului să pomenească ziua în fiecare frază; strict
 * pe sursă, arunca un text corect care spunea „Sufletul tău e 5, ziua cere 3”.
 */
const keepsFigures = (source: string, written: string, alsoAllowed: string[] = []): boolean => {
  const from = figuresIn(source);
  const to = figuresIn(written);
  const allowed = new Set([...from, ...alsoAllowed]);

  for (const n of from) if (!to.has(n)) return false;
  for (const n of to) if (!allowed.has(n)) return false;
  return true;
};

/** Textul modelului trece doar dacă e întreg și spune aceleași cifre. */
export const isFaithful = (
  composed: DayBody,
  written: unknown,
  /**
   * Ziua personală e îngăduită în orice frază, chiar dacă propoziția sursă
   * n-o conține.
   *
   * Ea e subiectul întregii citiri: „Sufletul tău e 5, ziua cere 3” e o
   * propoziție mai bună decât „Sufletul tău e 5”, iar cifra nu e inventată --
   * a plecat în aceeași cerere. Prima versiune o respingea ca pe o cifră
   * străină și arunca un text corect.
   */
  personalDay?: number,
): written is DayBody => {
  if (!written || typeof written !== 'object') return false;
  const w = written as Record<string, unknown>;
  // Verificate sunt fix părțile trimise: ce n-a plecat n-are ce să se întoarcă.
  const sent = DAY_PARTS.filter((k) => typeof composed[k] === 'string');
  return sent.every(
    (k) =>
      typeof w[k] === 'string' &&
      (w[k] as string).trim().length > 10 &&
      keepsFigures(
        composed[k] as string,
        w[k] as string,
        personalDay === undefined ? [] : [String(personalDay)],
      ),
  );
};

let client: Anthropic | null = null;

export async function writeDay(facts: DayFacts): Promise<DayWritten> {
  const key = process.env.ANTHROPIC_API_KEY || undefined;
  // Fără cheie nu se cheamă nimic. Textul compus nu e o improvizație: spune
  // aceleași fapte calculate, doar în cuvinte fixe.
  if (!key) return { body: facts.composed, source: 'composed' };

  const model = process.env.DAY_WRITER_MODEL || DAY_WRITER_MODEL;

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
            'Rescrie astea patru, păstrând cifrele:\n\n' +
            DAY_PARTS.filter((k) => facts.composed[k])
              .map((k) => `${k}: ${JSON.stringify(facts.composed[k])}`)
              .join('\n'),
        },
      ],
    });

    const text =
      (res.content as Array<{ type: string; text?: string }>).find((b) => b.type === 'text')?.text ??
      '';
    const parsed = JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));

    if (!isFaithful(facts.composed, parsed, facts.personalDay)) {
      return { body: facts.composed, source: 'composed' };
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
    // Orice se strică -- rețea, JSON, limită -- ziua tot trebuie să existe.
    return { body: facts.composed, source: 'composed' };
  }
}
