# Deploy

Descrierea reală a producției. Sursele ei sunt comentariul din capul lui
`.github/workflows/ci.yml` și antetul lui `scripts/serve-compass.mjs` — până
acum singurele două locuri din repo care nu descriau un sistem imaginar.
Restul, inclusiv `DEPLOYMENT_GUIDE.md` de 33 KB, e în `docs/istoric/`.

## Ce rulează

Două procese, pe aceeași mașină, pornite de pm2:

| Proces | Comandă | Port | Rol |
|---|---|---|---|
| `compass` | `node scripts/serve-compass.mjs` | 8090 (loopback) | servește `dist/` |
| `compass-api` | `node server/dist/index.js` | 3001 (loopback) | API-ul Express |

Amândouă ascultă pe `127.0.0.1`. Nimic nu e expus pe LAN.

Un **Cloudflare Tunnel** pornește de pe aceeași mașină și publică
`compass.oneaigency.com`, împărțind după cale: `/api/*` merge la 3001, restul la
8090. Tunelul termină TLS și trimite mai departe schema originală în
`x-forwarded-proto`, pe care ambele procese o citesc.

**PostgreSQL** local, pe socket unix, portul 5433. Nu e expus deloc.

Nu există Docker, Kubernetes, Redis, Weaviate sau backend Python. Au fost
descrise în documente, n-au rulat niciodată.

## Deploy

CI-ul (`.github/workflows/ci.yml`) construiește și rulează testele, dar
**deliberat nu face deploy**: un workflow verde care nu atinge ce e live se
citește ca o garanție pe care n-o oferă.

Deploy-ul e manual, pe mașina care servește:

```bash
git pull
npm ci && npm run build:internal   # frontend → dist/, vezi nota de mai jos
cd server && npm ci && npm run build && npm run migrate && cd ..
pm2 restart compass compass-api
```

Apoi, în browser: **`DevTools → Application → Service Workers → Unregister`.**
Nu e opțional. Workerul înregistrat anterior servește shell-ul vechi de pe origin
indiferent ce s-a deployat, iar un `Cmd+Shift+R` nu-l scoate. Verifici că te uiți
la build-ul nou comparând hash-ul lui `index-*.js` din `Network` cu cel tipărit
de comanda de build.

`build:internal` e `VITE_INCLUDE_INTERNAL=1 npm run build`, deci rulează tot ce
rulează și `build`: `prerender-meta`, `stamp-sw` și `emit-routes`. Adică
sitemap-ul, meta-ul per rută și numele cache-ului service workerului se
regenerează singure. Nu le atinge de mână.

### De ce `build:internal` și nu `build`

`npm run build` lasă afară rutele marcate `internal` în `routes.json` —
`/admin`, `/design-system`, `/white-label`. Aici există un singur `dist/` și un
singur server static, iar `dist/` ăla e și ce servește tunelul, și ce deschizi
tu pe `http://127.0.0.1:8090`. Deci un build fără rutele interne nu le ascunde
de public: le ia de pe mașină, singurul loc unde adminul chiar trebuie să
meargă.

Ce ține adminul privat e tunelul, nu build-ul. `~/.cloudflared/config.yml`
răspunde 404 la `^/admin(/|$)` și la `^/api/admin(/|$)` (decis 2026-08-30).
Verificat pe 2026-09-01, din același `dist/` construit cu `build:internal`:

```
http://127.0.0.1:8090/admin           200
https://compass.oneaigency.com/admin  404
```

Plus: serverele ascultă doar pe `127.0.0.1`, iar `requireAdmin` citește rolul
din baza de date, nu din token. Patru straturi, dintre care build-ul e cel mai
slab și singurul care te încurcă pe tine.

