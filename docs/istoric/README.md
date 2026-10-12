# Istoric — documente care descriu un sistem care n-a existat

Fișierele din directorul ăsta descriu un backend FastAPI, un stack Weaviate, o
imagine Docker și un deployment Kubernetes. **Niciunul n-a rulat vreodată.**
Comentariul din capul lui `.github/workflows/ci.yml` o spune direct, iar
straturile respective au fost scoase din repo pe 30 august 2026 (`8734b8b`,
„Scoate straturile care nu au rulat niciodată").

Sunt păstrate pentru istoric, nu pentru consultare. Erau activ dăunătoare cât
stăteau în rădăcina proiectului: orice agent sau coleg care deschidea repo-ul
citea `DEPLOYMENT_GUIDE.md` (33 KB) și pleca de la premise false despre ce
rulează în producție.

**Descrierea corectă a producției este în `DEPLOY.md`.**

| Fișier | Ce descrie | Stare |
|---|---|---|
| `BACKEND_SETUP.md` | backend FastAPI + Postgres + Redis | n-a existat |
| `DEPLOYMENT_GUIDE.md` | Docker, Kubernetes, smoke tests, rollback | n-a existat |
| `PHASE_1_COMPLETION.md` … `PHASE_5_AI_PERSONALIZATION.md` | plan pe faze pentru stack-ul de mai sus | parțial livrat, dar nu așa |

Al doilea lot a venit pe 12 octombrie 2026, din rădăcina repo-ului și din
`docs/`. Sunt documentele „1Numbers" din ianuarie: același backend FastAPI din
`backend/`, aceleași servere MCP, același `localhost:8000`. Niciunul dintre ele
nu există în cod — nu e niciun fișier Python, niciun `docker-compose`, niciun
director `backend/`. Legăturile dintre ele merg în continuare, pentru că stau
acum toate în același director.

| Fișier | Ce descrie | Stare |
|---|---|---|
| `API_REFERENCE.md` | API REST și WebSocket pe `api.1numbers.com` / `localhost:8000` | n-a existat; API-ul real e Express, în `server/src/routes/` |
| `ARCHITECTURE.md` | arhitectură FastAPI + Redis + Weaviate + servere MCP + Kubernetes | n-a existat |
| `CONTRIBUTING.md` | ghid de contribuție cu Python 3.11, `backend/`, `docker-compose` | n-a existat |
| `DELIVERABLES.md` | inventarul fișierelor din „Phase 1 Backend" | fișierele inventariate nu sunt în repo |
| `DOCUMENTATION_INDEX.md` | cuprinsul documentației de mai sus, cu `pytest backend/` | n-a existat |
| `FINAL_COMMIT_SUMMARY.md` | rezumatul ramurii `backend/phase-1-setup` | ramura n-a ajuns în cod |
| `MCP_COMPLETE_GUIDE.md` | integrarea serverelor MCP cu backend-ul FastAPI | n-a existat |
| `MCP_INTEGRATION_PART_E.md` | testarea și deployment-ul aceleiași integrări MCP | n-a existat |
| `PR_SUMMARY.md` | PR-ul „Calculator Agent + FastAPI Backend" | n-a ajuns în cod |
| `QUICK_REFERENCE.md` | comenzi Docker, Postgres, Redis pe `localhost:8000` | n-a existat |
| `README_1NUMBERS.md` | prezentarea platformei „1Numbers v5.0" | n-a existat; prezentarea reală e `README.md` |
| `PHASE_2_COMPLETE_GUIDE.md`, `PHASE_2_MCP_SETUP.md` | faza a doua: MCP, Redis, Weaviate peste FastAPI | n-a existat |
| `PHASE_3_FRONTEND_INTEGRATION.md`, `PHASE_3_IMPLEMENTATION_GUIDE.md` | un frontend legat de API-ul de pe `localhost:8000`, prin WebSocket | frontendul real vorbește cu Express, prin `src/services/api.ts` |
