import { ReactNode, useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// One wrapper for the two problems the result page had: everything was expanded
// at once down roughly 6000px, and every part of it was free, so there was no
// point in the flow where signing up mattered.
//
// Locked sections do not render their children at all. Blurring them client-side
// would still ship the content to anyone willing to open dev tools, which is a
// strange thing to do with something you are asking people to sign up for.

const LABELS = {
  ro: { show: "Arată", hide: "Ascunde", locked: "Creează un cont gratuit ca să vezi această secțiune", cta: "Creează cont gratuit" },
  en: { show: "Show", hide: "Hide", locked: "Create a free account to see this section", cta: "Create a free account" },
  ru: { show: "Показать", hide: "Скрыть", locked: "Создайте бесплатный аккаунт, чтобы увидеть этот раздел", cta: "Создать аккаунт" },
};

interface ResultSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  /** Rendered instead of children when locked, to hint at what is behind it. */
  teaser?: string;
  locked?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export const ResultSection = ({
  title, icon, children, teaser, locked = false, defaultOpen = false, className,
}: ResultSectionProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;
  const [open, setOpen] = useState(defaultOpen);

  if (locked) {
    return (
      <div className={cn("rounded-2xl border border-border/50 bg-card/40 p-6 text-center space-y-3", className)}>
        <div className="flex items-center justify-center gap-2 text-foreground/90">
          {icon}
          <h3 className="font-cinzel text-lg">{title}</h3>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        {teaser && <p className="text-sm text-muted-foreground max-w-md mx-auto">{teaser}</p>}
        <p className="text-sm text-muted-foreground">{l.locked}</p>
        <Link to="/auth">
          <Button size="sm" className="mt-1">{l.cta}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 mb-4 group"
      >
        {icon}
        <h3 className="font-cinzel text-lg text-foreground">{title}</h3>
        <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
          {open ? l.hide : l.show}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </span>
      </button>
      {open && children}
    </div>
  );
};
