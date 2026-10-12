import { lazy, Suspense, ComponentType, ReactElement } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
import { AppUpdatePrompt } from "@/components/AppUpdatePrompt";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { RouteMeta } from "@/components/RouteMeta";
import { ROUTES, REDIRECTS, isRouteBuilt, INCLUDE_INTERNAL } from "@/lib/routes";

// Eager load - main page
import Index from "./pages/Index";

// Lazy load - secondary pages
const Learn = lazy(() => import("./pages/Learn"));
const Compatibility = lazy(() => import("./pages/Compatibility"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Predictions = lazy(() => import("./pages/Predictions"));
const Tools = lazy(() => import("./pages/Tools"));
const Journal = lazy(() => import("./pages/Journal"));
const Premium = lazy(() => import("./pages/Premium"));
const Friends = lazy(() => import("./pages/Friends"));
const ChaldeanAnalysis = lazy(() => import("./pages/ChaldeanAnalysis"));
const Remedies = lazy(() => import("./pages/Remedies"));
const Privacy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import("./pages/NotFound"));

// Internal pages are constructed only when the build includes them. The ternary
// is what makes the exclusion real: with INCLUDE_INTERNAL folded to false, these
// import() calls are unreachable and Rollup emits no chunk for them at all.
const WhiteLabelSettings = INCLUDE_INTERNAL
  ? lazy(() => import("./pages/WhiteLabelSettings"))
  : null;
const DesignSystemShowcase = INCLUDE_INTERNAL
  ? lazy(() => import("./pages/DesignSystemShowcase"))
  : null;
const Admin = INCLUDE_INTERNAL ? lazy(() => import("./pages/Admin")) : null;

// Which component renders each path. The list of paths itself lives in
// src/data/routes.json, so sitemap.xml, the prerendered meta and the static
// server's 404 allowlist all read the same source this does.
const PAGES: Record<string, ComponentType | null> = {
  "/": Index,
  "/doi": Compatibility,
  "/azi": Predictions,
  "/unelte": Tools,
  "/invata": Learn,
  "/chaldean": ChaldeanAnalysis,
  "/remedies": Remedies,
  "/confidentialitate": Privacy,
  "/termeni": Terms,
  "/auth": Auth,
  "/eu": Profile,
  "/jurnal": Journal,
  "/cercul-meu": Friends,
  "/raport": Premium,
  "/invite/:code": Friends,
  "/admin": Admin,
  "/design-system": DesignSystemShowcase,
  "/white-label": WhiteLabelSettings,
};

// Routes that render inside a guard rather than bare.
const GUARDS: Record<string, (page: ReactElement) => ReactElement> = {
  "/admin": (page) => <ProtectedAdminRoute>{page}</ProtectedAdminRoute>,
};

// A path in the registry with no component here would silently fall through to
// the catch-all and render NotFound, which looks like a broken page rather than
// a missing wire. Failing loudly in development is cheaper than finding it in
// production.
if (import.meta.env.DEV) {
  const missing = ROUTES.filter(isRouteBuilt).filter((r) => !PAGES[r.path]);
  if (missing.length) {
    throw new Error(
      `routes.json lists ${missing.map((r) => r.path).join(", ")} with no component in App.tsx`,
    );
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-sunken border-2 border-line" />
      <div className="h-4 w-32 bg-sunken rounded" />
    </div>
  </div>
);

// Every page but the calculator arrives through React.lazy, so the failure that
// matters most is a chunk that will not load -- after a deploy, or offline. The
// boundary sits inside the router so the shell survives it, and it is keyed on
// the path so walking away from a broken route clears it.
const CHUNK_ERROR_COPY = {
  ro: {
    title: 'Pagina nu s-a încărcat',
    body: 'O bucată din aplicație n-a putut fi adusă. De obicei se rezolvă din a doua încercare.',
    retry: 'Încearcă din nou',
  },
  en: {
    title: 'This page did not load',
    body: 'Part of the app could not be fetched. A second try usually gets it.',
    retry: 'Try again',
  },
  ru: {
    title: 'Страница не загрузилась',
    body: 'Часть приложения не удалось получить. Обычно помогает вторая попытка.',
    retry: 'Попробовать снова',
  },
} as const;

const RoutedPages = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const labels = CHUNK_ERROR_COPY[language as keyof typeof CHUNK_ERROR_COPY] ?? CHUNK_ERROR_COPY.en;

  return (
    <ChunkErrorBoundary resetKey={location.pathname} labels={labels}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {ROUTES.filter(isRouteBuilt).map((route) => {
            const Page = PAGES[route.path];
            if (!Page) return null;
            const element = <Page />;
            const wrap = GUARDS[route.path];
            return (
              <Route
                key={route.path}
                path={route.path}
                element={wrap ? wrap(element) : element}
              />
            );
          })}
          {/* Old paths. The static server answers these 301 before the app
              loads; this is for a link followed inside the app, which never
              reaches the server. */}
          {REDIRECTS.map((r) => (
            <Route key={r.from} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
            <Toaster />
            <AppUpdatePrompt />
            <BrowserRouter>
              <RouteMeta />
              <RoutedPages />
            </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
