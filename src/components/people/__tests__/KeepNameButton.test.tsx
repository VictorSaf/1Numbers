import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { KeepNameButton } from "../KeepNameButton";

/**
 * Uneltele de nume calculează și uită. Butonul ăsta e singurul drum de la un
 * nume calculat la o hartă păstrată -- și trebuie să nu fure profilul activ pe
 * drum: numele unei firme nu e omul care e conectat.
 *
 * `LanguageProvider` citește `navigator.language` când nu există nimic în
 * localStorage, iar în jsdom asta rezolvă la engleză, nu la română -- de-aia
 * testele forțează explicit "ro", ca peste tot în restul suitei.
 */

const createProfile = vi.fn();

vi.mock("@/hooks/use-profiles", () => ({
  useProfiles: () => ({ createProfile }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

beforeEach(() => {
  createProfile.mockReset();
  createProfile.mockResolvedValue({ success: true });
});

const renderButton = (name = "Lumina SRL", defaultCategory: "eu" | "afacere" = "afacere") => {
  localStorage.setItem("language", "ro");
  return render(
    <LanguageProvider>
      <KeepNameButton name={name} defaultCategory={defaultCategory} />
    </LanguageProvider>,
  );
};

afterEach(() => {
  localStorage.clear();
});

describe("KeepNameButton", () => {
  it("nu se lasă apăsat fără un nume", () => {
    renderButton("");

    expect(screen.getByRole("button", { name: /Păstrează numele/i })).toBeDisabled();
  });

  it("cere o dată înainte să salveze", () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));

    expect(screen.getByLabelText(/Data înființării/i)).toBeInTheDocument();
    expect(createProfile).not.toHaveBeenCalled();
  });

  it("salvează numele cu data și categoria, fără să activeze nimic", async () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));
    fireEvent.change(screen.getByLabelText(/Data înființării/i), {
      target: { value: "2019-03-02" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Salvează$/i }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile).toHaveBeenCalledWith({
      fullName: "Lumina SRL",
      birthDate: "2019-03-02",
      category: "afacere",
      setAsActive: false,
    });
  });

  it("cere data nașterii, nu a înființării, pentru o hartă de om", () => {
    renderButton("Ana Pop", "eu");

    fireEvent.click(screen.getByRole("button", { name: /Păstrează numele/i }));

    expect(screen.getByLabelText(/Data nașterii/i)).toBeInTheDocument();
  });
});