De pe alt calculator din aceeași rețea, adminul se atinge direct pe IP-ul
mașinii: `http://<ip>:8090/admin`. `serve-compass.mjs` trimite singur `/api/*`
la `:3001` -- aceeași împărțire pe care o face tunelul, fiindcă frontendul
cere `/api/...` relativ la origine și pe calea directă nu există nimeni
altcineva care s-o facă. Prin tunel nimic nu se schimbă: cererile de `/api`
nu ajung niciodată la serverul static. Ambele procese ascultă pe rețeaua locală,
prin `HOST: '0.0.0.0'` din `ecosystem.config.cjs` (2026-09-01). Codul are
loopback ca implicit, deci o mașină fără fișierul ăla rămâne închisă.

S-a ales asta dintre trei căi: tunelul SSH ar fi cerut Remote Login pornit,
Cloudflare Access se configurează în panoul Cloudflare, iar scoaterea
blocajului din tunel ar fi pus adminul pe internetul deschis. Rețeaua locală
e cea mai mică schimbare care rezolvă, și nu atinge tunelul: `/admin` și
`/api/admin` răspund în continuare 404 prin domeniu.

Ce se expune nou e strict panoul de admin -- restul aplicației era deja
publică prin tunel. Îl apără autentificarea și `requireAdmin`, care citește
rolul din baza de date la fiecare cerere, nu din token.

Ca să revii la loopback: șterge cele două linii `HOST` din
`ecosystem.config.cjs` și repornește.

Repornirea după o schimbare în `ecosystem.config.cjs` cere `pm2 delete` plus
`pm2 start`, nu `restart`: pm2 păstrează mediul de la pornire, iar
`--update-env` îl împreunează cu shell-ul curent -- ceea ce a scurs o dată
variabilele unei sesiuni Claude Code în proces.

```bash
pm2 delete compass compass-api && pm2 start ecosystem.config.cjs
```

### Prima rulare pe o bază care are deja schema

Migrațiile nu sunt reluabile — `CREATE TRIGGER` în 004, 006 și 007 n-are
`IF NOT EXISTS`, iar 005 și 009 fac seed fără `ON CONFLICT`. Pe o bază construită
de mână, fără tabelul `schema_migrations`, se rulează **o singură dată**:

```bash
cd server && npm run migrate -- --baseline
```

După asta `npm run migrate` curge normal. Pe o bază goală nu e nevoie de nimic
special.

## Mediu

`server/.env`, negitat. Cheile care contează:

| Cheie | Efect dacă lipsește |
|---|---|
| `DATABASE_URL` | API-ul pornește, dar orice cerere spre bază eșuează |
| `JWT_SECRET` | procesul refuză să pornească — fără fallback, intenționat |
| `FRONTEND_URL` | CORS cade pe `localhost:8082` |
| `ALLOW_REGISTRATION` | înregistrarea publică e închisă (403) |
| `ALLOW_BILLING` | `/subscriptions/create`, `/upgrade`, `/purchase` întorc 403 |
| `ANTHROPIC_API_KEY` | consultantul AI e indisponibil — `/api/ai/consult` întoarce 503 și interfața spune că nu e disponibil |
| `VAPID_PUBLIC_KEY` | notificările push nu pleacă; dispecerul refuză să pornească și spune de ce |
| `VAPID_PRIVATE_KEY` | idem — perechea se generează cu `npx web-push generate-vapid-keys --json` |
| `VAPID_SUBJECT` | idem; un `mailto:` care identifică operatorul către serverul de push |
| `NOTIFICATIONS_ENABLED` | dispecerul zilnic nu pornește deloc. Implicit închis. |
| `NOTIFICATIONS_ONLY_USER` | dispecerul trimite tuturor abonaților. Setat pe un UUID, trimite doar acelui cont. |
| `VAPID_PUBLIC_KEY` | notificările push nu pleacă; dispecerul refuză să pornească și spune de ce |
| `VAPID_PRIVATE_KEY` | idem — perechea se generează cu `npx web-push generate-vapid-keys --json` |
| `VAPID_SUBJECT` | idem; un `mailto:` care identifică operatorul către serverul de push |
| `NOTIFICATIONS_ENABLED` | dispecerul zilnic nu pornește deloc. Implicit închis. |
| `NOTIFICATIONS_ONLY_USER` | dispecerul trimite tuturor abonaților. Setat pe un UUID, trimite doar acelui cont. |

