import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "../Index";

/**
 * Ce vede omul autentificat e ce vede vizitatorul care apasă „vezi un exemplu”.
 *
 * Vizitatorul primea harta întreagă -- cinci capitole, peste douăzeci de
 * blocuri, cu navigație pe capitole. Omul care își făcuse cont primea firul,
 * adică o selecție. Cine plătise cu un cont primea mai puțin decât cine nu
 * dăduse nimic.
 */

const getProfile = vi.fn();
vi.mock("@/services/api", () => {
  const svc = {
    getProfile: (...a: unknown[]) => getProfile(...a),
    getAllProfiles: async () => ({ success: true, profiles: [] }),
  };
  return { api: svc, default: svc };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const show = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  getProfile.mockReset().mockResolvedValue({
    success: true,
    profile: { id: "p1", userId: "u1", fullName: "Victor Ion Safta", birthDate: "1990-08-25" },
  });
});

describe("Index, autentificat", () => {
  it("dă harta direct, fără să mai ceară ce știe deja", async () => {
    // Numele și data lui sunt în baza noastră -- de-aia și-a făcut cont. Un
    // formular precompletat, pus în calea lui, e o vamă pentru exact omul care
    // ne-a dat datele.
    const { container } = show();

    await waitFor(() =>
      expect(container.querySelector('nav[aria-label="Capitole"]')).toBeInTheDocument(),
    );
    expect(container.textContent).not.toMatch(/Maria Elena Popescu/);
  });

  it("nu-i mai arată formularul la intrare", async () => {
    show();
    await waitFor(() => expect(getProfile).toHaveBeenCalled());

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /descoperă|discover your numbers/i })).toBeNull(),
    );
  });

  it("„calculează din nou” duce la formular, precompletat", async () => {
    const { container } = show();
    await waitFor(() =>
      expect(container.querySelector('nav[aria-label="Capitole"]')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /calculate again|calculează din nou/i }));

    await waitFor(() =>
      expect(screen.getByDisplayValue("Victor Ion Safta")).toBeInTheDocument(),
    );
  });
});
