# Scripts

## Conturi de admin

Aici stătea `create-admin-user.js`. A fost scos pe 12 octombrie 2026: avea un
email și o parolă de admin scrise în cod și cădea pe
`postgres:postgres@localhost` când lipsea `DATABASE_URL`.

Ce îl înlocuiește:

- **Un cont nou** se face din API, de către un admin: `POST /api/admin/users`
  (`server/src/routes/admin.ts`). Parola trece prin același bcrypt ca la
  înregistrare, iar rolul se dă explicit (`role: "admin"`).
- **O parolă nouă pe un cont existent**: `npm --prefix server run set-password`.
  Parola se citește fără ecou și nu ajunge nici în istoricul shell-ului, nici
  în lista de procese.

Niciunul nu face primul admin pe o bază goală: `set-password` nu schimbă rolul,
iar `POST /admin/users` cere deja un admin. Pe o bază nouă, rolul primului cont
se pune de mână, în `psql`.

## set-anthropic-key.sh

```bash
bash scripts/set-anthropic-key.sh
```

Pune cheia Anthropic în `server/.env` și repornește `compass-api` sub pm2.
Cheia se citește de la tastatură fără ecou și nu se tipărește; înainte de
scriere se face o copie `server/.env.bak.<dată>` (ignorată de git, pentru că
conține secrete). Procesul pornește cu `env -u ANTHROPIC_BASE_URL`, ca să nu
moștenească proxy-ul unei sesiuni de Claude Code, apoi scriptul verifică trei
lucruri: că variabila n-a scăpat în proces, că procesul e online și că
`/api/health` răspunde 200. Cheia trebuie să fie una de workspace — una legată
de identitate dă 502 la fiecare întrebare.
