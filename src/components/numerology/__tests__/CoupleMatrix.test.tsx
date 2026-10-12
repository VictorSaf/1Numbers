import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CoupleMatrix from "../CoupleMatrix";
import { coupleMatrix } from "@/lib/numerology-plus/matrix";
import { toBirthDate } from "@/lib/numerology-plus/core";

const A = new Date(2002, 10, 25);
const B = new Date(1990, 5, 15);

const renderCouple = () =>
  render(
    <LanguageProvider>
      <CoupleMatrix birthDateA={A} birthDateB={B} />
    </LanguageProvider>,
  );

describe("CoupleMatrix", () => {
  const m = coupleMatrix(toBirthDate(A), toBirthDate(B));

  it("arată cele nouă puncte ale cuplului în ambele reduceri", () => {
    const { container } = renderCouple();
    const points = m.reductions.find((r) => r.id === "points")!;
    expect(points.cells).toHaveLength(9);
    for (const c of points.cells) {
      const cell = container.querySelector(`[data-zone="points"] [data-cell="${c.key}"]`)!;
      expect(cell, c.key).toBeTruthy();
      expect(cell.querySelector('[data-reduction="digitsum"]')!.textContent).toBe(String(c.digitsum));
      expect(cell.querySelector('[data-reduction="mod22"]')!.textContent).toBe(String(c.mod22));
    }
  });

  it("arată portretul și coada cuplului în ambele modele", () => {
    const { container } = renderCouple();
    for (const id of ["portrait", "karmicTail.ladini", "karmicTail.vratamir"])
      expect(container.querySelector(`[data-zone="${id}"]`), id).toBeTruthy();
    expect(container.querySelector('[data-model-family="karmicTail"]')).toBeTruthy();
  });

  it("are pașii fiecărui punct (cine cu cine s-a adunat)", () => {
    const { container } = renderCouple();
    const steps = container.querySelector('[data-zone="points"] details[data-steps]');
    expect(steps?.textContent).toMatch(/E₁/);
  });

  it("nu lasă text nerezolvat", () => {
    const { container } = renderCouple();
    expect(container.textContent).not.toMatch(/undefined|NaN|\{/);
  });
});
