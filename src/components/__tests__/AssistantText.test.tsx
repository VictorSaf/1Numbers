import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssistantText } from "../AssistantText";

/**
 * Ce scrie modelul, citit de un om.
 *
 * Modelul răspunde în markdown -- titluri, îngroșări, liste. Componenta care
 * afișa mesajul îl punea într-un <p class="whitespace-pre-wrap">, deci omul
 * vedea literal `## Drumul tău` și `**miezul**`. Un răspuns de patru sute de
 * cuvinte devenea un bloc pe care nu-l parcurge nimeni.
 *
 * Randarea produce elemente React, niciodată HTML dintr-un șir: textul vine de
 * la un model, iar un model poate fi convins să scrie orice. React escapează
 * text, deci nu există cale de injecție prin construcție -- iar testul de la
 * final o ține așa.
 */

describe("AssistantText", () => {
  it("face din ## un titlu adevărat, nu un rând cu diez", () => {
    render(<AssistantText text={"## Drumul Vieții 6\n\nUrmează un paragraf."} />);

    const h = screen.getByRole("heading", { name: "Drumul Vieții 6" });
    expect(h).toBeInTheDocument();
    expect(screen.queryByText(/^##/)).not.toBeInTheDocument();
  });

  it("îngroașă textul dintre asteriscuri și le scoate din pagină", () => {
    const { container } = render(<AssistantText text={"**Miezul:** restul frazei."} />);

    expect(container.querySelector("strong")?.textContent).toBe("Miezul:");
    expect(container.textContent).toBe("Miezul: restul frazei.");
    expect(container.textContent).not.toContain("**");
  });

  it("face listă numerotată din 1. 2. 3.", () => {
    const { container } = render(
      <AssistantText text={"1. Cauți armonia.\n2. Iei prea mult.\n3. Ai standarde."} />,
    );

    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(3);
    expect(items[1].textContent).toBe("Iei prea mult.");
  });

  it("face listă simplă din liniuțe", () => {
    const { container } = render(
      <AssistantText text={"- Lecția 7 lipsește.\n- Lecția 8 lipsește."} />,
    );

    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
  });

  it("desparte paragrafele pe rând gol", () => {
    const { container } = render(<AssistantText text={"Primul.\n\nAl doilea."} />);

    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("dă cifrelor clasa .num, ca peste tot în aplicație", () => {
    const { container } = render(<AssistantText text={"Drumul Vieții 6 și Sufletul 5."} />);

    const nums = [...container.querySelectorAll(".num")].map((e) => e.textContent);
    expect(nums).toEqual(["6", "5"]);
  });

  it("nu execută HTML venit din text -- îl arată ca text", () => {
    // Textul vine de la un model, iar un model poate fi convins să scrie orice.
    const { container } = render(
      <AssistantText text={'<img src=x onerror="alert(1)"> și <b>gras</b>'} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(container.textContent).toContain("<img src=x");
  });
});
