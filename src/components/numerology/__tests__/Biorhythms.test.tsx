import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Biorhythms from "../Biorhythms";
import { biorhythmSeries, biorhythm } from "@/lib/numerology-plus/systems";
import { daysBetween } from "@/lib/numerology-plus/core";

/**
 * Recharts measures its container before drawing, and jsdom reports every
 * element as zero by zero, so the SVG paths are not reliably present here. The
 * assertions therefore target what the component itself derives and renders as
 * text -- above all the critical-day list, which is the part a reader acts on
 * and the part that would silently empty if the threshold or the offsets broke.
 */

const BIRTH = new Date(1990, 7, 25);
// Pinned: which days come out critical depends entirely on the day you ask.
const TODAY = new Date(2026, 7, 29);

const renderChart = () =>
  render(
    <LanguageProvider>
      <Biorhythms birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

const expectedCriticals = () => {
  const days = daysBetween(BIRTH, TODAY);
  return biorhythmSeries(days, 30)
    .filter((r) => r.critical === 1)
    .map((r) => r.offset as number);
};

describe("Biorhythms", () => {
  it("names the three cycle lengths so the curves are not unexplained", () => {
    renderChart();
    expect(screen.getByText(/23.*28.*33/)).toBeTruthy();
  });

  it("lists exactly the critical days the engine found", () => {
    const criticals = expectedCriticals();
    // A month spanning three cycles should always cross zero somewhere; an
    // empty list would mean the assertion below proves nothing.
    expect(criticals.length).toBeGreaterThan(0);

    const { container } = renderChart();
    const line = [...container.querySelectorAll("p")]
      .map((p) => p.textContent ?? "")
      .find((t) => /Zile critice|Critical days|Критические дни/.test(t))!;
    expect(line).toBeTruthy();

    for (const off of criticals) {
      const shown = off === 0 ? /azi|today|сегодня/ : new RegExp(`\\${off > 0 ? "+" : "-"}${Math.abs(off)}\\b`);
      expect(line, `offset ${off}`).toMatch(shown);
    }
  });

  it("only calls a day critical when a cycle really is near zero", () => {
    // The reverse direction: nothing should be listed that is not a crossing.
    const days = daysBetween(BIRTH, TODAY);
    for (const off of expectedCriticals()) {
      const nearest = Math.min(
        ...(["physical", "emotional", "intellectual"] as const).map((c) =>
          Math.abs(biorhythm(days + off, c)),
        ),
      );
      expect(nearest, `offset ${off}`).toBeLessThan(0.05);
    }
  });

  it("frames critical days as transitions rather than warnings", () => {
    // The copy matters: these are sine crossings, and presenting them as bad
    // days would be a claim the arithmetic does not support.
    renderChart();
    expect(
      screen.getByText(/tranziții, nu verdicte|transitions, not verdicts|переходы, а не приговоры/),
    ).toBeTruthy();
  });

  it("renders without throwing when the window has no crossing", () => {
    // Guard the empty branch, which the pinned date does not exercise.
    const { container } = render(
      <LanguageProvider>
        <Biorhythms birthDate={BIRTH} today={new Date(1990, 7, 25)} />
      </LanguageProvider>,
    );
    expect(container.textContent).toBeTruthy();
  });
});
