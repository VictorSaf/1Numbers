import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Tools from "@/pages/Tools";
import AddressTool from "../AddressTool";
import PhoneTool from "../PhoneTool";
import BabyNameTool from "../BabyNameTool";
import MoneyCodeTool from "../MoneyCodeTool";
import LifeCodeTool from "../LifeCodeTool";
import EventDateTool from "../EventDateTool";
import TurningYearsTool from "../TurningYearsTool";

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({ profileData: null, hasProfile: false }),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const wrap = (ui: React.ReactNode, entry = "/unelte") => {
  localStorage.setItem("language", "en");
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ThemeProvider>
        <LanguageProvider>{ui}</LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
};

const type = (container: HTMLElement, id: string, value: string) => {
  const el = container.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  expect(el).not.toBeNull();
  fireEvent.change(el, { target: { value } });
};

const school = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-school="${id}"] .num`)?.textContent;

beforeEach(() => localStorage.clear());

describe("uneltele cu mai multe școli", () => {
  it("adresa: apartamentul, blocul, caldeean, homofon", () => {
    const { container } = wrap(<AddressTool />);
    type(container, "addr-building", "1200");
    type(container, "addr-apartment", "45C");
    expect(school(container, "pyth-unit")).toBe("3");
    expect(school(container, "unit-digits")).toBe("9");
    expect(container.querySelector("[data-homophone]")).not.toBeNull();
  });

  it("telefonul: fără dată nu apare proprietarul, cu dată apare", () => {
    const { container } = wrap(<PhoneTool />);
    type(container, "phone-number", "0000000008");
    expect(school(container, "full")).toBe("8");
    expect(container.querySelector("[data-owner]")).toBeNull();
    type(container, "phone-birth", "1990-01-01");
    expect(container.querySelector("[data-owner]")).not.toBeNull();
  });

  it("nume de bebeluș: un rând pe nume, câte un loc pe școală", () => {
    const { container } = wrap(<BabyNameTool />);
    type(container, "baby-birth", "2027-03-05");
    type(container, "baby-names", "Ana\nMaria\nIon");
    expect(container.querySelectorAll("[data-name-row]")).toHaveLength(3);
  });

  it("codul banilor: ambele variante și avertismentul despre PIN", () => {
    const { container } = wrap(<MoneyCodeTool />);
    type(container, "money-birth", "1996-06-20");
    expect(screen.getByText("2676")).toBeTruthy();
    expect(screen.getByText(/PIN/)).toBeTruthy();
  });

  it("codul vieții: 358257", () => {
    const { container } = wrap(<LifeCodeTool />);
    type(container, "life-birth", "1977-06-05");
    expect(screen.getByText("358257")).toBeTruthy();
  });

  it("data evenimentului: două topuri", () => {
    const { container } = wrap(<EventDateTool />);
    type(container, "event-birth-a", "1990-01-01");
    type(container, "event-from", "2026-10-01");
    type(container, "event-to", "2026-10-31");
    expect(container.querySelector('[data-top="pyth"]')).not.toBeNull();
    expect(container.querySelector('[data-top="cheiro"]')).not.toBeNull();
  });

  it("anii de cotitură: o listă pe metodă", () => {
    const { container } = wrap(<TurningYearsTool />);
    type(container, "turning-birth", "1973-06-14");
    expect(container.querySelectorAll("[data-method]").length).toBe(6);
  });
});

describe("Tools: uneltele noi se deschid din ?s=", () => {
  it.each(["address", "phone", "baby-name", "money-code", "life-code", "event-date", "turning-years"])(
    "?s=%s deschide unealta, nu lansatorul",
    async (id) => {
      wrap(<Tools />, `/unelte?s=${id}`);
      expect(await screen.findByRole("button", { name: /all tools/i })).toBeTruthy();
      expect(await screen.findByTestId(`tool-${id}`)).toBeTruthy();
    },
  );

  it("lansatorul are o ușă pentru fiecare", () => {
    wrap(<Tools />);
    expect(screen.getByRole("button", { name: /house number/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /turning-point years/i })).toBeTruthy();
  });
});
