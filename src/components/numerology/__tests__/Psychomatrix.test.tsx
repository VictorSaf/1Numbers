import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Psychomatrix } from "../Psychomatrix";

const show = (d: Date) =>
  render(<LanguageProvider><Psychomatrix birthDate={d} /></LanguageProvider>);

describe("Psychomatrix", () => {
  it("desenează nouă celule și opt linii", () => {
    const { container } = show(new Date(1985, 2, 29));
    expect(container.querySelectorAll("[data-psychomatrix-grid] [data-cell]")).toHaveLength(9);
    expect(container.querySelectorAll("[data-line]")).toHaveLength(8);
    // 29.03.1985 + 37, 10, 33, 6: un 3 din dată, trei din numerele de lucru
    expect(container.querySelector('[data-cell="3"]')!.textContent).toContain("3333");
  });

  it("arată ambele reguli doar pentru născuții după 2000", () => {
    expect(show(new Date(1985, 2, 29)).container.querySelector("[data-psychomatrix-rules]")).toBeNull();
    expect(show(new Date(2004, 5, 5)).container.querySelector("[data-psychomatrix-rules]")).not.toBeNull();
  });
});
