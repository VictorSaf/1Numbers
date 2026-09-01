import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Thread } from "../Thread";
import { buildThread } from "@/lib/thread";

/**
 * Firul pe ecran: un pas, apoi următorul, și ține minte unde ai rămas.
 *
 * Panoul de dinainte arăta totul deodată. Aici se dezvăluie, iar poziția
 * supraviețuiește reîncărcării -- altfel „continuă" ar fi doar o animație,
 * nu o citire care se reia.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);

const show = () =>
  render(
    <LanguageProvider>
      <Thread fullName={NAME} birthDate={BIRTH} today={TODAY} />
    </LanguageProvider>,
  );

const steps = buildThread(NAME, BIRTH, "en", TODAY);

beforeEach(() => localStorage.clear());

describe("Thread", () => {
  it("arată un singur pas la început, nu toată harta", () => {
    const { container } = show();

    expect(container.querySelectorAll("[data-step]")).toHaveLength(1);
    expect(screen.getByText(steps[0].say)).toBeInTheDocument();
  });

  it("pune Drumul Vieții primul, cu cifra lui ca semnătură", () => {
    show();

    expect(screen.getByText(steps[0].figures)).toBeInTheDocument();
    expect(screen.getByText(steps[0].name)).toBeInTheDocument();
  });

  it("spune de unde vine cifra, pentru cine n-a auzit de ea", () => {
    show();

    expect(screen.getByText(steps[0].plain)).toBeInTheDocument();
  });

  it("dezvăluie pasul următor la apăsare", () => {
    const { container } = show();

    fireEvent.click(screen.getByRole("button", { name: /continu/i }));

    expect(container.querySelectorAll("[data-step]")).toHaveLength(2);
    expect(screen.getByText(steps[1].say)).toBeInTheDocument();
  });

  it("ține minte unde ai rămas după o reîncărcare", () => {
    const first = show();
    fireEvent.click(screen.getByRole("button", { name: /continu/i }));
    fireEvent.click(screen.getByRole("button", { name: /continu/i }));
    first.unmount();

    const { container } = show();
    expect(container.querySelectorAll("[data-step]")).toHaveLength(3);
  });

  it("ascunde butonul când firul s-a terminat", () => {
    show();

    for (let i = 1; i < steps.length; i++) {
      fireEvent.click(screen.getByRole("button", { name: /continu/i }));
    }

    expect(screen.queryByRole("button", { name: /continu/i })).not.toBeInTheDocument();
  });

  it("arată cât a citit din cât", () => {
    show();

    expect(screen.getByText(new RegExp(`1\\s*/\\s*${steps.length}`))).toBeInTheDocument();
  });
});
