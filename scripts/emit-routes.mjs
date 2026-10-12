// Emits the two route lists that used to be maintained by hand:
//
//   dist/sitemap.xml  — the indexable routes, with their priorities
//   dist/routes.json  — every route the build actually serves, which
//                       scripts/serve-compass.mjs uses to tell a real page from
//                       a typo instead of handing the SPA shell to both with 200
//   dist/redirects.json — the paths that used to be routes, and where they went
//
// Both come from src/data/routes.json. public/sitemap.xml is gone: a sitemap
// checked into the source tree drifts from App.tsx the moment a route is added,
// and it had already lost nine of them.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const registry = JSON.parse(
  await readFile(join(ROOT, "src/data/routes.json"), "utf8"),
);
const { origin, routes, redirects = [] } = registry;

// A build that excluded the internal pages must not advertise them in the
// manifest either, or the static server would answer 200 for /admin on a build
// that cannot render it.
const includeInternal = process.env.VITE_INCLUDE_INTERNAL === "1";
const built = routes.filter((r) => r.kind !== "internal" || includeInternal);

// ---- sitemap.xml -----------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const indexable = built.filter((r) => r.kind === "public");

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable
    .map(
      (r) =>
        `  <url>\n` +
        `    <loc>${origin}${r.path === "/" ? "/" : r.path}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <priority>${r.priority.toFixed(1)}</priority>\n` +
        `  </url>\n`,
    )
    .join("") +
  `</urlset>\n`;

await writeFile(join(DIST, "sitemap.xml"), sitemap);

// ---- routes.json -----------------------------------------------------------

await writeFile(
  join(DIST, "routes.json"),
  JSON.stringify(built.map((r) => r.path)) + "\n",
);

// ---- redirects.json --------------------------------------------------------
//
// A renamed route is still a route someone has bookmarked, linked or indexed.
// The static server answers these 301 before the app loads; App.tsx renders the
// same list as <Navigate replace> for links followed inside the app.

await writeFile(
  join(DIST, "redirects.json"),
  JSON.stringify(Object.fromEntries(redirects.map((r) => [r.from, r.to]))) + "\n",
);

console.log(
  `emit-routes: ${indexable.length} urls in sitemap, ${built.length} routes in manifest, ` +
    `${redirects.length} redirects` +
    (includeInternal ? " (internal pages included)" : ""),
);
