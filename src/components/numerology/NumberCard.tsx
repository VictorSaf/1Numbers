import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Interpretation } from "@/lib/numerology-plus/content/interpret";

/**
 * One number, its question, and the interpretation composed from archetype plus
 * frame.
 *
 * Every new calculation renders through this, so adding one is a matter of data
 * rather than markup: the engine returns an Interpretation and this draws it.
 * The alternative -- a component per number -- is how a codebase ends up with
 * fourteen near-identical cards that drift apart.
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

export const NumberCard = ({
  interpretation,
  raw,
  karmicDebt,
  isMaster,
  className,
}: NumberCardProps) => {
  const [open, setOpen] = useState(false);
  const { label, question, value, title, keywords, lead, works, breaks } = interpretation;
  const showsRaw = raw !== undefined && raw !== value;

  return (
    <article
      className={cn(
        "rounded-xl border border-line bg-surface/60 backdrop-blur-sm transition-colors",
        "hover:border-primary/40",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start gap-4 p-4 text-left group"
      >
        <span
          className={cn(
            "num shrink-0 text-3xl leading-none w-12 text-center",
            isMaster ? "text-primary" : "text-ink-2",
          )}
        >
          {value}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-heading text-base text-foreground">{label}</span>
            {isMaster && (
              <span className="num text-[10px] uppercase tracking-wider text-primary">master</span>
            )}
            {karmicDebt != null && (
              <span className="num rounded bg-crit-soft px-1.5 py-0.5 text-[10px] text-crit">
                {karmicDebt} · datorie karmică
              </span>
            )}
            {showsRaw && karmicDebt == null && (
              <span className="num text-[10px] text-faint">din {raw}</span>
            )}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{question}</span>
        </span>

        <span className="shrink-0 flex items-center gap-2 pt-1">
          <span className="hidden sm:inline text-xs text-faint">{title}</span>
          <ChevronDown
            className={cn("h-4 w-4 text-faint transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <span key={k} className="rounded bg-sunken px-2 py-0.5 text-xs text-ink-2">
                {k}
              </span>
            ))}
          </div>
          <p className="text-sm text-foreground/90">{lead}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="rounded-lg bg-ok-soft/60 p-3 text-sm text-foreground/90">{works}</p>
            <p className="rounded-lg bg-warn-soft/60 p-3 text-sm text-foreground/90">{breaks}</p>
          </div>
        </div>
      )}
    </article>
  );
};
