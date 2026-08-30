# Deploy

Descrierea reală a producției. Sursele ei sunt comentariul din capul lui
`.github/workflows/ci.yml` și antetul lui `scripts/serve-compass.mjs` — până
acum singurele două locuri din repo care nu descriau un sistem imaginar.
Restul, inclusiv `DEPLOYMENT_GUIDE.md` de 33 KB, e în `docs/istoric/`.

## Ce rulează

Două procese, pe aceeași mașină, pornite de pm2:

| Proces | Comandă | Port | Rol |
|---|---|---|---|
| `compass-web` | `node scripts/serve-compass.mjs` | 8090 (loopback) | servește `dist/` |
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
npm ci && npm run build            # frontend → dist/
cd server && npm ci && npm run build && npm run migrate && cd ..
pm2 restart ecosystem.config.cjs   # sau: pm2 reload compass-web compass-api
```

`npm run build` rulează și `prerender-meta`, `stamp-sw` și `emit-routes`, deci
sitemap-ul, meta-ul per rută și numele cache-ului service workerului se
regenerează singure. Nu le atinge de mână.

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
| `AI_PROVIDER` | `mock`; `openai` sau `anthropic` cer cheia respectivă |

Ultimele două sunt închise în producție. Nu există integrare de plată.

## Verificare după deploy

```bash
curl -s https://compass.oneaigency.com/api/health
curl -s -o /dev/null -w '%{http_code}\n' https://compass.oneaigency.com/guide   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://compass.oneaigency.com/nonsens # 404
```

A treia contează: un 200 acolo înseamnă că shell-ul se servește pentru rute care
nu există, iar Google le indexează.
