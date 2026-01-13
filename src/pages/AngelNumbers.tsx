import { useState, useMemo } from "react";
import { Search, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getAllAngelNumbers,
  getAngelNumberMeaning,
  searchAngelNumbers,
  AngelNumberMeaning,
} from "@/lib/angelNumbers";
import { AngelNumberCard, AngelNumberCompact } from "@/components/AngelNumberCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AngelNumbers = () => {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<AngelNumberMeaning | null>(null);

  const allNumbers = useMemo(() => getAllAngelNumbers(), []);

  const searchResults = useMemo(() => {
    if (!searchInput.trim()) return null;

    // First try direct lookup
    const directMatch = getAngelNumberMeaning(searchInput);
    if (directMatch) {
      return { type: "direct" as const, result: directMatch };
    }

    // Then try keyword search
    const keywordResults = searchAngelNumbers(searchInput, language);
    if (keywordResults.length > 0) {
      return { type: "keyword" as const, results: keywordResults };
    }

    return { type: "none" as const };
  }, [searchInput, language]);

  const t = {
    ro: {
      title: "Numerele Îngerilor",
      subtitle: "Descoperă mesajele divine ascunse în numerele pe care le vezi",
      searchPlaceholder: "Introdu un număr (ex: 111, 444, 777)",
      search: "Caută",
      popularNumbers: "Numere Populare",
      allNumbers: "Toate Numerele",
      noResults: "Nu am găsit acest număr în baza noastră de date.",
      tryAnother: "Încearcă un alt număr sau caută după cuvinte cheie.",
      whatAreAngelNumbers: "Ce sunt Numerele Îngerilor?",
      angelNumbersExplanation:
        "Numerele îngerilor sunt secvențe de numere care poartă ghidare divină, referindu-se la semnificații numerologice specifice. Când vezi aceste numere repetitiv, îngerii încearcă să-ți transmită un mesaj.",
      howToUse: "Cum să folosești acest instrument",
      howToUseSteps: [
        "Observă numerele care apar frecvent în viața ta",
        "Introdu numărul în caseta de căutare",
        "Citește mesajul și reflectează asupra semnificației sale",
        "Aplică sfaturile în viața ta de zi cu zi",
      ],
      resultsFor: "Rezultate pentru",
      foundMatches: "Am găsit potriviri:",
    },
    en: {
      title: "Angel Numbers",
      subtitle: "Discover the divine messages hidden in the numbers you see",
      searchPlaceholder: "Enter a number (e.g., 111, 444, 777)",
      search: "Search",
      popularNumbers: "Popular Numbers",
      allNumbers: "All Numbers",
      noResults: "We couldn't find this number in our database.",
      tryAnother: "Try another number or search by keywords.",
      whatAreAngelNumbers: "What are Angel Numbers?",
      angelNumbersExplanation:
        "Angel numbers are sequences of numbers that carry divine guidance by referring to specific numerological meanings. When you see these numbers repeatedly, angels are trying to convey a message to you.",
      howToUse: "How to use this tool",
      howToUseSteps: [
        "Notice the numbers that appear frequently in your life",
        "Enter the number in the search box",
        "Read the message and reflect on its meaning",
        "Apply the advice in your daily life",
      ],
      resultsFor: "Results for",
      foundMatches: "Found matches:",
    },
    ru: {
      title: "Ангельские Числа",
      subtitle: "Откройте божественные послания, скрытые в числах, которые вы видите",
      searchPlaceholder: "Введите число (напр., 111, 444, 777)",
      search: "Искать",
      popularNumbers: "Популярные Числа",
      allNumbers: "Все Числа",
      noResults: "Мы не нашли это число в нашей базе данных.",
      tryAnother: "Попробуйте другое число или поищите по ключевым словам.",
      whatAreAngelNumbers: "Что такое Ангельские Числа?",
      angelNumbersExplanation:
        "Ангельские числа — это последовательности чисел, несущие божественное руководство через конкретные нумерологические значения. Когда вы видите эти числа повторно, ангелы пытаются передать вам послание.",
      howToUse: "Как использовать этот инструмент",
      howToUseSteps: [
        "Замечайте числа, которые часто появляются в вашей жизни",
        "Введите число в поле поиска",
        "Прочитайте послание и поразмышляйте о его значении",
        "Применяйте советы в повседневной жизни",
      ],
      resultsFor: "Результаты для",
      foundMatches: "Найдены совпадения:",
    },
  }[language];

  const popularNumbers = ["111", "222", "333", "444", "555", "777", "888", "1111"];

  const handleQuickSearch = (num: string) => {
    setSearchInput(num);
    const meaning = getAngelNumberMeaning(num);
    if (meaning) {
      setSelectedNumber(meaning);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        badge={{
          icon: <Sparkles className="h-4 w-4 text-primary" />,
          label: t.title,
        }}
      />

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Section */}
          <div className="card-mystic rounded-xl p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSelectedNumber(null);
                  }}
                  placeholder={t.searchPlaceholder}
                  className="pl-10 input-mystic text-lg"
                />
              </div>
              <Button
                onClick={() => {
                  const meaning = getAngelNumberMeaning(searchInput);
                  if (meaning) setSelectedNumber(meaning);
                }}
                className="btn-mystic"
              >
                {t.search}
              </Button>
            </div>

            {/* Quick Search - Popular Numbers */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">{t.popularNumbers}:</p>
              <div className="flex flex-wrap gap-2">
                {popularNumbers.map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch(num)}
                    className={`border-primary/30 hover:bg-primary/10 ${
                      searchInput === num ? "bg-primary/20" : ""
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4 animate-fade-in">
              {searchResults.type === "direct" && (
                <AngelNumberCard meaning={searchResults.result} expanded />
              )}

              {searchResults.type === "keyword" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t.foundMatches}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.results.map((meaning) => (
                      <AngelNumberCompact
                        key={meaning.number}
                        meaning={meaning}
                        onClick={() => {
                          setSelectedNumber(meaning);
                          setSearchInput(meaning.number);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.type === "none" && (
                <Alert className="border-amber-500/30 bg-amber-500/10">
                  <Info className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-muted-foreground">
                    {t.noResults} {t.tryAnother}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Selected Number Detail */}
          {selectedNumber && searchResults?.type !== "direct" && (
            <div className="animate-fade-in">
              <AngelNumberCard meaning={selectedNumber} expanded />
            </div>
          )}

          {/* Info Section */}
          {!searchInput && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-mystic rounded-xl p-6">
                <h3 className="font-cinzel text-lg text-primary mb-3">
                  {t.whatAreAngelNumbers}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.angelNumbersExplanation}
                </p>
              </div>

              <div className="card-mystic rounded-xl p-6">
                <h3 className="font-cinzel text-lg text-primary mb-3">
                  {t.howToUse}
                </h3>
                <ol className="space-y-2">
                  {t.howToUseSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-medium">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* All Numbers Grid */}
          {!searchInput && (
            <div className="space-y-4">
              <h3 className="font-cinzel text-lg text-foreground">{t.allNumbers}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allNumbers.map((meaning) => (
                  <AngelNumberCompact
                    key={meaning.number}
                    meaning={meaning}
                    onClick={() => {
                      setSelectedNumber(meaning);
                      setSearchInput(meaning.number);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default AngelNumbers;
