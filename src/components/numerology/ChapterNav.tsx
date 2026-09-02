import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChapterMeta } from "./Chapter";

/**
 * Unde ești în citire, pe telefon.
 *
 * Coloana lipită de pe desktop a plecat. Odată ce fiecare capitol se deschide
 * cu o placă -- bandă întunecată, cifra la 48px, titlul în Literata -- poziția
 * se citește din pagină, iar o listă de șase titluri repetate lângă ea spunea
 * a doua oară același lucru și îngusta citirea cu treisprezece rem.
 *
 * Pe telefon rămâne: acolo placa ocupă tot ecranul pe rând, deci nu vezi
 * niciodată două deodată, iar pagina e de câteva ori mai lungă în derulare.
 * Banda e singurul mod de a sări în alt capitol fără să treci prin tot.
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
    <nav
      aria-label="Capitole"
      /* top-16, nu top-0. Antetul aplicației e `fixed`, înalt de 65px și pe
         z-50: lipită la zero, banda stătea complet sub el. Era așa de când a
         fost scrisă -- adică navigația pe capitole n-a funcționat niciodată pe
         telefon, iar nimeni n-a putut să raporteze un buton pe care nu-l
         vedea. */
      className="lg:hidden sticky top-16 z-30 -mx-4 border-b border-line bg-background/95 px-4 py-2 backdrop-blur"
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
                "inline-flex min-h-11 items-center gap-2 rounded-sm border px-4 text-xs whitespace-nowrap transition-colors",
                active === chapter.id
                  ? "border-gilt bg-gilt-soft text-foreground"
                  : "border-line text-muted-foreground",
              )}
            >
              <span className={cn("num", active === chapter.id ? "text-gilt" : "opacity-60")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{chapter.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
