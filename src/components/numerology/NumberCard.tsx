import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Interpretation } from "@/lib/numerology-plus/content/interpret";

/**
 * One number, its question, and the interpretation composed from archetype plus
 * frame.
 *
 * Every new calculation renders through this, so adding one is a matter of data
 * rather than markup: the engine returns an Interpretation and this draws it.
 * The alternative -- a component per number -- is how a codebase ends up with
 * fourteen near-identical cards that drift apart.
 *
 * Registrul e cel al plăcii: rând cu filet, nu chenar rotunjit. Cifra e
 * vizualul -- la 30px într-un card ca oricare altul, chiar produsul paginii
 * cântărea cât o notă de subsol.
 */

interface NumberCardProps {
  interpretation: Interpretation;
  /** Total before reduction. Shown when it differs, since 7 from 16 is not 7 from 25. */
  raw?: number;
  /** 13, 14, 16 or 19 when the raw total carries one. */
  karmicDebt?: number | null;
  isMaster?: boolean;
  className?: string;
}

const COPY = {
  ro: { works: "când merge", breaks: "când se strică", master: "maestru", debt: "datorie karmică", from: "din" },
  en: { works: "when it works", breaks: "when it breaks", master: "master", debt: "karmic debt", from: "from" },
  ru: { works: "когда работает", breaks: "когда ломается", master: "мастер", debt: "кармический долг", from: "из" },
} as const;

export const NumberCard = ({
  interpretation,
  raw,
  karmicDebt,
  isMaster,
  className,
}: NumberCardProps) => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const t = COPY[(language in COPY ? language : "ro") as keyof typeof COPY];
  const { label, question, value, title, keywords, lead, works, breaks } = interpretation;
  const showsRaw = raw !== undefined && raw !== value;

  return (
    <article className={cn("border-b border-line", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-start gap-5 py-5 text-left sm:gap-7"
      >
        <span
          className={cn(
            "num shrink-0 text-right text-4xl leading-[0.86] sm:w-[88px] sm:text-5xl",
            "w-14",
            isMaster ? "text-gilt" : "text-accent",
          )}
        >
          {value}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-lg text-foreground sm:text-xl">{label}</span>
            {isMaster && (
              <span className="num text-[0.6rem] uppercase tracking-[0.16em] text-gilt">
                {t.master}
              </span>
            )}
            {karmicDebt != null && (
              <span className="num text-[0.6rem] uppercase tracking-[0.16em] text-crit">
                {karmicDebt} · {t.debt}
              </span>
            )}
            {showsRaw && karmicDebt == null && (
              <span className="num text-[0.68rem] text-muted-foreground">
                {t.from} {raw}
              </span>
            )}
          </span>
          <span className="mt-1.5 block max-w-[60ch] text-sm text-muted-foreground">{question}</span>
        </span>

        <span className="num flex shrink-0 items-center gap-2.5 pt-1.5 text-[0.68rem] text-muted-foreground">
          <span className="hidden sm:inline">{title}</span>
          <span
            aria-hidden="true"
            className={cn("transition-transform", open && "rotate-180")}
          >
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-5 pb-6 sm:pl-[116px]">
          <p className="num text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {keywords.join(" · ")}
          </p>
          <p className="max-w-[65ch] font-heading text-[1.05rem] leading-relaxed text-foreground/90">
            {lead}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="border-t border-harmony pt-3">
              <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-harmony">
                {t.works}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{works}</p>
            </div>
            <div className="border-t border-tension pt-3">
              <span className="num text-[0.6rem] uppercase tracking-[0.18em] text-tension">
                {t.breaks}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{breaks}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
