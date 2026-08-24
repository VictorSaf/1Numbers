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
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// A path with no file extension is a client-side route; hand it index.html so
// React Router can render it. Anything with an extension is an asset request and
// gets an honest 404, which keeps broken bundle references visible instead of
// silently returning HTML with a 200.
const isClientRoute = (pathname) => !extname(pathname);

// The build emits no inline <script>, so script-src needs no 'unsafe-inline'.
// style-src does: React and Recharts set style attributes at runtime, and the
// stylesheet pulls Cinzel/Raleway from Google Fonts. Dropping those two font
// origins is the reward for self-hosting the fonts later.
// img-src allows data: and blob: because html2canvas rasterises through both.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
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

const serveFile = async (res, filePath, { immutable, head, proto }) => {
  const body = await readFile(filePath);
  res.writeHead(200, {
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

  const rel = decodeURIComponent(pathname.slice(1));
  const filePath = resolve(join(ROOT, rel));
  // Containment check: reject anything that escapes dist/ via .. or encoded traversal.
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
    return send(res, 403, "Forbidden", { head, proto, "Content-Type": MIME[".txt"] });
  }

  if (rel === "" || rel.endsWith("/")) {
    return await serveFile(res, join(ROOT, "index.html"), { immutable: false, head, proto });
  }

  try {
    const info = await stat(filePath);
    if (info.isFile()) {
      return await serveFile(res, filePath, { immutable: rel.startsWith("assets/"), head, proto });
    }
  } catch {
    // fall through
  }

  if (isClientRoute(pathname)) {
    return await serveFile(res, join(ROOT, "index.html"), { immutable: false, head, proto });
  }
  return send(res, 404, "Not Found", { head, proto, "Content-Type": MIME[".txt"] });
});

server.listen(PORT, HOST, () => {
  console.log(`compass: serving ${ROOT} at http://${HOST}:${PORT}/`);
});
