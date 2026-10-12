import { describe, it, expect } from "vitest";
import { addressSchools } from "../address";
import { phoneSchools } from "../phone";
import { babyNameSchools } from "../babyNames";
import { moneyCode } from "../moneyCode";
import { lifeCode } from "../lifeCode";
import { electionalDates } from "../electional";
import { turningYears, yearDonorYears, productAges } from "../turningYears";

describe("address", () => {
  it("apartamentul bate blocul; caldeean și homofon alături", () => {
    const r = addressSchools({ building: "1200", apartment: "45C" });
    const by = Object.fromEntries(r.models.map((m) => [m.id, m.value]));
    expect(by["pyth-unit"]).toBe(3); // 4+5+C(3) = 12 → 3
    expect(by["pyth-building"]).toBe(3); // 1+2+0+0
    expect(by["unit-digits"]).toBe(9); // 4+5, litera ignorată
    expect(by["chaldean-unit"]).toBe(3); // 4+5+C(3) = 12 → 3
    expect(r.homophone.unit.digits).toBe("45");
    expect(r.homophone.unit.has4).toBe(true);
    expect(r.pairs.length).toBe(6);
    expect(r.verdict).toBe("apart");
  });
  it("fără apartament, unitatea e clădirea", () => {
    const r = addressSchools({ building: "8" });
    expect(r.models.find((m) => m.id === "pyth-unit")!.value).toBe(8);
    expect(r.models.some((m) => m.id === "pyth-building")).toBe(false);
    expect(r.homophone.unit.has8).toBe(true);
    expect(r.homophone.building).toBeNull();
  });
  it("litera caldeeană diferă de cea pitagoreică", () => {
    // F: pitagoreic 6, caldeean 8
    const r = addressSchools({ building: "1F" });
    const by = Object.fromEntries(r.models.map((m) => [m.id, m.value]));
    expect(by["pyth-unit"]).toBe(7);
    expect(by["chaldean-unit"]).toBe(9);
  });
});

describe("phone", () => {
  it("suma totală, ultimele 4, ultima cifră", () => {
    const r = phoneSchools("+40 722 123 456");
    const by = Object.fromEntries(r.models.map((m) => [m.id, m.value]));
    expect(by["full"]).toBe(9); // 36 → 9
    expect(by["last4"]).toBe(9); // 3+4+5+6 = 18 → 9
    expect(by["last1"]).toBe(6);
    expect(r.homophone.digits).toBe("40722123456");
    expect(r.owner).toBeNull();
  });
  it("relația vedică cu Mulank și Bhagyank", () => {
    // 1 ian 1990: mulank 1, bhagyank 21 → 3, Drumul Vieții 3
    const r = phoneSchools("0000000008", { day: 1, month: 1, year: 1990 });
    const full = r.owner!.rows.find((x) => x.id === "full")!;
    expect(r.owner!.mulank).toBe(1);
    expect(r.owner!.bhagyank).toBe(3);
    expect(r.owner!.lifePath).toBe(3);
    expect(full.withMulank).toBe("enemy");
    expect(full.withBhagyank).toBe("enemy");
    expect(full.vedic).toBe("avoid");
    expect(full.lifePathDistance).toBe(5);
  });
});

describe("baby names", () => {
  it("fiecare școală își face clasamentul și se vede unde nu se potrivesc", () => {
    const r = babyNameSchools(["Ana", "Maria", "Ion"], { day: 5, month: 3, year: 2027 });
    expect(r.names).toHaveLength(3);
    expect(r.mulank).toBe(5);
    expect(r.bhagyank).toBe(1); // 5+3+2+0+2+7 = 19 → 1
    const ana = r.names.find((n) => n.name === "Ana")!;
    expect(ana.pyth.number).toBe(7);
    expect(ana.chaldean.number).toBe(7);
    for (const n of r.names) {
      const rs = [n.ranks.pyth, n.ranks.chaldean, n.ranks.vedic];
      expect(Math.min(...rs)).toBeGreaterThanOrEqual(1);
      expect(n.rankSpread).toBe(Math.max(...rs) - Math.min(...rs));
    }
  });
  it("ignoră rândurile goale", () => {
    expect(babyNameSchools(["", "  ", "Ana"], { day: 1, month: 1, year: 2000 }).names).toHaveLength(1);
  });
});

describe("money code", () => {
  it("20.06.1996 → 2676, cifra unică 6, varianta nereducută 2-6-7-15", () => {
    const r = moneyCode({ day: 20, month: 6, year: 1996 });
    expect(r.fourDigit.code).toBe("2676");
    expect(r.single.value).toBe(6);
    expect(r.unreducedFourth.code).toBe("2-6-7-15");
    expect(r.fourthEqualsSingle).toBe(true);
  });
});

