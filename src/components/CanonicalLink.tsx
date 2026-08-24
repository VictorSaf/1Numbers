import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Keeps <link rel="canonical"> pointing at the URL actually being viewed.
//
// The tag cannot live in index.html: this is a client-rendered SPA, so a single
// static value would be served on every route and would tell crawlers that
// /guide, /tools and the rest are all duplicates of one page. A wrong static
// canonical is worse than none, because without one each URL self-canonicalises.
//
// SITE_ORIGIN is fixed rather than read from location.origin so that previews
// and local runs cannot emit a canonical pointing at themselves.
const SITE_ORIGIN = "https://compass.oneaigency.com";

export const CanonicalLink = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Trailing slashes are dropped so /guide and /guide/ agree on one form.
    const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "";
    const href = `${SITE_ORIGIN}${path}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // og:url is read by social scrapers, which generally do not run JavaScript.
    // Updating it still helps anything that does, and costs nothing.
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", href);
  }, [pathname]);

  return null;
};
