#!/usr/bin/env bash
#
# Pune cheia Anthropic în server/.env și repornește API-ul, curat.
#
# De ce un script și nu o comandă: cheia nu trebuie să ajungă în istoricul
# shell-ului, în `ps`, sau într-o conversație. Aici se citește de la tastatură
# fără ecou, se scrie direct în fișier, și nu se tipărește niciodată.
#
# De ce `env -u`: shell-ul din care rulezi poate avea ANTHROPIC_BASE_URL
# exportat (o sesiune de Claude Code face asta). Dacă pm2 îl moștenește, SDK-ul
# trimite cererile spre acel proxy în loc de api.anthropic.com, merge cât timp
# proxy-ul trăiește, și se rupe fără explicație după. dotenv nu suprascrie ce e
# deja în mediu, deci singura apărare e să pornim procesul fără variabilă.
#
#   bash scripts/set-anthropic-key.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/server/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Nu găsesc $ENV_FILE. Ești în proiectul potrivit?" >&2
  exit 1
fi

echo "Cheia trebuie să fie una de WORKSPACE, nu legată de identitate."
echo "O cheie identity-linked cere un antet anthropic-workspace-id pe care"
echo "SDK-ul nu-l trimite, și primești 502 la fiecare întrebare."
echo
printf 'Lipește cheia (nu se afișează), apoi Enter: '
read -rs KEY
echo

if [[ -z "${KEY}" ]]; then
  echo "N-ai introdus nimic. Nu am schimbat nimic." >&2
  exit 1
fi

if [[ "${KEY}" != sk-ant-* ]]; then
  echo "Nu arată a cheie Anthropic (nu începe cu sk-ant-). Nu am schimbat nimic." >&2
  exit 1
fi

BACKUP="$ENV_FILE.bak.$(date +%Y%m%d-%H%M%S)"
cp "$ENV_FILE" "$BACKUP"

# Scoate orice linie veche, apoi adaugă noua. Fișierul temporar stă lângă
# original ca să rămână pe același volum și cu aceleași permisiuni.
TMP="$(mktemp "$ENV_FILE.XXXXXX")"
grep -v '^ANTHROPIC_API_KEY=' "$ENV_FILE" > "$TMP" || true
printf 'ANTHROPIC_API_KEY=%s\n' "$KEY" >> "$TMP"
mv "$TMP" "$ENV_FILE"
chmod 600 "$ENV_FILE"
unset KEY

echo "Scris în server/.env (permisiuni 600). Copie de siguranță: $(basename "$BACKUP")"
echo

echo "Repornesc compass-api fără variabilele de mediu ale acestui shell..."
env -u ANTHROPIC_BASE_URL -u ANTHROPIC_API_KEY pm2 restart compass-api --update-env >/dev/null
sleep 3

echo
echo "── Verificare ─────────────────────────────"

ID="$(pm2 id compass-api 2>/dev/null | tr -d '[] ')"
LEAK="$(pm2 env "$ID" 2>/dev/null | grep -c '^ANTHROPIC_BASE_URL' || true)"
if [[ "$LEAK" == "0" ]]; then
  echo "  ANTHROPIC_BASE_URL în proces : nu (corect)"
else
  echo "  ANTHROPIC_BASE_URL în proces : DA — proxy scurs, cere pm2 delete + start" >&2
fi

STATUS="$(pm2 list 2>/dev/null | grep compass-api | grep -c online || true)"
echo "  proces online               : $([[ "$STATUS" == "1" ]] && echo da || echo NU)"

HEALTH="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/api/health || true)"
echo "  /api/health                 : $HEALTH"

echo
if [[ "$HEALTH" == "200" && "$LEAK" == "0" ]]; then
  echo "Gata. Deschide aplicația și pune o întrebare consultantului."
  echo "Dacă primești 502, cheia e legată de identitate — ia una de workspace."
else
  echo "Ceva nu e în regulă. Vezi: pm2 logs compass-api --lines 30"
fi
