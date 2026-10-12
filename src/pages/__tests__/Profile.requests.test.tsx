import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Profile from "../Profile";

/**
 * Câte cereri face /eu.
 *
 * Pagina, comutatorul de profil și comparația citeau fiecare lista la montare,
 * iar după o salvare pagina o mai cerea o dată, deși salvarea o reîncărcase
 * deja. Acum lista e una, iar o salvare o reîncarcă o singură dată.
 */

const getAllProfiles = vi.fn();
const updateProfile = vi.fn();
vi.mock("@/services/api", () => {
  const known: Record<string, (...a: unknown[]) => unknown> = {
    getAllProfiles: (...a) => getAllProfiles(...a),
    updateProfile: (...a) => updateProfile(...a),
  };
  // Orice alt apel al paginii primește un răspuns gol, nu o excepție.
  const svc = new Proxy(known, {
    get: (target, key: string) => target[key] ?? (async () => ({ success: true })),
  });
  return { api: svc, default: svc };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
}));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

const ANA = {
  id: "a", userId: "u1", fullName: "Ana Pop", birthDate: "1990-05-15",
  category: "apropiat", isActive: false, createdAt: "", updatedAt: "",
};

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <Profile />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  toast.mockReset();
  getAllProfiles.mockReset().mockResolvedValue({ success: true, profiles: [ANA] });
  updateProfile.mockReset().mockResolvedValue({ success: true, profile: ANA });
});

describe("/eu, cereri pentru lista de profiluri", () => {
  it("o cerere la intrare, încă una după salvare", async () => {
    show();
    await waitFor(() => expect(screen.getByDisplayValue("Ana Pop")).toBeInTheDocument());
    expect(getAllProfiles).toHaveBeenCalledTimes(1);

    fireEvent.submit(screen.getByDisplayValue("Ana Pop").closest("form")!);

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toast).toHaveBeenCalled());
    // Lasă orice reîncărcare rămasă să plece.
    await new Promise((r) => setTimeout(r, 50));
    expect(getAllProfiles).toHaveBeenCalledTimes(2);
  });
});
