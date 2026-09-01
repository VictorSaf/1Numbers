/**
 * Tipar + arhetip + sfaturi → interpretarea finală.
 *
 * Arhetipurile vin din motor (numerology-plus), care e citit, nu modificat.
 * Consecința practică: dacă cineva schimbă arhetipul cifrei 7, se actualizează
 * 777 și 7777 în toate limbile, fără nicio atingere aici.
 */

import { archetypeFor, type Lang } from "@/lib/numerology-plus";
import type { Pattern } from "./patterns";
import { PATTERN_FRAMES, type PatternFrame } from "./frames";
import { DIGIT_ADVICE } from "./advice";

const LANGS: Lang[] = ["ro", "en", "ru"];

export interface AngelNumberMeaning {
  number: string;
  title: Record<Lang, string>;
  shortMessage: Record<Lang, string>;
  fullMeaning: Record<Lang, string>;
  spiritualSignificance: Record<Lang, string>;
  actionAdvice: Record<Lang, string[]>;
  relatedNumbers: string[];
  keywords: Record<Lang, string[]>;
  frequency: "common" | "uncommon" | "rare";
}

const fill = (tpl: string, vars: Record<string, string | number>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

const byLang = (fn: (lang: Lang) => string): Record<Lang, string> =>
  Object.fromEntries(LANGS.map((l) => [l, fn(l)])) as Record<Lang, string>;

const byLangList = (fn: (lang: Lang) => string[]): Record<Lang, string[]> =>
  Object.fromEntries(LANGS.map((l) => [l, fn(l)])) as Record<Lang, string[]>;

/** Rudele unei secvențe: alte forme ale acelorași cifre, fără ea însăși. */
function relatives(p: Pattern): string[] {
  const d = String(p.digitA);
  if (p.digitA === p.digitB) {
    return [d, d.repeat(2), d.repeat(3), d.repeat(4)]
      .filter((n) => n !== p.sequence)
      .slice(0, 3);
  }
  return [d, String(p.digitB), [...p.sequence].reverse().join("")]
    .filter((n) => n !== p.sequence)
    .slice(0, 3);
}

export function composeMeaning(pattern: Pattern): AngelNumberMeaning | null {
  const frame: PatternFrame | undefined = PATTERN_FRAMES[pattern.kind];
  if (!frame) return null;

  const a = archetypeFor(pattern.digitA);
  const b = archetypeFor(pattern.digitB);

  const vars = (lang: Lang) => ({
    sequence: pattern.sequence,
    digitA: pattern.digitA,
    digitB: pattern.digitB,
    titleA: a.title[lang],
    essenceA: a.essence[lang],
    strengthA: a.strength[lang],
    shadowA: a.shadow[lang],
    titleB: b.title[lang],
    essenceB: b.essence[lang],
    strengthB: b.strength[lang],
    shadowB: b.shadow[lang],
  });

  return {
    number: pattern.sequence,
    title: byLang((l) => fill(frame.titleTpl[l], vars(l))),
    shortMessage: byLang((l) => fill(frame.shortTpl[l], vars(l))),
    spiritualSignificance: byLang((l) => fill(frame.spiritualTpl[l], vars(l))),
    fullMeaning: byLang((l) =>
      [frame.leadTpl[l], frame.amplifyTpl[l], frame.worksTpl[l], frame.breaksTpl[l]]
        .map((tpl) => fill(tpl, vars(l)))
        .join(" "),
    ),
    actionAdvice: byLangList((l) => [
      ...DIGIT_ADVICE[pattern.digitA][l],
      fill(frame.adviceTpl[l], vars(l)),
    ]),
    keywords: byLangList((l) =>
      pattern.digitA === pattern.digitB
        ? a.keywords[l].slice(0, 4)
        : [...a.keywords[l].slice(0, 2), ...b.keywords[l].slice(0, 2)],
    ),
    relatedNumbers: relatives(pattern),
    frequency: frame.frequency,
  };
}
