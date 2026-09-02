import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/use-profile';
import {
  buildAIPrompt,
  generateDailySuggestion,
  FREQUENT_QUESTIONS,
  type AIContext,
  type DailySuggestion,
} from '@/lib/aiPrompts';
import { generateLoShuGrid } from '@/lib/loShuGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Sun,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { AssistantText } from '@/components/AssistantText';
import { API_BASE } from '@/lib/apiBase';
import { parseCalendarDate } from '@/lib/calendarDate';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIConsultant = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [dailySuggestion, setDailySuggestion] = useState<DailySuggestion | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  // What actually happened to the last question. Not an assistant message:
  // an answer that didn't come from the model has no business in the
  // conversation next to ones that did.
  const [problem, setProblem] = useState<'unavailable' | 'busy' | 'failed' | null>(null);

  // Build AI context from user profile
  const aiContext: AIContext | null = useMemo(() => {
    if (!profile) return null;

    const birthDate = parseCalendarDate(profile.birthDate);
    const loShuGrid = generateLoShuGrid(birthDate);

    return {
      profile: {
        fullName: profile.fullName,
        birthDate,
        loShuGrid,
      },
      language,
      conversationHistory: conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };
  }, [profile, language, conversation]);

  // Generate daily suggestion on mount
  useEffect(() => {
    if (aiContext) {
      const suggestion = generateDailySuggestion(aiContext);
      setDailySuggestion(suggestion);
    }
  }, [aiContext?.profile.birthDate, language]);

  const handleAsk = async () => {
    if (!question.trim() || !aiContext) return;

    setLoading(true);
    setProblem(null);
    const currentQuestion = question;
    setQuestion('');

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentQuestion,
      timestamp: new Date(),
    };
    setConversation((prev) => [...prev, userMessage]);

    // The server accepts at most eight history messages, each up to 1500
    // characters. Trim to that here instead of letting the request come
    // back 400 once the conversation runs long.
    const history = conversation.slice(-8).map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, 1500),
    }));

    try {
      const { profileContext, question: askedQuestion } = buildAIPrompt(currentQuestion, aiContext);

      // Try to call backend API
      const response = await fetch(`${API_BASE}/ai/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          profileContext,
          question: askedQuestion,
          conversationHistory: history,
          language,
        }),
      });

      // Nothing is appended to the conversation when the request fails. The
      // consultant either shows an answer a model wrote about this person, or
      // it says it has none -- there is no third thing it may display. What
      // used to sit here invented a paragraph about the reader's "remarkable
      // potential" and pushed it into the same bubble as a real answer.
      if (response.ok) {
        const data = (await response.json()) as { answer: string };
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, assistantMessage]);
      } else if (response.status === 503) {
        // No model key configured server-side. Said, not papered over.
        setProblem('unavailable');
      } else if (response.status === 429) {
        setProblem('busy');
      } else {
        setProblem('failed');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setProblem('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
    setActiveTab('chat');
  };

  const clearConversation = () => {
    setConversation([]);
    setProblem(null);
  };

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Consultant AI Numerologic',
      description: 'Pune întrebări despre numerologie și primește răspunsuri personalizate',
      placeholder: 'Ex: Ce înseamnă Numărul Drumului Vieții pentru mine?',
      ask: 'Întreabă',
      dailyEnergy: 'Energia Zilei',
      chat: 'Conversație',
      suggestions: 'Sugestii',
      clearChat: 'Șterge conversația',
      noProfile: 'Creează un profil pentru a primi răspunsuri personalizate',
      unavailable: 'Consultantul nu este disponibil acum. Nu s-a inventat nimic în locul lui — încearcă din nou peste puțin.',
      rateLimited: 'Ai pus prea multe întrebări într-un timp scurt. Încearcă din nou mai târziu.',
      error: 'Nu am putut obține un răspuns. Încearcă din nou.',
      focus: 'Focus',
      luckyNumbers: 'Numere norocoase',
      advice: 'Sfaturi',
      affirmation: 'Afirmație',
      frequentQuestions: 'Întrebări frecvente',
      startConversation: 'Începe o conversație pentru a primi ghidare numerologică',
    },
    en: {
      title: 'AI Numerology Consultant',
      description: 'Ask questions about numerology and get personalized answers',
      placeholder: 'E.g.: What does my Life Path Number mean for me?',
      ask: 'Ask',
      dailyEnergy: 'Daily Energy',
      chat: 'Chat',
      suggestions: 'Suggestions',
      clearChat: 'Clear chat',
      noProfile: 'Create a profile to receive personalized answers',
      unavailable: 'The consultant is not available right now. Nothing was invented in its place — try again in a moment.',
      rateLimited: 'Too many questions in a short time. Please try again later.',
      error: 'We could not get an answer. Please try again.',
      focus: 'Focus',
      luckyNumbers: 'Lucky Numbers',
      advice: 'Advice',
      affirmation: 'Affirmation',
      frequentQuestions: 'Frequent Questions',
      startConversation: 'Start a conversation to receive numerological guidance',
    },
    ru: {
      title: 'ИИ Нумерологический Консультант',
      description: 'Задавайте вопросы о нумерологии и получайте персонализированные ответы',
      placeholder: 'Например: Что означает мое Число Жизненного Пути?',
      ask: 'Спросить',
      dailyEnergy: 'Энергия Дня',
      chat: 'Чат',
      suggestions: 'Предложения',
      clearChat: 'Очистить чат',
      noProfile: 'Создайте профиль для получения персонализированных ответов',
      unavailable: 'Консультант сейчас недоступен. Ничего не было выдумано вместо него — попробуйте ещё раз чуть позже.',
      rateLimited: 'Слишком много вопросов за короткое время. Попробуйте позже.',
      error: 'Не удалось получить ответ. Попробуйте ещё раз.',
      focus: 'Фокус',
      luckyNumbers: 'Счастливые числа',
      advice: 'Совет',
      affirmation: 'Аффирмация',
      frequentQuestions: 'Частые вопросы',
      startConversation: 'Начните разговор для получения нумерологического руководства',
    },
  };

  const tr = translations[language] || translations.en;
  const frequentQuestions = FREQUENT_QUESTIONS[language] || FREQUENT_QUESTIONS.en;

  return (
    <div className="space-y-6">
      {/* Daily Energy Card */}
      {dailySuggestion && (
        <Card className="border-line bg-gradient-to-br from-primary/5 to-accent-ink/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-warn" />
              <CardTitle className="text-lg">{tr.dailyEnergy}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">{dailySuggestion.message}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{tr.focus}</p>
                <Badge variant="secondary">{dailySuggestion.focus}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{tr.luckyNumbers}</p>
                <div className="flex gap-1">
                  {dailySuggestion.luckyNumbers.map((num) => (
                    <Badge key={num} variant="outline" className="text-primary">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {dailySuggestion.advice && dailySuggestion.advice.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{tr.advice}</p>
                <ul className="space-y-1">
                  {dailySuggestion.advice.slice(0, 3).map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 text-warn mt-1 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{tr.affirmation}</p>
              <p className="text-sm italic text-primary">&ldquo;{dailySuggestion.affirmation}&rdquo;</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Consultant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>{tr.title}</CardTitle>
            </div>
            {conversation.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearConversation}>
                <RefreshCw className="h-4 w-4 mr-1" />
                {tr.clearChat}
              </Button>
            )}
          </div>
          <CardDescription>{tr.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {tr.chat}
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {tr.frequentQuestions}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4 mt-4">
              {/* No profile warning */}
              {!profile && (
                <div className="p-4 rounded-lg border border-warn text-sm text-warn">
                  {tr.noProfile}
                </div>
              )}

              {/* Said instead of an answer, never alongside one. */}
              {problem && (
                <div className="p-4 rounded-lg border border-warn text-sm text-warn">
                  {problem === 'unavailable' && tr.unavailable}
                  {problem === 'busy' && tr.rateLimited}
                  {problem === 'failed' && tr.error}
                </div>
              )}

              {/* Conversation History */}
              {conversation.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        data-role={msg.role}
                        className={`max-w-[85%] p-3 rounded-lg ${ msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted' }`}
                      >
                        {/* Întrebarea omului e text simplu, cum a scris-o.
                            Răspunsul modelului vine în markdown -- titluri,
                            îngroșări, liste -- și până acum se afișa cu tot cu
                            semne, ca un bloc pe care nu-l parcurgea nimeni. */}
                        {msg.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <AssistantText text={msg.content} />
                        )}
                        <p className="text-[10px] opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{tr.startConversation}</p>
                </div>
              )}

              {/* Question Input */}
              <div className="flex gap-2 pt-2">
                <Textarea
                  placeholder={tr.placeholder}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  className="min-h-[80px] resize-none"
                  disabled={!profile || problem === 'unavailable'}
                />
                <Button
                  onClick={handleAsk}
                  disabled={loading || !question.trim() || !profile || problem === 'unavailable'}
                  className="self-end"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="mt-4">
              <div className="space-y-2">
                {frequentQuestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(item.question)}
                    className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm">{item.question}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConsultant;
