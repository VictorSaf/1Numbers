import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { registerServiceWorker } from '@/lib/serviceWorker';

const COPY = {
  ro: {
    title: 'O versiune nouă e gata',
    body: 'Reîncarcă pentru a o folosi. Nimic din ce ai pe ecran nu se pierde.',
    reload: 'Reîncarcă',
    dismiss: 'Mai târziu',
  },
  en: {
    title: 'A new version is ready',
    body: 'Reload to use it. Nothing on screen is lost.',
    reload: 'Reload',
    dismiss: 'Later',
  },
  ru: {
    title: 'Новая версия готова',
    body: 'Перезагрузите, чтобы использовать её. Ничего на экране не потеряется.',
    reload: 'Перезагрузить',
    dismiss: 'Позже',
  },
} as const;

/**
 * Registers the worker and, when a newer one is waiting, offers the reload.
 *
 * The offer matters: the worker no longer takes over on its own, so without a
 * way to say yes a tab would stay on the old build until it was closed.
 */
export const AppUpdatePrompt = () => {
  const { language } = useLanguage();
  const [apply, setApply] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Stored as a thunk: useState treats a bare function as an updater.
    registerServiceWorker((activate) => setApply(() => activate));
  }, []);

  if (!apply) return null;

  const t = COPY[language as keyof typeof COPY] ?? COPY.en;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-card p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <p className="font-medium">{t.title}</p>
          <p className="text-sm text-muted-foreground">{t.body}</p>
        </div>
        <button
          type="button"
          onClick={() => setApply(null)}
          aria-label={t.dismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setApply(null)}>
          {t.dismiss}
        </Button>
        <Button size="sm" className="gap-2" onClick={() => apply()}>
          <RefreshCw className="h-4 w-4" />
          {t.reload}
        </Button>
      </div>
    </div>
  );
};
