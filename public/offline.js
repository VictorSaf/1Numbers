// The copy for offline.html, in a file rather than inline.
//
// The static server sends script-src 'self' with no 'unsafe-inline', so an
// inline block here would be blocked by CSP at exactly the moment the page is
// needed. Precached by the service worker alongside offline.html.
var COPY = {
  ro: {
    lang: 'ro',
    title: 'Nu ai conexiune',
    body: 'Calculele de numerologie se fac în browserul tău, deci merg și offline — dar pagina asta nu a apucat să fie salvată. Reîncearcă odată ce revine internetul.',
    retry: 'Reîncarcă',
    pageTitle: 'Fără conexiune — Numerologia'
  },
  en: {
    lang: 'en',
    title: 'You are offline',
    body: 'Numerology is calculated in your browser, so it works without a connection — but this page had not been saved yet. Try again once the network is back.',
    retry: 'Reload',
    pageTitle: 'Offline — Numerology Compass'
  },
  ru: {
    lang: 'ru',
    title: 'Нет соединения',
    body: 'Нумерологические расчёты выполняются в вашем браузере и работают без сети — но эта страница не успела сохраниться. Попробуйте снова, когда интернет вернётся.',
    retry: 'Перезагрузить',
    pageTitle: 'Нет соединения — Numerology Compass'
  }
};

// The app is RO/EN/RU; this page was Romanian only. It cannot ask
// LanguageContext which language is in play -- no bundle has loaded -- so it
// reads the same localStorage key the context writes, then falls back to the
// browser's own preference.
var stored = null;
try { stored = localStorage.getItem('language'); } catch (e) { /* private mode */ }
var fromBrowser = (navigator.language || 'en').slice(0, 2).toLowerCase();
var t = COPY[stored] || COPY[fromBrowser] || COPY.en;

document.documentElement.lang = t.lang;
document.title = t.pageTitle;
document.getElementById('title').textContent = t.title;
document.getElementById('body').textContent = t.body;

var retry = document.getElementById('retry');
retry.textContent = t.retry;
retry.addEventListener('click', function () { location.reload(); });
