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
 *
 * Registrul e cel al plăcii din capul paginii: cifra capitolului mare, în
 * alamă, și un filet în locul unei iconițe colorate. Placa pusă peste capitole
 * desenate altfel lăsa cusătura la vedere -- două stiluri pe o pagină sunt mai
 * rău decât oricare dintre ele singur.
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
  <section id={meta.id} className="scroll-mt-24 space-y-8">
    <header className="flex items-start gap-5 border-b border-line pb-5 sm:gap-6">
      {/* Cifra e cap curent, nu etichetă: la 12px se pierdea, iar capitolul
          începea fără să se vadă că începe. */}
      <span className="num shrink-0 text-4xl leading-[0.85] text-gilt/45 sm:text-5xl">
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 pt-0.5">
        <h2 className="font-heading text-2xl leading-tight text-foreground sm:text-3xl">
          {meta.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{meta.question}</p>
      </div>
    </header>
    {children}
  </section>
);

/**
 * A block inside a chapter: a heading and its content, nothing to click.
 *
 * Titlul e o etichetă de alamă cu filet, nu o iconiță lucide colorată plus un
 * titlu. Iconițele -- steluțe albastre, triunghiuri de avertisment chihlimbar --
 * erau chiar semnătura stilului vechi, și pe lângă asta spuneau alarmă acolo
 * unde harta vorbește despre distanțe. O distanță de 6 nu e o eroare.
 */
export const Block = ({
  title, note, children,
}: { title: string; note?: string; children: ReactNode }) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
        <h3 className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">{title}</h3>
      </div>
      {note && <p className="max-w-[65ch] text-sm text-muted-foreground">{note}</p>}
    </div>
    {children}
  </div>
);
