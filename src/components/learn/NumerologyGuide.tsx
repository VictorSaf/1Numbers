import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { getDelayClass } from "@/components/design-system";

const NumerologyGuide = () => {
  const { t } = useLanguage();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const coreNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const masterNumbers = [11, 22, 33];

  const getMeaning = (num: number) => {
    return t.meanings[num as keyof typeof t.meanings];
  };

  return (
    <>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-16">
        <div className="space-y-12">
          
          {/* Core Numbers Section */}
          <section className="space-y-6">
            <div className="space-y-3">
              <span className="block h-px w-10 bg-gilt" aria-hidden="true" />
              <h2 className="font-heading text-2xl text-foreground">{t.coreNumbersTitle}</h2>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              {t.coreNumbersDesc}
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
              {coreNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                  className={cn(
                    "number-display cursor-pointer transition-colors duration-200",
                    selectedNumber === num && "number-display-large text-gilt"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          {/* Master Numbers Section */}
          <section className="space-y-6">
            <div className="space-y-3">
              <span className="block h-px w-10 bg-gilt" aria-hidden="true" />
              <h2 className="font-heading text-2xl text-foreground">{t.masterNumbersTitle}</h2>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              {t.masterNumbersDesc}
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {masterNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedNumber(selectedNumber === num ? null : num)}
                  className={cn(
                    "number-display cursor-pointer text-gilt transition-colors duration-200",
                    selectedNumber === num && "number-display-large"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          {/* Selected Number Detail */}
          {selectedNumber && (
            <section className="card-mystic py-8 animate-scale-in">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="number-display-large shrink-0">
                  {selectedNumber}
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">
                      {masterNumbers.includes(selectedNumber) ? t.masterNumber : t.coreNumber}
                    </span>
                    <h3 className="font-heading text-3xl text-foreground mt-1">
                      {getMeaning(selectedNumber).title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {getMeaning(selectedNumber).traits.map((trait, index) => (
                      <span
                        key={index}
                        className="num min-h-11 rounded-sm border border-gilt px-4 text-[0.68rem] uppercase tracking-[0.14em] text-gilt"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-foreground/90 leading-relaxed text-lg">
                    {getMeaning(selectedNumber).description}
                  </p>

                  {/* Extended description */}
                  <div className="pt-4 border-t border-border/30 space-y-3">
                    <h4 className="font-heading text-lg text-foreground">{t.detailedAnalysis}</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {t.extendedMeanings[selectedNumber as keyof typeof t.extendedMeanings]}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* All Numbers Grid */}
          <section className="space-y-6">
            <div className="space-y-3">
              <span className="block h-px w-10 bg-gilt" aria-hidden="true" />
              <h2 className="font-heading text-2xl text-foreground">{t.allNumbersTitle}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...coreNumbers, ...masterNumbers].map((num, index) => {
                const meaning = getMeaning(num);
                const isMaster = masterNumbers.includes(num);
                
                return (
                  <div
                    key={num}
                    className={cn(
                      "card-mystic-link py-5 opacity-0 animate-fade-in cursor-pointer",
                      "transition-colors duration-200",
                      getDelayClass(index * 50)
                    )}
                    onClick={() => setSelectedNumber(num)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "num w-14 shrink-0 text-right text-4xl leading-none",
                        isMaster ? "text-gilt" : "text-accent",
                      )}>
                        {num}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-lg text-foreground truncate">
                            {meaning.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {meaning.traits.slice(0, 3).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

    </>
  );
};

export default NumerologyGuide;
