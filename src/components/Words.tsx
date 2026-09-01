import { Fragment } from "react";

/**
 * Un text care apare cuvânt cu cuvânt.
 *
 * Decalajul stă în CSS, nu pe cronometre: fiecare cuvânt e în pagină de la
 * început, cu o întârziere de animație proprie. Consecințele contează --
 * un cititor de ecran primește fraza întreagă din prima, testele o găsesc
 * fără să aștepte, iar un tab lăsat în fundal nu se întoarce cu jumătate de
 * propoziție scrisă. Cine a cerut mai puțină mișcare o primește dintr-o dată,
 * prin regula din index.css.
 *
 * `from` decalează pornirea: frazele care apar mai târziu într-un pas nu
 * trebuie să reia numărătoarea de la zero, altfel a doua frază ar începe să
 * se scrie în același moment cu prima.
 */
export const Words = ({
  text,
  animate = true,
  step = 55,
  from = 0,
  className,
}: {
  text: string;
  /** Fals pentru frazele deja citite: la revenire nu se rescriu. */
  animate?: boolean;
  /** Milisecunde între cuvinte. */
  step?: number;
  /** Întârziere de pornire, în milisecunde. */
  from?: number;
  className?: string;
}) => {
  if (!animate) return <span className={className}>{text}</span>;

  const words = text.split(" ");

  return (
    <span className={className ? `word-reveal ${className}` : "word-reveal"}>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span style={{ animationDelay: `${from + i * step}ms` }}>{word}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
};

export default Words;
