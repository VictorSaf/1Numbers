import { describe, it, expect } from "vitest";
import { buildIcs, personalDays, personalHours } from "../ics";

const B = { day: 25, month: 8, year: 1990 };

describe("ics", () => {
  it("dă ziua personală în ambele convenții; înainte de aniversare ele diferă", () => {
    const [d] = personalDays(B, new Date(2026, 2, 1), 1);
    // an: 8 + 7 + 1 = 16 → 7; lună: 7 + 3 = 10 → 1; zi: 1 + 1 = 2
    expect(d.jan).toBe(2);
    // an de la aniversare (2025): 8 + 7 + 9 = 24 → 6; lună 9; zi 10 → 1
    expect(d.birthday).toBe(1);
  });

  it("după aniversare cele două convenții coincid", () => {
    const [d] = personalDays(B, new Date(2026, 9, 1), 1);
    expect(d.jan).toBe(d.birthday);
  });

  it("scrie un calendar valid, cu un eveniment pe zi și rânduri CRLF", () => {
    const ics = buildIcs(B, new Date(2026, 2, 1), 3, "ro", new Date(2026, 0, 1));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics).toContain("DTSTART;VALUE=DATE:20260301");
    expect(ics).toContain("DTEND;VALUE=DATE:20260302");
    expect(ics).toContain("SUMMARY:Ziua personală 2 / 1");
  });

  it("dă 24 de ore personale, în două convenții", () => {
    const h = personalHours(5);
    expect(h).toHaveLength(24);
    expect(h[13]).toEqual({ hour: 13, h24: 9, h12: 1 + 5 }); // 5 + 13 = 18 → 9; 5 + 1 = 6
  });
});
