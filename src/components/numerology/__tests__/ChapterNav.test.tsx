import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ChapterNav } from "../ChapterNav";
import type { ChapterMeta } from "../Chapter";

/**
 * With five chapters all open the page is long, so the reader needs to be told
 * where they are. Both layouts render at once -- Tailwind hides one of them by
 * breakpoint, which jsdom does not apply -- so the pair is asserted together.
 */

const CHAPTERS: ChapterMeta[] = [
  { id: "self", title: "Cine ești", question: "Din ce ești făcut." },
  { id: "tension", title: "Ce se contrazice", question: "Ce nu se potrivește." },
  { id: "ahead", title: "Ce urmează", question: "Harta întregii vieți." },
];

type Callback = (entries: Array<{ isIntersecting: boolean; target: Element; boundingClientRect: { top: number } }>) => void;

let trigger: Callback | null = null;

beforeEach(() => {
  trigger = null;
  document.body.innerHTML = CHAPTERS.map((c) => `<section id="${c.id}"></section>`).join("");
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback) { trigger = cb; }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

const entry = (id: string, top: number) => ({
  isIntersecting: true,
  target: document.getElementById(id)!,
  boundingClientRect: { top },
});

describe("ChapterNav", () => {
  it("offers every chapter in both layouts", () => {
    render(<ChapterNav chapters={CHAPTERS} />);

    for (const chapter of CHAPTERS) {
      // One entry in the desktop column, one in the mobile pill row.
      expect(screen.getAllByText(chapter.title)).toHaveLength(2);
    }
  });

  it("marks the first chapter before anything has scrolled", () => {
    render(<ChapterNav chapters={CHAPTERS} />);

    const current = screen.getAllByText("Cine ești")
      .map((el) => el.closest("button"))
      .filter((b) => b?.getAttribute("aria-current") === "true");
    expect(current).toHaveLength(2);
  });

  it("follows the topmost chapter in view", () => {
    render(<ChapterNav chapters={CHAPTERS} />);

    // Two chapters on screen at once: the higher one is the one you are in.
    act(() => trigger?.([entry("ahead", 400), entry("tension", 80)]));

    const marked = screen.getAllByRole("button")
      .filter((b) => b.getAttribute("aria-current") === "true")
      .map((b) => b.textContent);
    expect(marked.every((text) => text?.includes("Ce se contrazice"))).toBe(true);
    expect(marked).toHaveLength(2);
  });

  it("scrolls to a chapter when its button is pressed", () => {
    const scrollIntoView = vi.fn();
    document.getElementById("ahead")!.scrollIntoView = scrollIntoView;
    render(<ChapterNav chapters={CHAPTERS} />);

    fireEvent.click(screen.getAllByText("Ce urmează")[0].closest("button")!);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });
});
