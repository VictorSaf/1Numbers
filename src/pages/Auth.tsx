import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { PageLayout } from '@/components/layout/PageLayout';
import { api } from '@/services/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Auth = () => {
  const { language, t } = useLanguage();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Mirrors ALLOW_REGISTRATION on the server. With sign-up closed the backend
  // answers 403, so offering the form would only lead users into a dead end.
  // Both sides default to closed when the variable is unset.
  const registrationOpen = import.meta.env.VITE_ALLOW_REGISTRATION === 'true';
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Trei ecrane, nu unul.
   *
   * `auth` e formularul dintotdeauna. `forgot` cere adresa. `reset` primește
   * parola nouă și apare doar când linkul din email aduce un jeton.
   *
   * Jetoanele vin prin adresă fiindcă vin dintr-un email: omul apasă un link,
   * nu completează un cod.
   */
  const [mode, setMode] = useState<'auth' | 'forgot' | 'reset'>('auth');
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const search = useLocation().search;
  const tokens = useMemo(() => {
    const q = new URLSearchParams(search);
    return { reset: q.get('reset'), verify: q.get('verify') };
  }, [search]);

  const labels = {
    ro: {
      login: 'Autentificare',
      register: 'Înregistrare',
      email: 'Email',
      password: 'Parolă',
      confirmPassword: 'Confirmă parola',
      name: 'Nume complet',
      loginButton: 'Conectare',
      registerButton: 'Creează cont',
      switchToRegister: 'Nu ai cont? Înregistrează-te',
      switchToLogin: 'Ai deja cont? Conectează-te',
      welcome: 'Bine ai venit',
      createAccount: 'Creează un cont',
      loginSubtitle: 'Conectează-te pentru a-ți accesa profilul numerologic',
      registerSubtitle: 'Creează un cont pentru a-ți salva profilul numerologic',
      backToCalculator: 'Înapoi la Calculator',
      loginSuccess: 'Te-ai conectat cu succes!',
      registerSuccess: 'Contul a fost creat cu succes!',
      error: 'Eroare',
      forgotLink: 'Am uitat parola',
      forgotTitle: 'Parolă nouă',
      forgotSubtitle: 'Îți trimitem un link pe email. E valabil 30 de minute.',
      forgotButton: 'Trimite linkul',
      forgotSent: 'Dacă adresa are cont, linkul a plecat. Verifică-ți emailul.',
      resetTitle: 'Alege o parolă nouă',
      resetSubtitle: 'După ce o schimbi, te deconectăm de pe toate dispozitivele.',
      resetButton: 'Schimbă parola',
      resetDone: 'Parola a fost schimbată. Conectează-te cu ea.',
      resetUsed: 'Linkul a fost deja folosit.',
      resetExpired: 'Linkul a expirat. Cere altul.',
      resetBad: 'Linkul nu mai e bun. Cere altul.',
      verified: 'Adresa ta e confirmată.',
      backToLogin: 'Înapoi la conectare',
    },
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      name: 'Full name',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      switchToRegister: "Don't have an account? Register",
      switchToLogin: 'Already have an account? Sign in',
      welcome: 'Welcome Back',
      createAccount: 'Create Account',
      loginSubtitle: 'Sign in to access your numerology profile',
      registerSubtitle: 'Create an account to save your numerology profile',
      backToCalculator: 'Back to Calculator',
      loginSuccess: 'Successfully logged in!',
      registerSuccess: 'Account created successfully!',
      error: 'Error',
      forgotLink: 'I forgot my password',
      forgotTitle: 'A new password',
      forgotSubtitle: 'We will email you a link. It is valid for 30 minutes.',
      forgotButton: 'Send the link',
      forgotSent: 'If that address has an account, the link is on its way. Check your email.',
      resetTitle: 'Choose a new password',
      resetSubtitle: 'Once you change it, we sign you out on every device.',
      resetButton: 'Change the password',
      resetDone: 'Your password has been changed. Sign in with it.',
      resetUsed: 'That link has already been used.',
      resetExpired: 'That link has expired. Ask for another.',
      resetBad: 'That link is no longer good. Ask for another.',
      verified: 'Your address is confirmed.',
      backToLogin: 'Back to sign in',
    },
    ru: {
      login: 'Вход',
      register: 'Регистрация',
      email: 'Эл. почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      name: 'Полное имя',
      loginButton: 'Войти',
      registerButton: 'Создать аккаунт',
      switchToRegister: 'Нет аккаунта? Зарегистрируйтесь',
      switchToLogin: 'Уже есть аккаунт? Войдите',
      welcome: 'С возвращением',
      createAccount: 'Создать аккаунт',
      loginSubtitle: 'Войдите для доступа к вашему нумерологическому профилю',
      registerSubtitle: 'Создайте аккаунт для сохранения вашего нумерологического профиля',
      backToCalculator: 'Назад к Калькулятору',
      loginSuccess: 'Вы успешно вошли!',
      registerSuccess: 'Аккаунт успешно создан!',
      error: 'Ошибка',
      forgotLink: 'Я забыл пароль',
      forgotTitle: 'Новый пароль',
      forgotSubtitle: 'Мы отправим ссылку на почту. Она действует 30 минут.',
      forgotButton: 'Отправить ссылку',
      forgotSent: 'Если у этого адреса есть аккаунт, ссылка отправлена. Проверьте почту.',
      resetTitle: 'Выберите новый пароль',
      resetSubtitle: 'После смены мы выйдем из аккаунта на всех устройствах.',
      resetButton: 'Сменить пароль',
      resetDone: 'Пароль изменён. Войдите с ним.',
      resetUsed: 'Ссылка уже использована.',
      resetExpired: 'Срок ссылки истёк. Запросите новую.',
      resetBad: 'Ссылка больше не действует. Запросите новую.',
      verified: 'Ваш адрес подтверждён.',
      backToLogin: 'Назад ко входу',
    }
  };

  const l = labels[language];

  // Linkul de verificare: se consumă o dată, la intrare, și spune ce s-a
  // întâmplat. Nu deschide un ecran -- confirmarea nu cere nimic de la om.
  useEffect(() => {
    if (!tokens.verify) return;
    let alive = true;
    api
      .verifyEmail(tokens.verify)
      .then(() => { if (alive) setNotice(l.verified); })
      .catch(() => { if (alive) setNotice(l.resetBad); })
      .finally(() => { if (alive) navigate('/auth', { replace: true }); });
    return () => { alive = false; };
  }, [tokens.verify]);

  // Linkul de resetare deschide ecranul de parolă nouă.
  useEffect(() => {
    if (tokens.reset) setMode('reset');
  }, [tokens.reset]);

  const askForLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.forgotPassword(formData.email, language);
    } catch {
      // Serverul întoarce mereu succes; dacă rețeaua cade, omul vede tot
      // mesajul neutru. A spune „adresa asta n-are cont” ar fi chiar scurgerea
      // pe care ruta o evită.
    }
    setBusy(false);
    setNotice(l.forgotSent);
  };

  const chooseNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = loginSchema.shape.password.safeParse(formData.password);
    if (!check.success) {
      setErrors({ password: check.error.issues[0].message });
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(tokens.reset ?? '', formData.password);
      setMode('auth');
      setNotice(l.resetDone);
      navigate('/auth', { replace: true });
    } catch (err) {
      const reason = err instanceof Error ? err.message : '';
      setNotice(reason.includes('used') ? l.resetUsed : reason.includes('expired') ? l.resetExpired : l.resetBad);
    }
    setBusy(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isLoginMode) {
        const validated = loginSchema.parse(formData);
        const result = await login({ email: validated.email, password: validated.password });
        
        if (result.success) {
          toast({ title: l.loginSuccess });
          // Cine se întoarce are deja o hartă: îl interesează ziua de azi, nu
          // să-și recitească harta. Înscrierea rămâne pe '/' -- acolo încă nu
          // există hartă prin care ziua să fie citită.
          navigate('/azi');
        } else {
          toast({ title: l.error, description: result.error, variant: 'destructive' });
        }
      } else {
        const validated = registerSchema.parse(formData);
        const result = await register({ 
          email: validated.email, 
          password: validated.password,
          name: validated.name 
        });
        
        if (result.success) {
          track('signup_completed');
          toast({ title: l.registerSuccess });
          navigate('/');
        } else {
          toast({ title: l.error, description: result.error, variant: 'destructive' });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  /**
   * Coaja comună a paginii. Cele două ecrane noi ies devreme, cu ea, ca să nu
   * fie nevoie să înfășor formularul existent în condiții -- o restructurare de
   * JSX pentru două ecrane care nu-l ating.
   */
  const Shell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <PageLayout className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        <div className="card-mystic py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 shrink-0 bg-gilt" aria-hidden="true" />
              <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-gilt">{l.login}</span>
            </div>
            <h1 className="mt-4 font-heading text-2xl text-foreground">{title}</h1>
            <p className="mt-2 max-w-[42ch] text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {notice && (
            <p className="mt-6 border-t border-gilt pt-4 text-sm text-foreground/90">{notice}</p>
          )}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => { setMode('auth'); setNotice(null); setErrors({}); navigate('/auth', { replace: true }); }}
              className="num min-h-11 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gilt"
            >
              ← {l.backToLogin}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );

  if (mode === 'forgot') {
    return (
      <Shell title={l.forgotTitle} subtitle={l.forgotSubtitle}>
        <form onSubmit={askForLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="font-raleway text-sm text-foreground/90">{l.email}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">{l.forgotButton}</Button>
        </form>
      </Shell>
    );
  }

  if (mode === 'reset') {
    return (
      <Shell title={l.resetTitle} subtitle={l.resetSubtitle}>
        <form onSubmit={chooseNewPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-raleway text-sm text-foreground/90">{l.password}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {errors.password && <p className="text-sm text-tension">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">{l.resetButton}</Button>
        </form>
      </Shell>
    );
  }

  // Wrapped in PageLayout like every other route. It used to render its own
  // StarField and a floating language switcher instead of the header, so
  // signing in meant losing the way back and the theme switcher both.
  return (
    <PageLayout className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        <div className="card-mystic py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl text-foreground mb-2">
              {isLoginMode ? l.welcome : l.createAccount}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoginMode ? l.loginSubtitle : l.registerSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/90 font-raleway text-sm">
                  {l.name}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className="input-mystic h-12 pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90 font-raleway text-sm">
                {l.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className="input-mystic h-12 pl-10"
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90 font-raleway text-sm">
                {l.password}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  className="input-mystic h-12 pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/90 font-raleway text-sm">
                  {l.confirmPassword}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className="input-mystic h-12 pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base mt-6"
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoginMode ? l.loginButton : l.registerButton}
            </Button>
          </form>

          {/* Drumul pentru cine a uitat parola. Doar la conectare: la
              înregistrare n-are ce parolă să uite. */}
          {isLoginMode && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setNotice(null); setErrors({}); }}
                className="num min-h-11 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gilt"
              >
                {l.forgotLink}
              </button>
            </div>
          )}

          {/* Mesajul rămas de la o verificare sau o resetare tocmai făcută. */}
          {notice && (
            <p className="mt-5 border-t border-gilt pt-4 text-sm text-foreground/90">{notice}</p>
          )}

          {/* Switch mode -- hidden entirely while sign-up is closed */}
          {registrationOpen && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isLoginMode) track('signup_started');
                  setIsLoginMode(!isLoginMode);
                  setErrors({});
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {isLoginMode ? l.switchToRegister : l.switchToLogin}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
