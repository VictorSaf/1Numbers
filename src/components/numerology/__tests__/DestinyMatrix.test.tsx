import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DestinyMatrix from "../DestinyMatrix";
import { compareReductions, ageLine, exactAge } from "@/lib/numerology-plus/matrix";
import { destinyMatrix } from "@/lib/numerology-plus/matrix";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * The engine's suite proves the arcana arithmetic. This proves the figure is
 * readable: that every point reaches the screen, that the numbers on it are the
 * ones the engine computed, and that selecting a point actually changes the
 * reading rather than leaving the centre's text in place.
 */

const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 9, 12);

const renderMatrix = () =>
  render(
    <LanguageProvider>
      <DestinyMatrix birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

/** Punctele octagramei — doar cele din figură, nu și dezvăluirile de calcul. */
const octagram = () => within(document.querySelector("figure svg") as HTMLElement).getAllByRole("button");

describe("DestinyMatrix", () => {
  it("draws the nine base points and no more", () => {
    renderMatrix();
    // The derived zones are listed below the figure, each with its source and
    // both reductions; the octagram itself stays the nine base points.
    expect(octagram()).toHaveLength(9);
  });

  it("shows the arcana the engine computed", () => {
    const { container } = renderMatrix();
    const engine = destinyMatrix(toBirthDate(BIRTH));
    const drawn = [...container.querySelectorAll("svg text")].map((t) => Number(t.textContent));
    for (const point of engine.points) {
      expect(drawn, `point ${point.key}`).toContain(point.arcana);
    }
    expect(drawn).toHaveLength(9);
  });

  it("keeps every arcana within the twenty-two", () => {
    const { container } = renderMatrix();
    for (const t of container.querySelectorAll("svg text")) {
      const n = Number(t.textContent);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(22);
    }
  });

  it("opens on the soul point with a full reading", () => {
    renderMatrix();
    const panel = screen.getByRole("heading", { level: 4 }).closest("div")?.parentElement;
    expect(panel).toBeTruthy();
    const text = panel!.textContent ?? "";
    expect(text).not.toMatch(/undefined|\{(title|light|shadow|task)\}/);
    // Light, shadow and task are the three fields that make the point useful.
    expect(text.length).toBeGreaterThan(80);
  });

  it("changes the reading when another point is selected", () => {
    renderMatrix();
    const before = screen.getByRole("heading", { level: 4 }).textContent;
    const points = octagram();
    // Walk to a point whose arcana differs from the centre's, so a changed
    // heading is proof of selection rather than coincidence.
    const centre = points.find((p) => p.getAttribute("aria-pressed") === "true")!;
    const centreArcana = centre.getAttribute("aria-label")?.split(": ").pop();
    const other = points.find((p) => p.getAttribute("aria-label")?.split(": ").pop() !== centreArcana);
    if (!other) return; // A birth date where all nine agree has nothing to prove here.
    fireEvent.click(other);
    expect(screen.getByRole("heading", { level: 4 }).textContent).not.toBe(before);
    expect(other.getAttribute("aria-pressed")).toBe("true");
  });

  it("is reachable by keyboard, not only by pointer", () => {
    renderMatrix();
    const points = octagram();
    const target = points.find((p) => p.getAttribute("aria-pressed") === "false")!;
    expect(target.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(target, { key: "Enter" });
    expect(target.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders numerals through the tabular class", () => {
    const { container } = renderMatrix();
    expect(container.querySelectorAll(".num").length).toBeGreaterThanOrEqual(9);
  });

  it("names each point for a screen reader", () => {
    renderMatrix();
    for (const p of octagram()) {
      const label = p.getAttribute("aria-label") ?? "";
      // "<position label>: <arcana>" -- a bare number would tell a blind user nothing.
      expect(label).toMatch(/\S+.*: \d+$/);
    }
  });

  it("keeps the keyword chips free of placeholders", () => {
    const { container } = renderMatrix();
    // Legat de rolul elementului, nu de culoarea lui: selectorul era `.bg-sunken`
    // și a picat la prima schimbare de stil, deși cuvintele erau întregi.
    const chips = [...container.querySelectorAll("[data-keyword]")].map((c) => c.textContent ?? "");
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.trim().length).toBeGreaterThan(0);
      expect(chip).not.toMatch(/undefined|\{/);
    }
  });
});

describe("DestinyMatrix — zonele derivate", () => {
  const rows = compareReductions(toBirthDate(BIRTH));

  it("listează fiecare zonă, cu ambele reduceri pe fiecare celulă", () => {
    const { container } = renderMatrix();
    for (const row of rows) {
      const zone = container.querySelector(`[data-zone="${row.id}"]`);
      expect(zone, row.id).toBeTruthy();
      for (const c of row.cells) {
        const cell = zone!.querySelector(`[data-cell="${c.key}"]`)!;
        expect(cell, `${row.id}.${c.key}`).toBeTruthy();
        expect(cell.querySelector('[data-reduction="digitsum"]')!.textContent).toBe(String(c.digitsum));
        expect(cell.querySelector('[data-reduction="mod22"]')!.textContent).toBe(String(c.mod22));
        const d = cell.querySelector("[data-distance]");
        if (c.distance === 0) expect(d).toBeNull();
        else expect(d!.textContent).toContain(String(c.distance));
      }
    }
  });

  it("fiecare zonă are pașii de calcul într-o dezvăluire", () => {
    const { container } = renderMatrix();
    for (const row of rows) {
      const details = container.querySelector(`[data-zone="${row.id}"] details[data-steps]`);
      expect(details, row.id).toBeTruthy();
      expect(details!.textContent).toMatch(/=/);
    }
  });

  it("harta chakrelor e anunțată ca simbolică, nu medicală", () => {
    const { container } = renderMatrix();
    expect(container.querySelector('[data-zone="chakras.numefy"] [data-symbolic]')).toBeTruthy();
  });

  it("arată modelele care nu se potrivesc, unul lângă altul", () => {
    const { container } = renderMatrix();
    for (const fam of ["money", "love", "karmicTail", "chakras"])
      expect(container.querySelector(`[data-model-family="${fam}"]`), fam).toBeTruthy();
  });

  it("linia vârstei are 65 de puncte și o singură poziție curentă", () => {
    const { container } = renderMatrix();
    const line = ageLine(toBirthDate(BIRTH), "digitsum", exactAge(toBirthDate(BIRTH), TODAY));
    expect(container.querySelectorAll("[data-age-point]")).toHaveLength(65);
    const current = container.querySelectorAll('[data-age-point][aria-current="true"]');
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("data-age-point")).toBe(String(line.points[line.current!].age));
  });

  it("nu lasă text nerezolvat", () => {
    const { container } = renderMatrix();
    expect(container.textContent).not.toMatch(/undefined|NaN|\{/);
  });
});
