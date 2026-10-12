import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToolLang, type Lang } from "./toolLang";
import type { PairDistance, Verdict } from "@/lib/tools/shared";

/**
 * Ce împart uneltele care pun o întrebare prin mai multe școli: răspunsurile
 * unul lângă altul, fiecare cu sursa și pașii lui, apoi distanța dintre ele.
 * Nimic de aici nu alege. Fără sursă sub cifră, două cifre diferite arată ca
 * un bug; cu sursa, arată ca ce sunt — două citiri.
 */


const COPY: Record<Lang, { verdict: Record<Verdict, string>; distance: string; spread: string; same: string }> = {
  ro: {
    same: "la fel",
    verdict: { agree: "toate la fel", octave: "aceeași rădăcină, alt registru", near: "aproape", apart: "departe" },
    distance: "distanța",
    spread: "cea mai mare distanță",
  },
  en: {
    same: "the same",
    verdict: { agree: "all the same", octave: "same root, other register", near: "close", apart: "far apart" },
    distance: "distance",
    spread: "largest distance",
  },
  ru: {
    same: "совпадают",
    verdict: { agree: "все совпадают", octave: "тот же корень, другой регистр", near: "близко", apart: "далеко" },
    distance: "расстояние",
    spread: "наибольшее расстояние",
  },
};

const TONE: Record<Verdict, string> = {
  agree: "border-harmony",
  octave: "border-harmony",
  near: "border-line",
  apart: "border-tension",
};

export interface SchoolRow {
  id: string;
  label: string;
  method: string;
  value: ReactNode;
  steps?: string[];
}

export const SchoolsCompare = ({
  rows,
  pairs,
  verdict,
  spread,
}: {
  rows: SchoolRow[];
  pairs?: PairDistance[];
  verdict?: Verdict;
  spread?: number;
}) => {
  const lang = useToolLang();
  const t = COPY[lang];
  const label = (id: string) => rows.find((r) => r.id === id)?.label ?? id;
  return (
    <div data-schools className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.id} data-school={r.id} className="border-t border-line pt-4">
            <div className="flex items-baseline gap-3">
              <span className="num text-3xl leading-none text-primary">{r.value}</span>
              <span className="text-sm text-foreground/90">{r.label}</span>
            </div>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{r.method}</p>
            {r.steps && r.steps.length > 0 && (
              <ul className="num mt-2 space-y-0.5 text-xs text-foreground/75">
                {r.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {verdict && pairs && pairs.length > 0 && (
        <div className={`border-t pt-4 ${TONE[verdict]}`}>
          <p className="text-sm text-foreground">
            {t.verdict[verdict]}
            {typeof spread === "number" && verdict !== "agree" && verdict !== "octave" && (
              <span className="text-muted-foreground">
                {" "}
                · {t.spread} <span className="num">{spread}</span>
              </span>
            )}
          </p>
          {/* Când toate cad de acord, lista de perechi ar fi numai „distanța 0”. */}
          {verdict !== "agree" && (
          <ul className="mt-3 space-y-1 text-sm text-foreground/80">
            {pairs.map((p) => (
              <li key={`${p.a}-${p.b}`} className="flex flex-wrap items-baseline gap-x-2">
                <span>{label(p.a)}</span>
                <span className="text-muted-foreground">↔</span>
                <span>{label(p.b)}</span>
                <span className="num text-xs text-muted-foreground">
                  {t.distance} {p.distance} · {p.verdict === "agree" ? t.same : t.verdict[p.verdict]}
                </span>
              </li>
            ))}
          </ul>
          )}
        </div>
      )}
    </div>
  );
};

/** Un bloc: filet sus, titlu, textul direct pe pagină. */
export const ToolBlock = ({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) => (
  <section className="space-y-5 border-t border-line pt-5">
    <h3 className="font-heading text-lg text-foreground sm:text-xl">{title}</h3>
    {lede && <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{lede}</p>}
    {children}
  </section>
);

export const Field = ({
  id,
  label,
  hint,
  ...input
}: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...input} />
    {hint && <p className="text-xs leading-snug text-muted-foreground">{hint}</p>}
  </div>
);
