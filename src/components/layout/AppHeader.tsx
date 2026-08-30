import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Heart, CalendarDays, Wrench, User, Menu, X, Shield, Map, NotebookPen, Users, FileText, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: Record<string, string>;
}

// The bar had seven destinations and had already overflowed at 1900px, so the
// labels were hidden below 2xl and it became a row of seven anonymous icons --
// while five complete features had no link into them at all.
//
// Five public destinations, named. Everything that needs an account is behind
// the account menu, where it does not compete with them.
const PUBLIC_NAV: NavItem[] = [
  { path: '/', icon: Map, label: { ro: 'Citește-ți harta', en: 'Read your map', ru: 'Ваша карта' } },
  { path: '/doi', icon: Heart, label: { ro: 'Voi doi', en: 'The two of you', ru: 'Вы двое' } },
  { path: '/azi', icon: CalendarDays, label: { ro: 'Azi', en: 'Today', ru: 'Сегодня' } },
  { path: '/unelte', icon: Wrench, label: { ro: 'Unelte', en: 'Tools', ru: 'Инструменты' } },
  { path: '/invata', icon: BookOpen, label: { ro: 'Învață', en: 'Learn', ru: 'Изучайте' } },
];

const ACCOUNT_NAV: NavItem[] = [
  { path: '/eu', icon: User, label: { ro: 'Hărțile mele', en: 'My maps', ru: 'Мои карты' } },
  { path: '/jurnal', icon: NotebookPen, label: { ro: 'Jurnal', en: 'Journal', ru: 'Дневник' } },
  { path: '/cercul-meu', icon: Users, label: { ro: 'Cercul meu', en: 'My circle', ru: 'Мой круг' } },
  { path: '/raport', icon: FileText, label: { ro: 'Raportul complet', en: 'The full report', ru: 'Полный отчёт' } },
];

const ACCOUNT_LABEL = { ro: 'Contul meu', en: 'My account', ru: 'Мой аккаунт' };
const SIGN_IN = { ro: 'Intră în cont', en: 'Sign in', ru: 'Войти' };
const SIGN_OUT = { ro: 'Ieși din cont', en: 'Sign out', ru: 'Выйти' };

const AppHeader = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const say = (copy: Record<string, string>) => copy[language] ?? copy.en;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-colors" />
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-warn flex items-center justify-center">
                <span className="text-primary-foreground font-cinzel font-bold text-lg">N</span>
              </div>
            </div>
            <span className="hidden sm:inline font-cinzel text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {t.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      // Five buttons with their names on them fit where seven
                      // icon-only ones did not.
                      "h-9 gap-2 px-3 font-raleway text-sm transition-all",
                      active
                        ? "bg-primary/10 text-primary border-b-2 border-primary"
                        : "text-foreground/90 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{say(item.label)}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Everything that needs an account lives here, so it does not
                compete with the five public destinations. */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 gap-2 px-3 font-raleway text-sm",
                      ACCOUNT_NAV.some((i) => isActive(i.path))
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/90 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{say(ACCOUNT_LABEL)}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{say(ACCOUNT_LABEL)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ACCOUNT_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="gap-2">
                          <Icon className="h-4 w-4" />
                          {say(item.label)}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => { void logout(); }} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    {say(SIGN_OUT)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 px-3 font-raleway text-sm text-foreground/90 hover:text-primary hover:bg-primary/5"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{say(SIGN_IN)}</span>
                </Button>
              </Link>
            )}

            {/* Theme Selector */}
            <LanguageSwitcher />

            {/* Language Switcher */}
            <ThemeSelector />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0 text-foreground/90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {PUBLIC_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-10 px-4 gap-3 font-raleway text-sm",
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/90 hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{say(item.label)}</span>
                    </Button>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="mt-2 border-t border-border/50 px-4 pt-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {say(ACCOUNT_LABEL)}
                  </div>
                  {ACCOUNT_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-10 px-4 gap-3 font-raleway text-sm",
                            isActive(item.path)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/90 hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{say(item.label)}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  <Button
                    variant="ghost"
                    onClick={() => { setMobileMenuOpen(false); void logout(); }}
                    className="w-full justify-start h-10 px-4 gap-3 font-raleway text-sm text-foreground/90"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{say(SIGN_OUT)}</span>
                  </Button>
                </>
              )}

              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-10 px-4 gap-3 font-raleway text-sm",
                      isActive('/admin')
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/90 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

