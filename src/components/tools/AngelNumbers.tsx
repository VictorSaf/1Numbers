import { useState, useMemo } from "react";
import { Search, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "react-router-dom";
import {
  getAllAngelNumbers,
  getAngelNumberMeaning,
  searchAngelNumbers,
  AngelNumberMeaning,
} from "@/lib/angel";
import { AngelNumberCard, AngelNumberCompact } from "@/components/AngelNumberCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AngelNumbers = () => {
  const { language } = useLanguage();
  // /unelte?s=angel&n=444 deschide unealta direct pe o secvență. Nu e nevoie de
  // o rută nouă: Tools.tsx citește deja tab-ul din query, iar un al doilea
  // parametru face legătura partajabilă fără nimic în routes.json.
  const [params] = useSearchParams();
  const initial = params.get("n") ?? "";
  const [searchInput, setSearchInput] = useState(initial);
  const [selectedNumber, setSelectedNumber] = useState<AngelNumberMeaning | null>(
    initial ? getAngelNumberMeaning(initial) : null,
  );

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
      noResults: "Numărul acesta nu formează un tipar pe care să-l putem citi.",
      tryAnother: "Citim repetări (444, 1111), alternanțe (1212), oglinzi (1221) și șiruri (1234, 4321).",
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
      noResults: "This number does not form a pattern we can read.",
      tryAnother: "We read repetitions (444, 1111), alternations (1212), mirrors (1221) and runs (1234, 4321).",
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
      noResults: "Это число не образует закономерности, которую мы умеем читать.",
      tryAnother: "Мы читаем повторы (444, 1111), чередования (1212), зеркала (1221) и ряды (1234, 4321).",
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

  // Nu mai e „toate numerele pe care le avem": catalogul are 35 și crește prin
  // regulă. Astea sunt cele mai căutate, una din fiecare formă la final.
  const popularNumbers = [
    "111", "222", "333", "444", "555", "666", "777", "888", "999",
    "1111", "1234", "1212",
  ];

  const handleQuickSearch = (num: string) => {
    setSearchInput(num);
    const meaning = getAngelNumberMeaning(num);
    if (meaning) {
      setSelectedNumber(meaning);
    }
  };

  return (
    <>

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Section */}
          <div className="card-mystic rounded-lg p-6">
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
                    className={`border-line hover:bg-sunken ${ searchInput === num ? "bg-sunken" : "" }`}
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
                <Alert className="border-warn">
                  <Info className="h-4 w-4 text-warn" />
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
              <div className="card-mystic rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-3">
                  {t.whatAreAngelNumbers}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.angelNumbersExplanation}
                </p>
              </div>

              <div className="card-mystic rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-3">
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
              <h3 className="font-heading text-lg text-foreground">{t.allNumbers}</h3>
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
    </>
  );
};

export default AngelNumbers;
