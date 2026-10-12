/**
 * Numerele-înger. API-ul public, cu aceleași nume ca vechiul angelNumbers.ts,
 * ca AngelNumberCard și unealta să nu se schimbe în afara căii de import.
 */

import type { Lang } from "@/lib/numerology-plus";
import { CATALOG, parseSequence } from "./patterns";
import { composeMeaning, type AngelNumberMeaning } from "./compose";

export type { AngelNumberMeaning };
export { CATALOG };

/**
 * Rezolvă o secvență. Răspunde și pentru numere din afara catalogului, atâta
 * timp cât forma lor e recunoscută — catalogul e ce afișăm, nu limita a ce
 * putem citi. Pentru un număr fără niciun tipar, null: nu inventăm un sens.
 */
export function getAngelNumberMeaning(input: string): AngelNumberMeaning | null {
  const pattern = parseSequence(input);
  return pattern ? composeMeaning(pattern) : null;
}

export function getAllAngelNumbers(): AngelNumberMeaning[] {
  return CATALOG.map((seq) => getAngelNumberMeaning(seq)).filter(
    (m): m is AngelNumberMeaning => m !== null,
  );
}

export function searchAngelNumbers(query: string, language: Lang): AngelNumberMeaning[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllAngelNumbers().filter(
    (m) =>
      m.number.includes(q) ||
      m.title[language].toLowerCase().includes(q) ||
      m.keywords[language].some((k) => k.toLowerCase().includes(q)),
  );
}
