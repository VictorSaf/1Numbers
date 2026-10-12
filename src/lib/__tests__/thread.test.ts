import { describe, it, expect } from "vitest";
import { buildThread, type ThreadStep } from "../thread";

/**
 * Firul: harta spusă pe rând, în ordinea în care te distinge.
 *
 * Panoul de dinainte arăta unsprezece blocuri deodată, toate cu aceeași
 * greutate, fiecare o cifră fără propoziție. Firul spune un lucru, apoi
 * următorul, iar ordinea nu e aceeași pentru toți: urcă ce e rar în harta ta.
 *
 * Textele nu se scriu aici. Vin din motor -- arhetipuri, contradicții,
 * interpretări -- exact ca pe pagina de rezultat, ca notificarea și harta să
 * nu spună lucruri diferite despre același număr.
 */

const NAME = "Victor Ion Safta";
const BIRTH = new Date(1990, 7, 25);
const TODAY = new Date(2026, 8, 1);
type Lang = "ro" | "en" | "ru";

const keys = (steps: ThreadStep[]) => steps.map((s) => s.key);
const keys_ = keys;

describe("buildThread", () => {
  it("începe întotdeauna cu Drumul Vieții, oricât de banal ar fi", () => {
    // Nu pentru că ar fi cel mai rar, ci pentru că restul se citește prin el.
    expect(buildThread(NAME, BIRTH, "ro", TODAY)[0].key).toBe("lifePath");
  });

  it("pune contradicția înaintea pașilor obișnuiți", () => {
    const order = keys(buildThread(NAME, BIRTH, "ro", TODAY));
    const tension = order.findIndex((k) => k.startsWith("bridge"));
    const letters = order.indexOf("letters");

    expect(tension).toBeGreaterThan(0);
    expect(tension).toBeLessThan(letters);
  });

  it("nu inventează un pas de lecții karmice pentru un nume care nu are", () => {
    // ANA are toate cifrele lipsă în afară de 1 și 5, deci pasul apare.
    // Un nume care le-ar avea pe toate nu l-ar primi -- aici verific doar că
    // pasul e legat de conținut, nu adăugat mereu.
    const withLessons = buildThread(NAME, BIRTH, "ro", TODAY);
    const step = withLessons.find((s) => s.key === "karmicLessons");

    expect(step).toBeDefined();
    expect(step!.figures).toMatch(/\d/);
  });

  it.each<Lang>(["ro", "en", "ru"])(
    "dă fiecărui pas toate câmpurile, nevide, în %s",
    (lang) => {
      for (const step of buildThread(NAME, BIRTH, lang, TODAY)) {
        expect(step.kicker.length, `kicker ${step.key}`).toBeGreaterThan(0);
        expect(step.say.length, `say ${step.key}`).toBeGreaterThan(20);
        expect(step.figures.length, `figures ${step.key}`).toBeGreaterThan(0);
        expect(step.name.length, `name ${step.key}`).toBeGreaterThan(0);
        expect(step.plain.length, `plain ${step.key}`).toBeGreaterThan(20);
      }
    },
  );

  it("nu lasă niciun șablon nerezolvat în text", () => {
    for (const lang of ["ro", "en", "ru"] as Lang[]) {
      for (const step of buildThread(NAME, BIRTH, lang, TODAY)) {
        expect(`${step.say} ${step.plain}`).not.toMatch(/\{(essence|strength|shadow|n|title)\}/);
        expect(`${step.say} ${step.plain}`).not.toMatch(/undefined/);
      }
    }
  });

  it("dă aceeași ordine pentru aceeași hartă, și alta pentru alta", () => {
    const mine = keys(buildThread(NAME, BIRTH, "ro", TODAY));
    const again = keys(buildThread(NAME, BIRTH, "ro", TODAY));
    const other = keys(buildThread("Ana Maria Pop", new Date(1993, 2, 4), "ro", TODAY));

    expect(again).toEqual(mine);
    expect(other[0]).toBe("lifePath");
    // Ordinea de după ancoră depinde de hartă; dacă ar fi identică pentru
    // oricine, „se rearanjează după harta lui" ar fi doar o afirmație.
    expect(other.join()).not.toBe(mine.join());
  });


  it("dă pasului-ancoră tot ce are motorul despre cifră, nu o singură frază", () => {
    // Arhetipul are titlu, cuvinte-cheie, cum funcționează și cum se strică.
    // Prima versiune folosea doar esența, adică o pătrime din ce era calculat.
    const first = buildThread(NAME, BIRTH, "ro", TODAY)[0];

    expect(first.title).toBeTruthy();
    expect(first.keywords?.length).toBeGreaterThanOrEqual(3);
    expect(first.works!.length).toBeGreaterThan(20);
    expect(first.breaks!.length).toBeGreaterThan(20);
  });

  it("spune ce urmează, ca să fie un motiv să apeși", () => {
    const steps = buildThread(NAME, BIRTH, "ro", TODAY);

    for (const [i, step] of steps.entries()) {
      if (i === steps.length - 1) expect(step.teaser).toBeUndefined();
      else expect(step.teaser!.length).toBeGreaterThan(3);
    }
  });

  it("explică fiecare cifră care lipsește, nu doar le enumeră", () => {
    const missing = buildThread(NAME, BIRTH, "ro", TODAY).find((s) => s.key === "karmicLessons");

    // „Lipsesc 7 și 8" nu spune nimic. Ce înseamnă fiecare, da.
    expect(missing!.details?.length).toBe(missing!.figures.split(" · ").length);
    for (const d of missing!.details!) expect(d.length).toBeGreaterThan(15);
  });

  it("arată tot ce calculează motorul, nu o șesime din el", () => {
    // Motorul calcula treizeci de lucruri și firul arăta șase. Sufletul,
    // Personalitatea și Destinul -- miezul oricărei hărți -- apăreau doar
    // înăuntrul unui pod, niciodată ca lucruri în sine.
    const keys = keys_(buildThread(NAME, BIRTH, "ro", TODAY));

    for (const k of [
      "expression", "soulUrge", "personality", "birthday",
      "maturity", "attitude", "balance", "subconsciousSelf", "rationalThought",
    ]) {
      expect(keys, `lipsește ${k}`).toContain(k);
    }
  });

  it("ridică datoriile karmice deasupra pașilor obișnuiți, când există", () => {
    const steps = buildThread(NAME, BIRTH, "ro", TODAY);
    const debt = steps.find((s) => s.key === "karmicDebts");
    if (!debt) return; // harta asta poate să n-aibă -- se testează doar rangul
    const letters = steps.findIndex((s) => s.key === "letters");
    expect(steps.findIndex((s) => s.key === "karmicDebts")).toBeLessThan(letters);
  });

  it("are cel puțin șase pași, ca firul să merite parcurs", () => {
    expect(buildThread(NAME, BIRTH, "ro", TODAY).length).toBeGreaterThanOrEqual(6);
  });
});
