import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChapterMeta } from "./Chapter";

/**
 * Where you are in the reading, and how to get somewhere else.
 *
 * A sticky column on desktop, a scrollable row of pills on mobile. Both mark
 * the chapter currently in view, which is the part that matters: with five
 * chapters all open the page is long, and without a position marker a reader
 * cannot tell how much is left.
 */

const useActiveChapter = (chapters: ChapterMeta[]) => {
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    // The topmost section that is intersecting wins. rootMargin pulls the
    // trigger line down from the very top so a heading counts as "reached"
    // once it is comfortably on screen rather than the instant it appears.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  return active;
};

export const ChapterNav = ({ chapters }: { chapters: ChapterMeta[] }) => {
  const active = useActiveChapter(chapters);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop: a column beside the reading. */}
      <nav aria-label="Capitole" className="hidden lg:block">
        <ol className="sticky top-24 space-y-1">
          {chapters.map((chapter, i) => (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => go(chapter.id)}
                aria-current={active === chapter.id ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  "flex items-baseline gap-2",
                  active === chapter.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono text-xs tabular-nums opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{chapter.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile: five pills that scroll sideways rather than wrap to three rows. */}
      <nav
        aria-label="Capitole"
        className="lg:hidden sticky top-0 z-30 -mx-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur"
      >
        <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chapters.map((chapter, i) => (
            <li key={chapter.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(chapter.id)}
                aria-current={active === chapter.id ? "true" : undefined}
                className={cn(
                  // 44px e pragul din ghidul iOS. Chip-urile aveau 31: pe o bandă
                  // orizontală de elemente lipite, degetul nimerea vecinul.
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-xs whitespace-nowrap transition-colors",
                  active === chapter.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground",
                )}
              >
                <span className="font-mono tabular-nums opacity-70">{i + 1}</span>
                <span className="ml-1.5">{chapter.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
