import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { inclusionTable } from "@/lib/numerology-plus/pythagorean";
import { classifyFullName } from "@/lib/numerology-plus/core";

/**
 * The chart used to carry its own letter table, which dropped diacritics rather
 * than transliterating them, so it drew eleven bars' worth of letters while the
 * rest of the page counted thirteen. It now reads from the engine.
 *
 * That makes agreement with the engine structural rather than something to
 * assert. What is still worth pinning down is the shape: the chart expects nine
 * bars, one per digit, and the engine's inclusionTable has to keep the digits
 * that do not occur in the name. If it ever returned only the digits present,
 * the axis would silently lose bars.
 */
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 640, height: 320 }),
  };
});

const renderChart = async (name: string) => {
  const { NumberDistributionChart } = await import("../NumberDistributionChart");
  return render(<NumberDistributionChart name={name} />);
};

describe("NumberDistributionChart", () => {
  it("draws one bar per digit even when most digits are absent", async () => {
    // "Ana" reaches only 1 and 5; the other seven bars must still be there.
    const { container } = await renderChart("Ana");
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(9);
  });

  it("keeps all nine for a longer name too", async () => {
    const { container } = await renderChart("Victor Ion Safta");
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(9);
  });

  it("labels the axis with the digits themselves", async () => {
    const { container } = await renderChart("Victor Ion Safta");
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")]
      .map((t) => t.textContent);
    for (const d of ["1", "5", "9"]) expect(ticks).toContain(d);
  });

  it("counts a diacritic name the way the engine does", async () => {
    // The point of the change: transliterated letters are counted, not dropped.
    const name = "Ștefan Mureșan";
    expect(classifyFullName(name)).toHaveLength(13);
    const total = Object.values(inclusionTable(name)).reduce((a, c) => a + c, 0);
    expect(total).toBe(13); // the old local table saw 11
    const { container } = await renderChart(name);
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(9);
  });

  it("renders without a bar for an empty name", async () => {
    // Guards the division that produces the percentage.
    const { container } = await renderChart("");
    expect(container.textContent).not.toMatch(/NaN/);
  });
});
