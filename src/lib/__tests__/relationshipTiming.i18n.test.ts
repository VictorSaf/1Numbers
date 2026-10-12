import { describe, it, expect } from "vitest";
import { getTranslation, type Language } from "../translations";
import type { AlignmentBand } from "../relationshipTiming";

/**
 * Cele trei benzi trebuie să-și spună numele în toate trei limbile, iar
 * numele alea nu au voie să sune a eroare: o lună de tensiune e o distanță
 * între doi oameni, nu o defecțiune. Testul verifică forma; tonul îl verifică
 * omul care citește textele.
 */

const LANGS: Language[] = ["ro", "en", "ru"];
const BANDS: AlignmentBand[] = ["harmony", "mixed", "tension"];

describe("stratul temporal vorbește trei limbi", () => {
  it.each(LANGS)("%s are titlu, subtitlu și cele două secțiuni", (lang) => {
    const t = getTranslation(lang);

    for (const key of ["title", "subtitle", "thisYear", "monthByMonth", "yourYear", "theirYear"] as const) {
      expect(t.timing[key], `${lang}.timing.${key}`).toBeTruthy();
    }
  });

  it.each(LANGS)("%s numește fiecare bandă și o explică", (lang) => {
    const t = getTranslation(lang);

    for (const band of BANDS) {
      expect(t.timing.bands[band], `${lang}.timing.bands.${band}`).toBeTruthy();
      expect(t.timing.bandHints[band], `${lang}.timing.bandHints.${band}`).toBeTruthy();
    }
  });

  it("nu repetă aceeași etichetă de bandă în toate trei limbile", () => {
    for (const band of BANDS) {
      const labels = LANGS.map((lang) => getTranslation(lang).timing.bands[band]);
      expect(new Set(labels).size, `bands.${band}`).toBe(3);
    }
  });
});
