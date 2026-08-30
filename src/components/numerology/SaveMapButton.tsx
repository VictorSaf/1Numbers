import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  },
  en: {
    save: "Save this map",
    saving: "Saving…",
    saved: "Map saved",
    needAccount: "You need an account",
    needAccountBody: "Sign in or create one to keep this map.",
    failed: "Could not save",
  },
  ru: {
    save: "Сохранить эту карту",
    saving: "Сохраняем…",
    saved: "Карта сохранена",
    needAccount: "Нужен аккаунт",
    needAccountBody: "Войдите или создайте аккаунт, чтобы сохранить карту.",
    failed: "Не удалось сохранить",
  },
} as const;

export const SaveMapButton = ({ fullName, birthDate }: { fullName: string; birthDate: Date }) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { createProfile } = useProfiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const t = COPY[language as keyof typeof COPY] ?? COPY.en;

  const save = async () => {
    if (!isAuthenticated) {
      toast({ title: t.needAccount, description: t.needAccountBody });
      navigate(`/auth?redirect=${encodeURIComponent("/")}`);
      return;
    }

    setState("saving");
    const result = await createProfile({
      fullName,
      birthDate: formatCalendarDate(birthDate),
      setAsActive: true,
    });

    if (result.success) {
      setState("saved");
      toast({ title: t.saved });
      return;
    }

    setState("idle");
    toast({ title: t.failed, description: result.error, variant: "destructive" });
  };

  return (
    <Button onClick={save} disabled={state !== "idle"} size="lg" className="gap-2">
      {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "saved" && <Check className="h-4 w-4" />}
      {state === "idle" && <BookmarkPlus className="h-4 w-4" />}
      {state === "saving" ? t.saving : state === "saved" ? t.saved : t.save}
    </Button>
  );
};
