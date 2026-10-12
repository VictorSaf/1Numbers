import { describe, it, expect } from "vitest";
import { DAY_HORIZON_DAYS, shiftDay, isWithinHorizon, clampToHorizon } from "../dayHorizon";
import { formatCalendarDate } from "../calendarDate";

/**
 * Orizontul e o margine, nu o sugestie.
 *
 * Un buton "înainte" fără capăt nu are stare dezactivată onestă, iar un
 * `?zi=` venit din afară poate cere orice. Ambele au nevoie de aceeași
 * aritmetică, într-un singur loc.
 *
 * Toate datele sunt fixe: `new Date()` fără argument face testul vacuu peste
 * un an.
 */

const TODAY = new Date(2026, 8, 1); // 1 septembrie 2026

describe("shiftDay", () => {
  it("mută o zi înainte", () => {
    expect(formatCalendarDate(shiftDay(TODAY, 1))).toBe("2026-09-02");
  });

  it("mută o zi înapoi", () => {
    expect(formatCalendarDate(shiftDay(TODAY, -1))).toBe("2026-08-31");
  });

  it("trece peste capătul lunii fără să se piardă", () => {
    expect(formatCalendarDate(shiftDay(new Date(2026, 0, 31), 1))).toBe("2026-02-01");
  });

  it("nu modifică data primită", () => {
    const original = new Date(2026, 8, 1);
    shiftDay(original, 30);
    expect(formatCalendarDate(original)).toBe("2026-09-01");
  });
});

describe("isWithinHorizon", () => {
  it("acceptă ziua curentă", () => {
    expect(isWithinHorizon(TODAY, TODAY)).toBe(true);
  });

  it("acceptă exact marginea din față", () => {
    expect(isWithinHorizon(shiftDay(TODAY, DAY_HORIZON_DAYS), TODAY)).toBe(true);
  });

  it("acceptă exact marginea din spate", () => {
    expect(isWithinHorizon(shiftDay(TODAY, -DAY_HORIZON_DAYS), TODAY)).toBe(true);
  });

  it("refuză o zi peste marginea din față", () => {
    expect(isWithinHorizon(shiftDay(TODAY, DAY_HORIZON_DAYS + 1), TODAY)).toBe(false);
  });

  it("refuză o zi peste marginea din spate", () => {
    expect(isWithinHorizon(shiftDay(TODAY, -DAY_HORIZON_DAYS - 1), TODAY)).toBe(false);
  });
});

describe("clampToHorizon", () => {
  it("lasă neatinsă o zi dinăuntru", () => {
    expect(formatCalendarDate(clampToHorizon(new Date(2026, 8, 10), TODAY))).toBe("2026-09-10");
  });

  it("aduce la margine o zi prea departe în față", () => {
    const far = new Date(2030, 0, 1);
    expect(formatCalendarDate(clampToHorizon(far, TODAY))).toBe(
      formatCalendarDate(shiftDay(TODAY, DAY_HORIZON_DAYS)),
    );
  });

  it("aduce la margine o zi prea departe în spate", () => {
    const far = new Date(1999, 0, 1);
    expect(formatCalendarDate(clampToHorizon(far, TODAY))).toBe(
      formatCalendarDate(shiftDay(TODAY, -DAY_HORIZON_DAYS)),
    );
  });

  it("ignoră ora din datele primite", () => {
    // `today` vine din `new Date()` în pagină, deci are ore, minute, secunde.
    // Fără normalizare, o zi la exact +90 pică sau trece în funcție de ceas.
    const noon = new Date(2026, 8, 1, 13, 45, 30);
    expect(isWithinHorizon(shiftDay(noon, DAY_HORIZON_DAYS), noon)).toBe(true);
  });
});
