import { describe, it, expect } from "vitest";
import { parseSequence, CATALOG } from "../patterns";

describe("parseSequence", () => {
  it("citește un triplu", () => {
    expect(parseSequence("444")).toEqual({ kind: "triple", sequence: "444", digitA: 4, digitB: 4 });
    expect(parseSequence("000")).toEqual({ kind: "triple", sequence: "000", digitA: 0, digitB: 0 });
  });

  it("citește un cvadruplu, și orice repetare mai lungă", () => {
    expect(parseSequence("1111")).toEqual({ kind: "quad", sequence: "1111", digitA: 1, digitB: 1 });
    expect(parseSequence("77777")).toEqual({ kind: "quad", sequence: "77777", digitA: 7, digitB: 7 });
  });

  it("citește o alternanță ABAB", () => {
    expect(parseSequence("1212")).toEqual({ kind: "alternating", sequence: "1212", digitA: 1, digitB: 2 });
    expect(parseSequence("1010")).toEqual({ kind: "alternating", sequence: "1010", digitA: 1, digitB: 0 });
  });

  it("citește o oglindă ABBA", () => {
    expect(parseSequence("1221")).toEqual({ kind: "mirror", sequence: "1221", digitA: 1, digitB: 2 });
  });

  it("citește un urcuș și o coborâre", () => {
    expect(parseSequence("123")).toEqual({ kind: "ascending", sequence: "123", digitA: 1, digitB: 3 });
    expect(parseSequence("1234")).toEqual({ kind: "ascending", sequence: "1234", digitA: 1, digitB: 4 });
    expect(parseSequence("4321")).toEqual({ kind: "descending", sequence: "4321", digitA: 4, digitB: 1 });
  });

  it("ignoră ce nu e cifră", () => {
    expect(parseSequence("11:11")).toEqual({ kind: "quad", sequence: "1111", digitA: 1, digitB: 1 });
  });

  it("nu inventează un tipar acolo unde nu e", () => {
    expect(parseSequence("4729")).toBeNull();
    expect(parseSequence("12")).toBeNull();
    expect(parseSequence("")).toBeNull();
    expect(parseSequence("abc")).toBeNull();
  });

  it("preferă repetarea în fața celorlalte forme pe care 1111 le satisface și el", () => {
    // 1111 e și ABAB, și palindrom. Repetarea are prioritate.
    expect(parseSequence("1111")!.kind).toBe("quad");
    // 111 e și palindrom.
    expect(parseSequence("111")!.kind).toBe("triple");
  });
});

describe("CATALOG", () => {
  it("are 35 de secvențe, fără duplicate", () => {
    expect(CATALOG).toHaveLength(35);
    expect(new Set(CATALOG).size).toBe(35);
  });

  it("conține toate cele 12 secvențe pe care le aveam deja", () => {
    for (const n of ["000","111","222","333","444","555","666","777","888","999","1111","1234"]) {
      expect(CATALOG, n).toContain(n);
    }
  });

  it("are un tipar recunoscut pentru fiecare intrare", () => {
    for (const seq of CATALOG) expect(parseSequence(seq), seq).not.toBeNull();
  });
});
