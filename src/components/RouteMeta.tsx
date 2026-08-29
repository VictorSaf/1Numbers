import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
// Shared with scripts/prerender-meta.mjs, which injects the same values into the
// HTML at build time so crawlers that do not run JavaScript see them too. Both
// read src/data/routes.json; see src/lib/routes.ts.
import { SITE_ORIGIN, metaFor } from "@/lib/routes";

// Sets canonical, title and description for the route being viewed.
//
// None of this can live in index.html: this is a client-rendered SPA, so a
// single static value is served on every route. A static canonical would mark
// /guide and the rest duplicates of the homepage, and a static title left all
// 21 routes sharing one.
//
// Crawlers that execute JavaScript (Google among them) see these. Social
// scrapers generally do not; making them work would require prerendering the
// routes at build time.
//
// SITE_ORIGIN is fixed rather than read from location.origin so previews and
// local runs cannot emit a canonical pointing at themselves.

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, selector.replace(/^meta\[|\]$/g, "").split("=")[1].replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

export const RouteMeta = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Trailing slashes are dropped so /guide and /guide/ agree on one form.
    const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
    const href = `${SITE_ORIGIN}${path === "/" ? "" : path}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // Routes with no meta in the registry are private (auth, profile, journal,
    // admin) and are not meant to be indexed. They still need a title: without
    // one they inherited whatever the previously viewed route had set.
    const fallback: Record<string, string> = {
      ro: "Numerologia", en: "Numerology Compass", ru: "Нумерология",
    };
    const entry = metaFor(path);
    const meta = entry?.[language] ?? entry?.en;
    document.title = meta?.title ?? fallback[language] ?? fallback.en;
    if (meta) {
      setMeta('meta[name="description"]', "name", meta.description);
      setMeta('meta[property="og:title"]', "property", meta.title);
      setMeta('meta[property="og:description"]', "property", meta.description);
      setMeta('meta[name="twitter:title"]', "name", meta.title);
      setMeta('meta[name="twitter:description"]', "name", meta.description);
    }
    setMeta('meta[property="og:url"]', "property", href);
    document.documentElement.lang = language;

    // WebApplication describes the site as a whole, so it is emitted only on the
    // home route rather than repeated on every page.
    const existing = document.getElementById("ld-webapp");
    if (existing) existing.remove();
    if (path === "/" && meta) {
      const ld = document.createElement("script");
      ld.id = "ld-webapp";
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: meta.title,
        description: meta.description,
        url: SITE_ORIGIN,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        inLanguage: ["ro", "en", "ru"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      });
      document.head.appendChild(ld);
    }
  }, [pathname, language]);

  return null;
};
