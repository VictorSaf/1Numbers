import { lazy, Suspense, ComponentType, ReactElement } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { RouteMeta } from "@/components/RouteMeta";
import { ROUTES, isRouteBuilt, INCLUDE_INTERNAL } from "@/lib/routes";

// Eager load - main page
import Index from "./pages/Index";

// Lazy load - secondary pages
const NumerologyGuide = lazy(() => import("./pages/NumerologyGuide"));
const Compatibility = lazy(() => import("./pages/Compatibility"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Predictions = lazy(() => import("./pages/Predictions"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const Tools = lazy(() => import("./pages/Tools"));
const Courses = lazy(() => import("./pages/Courses"));
const Articles = lazy(() => import("./pages/Articles"));
const Journal = lazy(() => import("./pages/Journal"));
const Premium = lazy(() => import("./pages/Premium"));
const AngelNumbers = lazy(() => import("./pages/AngelNumbers"));
const Friends = lazy(() => import("./pages/Friends"));
const ChaldeanAnalysis = lazy(() => import("./pages/ChaldeanAnalysis"));
const Remedies = lazy(() => import("./pages/Remedies"));
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
  "/guide": NumerologyGuide,
  "/compatibility": Compatibility,
  "/predictions": Predictions,
  "/tools": Tools,
  "/angel-numbers": AngelNumbers,
  "/chaldean": ChaldeanAnalysis,
  "/remedies": Remedies,
  "/tutorials": Tutorials,
  "/faq": FAQ,
  "/articles": Articles,
  "/premium": Premium,
  "/auth": Auth,
  "/profile": Profile,
  "/journal": Journal,
  "/courses": Courses,
  "/friends": Friends,
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
      <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40" />
      <div className="h-4 w-32 bg-primary/20 rounded" />
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RouteMeta />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
