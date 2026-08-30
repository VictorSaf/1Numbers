import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArticleLibrary } from '@/components/ArticleLibrary';
import { Article, initialArticles } from '@/lib/articles';
import { Card, CardContent } from '@/components/ui/card';

const Articles = () => {
  const { t, language } = useLanguage();
  const [articles] = useState<Article[]>(initialArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {selectedArticle ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-primary hover:underline"
              >
                ← {{ ro: 'Înapoi la articole', en: 'Back to articles', ru: 'Назад к статьям' }[language] ?? 'Back to articles'}
              </button>
              <Card className="card-mystic">
                <CardContent className="p-8">
                  <h1 className="font-heading text-3xl text-foreground mb-4">
                    {selectedArticle.title[language] ?? selectedArticle.title.en}
                  </h1>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground/90 whitespace-pre-wrap">
                      {selectedArticle.content[language] ?? selectedArticle.content.en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <ArticleLibrary
              articles={articles}
              onArticleSelect={setSelectedArticle}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default Articles;

