import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { humanProfileError } from "@/lib/profileErrors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfiles } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { PROFILE_CATEGORIES, type ProfileCategory } from "@/lib/profileCategories";

/**
 * Ce se întâmplă cu un nume după ce a fost calculat.
 *
 * Uneltele din /unelte calculează și uită: numele de firmă, varianta de nume,
 * sugestia optimizatorului -- toate dispar la reîncărcare. Butonul ăsta e
 * drumul către o hartă păstrată.
 *
 * `setAsActive: false`, mereu. Numele unei firme sau al unui copil nu e omul
 * care e conectat, iar profilul activ alimentează /azi și prefill-urile.
 * Serverul refuză oricum activarea a ce nu e „eu"; nu i-o cerem.
 */

interface KeepNameButtonProps {
  name: string;
  defaultCategory: ProfileCategory;
}

export const KeepNameButton = ({ name, defaultCategory }: KeepNameButtonProps) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { createProfile } = useProfiles();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ProfileCategory>(defaultCategory);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dateLabel = category === "afacere" ? t.people.foundedLabel : t.people.dateLabel;

  const start = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent("/unelte")}`);
      return;
    }
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const result = await createProfile({
      fullName: name.trim(),
      birthDate: date,
      category,
      setAsActive: false,
    });
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setOpen(false);
      toast({ title: t.people.keepNameDone });
      return;
    }

    // Codul serverului e pentru noi; omul primește o propoziție. Vezi
    // profileErrors.ts -- același refuz se lovește și la „Salvează harta”.
    const human = humanProfileError(result.error, language as "ro" | "en" | "ru");
    if (human) {
      toast({ title: human.title, description: human.body });
      return;
    }

    toast({ title: t.error, variant: "destructive" });
  };

  return (
    <>
      <Button variant="outline" onClick={start} disabled={!name.trim() || saved} className="gap-2">
        {saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        {saved ? t.people.keepNameDone : t.people.keepName}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{t.people.keepName}</DialogTitle>
            <DialogDescription>{t.people.categoryHints[category]}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keep-name-value">{t.fullNameLabel}</Label>
              <Input id="keep-name-value" value={name} readOnly className="input-mystic" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keep-name-category">{t.people.categoryLabel}</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ProfileCategory)}>
                <SelectTrigger id="keep-name-category" className="input-mystic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t.people.categories[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keep-name-date">{dateLabel}</Label>
              <Input
                id="keep-name-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input-mystic num"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={save} disabled={!date || saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
