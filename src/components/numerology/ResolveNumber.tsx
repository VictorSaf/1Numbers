import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Shows a number arriving at itself.
 *
 * The engine already computes the unreduced total on the way to the answer and
 * keeps it on `NumResult.raw`, but every surface so far has thrown it away and
 * printed only the final digit. That is the one piece of the calculation a
 * reader can verify by hand -- "STEFAN TIRLEA" is 49, 4+9 is 13, 1+3 is 4 --
 * and without it the number arrives as an assertion rather than a result. Every
 * other numerology site on the market prints the digit alone; replaying the
 * descent once, briefly, is the cheapest way to show the arithmetic is real.
 *
 * The animation is decoration over a value that is already correct: it never
 * computes the answer, it only walks toward the one it was handed. If motion is
 * refused, skipped or interrupted, the final value is what stands.
 */

/** Total duration of the descent, however many steps it takes. */
const TOTAL_MS = 600;

const digitSum = (n: number) =>
  String(Math.abs(n))
    .split("")
    .reduce((a, c) => a + Number(c), 0);

/**
 * The masters are terminal. 29 -> 11 stops there; reducing it further to 2
 * would erase the very distinction the system exists to make.
 */
const isTerminal = (x: number) => x <= 9 || x === 11 || x === 22 || x === 33;

/**
 * Exported for tests: the chain is the whole contract of this component, and
 * asserting on it directly is more honest than reading digits out of the DOM
 * between timer ticks.
 */
export const reductionChain = (raw: number): number[] => {
  if (!Number.isFinite(raw)) return [];
  const chain = [raw];
  let x = raw;
  // Bounded by construction -- each digit sum is strictly smaller than its
  // input above 9 -- but the guard keeps a malformed input from hanging a render.
  while (!isTerminal(x) && chain.length < 12) {
    x = digitSum(x);
    chain.push(x);
  }
  return chain;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface ResolveNumberProps {
  /** The final reduced value, e.g. 4. This is what is displayed when the animation is done or skipped. */
  value: number;
  /** The unreduced total the value came from, e.g. 49. When absent or equal to value, no animation runs. */
  raw?: number;
  /** Play the animation. When false the final value renders immediately. */
  play?: boolean;
  /** Extra classes for the number element. */
  className?: string;
}

export const ResolveNumber = ({ value, raw, play = true, className }: ResolveNumberProps) => {
  // Read once, at mount. A preference that flips mid-animation is not worth a
  // listener; the sequence is over in under a second either way.
  const [reduced] = useState(prefersReducedMotion);

  const chain = useMemo(() => {
    if (raw === undefined || raw === value || !Number.isFinite(raw)) return [value];
    const steps = reductionChain(raw);
    // The engine's value wins. If the walk lands somewhere else -- a raw that
    // never belonged to this value -- we still end where we were told to end.
    return steps[steps.length - 1] === value ? steps : [...steps, value];
  }, [raw, value]);

  const animates = play && !reduced && chain.length > 1;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!animates) return;

    setStep(0);
    const last = chain.length - 1;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= last) window.clearInterval(id);
    }, TOTAL_MS / last);

    return () => window.clearInterval(id);
  }, [animates, chain]);

  const display = animates ? (chain[Math.min(step, chain.length - 1)] ?? value) : value;

  return (
    // role="img" is what makes the label authoritative: without it a screen
    // reader would read the changing digits underneath instead of the answer.
    // The label is the final value from the first render on, so the assistive
    // announcement never depends on where the animation happens to be.
    <span role="img" aria-label={String(value)}>
      <span aria-live="off" className={cn("num", className)}>
        {display}
      </span>
    </span>
  );
};

export default ResolveNumber;
