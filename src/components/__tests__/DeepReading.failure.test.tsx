import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DeepReading } from "../DeepReading";

/**
 * Ce se vede când citirea nu poate fi scrisă -- într-un fișier al lui.
 *
 * Nu din estetică: pus lângă testele care reușesc, cazul ăsta cade, și cade și
 * pe cele de după el. Reprodus izolat: un singur test cu promisiune respinsă
 * trece; același test precedat de unul care reușește, nu. Respingerea unei
 * promisiuni din acest fișier ajunge la vitest ca eroare a testului, deși
 * componenta o prinde -- verificat direct, textul „Could not write it now”
 * chiar apare în pagină.
 *
 * N-am găsit cauza în harnașament. Un fișier separat izolează interacțiunea și
 * păstrează acoperirea, ceea ce e mai bine decât un test șters -- iar dacă
 * altcineva o găsește, aici scrie ce s-a văzut.
 */

const deep = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
}));
vi.mock("@/services/api", () => {
  const svc = { getDeepReading: (...a: unknown[]) => deep(...a) };
  return { api: svc, default: svc };
});

const show = () =>
  render(
    <LanguageProvider>
      <DeepReading fullName="Victor Ion Safta" birthDate={new Date(1990, 7, 25)} />
    </LanguageProvider>,
  );

describe("DeepReading, când nu se poate scrie", () => {
  it("spune că nu a mers, în loc să tacă", async () => {
    deep.mockRejectedValue(new Error("offline"));
    const { container } = show();

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(container.textContent).toMatch(/could not write|nu s-a putut/i));
  });
});
