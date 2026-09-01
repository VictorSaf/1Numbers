import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useSelectedDay } from "../use-selected-day";
import { formatCalendarDate } from "@/lib/calendarDate";
import { shiftDay, DAY_HORIZON_DAYS } from "@/lib/dayHorizon";

/**
 * Ziua aleasă stă în adresă, nu doar în stare.
 *
 * Trei lucruri depind de asta: butonul "înapoi" al browserului, o zi trimisă
 * cuiva ca link, și notificarea care va deschide `/azi?zi=...`. Un `?zi=` venit
 * din afară poate cere orice, deci se încadrează, nu se crede.
 */

const TODAY = new Date(2026, 8, 1);

const Probe = () => {
  const { selectedDay, selectDay } = useSelectedDay(TODAY);
  const location = useLocation();
  return (
    <div>
      <span data-testid="day">{formatCalendarDate(selectedDay)}</span>
      <span data-testid="search">{location.search}</span>
      <button onClick={() => selectDay(new Date(2026, 8, 10))}>zece</button>
      <button onClick={() => selectDay(TODAY)}>azi</button>
    </div>
  );
};

const at = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Probe />
    </MemoryRouter>,
  );

describe("useSelectedDay", () => {
  it("fără parametru, ziua e azi", () => {
    at("/azi");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("citește ziua din parametru", () => {
    at("/azi?zi=2026-09-10");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-10");
  });

  it("cade pe azi când parametrul nu e o dată", () => {
    at("/azi?zi=maine");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("încadrează un parametru din afara orizontului", () => {
    at("/azi?zi=2031-01-01");
    expect(screen.getByTestId("day").textContent).toBe(
      formatCalendarDate(shiftDay(TODAY, DAY_HORIZON_DAYS)),
    );
  });

  it("scrie ziua aleasă în adresă", () => {
    at("/azi");
    fireEvent.click(screen.getByText("zece"));
    expect(screen.getByTestId("search").textContent).toBe("?zi=2026-09-10");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-10");
  });

  it("scoate parametrul la întoarcerea pe azi, în loc să-l lase gol", () => {
    at("/azi?zi=2026-09-10");
    fireEvent.click(screen.getByText("azi"));
    expect(screen.getByTestId("search").textContent).toBe("");
    expect(screen.getByTestId("day").textContent).toBe("2026-09-01");
  });

  it("nu pierde ceilalți parametri ai paginii", () => {
    at("/azi?tab=daily");
    fireEvent.click(screen.getByText("zece"));
    expect(screen.getByTestId("search").textContent).toContain("tab=daily");
    expect(screen.getByTestId("search").textContent).toContain("zi=2026-09-10");
  });
});
