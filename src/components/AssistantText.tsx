import { Fragment, type ReactNode } from "react";

/**
 * Răspunsul consultantului, citit de un om.
 *
 * Modelul răspunde în markdown. Componenta care afișa mesajul îl punea într-un
 * <p class="whitespace-pre-wrap">, deci pe ecran apărea literal `## Drumul tău`
 * și `**miezul**` -- patru sute de cuvinte într-un bloc pe care nu-l parcurge
 * nimeni.
 *
 * De ce un randator propriu și nu react-markdown: subsetul pe care îl scrie
 * modelul e mic -- titluri, îngroșări, liste, paragrafe -- iar un randator
 * propriu poate aplica tipografia aplicației, ceea ce o bibliotecă generică nu
 * face: Literata pe titluri, .num pe fiecare cifră, exact ca pe pagina de
 * rezultat. Notificarea, harta și consultantul arată atunci la fel.
 *
 * De ce e sigur: totul se construiește ca elemente React, niciodată prin
 * dangerouslySetInnerHTML. React escapează text, deci un model convins să scrie
 * `<img onerror=...>` produce acele caractere pe ecran, nu o etichetă. Nu e o
 * curățare care poate fi păcălită -- e o cale care nu duce nicăieri.
 */

/** Cifrele poartă .num peste tot în aplicație; aici la fel. */
const withFigures = (text: string, keyBase: string): ReactNode[] =>
  text.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={`${keyBase}-n${i}`} className="num">
        {part}
      </span>
    ) : (
      <Fragment key={`${keyBase}-t${i}`}>{part}</Fragment>
    ),
  );

/** **îngroșat** rămâne îngroșat; restul trece prin tratamentul cifrelor. */
const inline = (text: string, keyBase: string): ReactNode[] =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyBase}-b${i}`} className="font-semibold text-foreground">
        {withFigures(part, `${keyBase}-b${i}`)}
      </strong>
    ) : (
      <Fragment key={`${keyBase}-s${i}`}>{withFigures(part, `${keyBase}-s${i}`)}</Fragment>
    ),
  );

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "ordered"; items: string[] }
  | { kind: "bullets"; items: string[] }
  | { kind: "paragraph"; text: string };

/**
 * Împarte textul în blocuri. O listă se adună cât timp rândurile o continuă;
 * orice altceva o închide. Rândul gol separă paragrafele.
 */
const parse = (text: string): Block[] => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let ordered: string[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    if (ordered.length) blocks.push({ kind: "ordered", items: ordered });
    if (bullets.length) blocks.push({ kind: "bullets", items: bullets });
    paragraph = [];
    ordered = [];
    bullets = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    if (!line) {
      flush();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
      });
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      if (paragraph.length || bullets.length) flush();
      ordered.push(numbered[1]);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (paragraph.length || ordered.length) flush();
      bullets.push(bullet[1]);
      continue;
    }

    if (ordered.length || bullets.length) flush();
    paragraph.push(line);
  }

  flush();
  return blocks;
};

export const AssistantText = ({ text }: { text: string }) => (
  <div className="space-y-3 text-sm leading-relaxed">
    {parse(text).map((block, i) => {
      const key = `b${i}`;

      if (block.kind === "heading") {
        return block.level === 2 ? (
          <h4 key={key} className="font-heading text-base text-foreground">
            {inline(block.text, key)}
          </h4>
        ) : (
          <h5 key={key} className="font-heading text-sm text-foreground">
            {inline(block.text, key)}
          </h5>
        );
      }

      if (block.kind === "ordered") {
        return (
          <ol key={key} className="ml-5 list-decimal space-y-1.5 marker:text-muted-foreground">
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>{inline(item, `${key}-${j}`)}</li>
            ))}
          </ol>
        );
      }

      if (block.kind === "bullets") {
        return (
          <ul key={key} className="ml-5 list-disc space-y-1.5 marker:text-muted-foreground">
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`}>{inline(item, `${key}-${j}`)}</li>
            ))}
          </ul>
        );
      }

      return <p key={key}>{inline(block.text, key)}</p>;
    })}
  </div>
);

export default AssistantText;
