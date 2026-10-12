import { describe, it, expect } from "vitest";
import { analyzeIndividualLetters } from "../nameAnalysis";

describe("analyzeIndividualLetters", () => {
  it("analyzes each letter correctly", () => {
    const result = analyzeIndividualLetters("Maria");
    expect(result).toHaveLength(5);
    expect(result[0].letter).toBe("M");
    expect(result[0].value).toBe(4);
    expect(result[0].isConsonant).toBe(true);
    expect(result[0].isVowel).toBe(false);
  });

  it("identifies vowels correctly", () => {
    const result = analyzeIndividualLetters("Maria");
    const vowels = result.filter(l => l.isVowel);
    expect(vowels).toHaveLength(3); // A, I, A
    expect(vowels[0].letter).toBe("A");
  });

  it("identifies consonants correctly", () => {
    const result = analyzeIndividualLetters("Maria");
    const consonants = result.filter(l => l.isConsonant);
    expect(consonants).toHaveLength(2); // M, R
  });

  it("handles empty string", () => {
    const result = analyzeIndividualLetters("");
    expect(result).toHaveLength(0);
  });

  it("ignores non-alphabetic characters", () => {
    const result = analyzeIndividualLetters("Maria123!");
    expect(result).toHaveLength(5); // Only letters
  });

  it("assigns correct positions", () => {
    const result = analyzeIndividualLetters("ABC");
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
    expect(result[2].position).toBe(3);
  });
});
