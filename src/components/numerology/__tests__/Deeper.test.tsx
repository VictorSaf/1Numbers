import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Deeper } from "../Deeper";

/**
 * Al doilea strat al unui capitol, cu regulile din practica de UX pe care am
 * verificat-o înainte: un singur nivel, deschidere explicită, închidere dintr-un
 * clic, iar eticheta numește ce e înăuntru.
 */

const show = () =>
  render(
    <LanguageProvider>
      <Deeper label="Lo Shu, planurile și distribuția">
        <p>conținut adânc</p>
      </Deeper>
    </LanguageProvider>,
  );
const trigger = () => screen.getByRole("button");

describe("Deeper", () => {
  it("ține conținutul ascuns până când omul cere", () => {
    show();
    expect(screen.queryByText("conținut adânc")).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("spune ce e înăuntru, nu „mai mult”", () => {
    show();
    // Un buton care nu-și numește conținutul cere un clic ca să afli dacă
    // merita clicul.
    expect(trigger()).toHaveTextContent("Lo Shu, planurile și distribuția");
  });

  it("deschide la o apăsare", () => {
    show();
    fireEvent.click(trigger());

    expect(screen.getByText("conținut adânc")).toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("se strânge înapoi tot dintr-o apăsare", () => {
    show();
    fireEvent.click(trigger());
    fireEvent.click(trigger());

    expect(screen.queryByText("conținut adânc")).not.toBeInTheDocument();
  });

  it("are o țintă de atins cu degetul", () => {
    show();
    expect(trigger().className).toMatch(/min-h-11/);
  });
});
