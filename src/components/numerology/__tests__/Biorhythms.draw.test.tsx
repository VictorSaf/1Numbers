import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * Does the chart actually draw?
 *
 * Recharts asks its container for a size before rendering anything, and jsdom
 * answers zero, so the sibling test file can only check the text around the
 * chart. That leaves the drawing itself unverified -- and a blank chart looks
 * exactly like a working one to a test that never inspects the SVG.
 *
 * Mocking ResponsiveContainer to hand down a fixed size is the smallest thing
 * that makes the real LineChart run. Everything below it -- scales, paths,
 * reference lines -- is the genuine library.
 */
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 640, height: 320 }),
  };
});

const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 7, 29);

describe("Biorhythms drawing", () => {
  const renderChart = async () => {
    const { default: Biorhythms } = await import("../Biorhythms");
    return render(
      <LanguageProvider>
        <Biorhythms birthDate={BIRTH} today={TODAY} />
      </LanguageProvider>,
    );
  };

  it("draws one curve per cycle", async () => {
    const { container } = await renderChart();
    const curves = container.querySelectorAll("path.recharts-curve.recharts-line-curve");
    expect(curves).toHaveLength(3);
  });

  it("gives every curve a real path, not an empty one", async () => {
    const { container } = await renderChart();
    for (const c of container.querySelectorAll("path.recharts-line-curve")) {
      const d = c.getAttribute("d") ?? "";
      // A collapsed chart still emits a path element; it just has nothing in it.
      expect(d.length).toBeGreaterThan(50);
      expect(d).not.toMatch(/NaN/);
    }
  });

  it("marks today and the zero axis", async () => {
    const { container } = await renderChart();
    const rules = container.querySelectorAll(".recharts-reference-line");
    // One per critical day, plus the y=0 axis and the vertical for today.
    expect(rules.length).toBeGreaterThanOrEqual(2);
  });

  it("labels the axis with today rather than a bare zero", async () => {
    const { container } = await renderChart();
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")]
      .map((t) => t.textContent ?? "");
    expect(ticks.some((t) => /azi|today|сегодня/.test(t))).toBe(true);
  });
});
