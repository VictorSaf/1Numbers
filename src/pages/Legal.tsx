import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { PRIVACY, TERMS, type LegalDocument, type LegalLang } from "@/lib/legal";

/**
 * Cele două documente juridice, cu un singur randator.
 *
 * Ambele au aceeași formă -- titlu, dată, o frază de deschidere, secțiuni cu
 * paragrafe și liste -- deci nu au nevoie de două pagini care se despart în
 * timp. Ce diferă e conținutul, iar acela stă în `lib/legal.ts`.
 *
 * Registrul e al restului platformei: placă la deschidere, secțiuni deschise de
 * filet, text pe măsura paginii. Un document juridic care arată ca un fișier
 * lipit din altă parte se citește ca și cum n-ar fi al produsului.
 */

const Document = ({ doc }: { doc: LegalDocument }) => (
  <PageLayout>
    <main className="pb-16">
      <div className="page-measure pt-4">
        <PageHeader title={doc.title} subtitle={doc.lede} badge={{ icon: null, label: doc.updated }} />

        <div className="page-rhythm mt-14">
          {doc.sections.map((section, i) => (
            <section key={i}>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
                <h2 className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">
                  {section.heading}
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {section.body.map((line, j) =>
                  line.startsWith("• ") ? (
                    <p key={j} className="flex max-w-[68ch] gap-3 leading-relaxed text-foreground/90">
                      <span aria-hidden="true" className="text-gilt">·</span>
                      <span>{line.slice(2)}</span>
                    </p>
                  ) : (
                    <p key={j} className="max-w-[68ch] leading-relaxed text-foreground/90">
                      {line}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  </PageLayout>
);

const pick = (language: string): LegalLang =>
  language === "en" || language === "ru" ? language : "ro";

export const Privacy = () => {
  const { language } = useLanguage();
  return <Document doc={PRIVACY[pick(language)]} />;
};

export const Terms = () => {
  const { language } = useLanguage();
  return <Document doc={TERMS[pick(language)]} />;
};

export default Privacy;
