import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KuaNumber } from "../KuaNumber";
import { kuaNumber } from "@/lib/numerology-plus/systems";

/**
 * The Kua formula needs a branch the application has never collected. These
 * assert the two things that matter about that: the block is useful before a
 * branch is picked, and once one is picked the numbers are the engine's.
 */

const BIRTH = new Date(1990, 7, 25); // fixed: kua 1 on the male branch, 8 on the female one

const draw = () =>
  render(
    <LanguageProvider>
      <KuaNumber birthDate={BIRTH} />
    </LanguageProvider>,
  );

const branchButton = (which: "male" | "female") =>
  screen.getByRole("button", { name: new RegExp(which === "male" ? "10 −" : "\\+ 5") });

describe("KuaNumber", () => {
  beforeEach(() => localStorage.clear());

  it("asks for a branch instead of hiding the block", () => {
    const { container } = draw();
    // The block is there, discoverable, with both branches offered...
    expect(branchButton("male")).toBeTruthy();
    expect(branchButton("female")).toBeTruthy();
    // ...and no Kua number invented in the absence of an answer.
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
  });

  it("says on its face that this is a two-branch formula, not a classification", () => {
    const { container } = draw();
    expect(container.textContent ?? "").toMatch(
      /nu clasificăm|classify no one|никого не классифицируем/i,
    );
    expect(container.textContent ?? "").toMatch(/Feng Shui|фэн-шуй/i);
  });

  it("computes the branch that subtracts from 10", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    const engine = kuaNumber(1990, "male");
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(engine.kua);
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(1);
    for (const key of ["shengChi", "tienYi", "nienYen", "fuWei"] as const) {
      expect(container.querySelector(`[data-direction="${key}"]`)?.textContent, key).toBeTruthy();
    }
    // Kua 1 is an East-group number; the group must follow the engine, not a guess.
    expect(container.querySelector("[data-group]")?.getAttribute("data-group")).toBe(engine.group);
  });

  it("computes the branch that adds 5", () => {
    const { container } = draw();
    fireEvent.click(branchButton("female"));
    const engine = kuaNumber(1990, "female");
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(engine.kua);
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(8);
    expect(container.querySelector("[data-group]")?.getAttribute("data-group")).toBe("west");
  });

  it("keeps the choice in this browser and nowhere else", () => {
    draw();
    fireEvent.click(branchButton("female"));
    expect(localStorage.getItem("kua-branch")).toBe("female");
  });

  it("reads the remembered branch back on a fresh render", () => {
    localStorage.setItem("kua-branch", "male");
    const { container } = draw();
    expect(Number(container.querySelector('[data-figure="kua"]')?.textContent)).toBe(1);
  });

  it("ignores a stored value that is not a branch", () => {
    localStorage.setItem("kua-branch", "banana");
    const { container } = draw();
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
    expect(branchButton("male")).toBeTruthy();
  });

  it("lets the reader take the choice back", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    fireEvent.click(screen.getByRole("button", { name: /Schimbă ramura|Change branch|Сменить ветвь/ }));
    expect(container.querySelector('[data-figure="kua"]')).toBeNull();
    expect(localStorage.getItem("kua-branch")).toBeNull();
  });

  it("renders the number through the tabular class", () => {
    const { container } = draw();
    fireEvent.click(branchButton("male"));
    expect(container.querySelector('[data-figure="kua"]')?.className).toContain("num");
  });
});
