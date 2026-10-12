import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Predictions from "../Predictions";
import { calculatePersonalDayNumber } from "@/lib/personalCycles";
import { calculatePersonalYearNumber } from "@/lib/numerology";

/**
 * /azi, fila „Luna curentă", în română și în rusă.
 *
 * Fila punea titluri traduse peste conținut englezesc („New Beginnings Week",
 * „Plant seeds for future growth"), arăta tema anului sub eticheta „Luna Ta
 * Personală - 2026", iar săptămâna avea o temă scoasă din media celor șapte
 * zile personale.
 */

const BIRTH = new Date(1985, 6, 23);

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({
    hasProfile: true,
    loading: false,
    profileData: { fullName: "Ana Pop", birthDate: new Date(1985, 6, 23) },
  }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
// Ce nu ține de fila lunii.
vi.mock("@/components/Today", () => ({ Today: () => null }));
vi.mock("@/components/predictions/CalendarAndHours", () => ({ CalendarAndHours: () => null }));
vi.mock("@/components/DailyPredictionCard", () => ({ DailyPredictionCard: () => null }));

/** Fraze din vechile tabele englezești -- și câteva cuvinte-santinelă. */
const ENGLISH =
  /(?<!\p{L})(the|your|and|with|for|week|beginnings|growth|opportunities|avoid|leadership|energy)(?!\p{L})/iu;

const openMonth = (lang: "ro" | "ru") => {
  localStorage.setItem("language", lang);
  render(
    <MemoryRouter initialEntries={["/azi"]}>
      <ThemeProvider>
        <LanguageProvider>
          <Predictions />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
  const tab = screen.getByRole("tab", { name: lang === "ro" ? /luna curentă/i : /этот месяц/i });
  fireEvent.mouseDown(tab, { button: 0 });
  return screen.getByRole("tabpanel");
};

beforeEach(() => localStorage.clear());

describe("/azi — luna, săptămâna și anul, în limba paginii", () => {
  it.each(["ro", "ru"] as const)("nu lasă engleză în fila lunii (%s)", (lang) => {
    const panel = openMonth(lang);
    const text = panel.textContent ?? "";
    expect(text.length).toBeGreaterThan(500);
    expect(text).not.toMatch(ENGLISH);
  });

  it("numește anul personal an, nu lună (ro)", () => {
    const panel = openMonth("ro");
    const year = new Date().getFullYear();
    expect(within(panel).queryByText(new RegExp(`Luna Ta Personală\\s*-\\s*${year}`))).toBeNull();
    expect(within(panel).getByText(new RegExp(`Anul tău personal.*${year}`, "i"))).toBeTruthy();
    // și cifra lui stă lângă el
    const py = calculatePersonalYearNumber(BIRTH, year);
    expect(within(panel).getByText(new RegExp(`Anul tău personal.*${year}`, "i")).textContent).toContain(String(py));
  });

  it("numește anul personal an și în rusă", () => {
    const panel = openMonth("ru");
    expect(within(panel).getByText(/Ваш личный год/i)).toBeTruthy();
  });

  it("arată săptămâna ca șapte zile personale, fără medie", () => {
    const panel = openMonth("ro");
    const list = within(panel).getAllByRole("list").find((l) => l.tagName === "OL");
    expect(list, "lista zilelor").toBeTruthy();
    const items = within(list!).getAllByRole("listitem");
    expect(items).toHaveLength(7);

    // Luni din săptămâna curentă, ca pe pagină.
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow + (dow === 0 ? -6 : 1));
    items.forEach((li, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const n = calculatePersonalDayNumber(BIRTH, d);
      expect(within(li).getByLabelText(`Ziua personală ${n}`)).toBeTruthy();
    });
  });
});
