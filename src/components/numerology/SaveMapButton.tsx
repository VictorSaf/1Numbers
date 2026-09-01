import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { humanProfileError } from "@/lib/profileErrors";
import { formatCalendarDate } from "@/lib/calendarDate";

/**
 * What the reading ends with.
 *
 * It used to end with "Calculate again", which is an offer to throw the reading
 * away -- the last thing on a page someone has just spent several minutes in.
 * Keeping the map is the thing worth offering there; recalculating is available
 * from the calculator, where it belongs.
 *
 * The date goes over as YYYY-MM-DD, not an ISO instant: the column is DATE and
 * a timestamp shifts the birthday by a day in half the world's timezones.
 */

const COPY = {
  ro: {
    save: "Salvează harta asta",
    saving: "Se salvează…",
    saved: "Harta e salvată",
    needAccount: "Ai nevoie de un cont",
    needAccountBody: "Creează unul sau conectează-te ca să păstrezi harta.",
    failed: "Nu s-a putut salva",
    keepClose: "Ține-o ca apropiat",
    keptClose: "E la oamenii tăi",
  },
  en: {
    save: "Save this map",
    saving: "Saving…",
    saved: "Map saved",
    needAccount: "You need an account",
    needAccountBody: "Sign in or create one to keep this map.",
    failed: "Could not save",
    keepClose: "Keep as someone close",
    keptClose: "Kept with your people",
  },
  ru: {
    save: "Сохранить эту карту",
    saving: "Сохраняем…",
    saved: "Карта сохранена",
    needAccount: "Нужен аккаунт",
    needAccountBody: "Войдите или создайте аккаунт, чтобы сохранить карту.",
    failed: "Не удалось сохранить",
    keepClose: "Сохранить как близкого",
    keptClose: "В разделе близких",
  },
} as const;

export const SaveMapButton = ({ fullName, birthDate }: { fullName: string; birthDate: Date }) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { createProfile } = useProfiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  /**
   * „offerClose” apare doar după ce serverul refuză harta proprie.
   *
   * Mesajul spunea că harta se poate ține ca om apropiat -- adevărat, dar un
   * mesaj care descrie o alternativă fără s-o ofere e o instrucțiune, nu un
   * produs: omul ar trebui să caute singur secțiunea cu oameni și să retasteze
   * numele și data pe care tocmai le-a citit.
   */
  const [state, setState] = useState<"idle" | "saving" | "saved" | "offerClose">("idle");

  const t = COPY[language as keyof typeof COPY] ?? COPY.en;

  const save = async () => {
    if (!isAuthenticated) {
      toast({ title: t.needAccount, description: t.needAccountBody });
      navigate(`/auth?redirect=${encodeURIComponent("/")}`);
      return;
    }

    const asClose = state === "offerClose";
    setState("saving");

    const result = await createProfile({
      fullName,
      birthDate: formatCalendarDate(birthDate),
      // Ținută pentru altcineva, deci nu devine harta ta activă.
      ...(asClose ? { category: "apropiat" as const, setAsActive: false } : { setAsActive: true }),
    });

    if (result.success) {
      setState("saved");
      toast({ title: asClose ? t.keptClose : t.saved });
      return;
    }

    setState("idle");

    // Codul de eroare e pentru noi; omul primește o propoziție. Traducerea stă
    // în profileErrors.ts, fiindcă același refuz se lovește în trei locuri.
    const human = humanProfileError(result.error, (language in COPY ? language : "en") as "ro" | "en" | "ru");
    if (human) {
      // Nu e o avarie -- e o regulă. Un toast roșu ar spune altceva.
      toast({ title: human.title, description: human.body });
      // Refuzul hărții proprii are o ieșire, și ea se pune pe buton. Celelalte
      // refuzuri n-au: „ai deja harta ta” nu se rezolvă apăsând din nou.
      if ((result.error ?? "").includes("admin_only") && !asClose) setState("offerClose");
      return;
    }

    toast({ title: t.failed, variant: "destructive" });
  };

  return (
    <Button onClick={save} disabled={state === "saving" || state === "saved"} size="lg" className="gap-2">
      {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "saved" && <Check className="h-4 w-4" />}
      {state === "idle" && <BookmarkPlus className="h-4 w-4" />}
      {state === "saving"
        ? t.saving
        : state === "saved"
          ? t.saved
          : state === "offerClose"
            ? t.keepClose
            : t.save}
    </Button>
  );
};
