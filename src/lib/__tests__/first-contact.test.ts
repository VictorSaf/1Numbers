import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Drumul anonim până la prima hartă nu cere cont.
 *
 * Contul se cere unde are ce să apere: în `SaveMapButton`, la salvarea hărții,
 * cu un toast și `/auth?redirect=`. Nicăieri înainte. Testul ăsta e o
 * santinelă -- cade dacă cineva pune vreodată un zid în fața calculatorului,
 * care e singurul motiv pentru care oamenii ajung aici.
 *
 * Scanare de sursă, ca `navigation.test.ts`: randarea lui Index.tsx ar cere
 * router, auth, query și rețea pentru a testa o afirmație care e vizibilă în
 * text.
 */

const ROOT = resolve(__dirname, "../../..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("primul contact nu cere cont", () => {
  it("pagina de start nu trimite vizitatorul la /auth", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).not.toMatch(/["'`]\/auth/);
  });

  it("formularul nu trimite vizitatorul la /auth", () => {
    expect(read("src/components/NumerologyForm.tsx")).not.toMatch(/["'`]\/auth/);
  });

  it("promisiunea de la prima vizită nu trimite vizitatorul la /auth", () => {
    expect(read("src/components/FirstVisitPromise.tsx")).not.toMatch(/["'`]\/auth/);
  });

  it("contul se cere în continuare la salvarea hărții, unde are ce apăra", () => {
    const save = read("src/components/numerology/SaveMapButton.tsx");
    expect(save).toMatch(/isAuthenticated/);
    expect(save).toMatch(/\/auth\?redirect=/);
  });

  it("pagina de start oferă o hartă de citit fără să scrii nimic", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).toMatch(/FirstVisitPromise/);
    expect(index).toMatch(/EXAMPLE_NAME/);
  });
});
