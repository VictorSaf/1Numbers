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
    <header className="relative overflow-hidden rounded-xl bg-plate px-6 py-7 sm:px-8 sm:py-8">
      <div className="plate-sky" aria-hidden="true" />
      <div
        className={
          aside
            ? "relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center sm:gap-8"
            : "relative"
        }
      >
        <div className="flex items-start gap-5 sm:gap-6">
          {/* Cifra e cap curent, nu etichetă: la 12px se pierdea, iar capitolul
              începea fără să se vadă că începe. */}
          <span className="num shrink-0 text-4xl leading-[0.85] text-plate-gilt/60 sm:text-5xl">
            {String(index).padStart(2, "0")}
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="font-heading text-2xl leading-tight text-plate-ink sm:text-3xl">
              {meta.title}
            </h2>
            <p className="mt-2 max-w-[52ch] text-plate-muted">{meta.question}</p>
          </div>
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
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
