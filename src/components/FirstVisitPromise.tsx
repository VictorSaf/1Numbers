import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Ce află omul înainte să i se ceară ceva.
 *
 * Pagina de start cerea înainte să ofere: un titlu, "Calculează Numerele
 * Tale", două câmpuri. Nimic despre ce iese din ele, cât durează, sau că nu se
 * cere cont, plată sau adresă de e-mail. Cele trei carduri explicative erau
 * abia sub prima cotitură.
 *
 * Nu e un tur. Un tur e o descriere a produsului așezată în fața produsului;
 * aici produsul e lizibil dintr-un clic, iar harta de exemplu *este*
 * explicația. Fără modal, fără bule, fără contor de pași, fără "sari peste".
 *
 * Exemplul e fix -- același nume inventat și aceeași dată în toate limbile --
 * ca să fie determinist, testabil, și ca să nu semene cu al nimănui.
 *
 * Nicio clasă `animate-*` și niciun `opacity-0`: conținutul nou nu are voie să
 * depindă de o animație ca să fie vizibil (vezi 57f095a).
 */

export const EXAMPLE_NAME = "Maria Elena Popescu";
export const EXAMPLE_BIRTH_DATE = new Date(1990, 4, 15);

interface FirstVisitPromiseProps {
  onTryExample: () => void;
}

export const FirstVisitPromise = ({ onTryExample }: FirstVisitPromiseProps) => {
  const { t } = useLanguage();

  return (
    <div className="mb-6 text-center">
      <p className="text-foreground/90">{t.firstVisit.promise}</p>
      <p className="mt-1 font-raleway text-sm text-muted-foreground">{t.firstVisit.noAccount}</p>

      <div className="mt-4 border-t border-border/40 pt-4">
        <Button
          variant="outline"
          onClick={onTryExample}
          className="gap-2 border-primary/30 font-raleway text-primary hover:bg-primary/10"
        >
          {t.firstVisit.tryExample}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-2 font-raleway text-xs text-muted-foreground">{t.firstVisit.exampleNote}</p>
      </div>
    </div>
  );
};
