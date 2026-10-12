import { describe, it, expect } from "vitest";
import { humanProfileError } from "../profileErrors";

describe("humanProfileError", () => {
  it("traduce refuzurile pe care le cunoaște", () => {
    for (const code of ["admin_only", "own_map_exists", "identity_is_fixed"]) {
      for (const lang of ["ro", "en", "ru"] as const) {
        const m = humanProfileError(code, lang);
        expect(m, `${code}/${lang}`).not.toBeNull();
        expect(m!.title.length).toBeGreaterThan(5);
        expect(m!.body.length).toBeGreaterThan(30);
        expect(`${m!.title} ${m!.body}`).not.toContain(code);
      }
    }
  });

  it("nu inventează un motiv pentru ce nu cunoaște", () => {
    expect(humanProfileError("ceva nou", "ro")).toBeNull();
    expect(humanProfileError(undefined, "ro")).toBeNull();
  });

  it("nu numește un refuz „avarie”", () => {
    // Un toast roșu ar spune „s-a stricat ceva”. E o regulă, nu o defecțiune.
    expect(humanProfileError("admin_only", "ro")!.isFailure).toBe(false);
  });

  it("găsește codul și când serverul îl trimite într-o frază", () => {
    expect(humanProfileError('{"error":"admin_only"}', "en")).not.toBeNull();
  });
});
