import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Collapsible wrapper for the result page, which otherwise expanded everything
// at once down roughly 6000px.
//
// This used to also gate sections behind an account, rendering a lock and a
// signup CTA in place of the children. That gate is gone: every section is
// public now. The teaser survived it, because a one-line description of what a
// section holds is worth as much when the section is merely closed as it was
// when it was locked.

const LABELS = {
  ro: { show: "Arată", hide: "Ascunde" },
  en: { show: "Show", hide: "Hide" },
  ru: { show: "Показать", hide: "Скрыть" },
};

interface ResultSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  /** One line on what the section holds, shown open or closed. */
  teaser?: string;
  defaultOpen?: boolean;
  className?: string;
}

export const ResultSection = ({
  title, icon, children, teaser, defaultOpen = false, className,
}: ResultSectionProps) => {
  const { language } = useLanguage();
  const l = LABELS[language as keyof typeof LABELS] ?? LABELS.en;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center gap-2 group"
        >
          {icon}
          <h3 className="font-cinzel text-lg text-foreground">{title}</h3>
          <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
            {open ? l.hide : l.show}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </span>
        </button>
        {teaser && <p className="mt-1 text-sm text-muted-foreground text-left">{teaser}</p>}
      </div>
      {open && children}
    </div>
  );
};
