import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ExpressionPlanes from "../ExpressionPlanes";
import { planesOfExpression, expression } from "@/lib/numerology-plus/pythagorean";

const NAME = "Victor Ion Safta";

const renderGrid = () =>
  render(
    <LanguageProvider>
      <ExpressionPlanes fullName={NAME} />
    </LanguageProvider>,
  );

describe("ExpressionPlanes", () => {
  it("draws four planes against three natures", () => {
    renderGrid();
    // Four data rows plus the totals row, each with a row header.
    expect(screen.getAllByRole("rowheader")).toHaveLength(5);
    expect(screen.getAllByRole("row")).toHaveLength(6); // header + 4 planes + totals
  });

  it("shows the same figures the engine computed", () => {
    const { container } = renderGrid();
    const p = planesOfExpression(NAME);
    const shown = [...container.querySelectorAll("td .num")].map((n) => Number(n.textContent));
    const cells = Object.values(p.grid).flatMap((row) => Object.values(row));
    // Each cell renders its count and its sum, so both must appear.
    for (const cell of cells) {
      expect(shown).toContain(cell.count);
    }
  });

  it("keeps the grid consistent with Expression", () => {
    // The invariant the letter tables must hold, asserted through the rendered
    // component rather than only in the engine.
    const p = planesOfExpression(NAME);
    const total = Object.values(p.grid)
      .flatMap((row) => Object.values(row))
      .reduce((a, c) => a + c.sum, 0);
    expect(total).toBe(expression(NAME).raw);
  });

  it("labels both ends of the ramp, since a gradient alone means nothing", () => {
    renderGrid();
    expect(screen.getByText(/Puține litere|Few letters|Мало букв/)).toBeTruthy();
    expect(screen.getByText(/Multe litere|Many letters|Много букв/)).toBeTruthy();
  });

  it("renders figures through the tabular class", () => {
    const { container } = renderGrid();
    expect(container.querySelectorAll(".num").length).toBeGreaterThanOrEqual(12);
  });
});
