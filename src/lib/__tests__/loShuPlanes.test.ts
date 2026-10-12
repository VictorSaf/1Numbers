import { describe, it, expect } from "vitest";
import { generateLoShuGrid } from "../loShuGrid";

const plane = (d: Date, type: string) => generateLoShuGrid(d).planes.find((p) => p.type === type)!;

describe("Lo Shu planes", () => {
  it("un plan cu o singură cifră, oricât de repetată, e slab, nu echilibrat", () => {
    // 11.11.2011: cifrele 1 și 2. Planul practic (8-1-6) are doar 1, de cinci ori.
    expect(plane(new Date(2011, 10, 11), "practical").strength).toBe("weak");
  });

  it("două cifre din trei sunt echilibrat; toate trei, puternic sau mai mult", () => {
    // 27.03.1988: 2 7 3 1 9 8 8. Practic (8-1-6): 8 și 1 → echilibrat.
    expect(plane(new Date(1988, 2, 27), "practical").strength).toBe("balanced");
    // 18.06.1981: 1 8 6 1 9 8 1. Practic (8-1-6): toate trei → cel puțin puternic.
    expect(["strong", "dominant"]).toContain(plane(new Date(1981, 5, 18), "practical").strength);
  });
});
