import { ReactNode } from "react";

/**
 * Capul unei secțiuni numerotate: banda de placă din hartă.
 *
 * E scoasă din `Chapter` ca să poată fi INSERATĂ în paginile existente, fără
 * să le rescriu structura. Un capitol de hartă înfășoară ce urmează după el;
 * o secțiune de pagină doar se anunță, iar conținutul rămâne unde era.
 *
 * Cifra e cap curent, ca la hartă: la 12px se pierdea, iar secțiunea începea
 * fără să se vadă că începe.
 */
export const SectionHead = ({
  index,
  title,
  question,
  aside,
}: {
  index: number;
  title: string;
  question?: string;
  aside?: ReactNode;
}) => (
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
        <span className="num shrink-0 text-4xl leading-[0.85] text-plate-gilt/60 sm:text-5xl">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-heading text-2xl leading-tight text-plate-ink sm:text-3xl">{title}</h2>
          {question && <p className="mt-2 max-w-[52ch] text-plate-muted">{question}</p>}
        </div>
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </div>
  </header>
);

export default SectionHead;
