import { ReactNode } from "react";
import { SectionHead } from "@/components/layout/SectionHead";

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
 * Capul e o placă, ca frontispiciul. Harta se citește ca un atlas: plăci și
 * pauze. Placa poartă cifra, titlul și întrebarea -- adică unde ești --, iar
 * materialul de citit rămâne pe suprafața paginii, care urmează tema. Zece mii
 * de pixeli de proză pe fundal închis ar fi fost altă discuție.
 */

export interface ChapterMeta {
  /** Anchor and scroll-spy key. */
  id: string;
  title: string;
  /** The question this chapter answers, in the reader's language. */
  question: string;
}

export const Chapter = ({
  meta,
  index,
  aside,
  children,
}: {
  meta: ChapterMeta;
  index: number;
  /**
   * Ce stă în dreapta plăcii: cadranul, la capitolele care vorbesc chiar
   * despre el. Ecoul stătea mai jos, într-un bloc propriu -- adică o a doua
   * placă la câteva rânduri de prima, ceea ce făcea pagina să pară vărgată.
   */
  aside?: ReactNode;
  children: ReactNode;
}) => (
  <section id={meta.id} className="scroll-mt-24 space-y-8">
    <SectionHead index={index} title={meta.title} question={meta.question} aside={aside} />
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
