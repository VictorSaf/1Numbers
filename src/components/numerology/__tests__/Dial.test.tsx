import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dial } from "../Dial";
import { buildDial } from "@/lib/dial";

/**
 * Cadranul, desenat.
 *
 * Ce se verifică e ce nu poate verifica typecheck-ul: că figura arată chiar
 * datele primite -- un punct pentru fiecare loc ocupat, un inel gol pentru
 * fiecare absență -- și că greutatea se vede, fiindcă tocmai ea spune că trei
 * numere cad în același loc.
 */

const NAME = "Maria Elena Popescu";
const BIRTH = new Date(1990, 4, 15);
const TODAY = new Date(2026, 8, 2);
const figure = buildDial(NAME, BIRTH, "ro", TODAY);

const draw = (size: "plate" | "echo" | "phone" = "plate") =>
  render(<Dial figure={figure} size={size} />);

describe("Dial", () => {
  it("scrie fiecare cifră ocupată o singură dată", () => {
    const { container } = draw();
    for (const p of figure.points) {
      const hits = [...container.querySelectorAll("text")].filter(
        (t) => t.textContent === String(p.master ?? p.n),
      );
      expect(hits, `cifra ${p.n}`).toHaveLength(1);
    }
  });

  it("desenează un inel gol pentru fiecare cifră care lipsește", () => {
    const { container } = draw();
    const hollow = container.querySelectorAll("[data-missing]");
    expect(hollow).toHaveLength(figure.missing.length);
    expect([...hollow].map((h) => h.getAttribute("data-missing"))).toEqual(["2", "8"]);
  });

  it("face punctul mai mare când cad mai multe numere pe el", () => {
    const { container } = draw();
    const radius = (n: number) =>
      Number(container.querySelector(`[data-seat="${n}"]`)?.getAttribute("r"));

    // 3 poartă patru numere, 9 poartă unul. Dacă ar fi la fel de mari, figura
    // ar ascunde exact lucrul pentru care există.
    expect(radius(3)).toBeGreaterThan(radius(9));
  });

  it("desenează coarda punții, cu distanța pe ea", () => {
    const { container } = draw();
    const chord = container.querySelector("[data-chord]");
    expect(chord).not.toBeNull();
    expect(container.textContent).toContain(String(figure.chord?.distance));
  });

  it("scrie un maestru cu valoarea lui, nu cu cifra redusă", () => {
    // Drumul Vieții 11 stă pe locul 2, dar 11 nu e 2.
    const master = buildDial(NAME, new Date(1975, 0, 6), "ro", TODAY);
    const { container } = render(<Dial figure={master} size="plate" />);
    const seat = container.querySelector('[data-seat="2"]');

    expect(seat).not.toBeNull();
    expect(container.textContent).toContain("11");
  });

  it("spune figura în cuvinte, pentru cine n-o vede", () => {
    const { container } = draw();
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    expect(svg?.getAttribute("aria-label")).toMatch(/3.*9|9.*3/);
  });

  it("la mărimea de ecou renunță la etichete, nu la figură", () => {
    const { container } = draw("echo");
    expect(container.querySelector("[data-chord]")).not.toBeNull();
    expect(container.querySelectorAll("[data-seat]").length).toBe(figure.points.length);
    expect(container.textContent).not.toContain("Sufletul");
  });
});