describe("life code (Kuzdenbaeva)", () => {
  it("05.06.1977 → 358257 (exemplul publicat)", () => {
    const r = lifeCode({ day: 5, month: 6, year: 1977 });
    expect(r.working).toEqual([35, 8, 25, 7]);
    expect(r.code).toBe("358257");
    expect(r.length).toBe(6);
  });
  it("19.03.1962 → 3142911 (șapte cifre, 11 nu se reduce)", () => {
    const r = lifeCode({ day: 19, month: 3, year: 1962 });
    expect(r.code).toBe("3142911");
    expect(r.length).toBe(7);
  });
  it("numără cifrele din dată și cod", () => {
    const r = lifeCode({ day: 5, month: 6, year: 1977 });
    expect(r.counts[5]).toBe(3);
    expect(r.counts[7]).toBe(3);
    expect(r.counts[4]).toBe(0);
  });
  it("W3 negativ: nicio regulă publicată, se arată cele două convenții ale pătratului", () => {
    const r = lifeCode({ day: 9, month: 1, year: 2000 }); // W1 = 12, 12 − 18 = −6
    expect(r.negativeThird).toBe(true);
    expect(r.alternatives.map((a) => a.id)).toEqual(["absolute", "plus19"]);
    expect(r.alternatives[0].working[2]).toBe(6);
    expect(r.alternatives[1].working[2]).toBe(31);
  });
  it("W2 față de Drumul Vieții", () => {
    const r = lifeCode({ day: 5, month: 6, year: 1977 });
    expect(r.vsLifePath.lifePath).toBe(8);
    expect(r.vsLifePath.verdict).toBe("agree");
  });
});

describe("electional", () => {
  const from = new Date(2026, 9, 1), to = new Date(2026, 9, 31);
  const me = [{ day: 1, month: 1, year: 1990 }];
  it("două convenții, fiecare cu clasamentul ei", () => {
    const r = electionalDates({ from, to, people: me, purpose: "wedding" });
    expect(r.days).toHaveLength(31);
    const cheiroHits = r.days.filter((d) => d.cheiro.hits === 1).map((d) => d.date.getDate());
    expect(cheiroHits).toEqual([1, 10, 19, 28]);
    expect(r.top.pyth.length).toBeGreaterThan(0);
    expect(r.top.cheiro.length).toBeGreaterThan(0);
  });
  it("zilele de datorie karmică sunt marcate și scoase din top", () => {
    const r = electionalDates({ from, to, people: me, purpose: "wedding" });
    const d13 = r.days.find((d) => d.date.getDate() === 13)!;
    expect(d13.karmic).toContain(13);
    expect(r.top.pyth.every((d) => d.karmic.length === 0)).toBe(true);
    expect(r.top.cheiro.every((d) => d.karmic.length === 0)).toBe(true);
  });
  it("Zi personală: AP + luna + ziua", () => {
    // 2026: AP = 1+1+1 = 3; oct: LP = 3+10 = 13 → 4; 5 oct: ZP = 4+5 = 9
    const r = electionalDates({ from, to, people: me, purpose: "ending" });
    const d5 = r.days.find((d) => d.date.getDate() === 5)!;
    expect(d5.personalDays).toEqual([9]);
    expect(d5.pyth.hits).toBe(1);
  });
  it("refuză intervale peste un an", () => {
    expect(() =>
      electionalDates({ from, to: new Date(2028, 0, 1), people: me, purpose: "wedding" }),
    ).toThrow();
  });
});

describe("turning years", () => {
  it("anul-donor: 11.09.1986 → 2003, 2017", () => {
    expect(yearDonorYears({ day: 11, month: 9, year: 1986 }, 2020)).toEqual([2003, 2017]);
  });
  it("anul-donor, excepția sub 6: 12.01.1999 → 2012, 2025, 2038", () => {
    expect(yearDonorYears({ day: 12, month: 1, year: 1999 }, 2040)).toEqual([2012, 2025, 2038]);
  });
  it("produsul ZZLL × AAAA: 15.08.2001 → 3017508", () => {
    const r = productAges({ day: 15, month: 8, year: 2001 }, 100);
    expect(r.product).toBe(3017508);
    expect(r.ages.slice(0, 7)).toEqual([13, 20, 31, 47, 55, 60, 78]);
    expect(r.ages[7]).toBe(83);
  });
  it("produsul: zero din față al zilei cade (01.08 → 108)", () => {
    expect(productAges({ day: 1, month: 8, year: 2000 }, 100).base).toBe(108);
  });
  it("listă pe metode și coincidențe", () => {
    const r = turningYears({ day: 14, month: 6, year: 1973 }, 90);
    const pin = r.methods.find((m) => m.id === "pinnacles")!;
    // DV 4 → primul pinacol se încheie la 32
    expect(pin.years).toEqual([1973 + 33, 1973 + 42, 1973 + 51]);
    const matrix = r.methods.find((m) => m.id === "matrix")!;
    expect(matrix.years).toEqual([1983, 1993, 2003, 2013, 2023, 2033, 2043]);
    expect(r.coincidences.length).toBeGreaterThan(0);
    for (const c of r.coincidences) expect(c.methods.length).toBeGreaterThanOrEqual(2);
  });
});
