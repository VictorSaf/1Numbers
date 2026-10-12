import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ResolveNumber, reductionChain } from "../ResolveNumber";

/**
 * The component animates, so the temptation is to test the animation. What
 * actually matters is narrower: whatever happens to the motion -- refused,
 * disabled, cut short by an unmount -- the reader must never be left looking at
 * an intermediate digit, and the descent that does play must be the arithmetic
 * the engine performed, not a plausible-looking sequence.
 */

const stubMatchMedia = (matches: boolean) => {
  const value = (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  Object.defineProperty(window, "matchMedia", { writable: true, value });
};

afterEach(() => {
  vi.useRealTimers();
  stubMatchMedia(false);
});

describe("reductionChain", () => {
  it("walks 49 down to 4 through 13", () => {
    expect(reductionChain(49)).toEqual([49, 13, 4]);
  });

  it("stops on a master number instead of reducing it away", () => {
    // 29 -> 11 -> would be 2. The chain must not take that last step.
    expect(reductionChain(29)).toEqual([29, 11]);
    expect(reductionChain(29)).not.toContain(2);
    expect(reductionChain(499)).toEqual([499, 22]);
  });

  it("leaves a value that is already terminal alone", () => {
    expect(reductionChain(4)).toEqual([4]);
    expect(reductionChain(11)).toEqual([11]);
  });
});

describe("ResolveNumber", () => {
  it("renders the final value with no timers when play is false", () => {
    vi.useFakeTimers();
    render(<ResolveNumber value={4} raw={49} play={false} />);

    expect(screen.getByLabelText("4")).toHaveTextContent("4");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders the final value immediately under reduced motion", () => {
    stubMatchMedia(true);
    vi.useFakeTimers();
    render(<ResolveNumber value={4} raw={49} />);

    // Not 49, not 13 -- the reader who asked for no motion gets the answer.
    expect(screen.getByLabelText("4")).toHaveTextContent("4");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("renders the final value when there is nothing to reduce", () => {
    vi.useFakeTimers();
    render(<ResolveNumber value={7} />);

    expect(screen.getByLabelText("7")).toHaveTextContent("7");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("steps through 49, 13, 4 and stays on 4", () => {
    vi.useFakeTimers();
    render(<ResolveNumber value={4} raw={49} />);

    const seen = [screen.getByLabelText("4").textContent];
    // Two transitions across 600ms; step past each and record what shows.
    act(() => void vi.advanceTimersByTime(300));
    seen.push(screen.getByLabelText("4").textContent);
    act(() => void vi.advanceTimersByTime(300));
    seen.push(screen.getByLabelText("4").textContent);

    expect(seen).toEqual(["49", "13", "4"]);

    // And it does not keep going once it has arrived.
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByLabelText("4").textContent).toBe("4");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ends on 11 rather than reducing the master away", () => {
    vi.useFakeTimers();
    render(<ResolveNumber value={11} raw={29} />);

    act(() => void vi.advanceTimersByTime(1200));
    expect(screen.getByLabelText("11").textContent).toBe("11");
  });

  it("labels the wrapper with the final value from the first render", () => {
    render(<ResolveNumber value={4} raw={49} />);

    // Mid-animation the digits read 49, but the accessible name is already 4.
    const wrapper = screen.getByLabelText("4");
    expect(wrapper).toHaveTextContent("49");
    expect(wrapper.firstElementChild).toHaveAttribute("aria-live", "off");
    expect(wrapper.firstElementChild).toHaveClass("num");
  });

  it("keeps the caller's className on the numeral", () => {
    render(<ResolveNumber value={4} play={false} className="text-4xl" />);

    const numeral = screen.getByLabelText("4").firstElementChild;
    expect(numeral).toHaveClass("num");
    expect(numeral).toHaveClass("text-4xl");
  });

  it("leaves no timer running after unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<ResolveNumber value={4} raw={49} />);

    expect(vi.getTimerCount()).toBe(1);
    act(() => void vi.advanceTimersByTime(300));
    unmount();

    expect(vi.getTimerCount()).toBe(0);
    // Nothing left to fire, so nothing can set state on a dead component.
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });
});
