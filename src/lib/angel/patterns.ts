export type PatternKind = "triple" | "quad" | "alternating" | "mirror" | "ascending" | "descending";

export interface Pattern {
  kind: PatternKind;
  sequence: string;
  digitA: number;
  digitB: number;
}

const digitsOf = (s: string): number[] => [...s].map(Number);

export function parseSequence(input: string): Pattern | null {
  const sequence = (input ?? "").replace(/\D/g, "");
  if (sequence.length < 3) return null;

  const d = digitsOf(sequence);
  const first = d[0];
  const last = d[d.length - 1];

  if (d.every((x) => x === first)) {
    const kind: PatternKind = sequence.length === 3 ? "triple" : "quad";
    return { kind, sequence, digitA: first, digitB: first };
  }

  if (sequence.length === 4 && first !== d[1]) {
    if (d[0] === d[2] && d[1] === d[3]) {
      return { kind: "alternating", sequence, digitA: d[0], digitB: d[1] };
    }
    if (d[0] === d[3] && d[1] === d[2]) {
      return { kind: "mirror", sequence, digitA: d[0], digitB: d[1] };
    }
  }

  if (d.every((x, i) => i === 0 || x === d[i - 1] + 1)) {
    return { kind: "ascending", sequence, digitA: first, digitB: last };
  }
  if (d.every((x, i) => i === 0 || x === d[i - 1] - 1)) {
    return { kind: "descending", sequence, digitA: first, digitB: last };
  }

  return null;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const CATALOG: string[] = [
  ...DIGITS.map((n) => String(n).repeat(3)),
  ...DIGITS.map((n) => String(n).repeat(4)),
  "1010", "1212", "1313", "1414", "1515", "2121", "2323",
  "1221", "1331", "1441", "1551",
  "123", "1234",
  "321", "4321",
];
