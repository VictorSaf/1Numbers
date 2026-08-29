import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TransitsTimeline from "../TransitsTimeline";
import { dualitiesTimeline, ageAt } from "@/lib/numerology-plus/pythagorean";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * The table's job is to make one rare year findable among twelve ordinary ones,
 * so the assertions here are about the highlight being present, correct, and
 * attached to the right row -- not merely that a table rendered.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
// Pinned so the window is fixed: 2024-2035, which contains the 2025 duality.
// Left to the real clock, the highlight assertions would go vacuous the year
// that row drifts out of range, and a passing test would prove nothing.
const TODAY = new Date(2026, 7, 29);

const renderTimeline = () =>
  render(
    <LanguageProvider>
      <TransitsTimeline fullName={NAME} birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

const engineRows = () => {
  const b = toBirthDate(BIRTH);
  const age = ageAt(b, TODAY);
  return { age, rows: dualitiesTimeline(NAME, b, Math.max(0, age - 2), age + 9) };
};

describe("TransitsTimeline", () => {
  it("shows the window the engine produced, row for row", () => {
    renderTimeline();
    const { rows } = engineRows();
    const body = screen.getAllByRole("row").slice(1); // drop the header
    expect(body).toHaveLength(rows.length);
    for (const [i, r] of rows.entries()) {
      expect(within(body[i]).getByText(String(r.calendarYear))).toBeTruthy();
    }
  });

  it("marks the current year so the reader has an anchor", () => {
    const { container } = renderTimeline();
    const current = container.querySelectorAll('tr[aria-current="date"]');
    expect(current).toHaveLength(1);
    const { age, rows } = engineRows();
    const expected = rows.find((r) => r.age === age)!;
    expect(current[0].textContent).toContain(String(expected.calendarYear));
  });

  it("highlights exactly the duality years, and no others", () => {
    const { container } = renderTimeline();
    const { rows } = engineRows();
    const flagged = [...container.querySelectorAll("tr[data-duality]")];
    const expected = rows.filter((r) => r.duality);
    // Guard against the assertion below passing by finding nothing to check.
    expect(expected.length).toBeGreaterThan(0);
    expect(flagged).toHaveLength(expected.length);
    for (const r of expected) {
      const row = flagged.find((el) => el.textContent?.includes(String(r.calendarYear)));
      expect(row, `year ${r.calendarYear} should be flagged`).toBeTruthy();
      // The badge has to be readable, not only a background tint.
      expect(row!.textContent).toMatch(/Dualitate|Duality|Дуальность/);
    }
  });

  it("puts Essence and Personal Year on every row", () => {
    renderTimeline();
    const { rows } = engineRows();
    const body = screen.getAllByRole("row").slice(1);
    for (const [i, r] of rows.entries()) {
      const cells = within(body[i]).getAllByRole("cell");
      // Last two columns, in order.
      expect(cells[cells.length - 2].textContent).toContain(String(r.essence));
      expect(cells[cells.length - 1].textContent).toContain(String(r.personalYear));
    }
  });

  it("names the transit letter and how far into it the year is", () => {
    renderTimeline();
    const { rows } = engineRows();
    const first = screen.getAllByRole("row")[1];
    const p = rows[0].physical!;
    expect(first.textContent).toContain(p.letter);
    // "year 3 of 9" -- a bare letter would not say when it changes.
    expect(first.textContent).toMatch(new RegExp(`${p.yearInLetter}\\D+${p.value}`));
  });

  it("leaves no placeholder or undefined in the table", () => {
    const { container } = renderTimeline();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/undefined|NaN|\{a\}|\{b\}/);
  });

  it("renders figures through the tabular class so columns line up", () => {
    const { container } = renderTimeline();
    expect(container.querySelectorAll(".num").length).toBeGreaterThanOrEqual(12);
  });
});
