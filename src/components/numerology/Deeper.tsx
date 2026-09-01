import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Al doilea strat al unui capitol.
 *
 * Raportul arăta douăzeci și două de blocuri, toate deschise, toate cu aceeași
 * greutate. Cine intra primea Lo Shu, planurile de expresie, bioritmurile și
 * matricea destinului deodată cu miezul -- iar prea multă informație odată
 * împiedică reținerea oricăreia.
 *
 * Practica pe care o urmăm aici -- verificată în literatura de UX înainte de a
 * fi implementată -- are trei reguli, și toate trei contează:
 *
 *   1. UN SINGUR strat ascuns. Mai multe niveluri îngroapă lucrurile și fac
 *      funcționalitatea greu de găsit; „mai simplu” bate „mai stratificat”.
 *   2. Deschiderea e o acțiune EXPLICITĂ a omului, nu o presupunere a noastră.
 *   3. Se închide înapoi dintr-un clic. Un strat care nu se poate reîmpacheta
 *      e o navigare, nu o dezvăluire.
 *
 * Ce rămâne mereu vizibil e ce răspunde direct la întrebarea capitolului.
 * Aici intră doar susținerea: adevărată, dar nu primul lucru de citit.
 *
 * Eticheta spune CE e înăuntru, nu „mai mult”: un buton care nu-și numește
 * conținutul cere un clic ca să afli dacă meritau clicul.
 */
export const Deeper = ({
  label,
  children,
}: {
  /** Ce e înăuntru, numit. Nu „vezi mai mult”. */
  label: string;
  children: ReactNode;
}) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  const close = { ro: "Strânge la loc", en: "Fold it back", ru: "Свернуть" };
  const hint = (language in close ? language : "en") as keyof typeof close;

  return (
    <div className="mt-8 border-t border-line pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="btn-primary inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        {open ? close[hint] : label}
      </button>

      {open && <div className="mt-8 space-y-12">{children}</div>}
    </div>
  );
};

export default Deeper;