`ALLOW_REGISTRATION` și `ALLOW_BILLING` sunt închise în producție. Nu există
integrare de plată.

 nu mai există. Avea implicit valoarea , ceea ce însemna cănun server fără cheie întorcea răspunsuri inventate ca și cum ar fi venit de lanmodel. Acum furnizorul e unul singur, iar singura întrebare e dacă are cheie.nn`VITE_VAPID_PUBLIC_KEY` trăiește în `.env.local` la rădăcină și trebuie să fie
identică cu `VAPID_PUBLIC_KEY`. Cheia privată nu părăsește `server/.env`: dacă
ajunge în bundle, oricine poate semna push-uri către utilizatorii noștri.

## Prima trimitere de notificări

O notificare zilnică trimisă greșit ajunge la toți abonații deodată și nu se
poate retrage. Ordinea de mai jos există ca să nu se întâmple asta.

**1. Deploy cu dispecerul închis.** `NOTIFICATIONS_ENABLED` lipsește sau e pe
`false`. După `pm2 restart compass-api`, în log trebuie să apară:

```
[notifications] dispecerul e oprit (NOTIFICATIONS_ENABLED nu e "true")
```

**2. Abonează-te tu.** În browser, pe `/eu`, activează notificările. Verifică în
bază că au ajuns și subscripția, și preferințele:

```bash
psql -p 5433 -d numerology_compass -c \
  "SELECT user_id, language, left(endpoint, 40) FROM push_subscriptions;" -c \
  "SELECT user_id, preferences FROM notification_preferences;"
```

Un rând în fiecare, cu `enabled: true`. Dacă `notification_preferences` e goală,
clientul n-a trimis PUT-ul — nu merge mai departe.

**3. Trimite-ți ție.** Cu un token de admin:

```bash
curl -s -X POST https://compass.oneaigency.com/api/notifications/test-send \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Așteptat: `{"success":true,"tally":{"claimed":1,"sent":1,"gone":0,"failed":0}}`
**și** notificarea apare pe dispozitiv. `sent: 0` cu `failed: 1` înseamnă chei
VAPID greșite; `gone: 1` înseamnă că subscripția era deja moartă — reabonează-te.

Click pe notificare trebuie să deschidă `/azi`.

**4. Deschide dispecerul, pentru un singur cont.** În `server/.env`:

```
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_ONLY_USER=<uuid-ul tău>
```

`pm2 restart compass-api`. În log:

```
[notifications] dispecerul pornit, DOAR pentru <uuid>
```

Pune-ți ora de predicție cu două minute în viitor și așteaptă. Când sosește:

```bash
psql -p 5433 -d numerology_compass -c \
  "SELECT notification_type, title, dedupe_key, sent_at FROM notification_history ORDER BY sent_at DESC LIMIT 3;"
```

Un singur rând cu `dedupe_key = 'daily-prediction:<azi>'`. **Un singur rând** e
jumătatea care contează: dispecerul a mai bătut de zeci de ori între timp și n-a
trimis a doua oară.

**5. Deschide pentru toți.** Scoate `NOTIFICATIONS_ONLY_USER` din `server/.env`,
`pm2 restart compass-api`, confirmă în log `pentru toți abonații`. Din acest
moment orice greșeală de text pleacă la toată lumea; orice modificare la
`server/src/lib/dailyNotification.ts` se reface prin pașii 3 și 4 înainte de 5.

## Verificare după deploy

```bash
curl -s https://compass.oneaigency.com/api/health
curl -s -o /dev/null -w '%{http_code}\n' https://compass.oneaigency.com/guide   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://compass.oneaigency.com/nonsens # 404
```

A treia contează: un 200 acolo înseamnă că shell-ul se servește pentru rute care
nu există, iar Google le indexează.
