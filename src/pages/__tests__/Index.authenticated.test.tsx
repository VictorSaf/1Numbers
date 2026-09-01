import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
vi.mock("@/services/api", () => ({
  api: { getProfile: (...a: unknown[]) => getProfile(...a) },
  default: { getProfile: (...a: unknown[]) => getProfile(...a) },
}));

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
    profile: { id: "p1", userId: "u1", fullName: "Victor Ion Safta", birthDate: "1990-08-25" },
  });
});

describe("Index, autentificat", () => {
  it("dă harta întreagă, în formatul exemplului", async () => {
    const { container } = show();

    // Semnătura formatului: navigația pe capitole, care e a raportului întreg.
    await waitFor(() => expect(container.querySelector("nav")).toBeInTheDocument());
    await waitFor(() =>
      expect(container.textContent).toMatch(/Drumul Vieții|Life Path|Жизненный путь/),
    );
  });

  it("citește harta din profil, nu pe cea a exemplului", async () => {
    // Exemplul e Maria Elena Popescu, 15.05.1990 -- Drum de Viață 3.
    // Profilul de aici dă 7. Dacă pe ecran apare harta exemplului, cifra
    // ancoră ar fi 3.
    const { container } = show();
    await waitFor(() => expect(getProfile).toHaveBeenCalled());
    await waitFor(() => expect(container.querySelector("nav")).toBeInTheDocument());

    expect(container.textContent).not.toMatch(/Maria Elena Popescu/);
  });
});
