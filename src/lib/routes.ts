// Typed view over src/data/routes.json, the registry every route list is derived
// from. The JSON is what the build scripts read -- plain fs, no bundler, no React
// -- and this module is what the app reads. Keeping the data in JSON is the only
// reason one file can feed both.
import registry from "@/data/routes.json";

export type RouteKind = "public" | "app" | "internal";
export type RouteMeta = { title: string; description: string };

export type RouteDef = {
  path: string;
  kind: RouteKind;
  priority?: number;
  meta?: Record<string, RouteMeta>;
};

export type Redirect = { from: string; to: string };

export const SITE_ORIGIN: string = registry.origin;
export const ROUTES = registry.routes as unknown as RouteDef[];

// Paths that used to be routes. Every one of them has been linked to from
// somewhere -- a bookmark, a share, an index -- so they answer 301 rather than
// 404. The static server reads the same list out of dist/routes.json; App.tsx
// renders a <Navigate replace> for each so a client-side link lands too.
export const REDIRECTS = registry.redirects as unknown as Redirect[];

// Internal routes exist only while developing. Vite replaces import.meta.env
// values with literals at build time, so this constant folds and Rollup drops
// both the guarded routes and the page chunks they reference -- the admin panel
// stops being downloadable by anyone who opens dev tools on the public site.
//
// VITE_INCLUDE_INTERNAL=1 puts them back for a build meant to be served locally
// on :8090; `npm run dev` always has them.
export const INCLUDE_INTERNAL =
  import.meta.env.DEV || import.meta.env.VITE_INCLUDE_INTERNAL === "1";

export const isRouteBuilt = (route: RouteDef) =>
  route.kind !== "internal" || INCLUDE_INTERNAL;

export const metaFor = (path: string) =>
  ROUTES.find((r) => r.path === path)?.meta;
