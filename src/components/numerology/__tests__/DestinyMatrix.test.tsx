import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DestinyMatrix from "../DestinyMatrix";
import { destinyMatrix } from "@/lib/numerology-plus/matrix";
import { toBirthDate } from "@/lib/numerology-plus/core";

/**
 * The engine's suite proves the arcana arithmetic. This proves the figure is
 * readable: that every point reaches the screen, that the numbers on it are the
 * ones the engine computed, and that selecting a point actually changes the
 * reading rather than leaving the centre's text in place.
 */

const BIRTH = new Date(1990, 7, 25);

const renderMatrix = () =>
  render(
    <LanguageProvider>
      <DestinyMatrix birthDate={BIRTH} />
    </LanguageProvider>,
  );

describe("DestinyMatrix", () => {
  it("draws the nine base points and no more", () => {
    renderMatrix();
    // The derived points are confidence:'low' and deliberately absent; a figure
    // that grew past nine would mean a reconstruction leaked into the reading.
    expect(screen.getAllByRole("button")).toHaveLength(9);
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
    const points = screen.getAllByRole("button");
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
    const points = screen.getAllByRole("button");
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
    for (const p of screen.getAllByRole("button")) {
      const label = p.getAttribute("aria-label") ?? "";
      // "<position label>: <arcana>" -- a bare number would tell a blind user nothing.
      expect(label).toMatch(/\S+.*: \d+$/);
    }
  });

  it("keeps the keyword chips free of placeholders", () => {
    const { container } = renderMatrix();
    const chips = [...container.querySelectorAll(".bg-sunken")].map((c) => c.textContent ?? "");
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.trim().length).toBeGreaterThan(0);
      expect(chip).not.toMatch(/undefined|\{/);
    }
  });
});
