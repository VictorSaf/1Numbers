import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DayNavigator } from "../DayNavigator";
import { getTranslation } from "@/lib/translations";
import { formatCalendarDate } from "@/lib/calendarDate";
import { shiftDay, DAY_HORIZON_DAYS } from "@/lib/dayHorizon";

/**
 * Prognoza zilnică era legată de `new Date()`: se vedea o singură zi și nu
 * exista niciun gest care s-o mute. Astea sunt cele trei gesturi -- înapoi,
 * înainte, și întoarcerea la azi -- plus cele două margini.
 *
 * Ultimul test e o santinelă pentru regresia din 57f095a: pagina de rezultat
 * era plină de `opacity-0 animate-fade-in`, deci invizibilă pentru cine
 * ceruse sistemului mai puțină mișcare. Nimic aici nu are voie să depindă de
 * o animație ca să fie vizibil.
 *
 * `LanguageContext` deduce limba din `navigator.language`, care în jsdom e
 * "en-US" implicit. Testul afirmă text românesc, deci limba se fixează
 * explicit în localStorage înainte de fiecare randare.
 */

const TODAY = new Date(2026, 8, 1);
const t = getTranslation("ro");

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("language", "ro");
});

const show = (date: Date, onChange = vi.fn()) => {
  const view = render(
    <LanguageProvider>
      <DayNavigator date={date} today={TODAY} onChange={onChange} />
    </LanguageProvider>,
  );
  return { ...view, onChange };
};

describe("DayNavigator", () => {
  it("arată ziua primită, cu cifrele în clasa numerică", () => {
    const { container } = show(new Date(2026, 8, 10));
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("2026")).toBeTruthy();
    const numerals = [...container.querySelectorAll(".num")].map((n) => n.textContent);
    expect(numerals).toContain("10");
    expect(numerals).toContain("2026");
  });

  it("mută o zi înapoi", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByLabelText(t.today.previousDay));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-09");
  });

  it("mută o zi înainte", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByLabelText(t.today.nextDay));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-11");
  });

  it("nu oferă întoarcerea la azi când deja e azi", () => {
    show(TODAY);
    expect(screen.queryByText(t.today.backToToday)).toBeNull();
  });

  it("oferă întoarcerea la azi din orice altă zi, și o face", () => {
    const { onChange } = show(new Date(2026, 8, 10));
    fireEvent.click(screen.getByText(t.today.backToToday));
    expect(formatCalendarDate(onChange.mock.calls[0][0])).toBe("2026-09-01");
  });

  it("închide drumul la marginea din față", () => {
    show(shiftDay(TODAY, DAY_HORIZON_DAYS));
    expect(screen.getByLabelText(t.today.nextDay)).toBeDisabled();
    expect(screen.getByLabelText(t.today.previousDay)).not.toBeDisabled();
    expect(screen.getByText(t.today.horizonEdge)).toBeTruthy();
  });

  it("închide drumul la marginea din spate", () => {
    show(shiftDay(TODAY, -DAY_HORIZON_DAYS));
    expect(screen.getByLabelText(t.today.previousDay)).toBeDisabled();
    expect(screen.getByLabelText(t.today.nextDay)).not.toBeDisabled();
  });

  it("nu spune nimic despre orizont cât timp mai e drum", () => {
    show(new Date(2026, 8, 10));
    expect(screen.queryByText(t.today.horizonEdge)).toBeNull();
  });

  it("nu ascunde nimic în spatele unei animații de intrare", () => {
    const { container } = show(new Date(2026, 8, 10));
    expect(container.querySelectorAll("[class*='opacity-0']")).toHaveLength(0);
    expect(container.querySelectorAll("[class*='animate-fade-in']")).toHaveLength(0);
  });
});
