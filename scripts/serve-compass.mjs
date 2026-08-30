// Static server for the production build of the frontend.
//
// Serves dist/ at the root of compass.oneaigency.com. The Cloudflare Tunnel
// splits by path: /api/* goes to the backend on :3001, everything else here.
// Zero dependencies so pm2 can restart it without a network.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const PORT = 8090;
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// Which paths are real client routes, read from the manifest the build emits
// (scripts/emit-routes.mjs) out of src/data/routes.json.
//
// This used to be `!extname(pathname)`: anything without a file extension got
// the SPA shell with a 200. That made a typo in a shared link and a real page
// indistinguishable over HTTP -- crawlers indexed invented URLs as valid pages,
// and monitoring could not tell a broken route from a working one. Unknown
// paths now get the same shell, so React Router still renders NotFound, but
// with an honest 404 status.
//
// If the manifest is missing the server stays permissive rather than answering
// 404 for the whole site: a half-finished build should degrade, not go dark.
const ROUTE_PATTERNS = await (async () => {
  try {
    const paths = JSON.parse(await readFile(join(ROOT, "routes.json"), "utf8"));
    // "/invite/:code" -> /^\/invite\/[^/]+$/
    return paths.map(
      (p) =>
        new RegExp(
          "^" +
            p
              .split("/")
              .map((seg) =>
                seg.startsWith(":")
                  ? "[^/]+"
                  : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              )
              .join("/") +
            "$",
        ),
    );
  } catch {
    console.warn("compass: dist/routes.json missing; serving every path as a route");
    return null;
  }
})();

// The paths that used to be routes, emitted beside the manifest. A rename does
// not un-bookmark anything, so these answer 301 rather than 404 -- before the
// SPA shell is even considered.
const REDIRECTS = await (async () => {
  try {
    return JSON.parse(await readFile(join(ROOT, "redirects.json"), "utf8"));
  } catch {
    console.warn("compass: dist/redirects.json missing; old paths will 404");
    return {};
  }
})();

const isKnownRoute = (pathname) => {
  if (ROUTE_PATTERNS === null) return true;
  const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  return ROUTE_PATTERNS.some((re) => re.test(path));
};

// The build emits no inline <script>, so script-src needs no 'unsafe-inline'.
// plausible.io is allowed for the analytics script and its event endpoint.
// style-src still does: React and Recharts set style attributes at runtime.
// Both Google font origins are gone now that the fonts are served from here.
// img-src allows data: and blob: because html2canvas rasterises through both.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://plausible.io",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": CSP,
};

// Cloudflare terminates TLS and forwards the client's original scheme. Returns
// undefined for a direct local request (no proxy headers), which must be served
// as-is so local testing does not get redirected to an https port that isn't there.
const clientProto = (req) => {
  const xfp = req.headers["x-forwarded-proto"];
  if (xfp) return xfp.split(",")[0].trim();
  try { return JSON.parse(req.headers["cf-visitor"] ?? "{}").scheme; } catch { return undefined; }
};

// HSTS is deliberately without includeSubDomains: this tunnel also serves
// one21/niha/2u on sibling subdomains, and those must not inherit the policy.
const protoHeaders = (proto) =>
  proto === "https" ? { "Strict-Transport-Security": "max-age=31536000" } : {};

// `head` is threaded through per call rather than held in module scope, so two
// concurrent requests can never observe each other's method.
const send = (res, status, body, { head = false, proto, ...headers } = {}) => {
  res.writeHead(status, { ...SECURITY_HEADERS, ...protoHeaders(proto), ...headers });
  res.end(head ? undefined : body);
};

const serveFile = async (res, filePath, { immutable, head, proto, status = 200 }) => {
  const body = await readFile(filePath);
  res.writeHead(status, {
    "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": immutable
      ? "public, max-age=31536000, immutable"   // filename carries a content hash
      : "no-cache",                             // index.html must never pin a build
    ...SECURITY_HEADERS,
    ...protoHeaders(proto),
  });
  res.end(head ? undefined : body);
};

const server = createServer(async (req, res) => {
  const head = req.method === "HEAD";
  const proto = clientProto(req);

  // Anything that reached Cloudflare over plain HTTP is bounced before it is served.
  if (proto === "http") {
    return send(res, 301, "", { head, proto, Location: `https://${req.headers.host}${req.url}` });
  }

  if (req.method !== "GET" && !head) {
    return send(res, 405, "Method Not Allowed", { head, proto, Allow: "GET, HEAD" });
  }

  const { pathname } = new URL(req.url, `http://${HOST}`);

  // /api belongs to the backend. If one of these arrives here the tunnel is
  // misrouting; answer 404 rather than masking it with the SPA shell.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return send(res, 404, "Not Found", { head, proto, "Content-Type": MIME[".txt"] });
  }

  // A retired path, before anything else looks for a file to serve.
  const moved = REDIRECTS[pathname.replace(/(.)\/+$/, "$1")];
  if (moved) {
    return send(res, 301, `Moved to ${moved}`, {
      head,
      proto,
      Location: moved,
      "Content-Type": MIME[".txt"],
    });
  }

  const rel = decodeURIComponent(pathname.slice(1));
  const filePath = resolve(join(ROOT, rel));
  // Containment check: reject anything that escapes dist/ via .. or encoded traversal.
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
    return send(res, 403, "Forbidden", { head, proto, "Content-Type": MIME[".txt"] });
  }

  // Only the root itself short-circuits to the root shell. This used to accept
  // any path ending in a slash, which ran before both the per-route lookup below
  // and isKnownRoute: /guide/ was answered with the homepage's meta tags, and
  // /nonsens/ was answered 200.
  if (rel === "") {
    return await serveFile(res, join(ROOT, "index.html"), { immutable: false, head, proto });
  }

  try {
    const info = await stat(filePath);
    if (info.isFile()) {
      return await serveFile(res, filePath, { immutable: rel.startsWith("assets/"), head, proto });
    }
    // A directory here means the build wrote a per-route index.html for it
    // (see scripts/prerender-meta.mjs), carrying that route's meta tags.
    if (info.isDirectory()) {
      const nested = join(filePath, "index.html");
      try {
        if ((await stat(nested)).isFile()) {
          return await serveFile(res, nested, { immutable: false, head, proto });
        }
      } catch {
        // no prerendered file; fall through to the SPA shell
      }
    }
  } catch {
    // fall through
  }

  // A path with an extension that reached here is a missing asset, and gets an
  // honest 404 rather than HTML with a 200, which keeps broken bundle references
  // visible. Anything else is a client route: the shell renders it either way,
  // but the status distinguishes a real page from one that does not exist.
  if (!extname(pathname)) {
    return await serveFile(res, join(ROOT, "index.html"), {
      immutable: false,
      head,
      proto,
      status: isKnownRoute(pathname) ? 200 : 404,
    });
  }
  return send(res, 404, "Not Found", { head, proto, "Content-Type": MIME[".txt"] });
});

server.listen(PORT, HOST, () => {
  const known = ROUTE_PATTERNS === null ? "no manifest" : `${ROUTE_PATTERNS.length} routes`;
  console.log(`compass: serving ${ROOT} at http://${HOST}:${PORT}/ (${known})`);
});
