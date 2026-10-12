import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { reduceToSingleDigit } from "@/lib/numerology";
import { useState } from "react";
import { getDelayClass } from "@/components/design-system";
import { ResolveNumber } from "@/components/numerology/ResolveNumber";

/**
 * Unul dintre numerele de bază: cifra, arhetipul, și ce se deschide sub ele.
 *
 * Cardul ăsta era ultimul loc care ținea stilul vechi în viață: cerc luminos cu
 * halou, pastile rotunde albastre, iconițe lucide colorate, totul centrat
 * într-o cutie rotunjită. Peste el am pus o placă cerească -- iar două stiluri
 * pe aceeași pagină sunt mai rău decât oricare dintre ele singur.
 *
 * Acum e un rând cu filet, ca tot restul citirii: cifra e vizualul, la 30px
 * într-un cerc decorativ chiar produsul paginii cântărea cât o notă de subsol.
 * Culoarea semantică rămâne pe etichete -- puterile sunt verzi, provocările
 * chihlimbar -- fiindcă acolo spune ceva; ce a plecat sunt pastilele și
 * iconițele, care nu spuneau nimic.
 *
 * Comportamentul e neatins: aceeași replay a reducerii, aceeași eșalonare,
 * aceleași cinci secțiuni de detaliu.
 */

interface NumberCardProps {
  title: string;
  number: number;
  /**
   * The unreduced total this number came from, when the caller has it. Only
   * used to replay the reduction; the displayed value is always `number`.
   */
  raw?: number;
  /** Play that replay. Off everywhere except the first reading a visitor sees. */
  resolve?: boolean;
  delay?: number;
  isMain?: boolean;
  showDetails?: boolean;
}

/** O secțiune din panoul de detaliu: filet, etichetă de culoarea ei, conținut. */
const Detail = ({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "ok" | "warn" | "info" | "tension" | "gilt";
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "border-t pt-3",
      tone === "ok" && "border-ok",
      tone === "warn" && "border-warn",
      tone === "info" && "border-info",
      tone === "tension" && "border-tension",
      tone === "gilt" && "border-gilt/40",
    )}
  >
    <span
      className={cn(
        "num text-[0.6rem] uppercase tracking-[0.18em]",
        tone === "ok" && "text-ok",
        tone === "warn" && "text-warn",
        tone === "info" && "text-info",
        tone === "tension" && "text-tension",
        tone === "gilt" && "text-gilt",
      )}
    >
      {label}
    </span>
    <div className="mt-2 text-sm leading-relaxed text-foreground/85">{children}</div>
  </div>
);

export const NumberCard = ({
  title,
  number,
  raw,
  resolve = false,
  delay = 0,
  isMain = false,
  showDetails = true,
}: NumberCardProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const meaningKey = number as keyof typeof t.meanings;
  const meaning = t.meanings[meaningKey] || t.meanings[reduceToSingleDigit(number, false) as keyof typeof t.meanings];

  const hasDetailedInfo = meaning && "strengths" in meaning;
  const list = (xs: string[]) => xs.join(" · ");

  return (
    <article className={cn("border-b border-line opacity-0 animate-fade-in", getDelayClass(delay))}>
      <div className="flex items-start gap-5 py-6 sm:gap-7">
        <span
          className={cn(
            "num shrink-0 text-right leading-[0.86] text-accent",
            isMain ? "w-16 text-5xl sm:w-[88px] sm:text-6xl" : "w-14 text-4xl sm:w-[88px] sm:text-5xl",
          )}
        >
          <ResolveNumber value={number} raw={raw} play={resolve} />
        </span>

        <div className="min-w-0 flex-1">
          <span className="num block text-[0.6rem] uppercase tracking-[0.18em] text-gilt">
            {title}
          </span>
          <h3 className="mt-1.5 font-heading text-xl text-foreground sm:text-2xl">
            {meaning.title}
          </h3>
          <p className="num mt-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
            {list(meaning.traits)}
          </p>

          {/* The number's own reading. A second paragraph used to sit above this
              one -- t.lifePathDesc and its four siblings -- describing what a Life
              Path *is*, identical for every visitor, placed above the sentence
              that was actually about them. */}
          <p className="mt-3 max-w-[65ch] font-heading text-[1.05rem] leading-relaxed text-foreground/90">
            {meaning.description}
          </p>

          {showDetails && hasDetailedInfo && (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                className="num mt-4 inline-flex min-h-11 items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-gilt transition-colors hover:text-foreground"
              >
                <span>
                  {isExpanded
                    ? t.adviceLabel
                      ? "Ascunde detalii"
                      : "Hide details"
                    : t.adviceLabel || "Sfaturi Personalizate"}
                </span>
                <span aria-hidden="true" className={cn("transition-transform", isExpanded && "rotate-180")}>
                  ▾
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 grid animate-fade-in gap-5 sm:grid-cols-2">
                  {"strengths" in meaning && meaning.strengths && (
                    <Detail label={t.strengthsLabel || "Puncte Forte"} tone="ok">
                      {list(meaning.strengths as string[])}
                    </Detail>
                  )}
                  {"challenges" in meaning && meaning.challenges && (
                    <Detail label={t.challengesLabel || "Provocări"} tone="warn">
                      {list(meaning.challenges as string[])}
                    </Detail>
                  )}
                  {"career" in meaning && meaning.career && (
                    <Detail label={t.careerLabel || "Carieră Potrivită"} tone="info">
                      {list(meaning.career as string[])}
                    </Detail>
                  )}
                  {"relationships" in meaning && meaning.relationships && (
                    <Detail label={t.relationshipsLabel || "Relații"} tone="tension">
                      {meaning.relationships as string}
                    </Detail>
                  )}
                  {"advice" in meaning && meaning.advice && (
                    <div className="sm:col-span-2">
                      <Detail label={t.adviceLabel || "Sfaturi Personalizate"} tone="gilt">
                        <ul className="space-y-1.5">
                          {(meaning.advice as string[]).map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="num shrink-0 text-gilt">—</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </Detail>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
};
