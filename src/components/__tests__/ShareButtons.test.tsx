import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ShareButtons } from "../ShareButtons";

/**
 * Două butoane alăturate, cu același cuvânt pe ele.
 *
 * Unul deschide foaia de partajare a sistemului, celălalt un meniu cu
 * Facebook, X, WhatsApp, mail și copiere de link. Lucruri diferite, care fac
 * lucruri diferite -- dar în engleză scria „Share” pe amândouă, iar în română
 * „Partajează” pe amândouă. Codul era corect; omul nu avea de unde ști care
 * face ce.
 */

const DATA = { title: "Harta mea", text: "uite", url: "https://exemplu.ro/x" };
const show = () =>
  render(
    <LanguageProvider>
      <ShareButtons shareData={DATA} />
    </LanguageProvider>,
  );

const withNativeShare = (present: boolean) => {
  if (present) Object.defineProperty(navigator, "share", { value: vi.fn(), configurable: true });
  else Reflect.deleteProperty(navigator as object, "share");
};

afterEach(() => withNativeShare(false));

describe("ShareButtons", () => {
  it("nu pune același cuvânt pe două butoane diferite", () => {
    withNativeShare(true);
    show();

    const names = screen.getAllByRole("button").map((b) => b.textContent?.trim());
    expect(new Set(names).size).toBe(names.length);
  });

  it("spune care deschide foaia sistemului și care duce undeva anume", () => {
    withNativeShare(true);
    show();

    expect(screen.getByRole("button", { name: /^share$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share to/i })).toBeInTheDocument();
  });

  it("nu arată butonul de sistem unde sistemul nu-l are", () => {
    withNativeShare(false);
    show();

    expect(screen.queryByRole("button", { name: /^share$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share to/i })).toBeInTheDocument();
  });

  it("dă butoanelor o țintă de atins cu degetul", () => {
    withNativeShare(true);
    show();

    // 44px e pragul din ghidul iOS. Sub el, atingerile nimeresc vecinul.
    for (const b of screen.getAllByRole("button")) {
      expect(b.className).toMatch(/min-h-11|h-11|min-h-\[44px\]/);
    }
  });
});
