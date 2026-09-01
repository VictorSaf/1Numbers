import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DeepReading } from "../DeepReading";

/**
 * Citirea întreagă se cere, nu se întâmplă.
 *
 * E cea mai scumpă operație din aplicație -- model puternic, ieșire lungă.
 * Pornită la încărcarea paginii, ar fi plătită pentru fiecare vizitator care
 * doar trece pe acolo. Un buton e și mai onest cu ce e.
 */

const deep = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "u1" }, isLoading: false }),
}));
vi.mock("@/services/api", () => {
  const svc = { getDeepReading: (...a: unknown[]) => deep(...a) };
  return { api: svc, default: svc };
});

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const BODY = {
  opening: "Ești un om care întreabă, pus să decidă singur.",
  chapters: [{ title: "Întrebarea și decizia", text: "Drumul tău e 7 și Destinul 1." }],
  closing: "Harta nu cere să alegi.",
};

const show = () =>
  render(
    <LanguageProvider>
      <DeepReading fullName={NAME} birthDate={BIRTH} />
    </LanguageProvider>,
  );
const button = () => screen.getByRole("button", { name: /write my reading|scrie-mi/i });

beforeEach(() => deep.mockReset().mockImplementation(async () => ({ body: BODY, source: "model", cached: false })));

describe("DeepReading", () => {
  it("nu cheamă nimic până nu ceri", () => {
    show();
    expect(deep).not.toHaveBeenCalled();
    expect(button()).toBeInTheDocument();
  });

  it("trimite toată harta, în propoziții, nu doar cifre", async () => {
    show();
    fireEvent.click(button());

    await waitFor(() => expect(deep).toHaveBeenCalledTimes(1));
    const sent = deep.mock.calls[0][0] as { steps: Array<{ say: string; figures: string }> };
    expect(sent.steps.length).toBeGreaterThanOrEqual(10);
    for (const s of sent.steps) expect(s.say.length).toBeGreaterThan(20);
  });

  it("arată citirea legată", async () => {
    const { container } = show();
    fireEvent.click(button());

    await waitFor(() => expect(container.textContent).toContain(BODY.opening));
    expect(container.textContent).toContain("Întrebarea și decizia");
    expect(container.textContent).toContain(BODY.closing);
  });


});
