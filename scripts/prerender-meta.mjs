// Writes a per-route index.html into dist/ with that route's meta baked in.
//
// The app already sets title, description and canonical per route at runtime,
// which is enough for crawlers that execute JavaScript. It is not enough for a
// plain fetch: Facebook, LinkedIn, WhatsApp, X and Bing read the HTML as served,
// so every shared link showed the same generic title.
//
// Full static generation would mean rendering each route in a headless browser
// at build time. That buys body content Google already renders for itself, at
// the cost of a browser in the build. Injecting the known meta as strings gets
// the part that actually fails, with no new dependency.
//
// The body remains the SPA shell; only the head differs per route.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const ORIGIN = "https://compass.oneaigency.com";
// Romanian is the interface default, so it is what an un-run bundle would show.
const DEFAULT_LANG = "ro";

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const replaceTag = (html, pattern, replacement) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html;

const meta = JSON.parse(await readFile(join(ROOT, "src/data/routeMeta.json"), "utf8"));
const shell = await readFile(join(DIST, "index.html"), "utf8");

let written = 0;
for (const [route, langs] of Object.entries(meta)) {
  const { title, description } = langs[DEFAULT_LANG] ?? Object.values(langs)[0];
  const url = `${ORIGIN}${route === "/" ? "/" : route}`;

  let html = shell;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escape(description)}" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escape(title)}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escape(description)}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escape(title)}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escape(description)}" />`);
  // A canonical in the served HTML, which RouteMeta then keeps in step client-side.
  html = html.replace(/<!-- canonical is set per route[\s\S]*?-->/,
    `<link rel="canonical" href="${url}" />`);

  if (route === "/") {
    await writeFile(join(DIST, "index.html"), html);
  } else {
    const dir = join(DIST, route.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), html);
  }
  written++;
}

console.log(`prerender-meta: ${written} routes written`);
