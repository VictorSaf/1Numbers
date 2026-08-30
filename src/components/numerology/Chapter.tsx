import { ReactNode } from "react";

/**
 * A chapter of the reading.
 *
 * This replaces what ResultSection did. That component was an accordion: every
 * one of the ten sections it wrapped was closed by default, behind a "Show"
 * button identical to the other nine, so nothing on the page said which of them
 * was worth opening -- and the strongest material sat in the last five.
 *
 * A chapter is always open. What it keeps from the accordion is the one line
 * that said what was inside; that line is now the question the chapter answers,
 * and it earns its place by being the thing a reader scans for.
 */

export interface ChapterMeta {
  /** Anchor and scroll-spy key. */
  id: string;
  title: string;
  /** The question this chapter answers, in the reader's language. */
  question: string;
}

export const Chapter = ({
  meta, index, children,
}: { meta: ChapterMeta; index: number; children: ReactNode }) => (
  <section id={meta.id} className="scroll-mt-24 space-y-6">
    <header className="space-y-1 border-b border-border/60 pb-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-heading text-2xl text-foreground">{meta.title}</h2>
      </div>
      <p className="pl-9 text-muted-foreground">{meta.question}</p>
    </header>
    {children}
  </section>
);

/**
 * A block inside a chapter: a heading and its content, nothing to click.
 *
 * The icon and one-line note are what the accordion header used to carry, minus
 * the toggle -- the description of a block is worth as much when the block is
 * simply there as it was when it was hidden.
 */
export const Block = ({
  title, icon, note, children,
}: { title: string; icon?: ReactNode; note?: string; children: ReactNode }) => (
  <div className="space-y-3">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading text-lg text-foreground">{title}</h3>
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
    {children}
  </div>
);
