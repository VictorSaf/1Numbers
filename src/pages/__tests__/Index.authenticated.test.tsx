import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
const getAllProfiles = vi.fn();
vi.mock("@/services/api", () => {
  const svc = {
    getProfile: (...a: unknown[]) => getProfile(...a),
    getAllProfiles: (...a: unknown[]) => getAllProfiles(...a),
  };
  return { api: svc, default: svc };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  getProfile.mockReset();
  getAllProfiles.mockReset().mockResolvedValue({
    success: true,
    profiles: [
      { id: "p1", userId: "u1", fullName: "Victor Ion Safta", birthDate: "1990-08-25", category: "eu", isActive: true },
    ],
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
    await waitFor(() => expect(getAllProfiles).toHaveBeenCalled());

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

  it("ia harta din lista comună: o cerere pe pagină, nu una în plus", async () => {
    // Pagina și butonul de salvare de sub hartă citesc aceeași listă. Înainte,
    // pagina cerea /profiles/me, iar butonul /profiles/all, doar ca să poată
    // crea un profil.
    const { container } = show();
    await waitFor(() =>
      expect(container.querySelector('nav[aria-label="Capitole"]')).toBeInTheDocument(),
    );

    expect(getAllProfiles).toHaveBeenCalledTimes(1);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("fără o hartă activă dă formularul, ca /profiles/me", async () => {
    // /profiles/me întoarce doar rândul activ, iar activă poate fi doar o hartă
    // proprie. Cine ține doar harta unui copil n-are una -- și nu primește
    // harta copilului drept a lui.
    getAllProfiles.mockResolvedValue({
      success: true,
      profiles: [
        { id: "c1", userId: "u1", fullName: "Ion Mic", birthDate: "2015-03-03", category: "copil", isActive: false },
      ],
    });
    const { container } = show();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /descoperă|discover your numbers/i })).toBeInTheDocument(),
    );
    expect(container.querySelector('nav[aria-label="Capitole"]')).toBeNull();
  });
});
