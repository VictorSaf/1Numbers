import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WhenVisible } from "../WhenVisible";

/**
 * The gate that stops Recharts being downloaded for readers who never scroll to
 * a chart. The charts were lazily imported but eagerly mounted, and React.lazy
 * starts fetching the moment the component renders -- so the 412 kB charts
 * chunk was paid for by everyone who opened a reading.
 */

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

let trigger: Callback | null = null;
const disconnect = vi.fn();

beforeEach(() => {
  trigger = null;
  disconnect.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback) { trigger = cb; }
      observe() {}
      disconnect = disconnect;
      unobserve() {}
      takeRecords() { return []; }
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("WhenVisible", () => {
  it("shows the fallback and not the children until it is reached", () => {
    render(<WhenVisible fallback={<span>skeleton</span>}><span>chart</span></WhenVisible>);

    expect(screen.getByText("skeleton")).toBeTruthy();
    expect(screen.queryByText("chart")).toBeNull();
  });

  it("mounts the children once they intersect", () => {
    render(<WhenVisible fallback={<span>skeleton</span>}><span>chart</span></WhenVisible>);

    act(() => trigger?.([{ isIntersecting: true }]));

    expect(screen.getByText("chart")).toBeTruthy();
    expect(screen.queryByText("skeleton")).toBeNull();
  });

  it("keeps them mounted afterwards, and stops observing", () => {
    render(<WhenVisible fallback={<span>skeleton</span>}><span>chart</span></WhenVisible>);

    act(() => trigger?.([{ isIntersecting: true }]));
    act(() => trigger?.([{ isIntersecting: false }]));

    // A chart that vanishes when scrolled past is worse than one that arrives
    // a moment late.
    expect(screen.getByText("chart")).toBeTruthy();
    expect(disconnect).toHaveBeenCalled();
  });

  it("renders everything where there is no IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<WhenVisible fallback={<span>skeleton</span>}><span>chart</span></WhenVisible>);

    expect(screen.getByText("chart")).toBeTruthy();
  });
});
