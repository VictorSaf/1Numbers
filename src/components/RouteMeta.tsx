import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

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
const SITE_ORIGIN = "https://compass.oneaigency.com";

type Meta = { title: string; description: string };

const META: Record<string, Record<string, Meta>> = {
  "/": {
    ro: { title: "Numerologia — Calculator Numerologic Gratuit", description: "Calculează-ți Numărul Drumului Vieții, Destinului, Sufletului și Personalității cu sistemul pitagoreic. Gratuit, în română." },
    en: { title: "Numerology Compass — Free Numerology Calculator", description: "Calculate your Life Path, Destiny, Soul Urge and Personality numbers using the Pythagorean system. Free." },
    ru: { title: "Нумерология — Бесплатный нумерологический калькулятор", description: "Рассчитайте числа жизненного пути, судьбы, души и личности по пифагорейской системе. Бесплатно." },
  },
  "/guide": {
    ro: { title: "Ghid Numerologie — Semnificația Numerelor 1-9, 11, 22, 33", description: "Ghid complet al numerelor în numerologie: numerele fundamentale 1-9 și numerele master 11, 22 și 33." },
    en: { title: "Numerology Guide — Meaning of Numbers 1-9, 11, 22, 33", description: "A complete guide to numbers in numerology: the core numbers 1-9 and the master numbers 11, 22 and 33." },
    ru: { title: "Руководство по нумерологии — значения чисел 1-9, 11, 22, 33", description: "Полное руководство по числам: основные числа 1-9 и мастер-числа 11, 22 и 33." },
  },
  "/compatibility": {
    ro: { title: "Compatibilitate Numerologică în Cuplu", description: "Verifică armonia numerologică dintre două persoane: Drumul Vieții, Destinul și Numărul Sufletului." },
    en: { title: "Numerology Compatibility for Couples", description: "Check the numerological harmony between two people across Life Path, Destiny and Soul Urge numbers." },
    ru: { title: "Нумерологическая совместимость пары", description: "Проверьте нумерологическую совместимость двух людей по числам пути, судьбы и души." },
  },
  "/predictions": {
    ro: { title: "Previziuni Numerologice — Zi, Lună și An Personal", description: "Descoperă energia zilei, lunii și anului tău personal, calculate din data nașterii." },
    en: { title: "Numerology Predictions — Personal Day, Month and Year", description: "Discover your personal day, month and year energy, calculated from your date of birth." },
    ru: { title: "Нумерологические прогнозы — день, месяц и год", description: "Узнайте энергию личного дня, месяца и года, рассчитанную по дате рождения." },
  },
  "/tools": {
    ro: { title: "Instrumente Numerologice — Nume, Telefon, Adresă", description: "Analizează numerologic numele, numărul de telefon, adresa și numărul de înmatriculare." },
    en: { title: "Numerology Tools — Name, Phone, Address", description: "Run a numerology analysis on names, phone numbers, addresses and vehicle plates." },
    ru: { title: "Нумерологические инструменты — имя, телефон, адрес", description: "Нумерологический анализ имени, номера телефона, адреса и номера автомобиля." },
  },
  "/angel-numbers": {
    ro: { title: "Numere Îngerești — Semnificația 111, 222, 333", description: "Ce înseamnă numerele repetitive pe care le vezi des: 111, 222, 333 și celelalte secvențe îngerești." },
    en: { title: "Angel Numbers — Meaning of 111, 222, 333", description: "What the repeating numbers you keep seeing mean: 111, 222, 333 and the other angel sequences." },
    ru: { title: "Ангельские числа — значения 111, 222, 333", description: "Что означают повторяющиеся числа: 111, 222, 333 и другие ангельские последовательности." },
  },
  "/chaldean": {
    ro: { title: "Numerologie Caldeeană — Analiză după Sistemul Caldeean", description: "Analiză numerologică după sistemul caldeean, mai vechi decât cel pitagoreic." },
    en: { title: "Chaldean Numerology — Analysis by the Chaldean System", description: "A numerology reading using the Chaldean system, older than the Pythagorean one." },
    ru: { title: "Халдейская нумерология — анализ по халдейской системе", description: "Нумерологический анализ по халдейской системе, более древней, чем пифагорейская." },
  },
  "/remedies": {
    ro: { title: "Remedii Numerologice — Culori, Pietre și Mantre", description: "Descoperă culorile, pietrele și mantrele favorabile numerelor tale personale." },
    en: { title: "Numerology Remedies — Colours, Stones and Mantras", description: "Find the colours, stones and mantras that favour your personal numbers." },
    ru: { title: "Нумерологические средства — цвета, камни и мантры", description: "Цвета, камни и мантры, благоприятные для ваших личных чисел." },
  },
  "/tutorials": {
    ro: { title: "Tutoriale Numerologie — Cum se Calculează", description: "Tutoriale pas cu pas despre cum se calculează fiecare număr numerologic." },
    en: { title: "Numerology Tutorials — How the Numbers Are Calculated", description: "Step-by-step tutorials on how each numerology number is calculated." },
    ru: { title: "Уроки нумерологии — как рассчитываются числа", description: "Пошаговые уроки о том, как рассчитывается каждое нумерологическое число." },
  },
  "/faq": {
    ro: { title: "Întrebări Frecvente despre Numerologie", description: "Răspunsuri la cele mai frecvente întrebări despre numerologie și modul de calcul." },
    en: { title: "Frequently Asked Questions about Numerology", description: "Answers to the most common questions about numerology and how the numbers are worked out." },
    ru: { title: "Часто задаваемые вопросы о нумерологии", description: "Ответы на самые частые вопросы о нумерологии и расчётах." },
  },
  "/articles": {
    ro: { title: "Articole de Numerologie", description: "Articole despre numerologie: bazele, numerele master și Numărul Drumului Vieții." },
    en: { title: "Numerology Articles", description: "Articles on numerology: the basics, master numbers and the Life Path number." },
    ru: { title: "Статьи по нумерологии", description: "Статьи о нумерологии: основы, мастер-числа и число жизненного пути." },
  },
  "/premium": {
    ro: { title: "Premium — Planuri și Funcții Avansate", description: "Compară planurile și funcțiile avansate: rapoarte detaliate, consultant AI și export PDF." },
    en: { title: "Premium — Plans and Advanced Features", description: "Compare plans and advanced features: detailed reports, AI consultant and PDF export." },
    ru: { title: "Премиум — тарифы и расширенные возможности", description: "Сравните тарифы и возможности: подробные отчёты, ИИ-консультант и экспорт в PDF." },
  },
};

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

    const meta = META[path]?.[language] ?? META[path]?.en;
    if (meta) {
      document.title = meta.title;
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
