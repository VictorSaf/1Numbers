import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FirstVisitPromise, EXAMPLE_NAME, EXAMPLE_BIRTH_DATE } from "../FirstVisitPromise";
import { getTranslation } from "@/lib/translations";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * Pagina cerea înainte să ofere.
 *
 * Vizitatorul anonim vedea "Calculează Numerele Tale" -- o comandă -- și două
 * câmpuri. Nimic despre ce iese, cât durează, sau că nu se cere nimic. Astea
 * sunt cele două propoziții și singura intrare care nu cere să scrii nimic.
 *
 * Fără tur, fără modal, fără contor de pași: harta de exemplu *este*
 * explicația, și e mai bună decât orice bulă pentru că e adevărată.
 *
 * `LanguageContext` deduce limba din `navigator.language`, care în jsdom e
 * "en-US". Testele afirmă text românesc, deci limba se fixează explicit în
 * localStorage înainte de fiecare randare.
 */

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("language", "ro");
});

const show = (onTryExample = vi.fn()) => {
  const view = render(
    <LanguageProvider>
      <FirstVisitPromise onTryExample={onTryExample} />
    </LanguageProvider>,
  );
  return { ...view, onTryExample };
};

describe("FirstVisitPromise", () => {
  it("spune ce primește omul înainte să i se ceară ceva", () => {
    const t = getTranslation("ro");
    show();
    expect(screen.getByText(t.firstVisit.promise)).toBeTruthy();
    expect(screen.getByText(t.firstVisit.noAccount)).toBeTruthy();
  });

  it("oferă o hartă de citit fără să scrii nimic", () => {
    const t = getTranslation("ro");
    const { onTryExample } = show();
    fireEvent.click(screen.getByText(t.firstVisit.tryExample));
    expect(onTryExample).toHaveBeenCalledTimes(1);
  });

  it("spune că exemplul e inventat, ca să nu pară al cuiva", () => {
    const t = getTranslation("ro");
    show();
    expect(screen.getByText(t.firstVisit.exampleNote)).toBeTruthy();
  });

  it("ține exemplul fix, ca să fie același pentru toți", () => {
    expect(EXAMPLE_NAME).toBe("Maria Elena Popescu");
    expect(formatCalendarDate(EXAMPLE_BIRTH_DATE)).toBe("1990-05-15");
  });

  it("nu cere cont nicăieri", () => {
    // Copia spune "Fără cont" -- deci nu se caută cuvântul, ci cererea.
    const { container } = show();
    expect(container.querySelectorAll("a[href*='/auth']")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/creează un cont|intră în cont|conectează-te/i);
  });

  it("nu ascunde nimic în spatele unei animații de intrare", () => {
    // Regresia din 57f095a: `opacity-0 animate-fade-in` face conținutul
    // invizibil pentru cine a cerut sistemului mai puțină mișcare. Regula din
    // index.css salvează ce depinde deja de o animație; conținut nou nu are
    // voie să depindă de ea.
    const { container } = show();
    expect(container.querySelectorAll("[class*='opacity-0']")).toHaveLength(0);
    expect(container.querySelectorAll("[class*='animate-']")).toHaveLength(0);
  });
});
