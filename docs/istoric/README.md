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
