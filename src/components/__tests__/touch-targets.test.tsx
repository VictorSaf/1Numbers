import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Ținte de atingere sub prag.
 *
 * Măsurat pe 390×844: chip-urile de capitole aveau 31px înălțime, butoanele
 * din antet 36. Ghidul iOS cere 44, Material 48. Pe o bandă de chip-uri lipite
 * orizontal, 31px înseamnă că degetul nimerește vecinul.
 *
 * Testul citește clasele din sursă, nu geometria: jsdom nu are layout, deci o
 * măsurătoare acolo ar fi mereu zero și n-ar spune nimic. Regula pe care o
 * apără e „elementul cere explicit o înălțime de atingere”, iar clasa e chiar
 * felul în care o cere.
 */

// import.meta.url e nedefinit sub transformarea din vitest, iar `new URL` cu el
// dă o cale literală „undefined”. cwd-ul e rădăcina proiectului la rulare.
const read = (p: string) => readFileSync(resolve(process.cwd(), "src", p), "utf8");
const asksForTouchHeight = (chunk: string) =>
  /min-h-11|min-h-12|\bh-11\b|\bh-12\b|min-h-\[4[48]px\]/.test(chunk);

describe("ținte de atingere", () => {
  it("chip-urile de capitole se pot atinge cu degetul", () => {
    const src = read("components/numerology/ChapterNav.tsx");
    // Banda orizontală de pe mobil: cea cu `rounded-full border`.
    const chip = src.slice(src.indexOf("lg:hidden sticky"));
    expect(asksForTouchHeight(chip)).toBe(true);
  });

  it("butonul de meniu din antet e cât un deget, pe mobil", () => {
    const src = read("components/layout/AppHeader.tsx");
    const burger = src.slice(src.indexOf("lg:hidden"), src.indexOf("lg:hidden") + 300);
    expect(asksForTouchHeight(burger)).toBe(true);
  });
});

describe("antetul pe telefon", () => {
  it("nu lasă selectorul de temă să mănânce lățimea", () => {
    // Măsurat pe 390px: eticheta „System” plus iconița plus săgeata ocupau
    // vizibil o treime din antet, lângă steag și butonul de meniu. „System” e
    // cuvântul dezvoltatorului pentru „urmează setarea telefonului” -- pe un
    // ecran îngust, cuvântul ăla costă mai mult decât spune.
    const src = read("components/ThemeSelector.tsx");

    // Interzisă e lățimea NECONDIȚIONATĂ pe telefon: pe 390px trebuie să fie
    // lat cât iconița. Ce e permis e o lățime care începe de la `sm:`.
    // Se verifică INTENȚIA, nu remediul: prima oară era scrisă `sm:w-[150px]`,
    // iar testul cerea chiar parantezele acelea -- deci a picat când lățimea a
    // devenit `sm:w-auto`, deși pe telefon nimic nu se schimbase.
    expect(src).toMatch(/(?<!:)w-11\b/);
    expect(src).not.toMatch(/(?<!:)w-(?:\[|auto|full)/);
    expect(src).toMatch(/\bsm:w-/);
    expect(src).toMatch(/hidden sm:inline|sr-only sm:not-sr-only/);
  });
});

describe("mărimile butonului", () => {
  const src = read("components/ui/button.tsx");
  const sizes = src.slice(src.indexOf("size: {"), src.indexOf("size: {") + 320);

  it("nu coboară nicio mărime sub pragul de atingere", () => {
    // 44px = h-11. Toate cele patru mărimi îl ating sau îl depășesc, fiindcă
    // un buton „mic” rămâne un buton apăsat cu degetul.
    const heights = [...sizes.matchAll(/h-(\d+)/g)].map((m) => Number(m[1]));
    expect(heights.length).toBeGreaterThanOrEqual(4);
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(11);
  });

  it("nu face „mic” mai mare decât „normal”", () => {
    // Ridicat doar sm la 44, ar fi ieșit mai înalt decât default, care era 40.
    const h = (key: string) => Number(sizes.match(new RegExp(`${key}: "h-(\\d+)`))?.[1]);
    expect(h("sm")).toBeLessThanOrEqual(h("default"));
    expect(h("default")).toBeLessThanOrEqual(h("lg"));
  });
});
