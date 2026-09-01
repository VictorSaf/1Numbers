import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SaveMapButton } from "../numerology/SaveMapButton";

/**
 * Ce se întâmplă când salvarea nu mai e permisă.
 *
 * De când profilurile le creează adminul, un om obișnuit care apasă „Salvează
 * harta” primea un toast roșu cu textul brut al serverului: „admin_only”.
 * Adevărat, și complet inutil -- omul nu află nici ce s-a întâmplat, nici ce
 * poate face în schimb.
 *
 * Codul de eroare e pentru noi. Omul primește o propoziție.
 */

const createProfile = vi.fn();
vi.mock("@/hooks/use-profiles", () => ({
  useProfiles: () => ({ createProfile, profiles: [], activeProfile: null, loading: false }),
}));
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
}));

const show = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SaveMapButton fullName="Ana Pop" birthDate={new Date(1990, 4, 15)} />
      </LanguageProvider>
    </MemoryRouter>,
  );
const press = () => fireEvent.click(screen.getByRole("button"));
const said = () => JSON.stringify(toast.mock.calls);

beforeEach(() => { createProfile.mockReset(); toast.mockReset(); });

describe("SaveMapButton, când serverul refuză", () => {
  it("nu arată niciodată codul brut al erorii", async () => {
    createProfile.mockResolvedValue({ success: false, error: "admin_only" });
    show();
    press();

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(said()).not.toContain("admin_only");
  });

  it("spune cine face hărțile, când nu are voie", async () => {
    createProfile.mockResolvedValue({ success: false, error: "admin_only" });
    show();
    press();

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(said()).toMatch(/administrator/i);
  });

  it("spune că are deja o hartă, când asta e problema", async () => {
    createProfile.mockResolvedValue({ success: false, error: "own_map_exists" });
    show();
    press();

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(said()).toMatch(/already have|ai deja|уже есть/i);
    expect(said()).not.toContain("own_map_exists");
  });

  it("nu inventează un motiv pentru o eroare pe care n-o cunoaște", async () => {
    createProfile.mockResolvedValue({ success: false, error: "ceva neașteptat" });
    show();
    press();

    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(said()).toMatch(/could not save|nu s-a putut/i);
  });

  it("spune că s-a salvat, când chiar s-a salvat", async () => {
    createProfile.mockResolvedValue({ success: true, profile: {} });
    show();
    press();

    await waitFor(() => expect(said()).toMatch(/saved|salvat/i));
  });
});
