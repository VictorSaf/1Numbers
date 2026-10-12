import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Tools from "../Tools";

/**
 * O dată de naștere e o zi din calendar, nu un moment.
 *
 * Câmpul `<input type="date">` dă `YYYY-MM-DD`; `new Date("1990-05-15")` e
 * miezul nopții UTC, adică 14 mai seara oriunde la vest de Greenwich. Uneltele
 * primeau deci ziua de dinainte. Rulați cu TZ=America/New_York ca să se vadă.
 */

const seen = vi.hoisted(() => ({ dates: [] as Date[] }));

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ profileData: null, hasProfile: false }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/LoShuGrid", () => ({
  LoShuGrid: ({ birthDate }: { birthDate: Date }) => {
    seen.dates.push(birthDate);
    return null;
  },
}));
vi.mock("@/components/NumerologyCalendar", () => ({
  NumerologyCalendar: ({ birthDate }: { birthDate: Date }) => {
    seen.dates.push(birthDate);
    return null;
  },
}));
vi.mock("@/lib/yearForecast", () => ({
  generateYearForecast: (birthDate: Date) => {
    seen.dates.push(birthDate);
    return null;
  },
}));

const open = (tool: string) => {
  localStorage.setItem("language", "en");
  return render(
    <MemoryRouter initialEntries={[`/unelte?s=${tool}`]}>
      <ThemeProvider>
        <LanguageProvider>
          <Tools />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
};

const day = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

beforeEach(() => {
  seen.dates = [];
  localStorage.clear();
});

describe("Tools: data de naștere ajunge în unealtă ca zi locală", () => {
  it.each([
    ["loshu", /lo shu/i],
    ["forecast", /^calculate$/i],
  ])("%s primește 15 mai, nu 14", (tool, button) => {
    const { container } = open(tool);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1990-05-15" } });
    const buttons = screen.getAllByRole("button", { name: button });
    fireEvent.click(buttons[buttons.length - 1]);

    expect(seen.dates.length).toBeGreaterThan(0);
    expect(day(seen.dates[0])).toEqual([1990, 5, 15]);
  });

  it("calendar primește 15 mai, nu 14", () => {
    const { container } = open("calendar");
    const [date, name] = Array.from(container.querySelectorAll("input")) as HTMLInputElement[];
    fireEvent.change(date, { target: { value: "1990-05-15" } });
    fireEvent.change(name, { target: { value: "Ion Popescu" } });
    fireEvent.click(screen.getAllByRole("button", { name: /calendar/i }).pop()!);

    expect(seen.dates.length).toBeGreaterThan(0);
    expect(day(seen.dates[0])).toEqual([1990, 5, 15]);
  });
});

describe("Tools: o unealtă care nu mai există", () => {
  it.each(["optimizer", "matrix"])("?s=%s deschide lansatorul, nu o pagină goală", (tool) => {
    open(tool);
    // Lansatorul are o ușă pentru calendar; o filă necunoscută n-are decât „toate uneltele".
    expect(screen.queryByRole("button", { name: /all tools/i })).toBeNull();
    expect(screen.getAllByRole("button", { name: /calendar/i }).length).toBeGreaterThan(0);
  });
});
