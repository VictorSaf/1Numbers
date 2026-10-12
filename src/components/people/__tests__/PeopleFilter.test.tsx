import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PeopleFilter } from "../PeopleFilter";

/**
 * Filtrul arată numai categoriile care au ceva în ele: un chip „Afacere (0)"
 * e o promisiune goală într-o listă care e deja scurtă.
 */

const counts = { eu: 2, apropiat: 1, copil: 0, afacere: 0 };

afterEach(() => {
  localStorage.clear();
});

describe("PeopleFilter", () => {
  it("arată doar categoriile care au hărți, plus Toate", () => {
    localStorage.setItem("language", "ro");
    render(
      <LanguageProvider>
        <PeopleFilter selected={null} counts={counts} onSelect={() => {}} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button", { name: /Toate/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Eu/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cineva apropiat/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Copil/ })).not.toBeInTheDocument();
  });

  it("cheamă onSelect cu categoria apăsată", () => {
    localStorage.setItem("language", "ro");
    const onSelect = vi.fn();
    render(
      <LanguageProvider>
        <PeopleFilter selected={null} counts={counts} onSelect={onSelect} />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cineva apropiat/ }));

    expect(onSelect).toHaveBeenCalledWith("apropiat");
  });

  it("cheamă onSelect cu null pe Toate", () => {
    localStorage.setItem("language", "ro");
    const onSelect = vi.fn();
    render(
      <LanguageProvider>
        <PeopleFilter selected="eu" counts={counts} onSelect={onSelect} />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Toate/ }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("marchează chip-ul ales", () => {
    localStorage.setItem("language", "ro");
    render(
      <LanguageProvider>
        <PeopleFilter selected="eu" counts={counts} onSelect={() => {}} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button", { name: /Eu/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Toate/ })).toHaveAttribute("aria-pressed", "false");
  });
});
