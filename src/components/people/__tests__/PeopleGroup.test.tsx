import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PeopleGroup } from "../PeopleGroup";
import type { Profile } from "@/hooks/use-profiles";

/**
 * Un grup de hărți dintr-o categorie. Ce trebuie să fie adevărat aici e că
 * hărțile altcuiva își spun că sunt ale altcuiva -- brief-ul cere ca datele
 * unei persoane care n-a consimțit la nimic să fie tratate ca atare, iar locul
 * în care se vede asta e chiar lângă ele.
 */

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: "p1",
  userId: "u1",
  fullName: "Ana Pop",
  birthDate: "1990-05-15",
  category: "eu",
  isActive: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

const renderGroup = (props: Partial<React.ComponentProps<typeof PeopleGroup>> = {}) => {
  localStorage.setItem("language", "ro");
  return render(
    <LanguageProvider>
      <PeopleGroup
        category="eu"
        profiles={[profile()]}
        onEdit={() => {}}
        onDelete={() => {}}
        {...props}
      />
    </LanguageProvider>,
  );
};

afterEach(() => {
  localStorage.clear();
});

describe("PeopleGroup", () => {
  it("scrie eticheta categoriei și numărul de hărți", () => {
    renderGroup({ category: "copil", profiles: [profile({ category: "copil" }), profile({ id: "p2", category: "copil" })] });

    expect(screen.getByText("Copil")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("arată numele fiecărei hărți", () => {
    renderGroup({ profiles: [profile(), profile({ id: "p2", fullName: "Ion Popescu" })] });

    expect(screen.getByText("Ana Pop")).toBeInTheDocument();
    expect(screen.getByText("Ion Popescu")).toBeInTheDocument();
  });

  it("spune, pe hărțile altcuiva, că datele sunt ale altcuiva", () => {
    renderGroup({ category: "apropiat", profiles: [profile({ category: "apropiat" })] });

    expect(screen.getByText(/vezi numai tu/i)).toBeInTheDocument();
  });

  it("nu pune nota aia pe hărțile mele", () => {
    renderGroup({ category: "eu" });

    expect(screen.queryByText(/vezi numai tu/i)).not.toBeInTheDocument();
  });

  it("cere data înființării pentru o firmă și data nașterii pentru un om", () => {
    const { unmount } = renderGroup({ category: "afacere", profiles: [profile({ category: "afacere" })] });
    expect(screen.getByText(/Data înființării/i)).toBeInTheDocument();
    unmount();

    renderGroup({ category: "apropiat", profiles: [profile({ category: "apropiat" })] });
    expect(screen.getByText(/Data nașterii/i)).toBeInTheDocument();
  });

  it("cheamă onEdit cu id-ul hărții", () => {
    const onEdit = vi.fn();
    renderGroup({ onEdit });

    fireEvent.click(screen.getByRole("button", { name: /editeaz/i }));

    expect(onEdit).toHaveBeenCalledWith("p1");
  });

  it("cheamă onDelete cu id-ul hărții", () => {
    const onDelete = vi.fn();
    renderGroup({ onDelete });

    fireEvent.click(screen.getByRole("button", { name: /șterge/i }));

    expect(onDelete).toHaveBeenCalledWith("p1");
  });
});
