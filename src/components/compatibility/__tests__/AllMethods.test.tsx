import { describe, it, expect, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AllMethods } from "../AllMethods";
import { compareCouple } from "@/lib/models/compatibility";

/**
 * Fiecare metodă pe rândul ei, cu ambii parteneri, verdictul pe filetul
 * armoniei sau al tensiunii și pașii sub un <details>. Deasupra, câte metode
 * spun ce — fără un procent.
 */

const ana = { name: "Ana Pop", birthDate: new Date(2000, 0, 1) };
const ion = { name: "Ion Rus", birthDate: new Date(2000, 0, 6) };
const today = new Date(2026, 9, 12);

const renderIt = (genders?: { genderA: "male" | "female"; genderB: "male" | "female" }) => {
  localStorage.setItem("language", "ro");
  return render(
    <LanguageProvider>
      <AllMethods a={ana} b={ion} today={today} {...genders} />
    </LanguageProvider>,
  );
};

afterEach(() => localStorage.clear());

describe("AllMethods", () => {
  it("desenează un rând pentru fiecare metodă calculată", () => {
    const { container } = renderIt();
    const expected = compareCouple(ana, ion, { lang: "ro", today });
    const rows = container.querySelectorAll("[data-method]");
    expect(rows).toHaveLength(expected.methods.length);
  });

  it("adaugă Kua doar când are genul amândurora", () => {
    const { container } = renderIt({ genderA: "female", genderB: "male" });
    expect(container.querySelector('[data-method="kua"]')).not.toBeNull();
  });

  it("numește ambii parteneri și intrările lor pe fiecare rând", () => {
    const { container } = renderIt();
    const row = container.querySelector('[data-method="vedic-grahai"]')!;
    expect(row.textContent).toContain("Ana Pop");
    expect(row.textContent).toContain("Ion Rus");
    expect(row.textContent).toContain("Mulank 1");
    expect(row.textContent).toContain("Mulank 6");
  });

  it("pune verdictul pe tokenii armoniei și tensiunii, nu pe altele", () => {
    const { container } = renderIt();
    const grahai = container.querySelector('[data-method="vedic-grahai"] [data-verdict]')!;
    expect(grahai.getAttribute("data-verdict")).toBe("challenging");
    expect(grahai.className).toContain("text-tension");
    const rel = container.querySelector('[data-method="relationship-lp"] [data-verdict]')!;
    expect(rel.className).toContain("text-harmony");
    expect(container.innerHTML).not.toMatch(/hsl\(/);
  });

  it("ține pașii sub un <details>", () => {
    const { container } = renderIt();
    const details = container.querySelector('[data-method="relationship-lp"] details')!;
    expect(details).not.toBeNull();
    expect(details.textContent).toContain("13 → 4");
  });

  it("rezumă împărțirea fără niciun procent", () => {
    const { container } = renderIt();
    const summary = container.querySelector("[data-block='split']")!;
    const r = compareCouple(ana, ion, { lang: "ro", today });
    expect(summary.textContent).toContain(r.says);
    expect(container.textContent).not.toMatch(/%/);
  });
});
