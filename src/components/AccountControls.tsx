import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";

/**
 * Cele două drepturi care cer un buton: să-ți iei datele, și să dispari.
 *
 * Ordinea de pe ecran e deliberată -- descărcarea deasupra ștergerii, iar nota
 * ștergerii trimite explicit la ea. Cine a ajuns aici să plece trebuie să afle
 * că poate lua ceva cu el ÎNAINTE să apese, nu după.
 *
 * Ștergerea nu se face de aici. Se cere, și se confirmă din email: gestul e
 * ireversibil, iar un laptop lăsat deschis nu trebuie să fie de ajuns.
 */
export const AccountControls = () => {
  const { t, language } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const search = useLocation().search;

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Linkul din email aduce jetonul. Se consumă o dată, la intrare.
  useEffect(() => {
    const token = new URLSearchParams(search).get("delete");
    if (!token) return;
    let alive = true;
    api
      .confirmAccountDeletion(token)
      .then(() => {
        if (!alive) return;
        setNotice(t.deleteDone);
        // Nu mai există cont în spatele jetonului din browser.
        void logout();
        navigate("/", { replace: true });
      })
      .catch(() => { if (alive) setNotice(t.deleteNote); });
    return () => { alive = false; };
  }, [search, t.deleteDone, t.deleteNote, logout, navigate]);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await api.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "numerologia-datele-mele.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice(t.error);
    }
    setBusy(false);
  };

  const askToDelete = async () => {
    setBusy(true);
    try {
      await api.requestAccountDeletion(language);
      setNotice(t.deleteSent);
    } catch (err) {
      // Fără transport de email nu se poate confirma, deci nici șterge. Se
      // spune limpede, în loc să pară că n-a mers nimic.
      const status = err instanceof Error ? err.message : "";
      setNotice(status.includes("503") ? t.deleteNoEmail : t.error);
    }
    setBusy(false);
  };

  return (
    <section className="border-t border-line pt-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
        <h3 className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">{t.accountTitle}</h3>
      </div>

      <div className="mt-6 space-y-8">
        <div>
          <h4 className="font-heading text-lg text-foreground">{t.exportLabel}</h4>
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{t.exportNote}</p>
          <Button onClick={download} disabled={busy} variant="outline" className="mt-4 w-full sm:w-auto">
            {t.exportButton}
          </Button>
        </div>

        <div className="border-t border-tension pt-6">
          <h4 className="font-heading text-lg text-tension">{t.deleteLabel}</h4>
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{t.deleteNote}</p>
          <Button onClick={askToDelete} disabled={busy} variant="destructive" className="mt-4 w-full sm:w-auto">
            {t.deleteButton}
          </Button>
        </div>

        {notice && (
          <p className="border-t border-gilt pt-4 text-sm text-foreground/90">{notice}</p>
        )}
      </div>
    </section>
  );
};

export default AccountControls;
