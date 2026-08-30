import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROUTES, REDIRECTS, isRouteBuilt } from "../routes";

/**
 * Nobody can use a page they cannot reach.
 *
 * Before the navigation was split in two, the header carried seven destinations
 * -- already overflowing at 1900px, so the labels were hidden and it became a
 * row of anonymous icons -- while /chaldean, /articles, /journal, /courses and
 * /premium had no link into them anywhere in the application.
 */

const SRC = resolve(__dirname, "../..");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === "__tests__" ? [] : sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });

// App.tsx maps paths to components and routes.ts is the registry itself, so a
// mention in either is a definition rather than a way in. services/api.ts is
// excluded for a different reason: its paths address the Express API, where
// /friends is an endpoint and has nothing to do with the route that used to
// carry that name.
const NOT_NAVIGATION = new Set(["App.tsx", "routes.ts", "RouteMeta.tsx", "api.ts"]);

const sources = sourceFiles(SRC)
  .filter((p) => !NOT_NAVIGATION.has(p.split("/").pop()!))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

const linksTo = (path: string) =>
  new RegExp(`["'\`]${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\?[^"'\`]*)?["'\`]`).test(sources);

describe("every route can be reached", () => {
  // /invite/:code is entered from an emailed or copied link, and the internal
  // pages are development-only.
  const ENTERED_FROM_OUTSIDE = new Set(["/invite/:code"]);

  const reachable = ROUTES.filter(isRouteBuilt)
    .filter((r) => r.kind !== "internal")
    .filter((r) => !ENTERED_FROM_OUTSIDE.has(r.path));

  it.each(reachable.map((r) => r.path))("%s is linked from somewhere", (path) => {
    expect(linksTo(path)).toBe(true);
  });
});

describe("the paths that were renamed", () => {
  it("all point at a route that exists", () => {
    const known = new Set(ROUTES.map((r) => r.path));
    for (const { from, to } of REDIRECTS) {
      const target = to.split("?")[0];
      expect(known.has(target), `${from} -> ${to}`).toBe(true);
    }
  });

  it("are not routes any more", () => {
    // A path that both redirects and resolves would race itself.
    const known = new Set(ROUTES.map((r) => r.path));
    for (const { from } of REDIRECTS) {
      expect(known.has(from), `${from} is still a route`).toBe(false);
    }
  });

  it("leaves nothing in the source pointing at an old path", () => {
    const stale = REDIRECTS.filter(({ from }) => linksTo(from)).map((r) => r.from);
    expect(stale).toEqual([]);
  });
});

describe("every page keeps the application header", () => {
  // Only the top level of pages/ is routed; pages/admin/* are sections of the
  // admin page rather than destinations of their own.
  const pages = readdirSync(join(SRC, "pages")).filter((name) => name.endsWith(".tsx"));

  it.each(pages)("%s renders inside PageLayout", (name) => {
    const source = readFileSync(join(SRC, "pages", name), "utf8");
    // Friends, Auth, ChaldeanAnalysis and Remedies had none, so those four had
    // no way back, no language switcher and no theme switcher.
    expect(source).toMatch(/PageLayout/);
  });
});
