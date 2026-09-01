-- Migration: ce lipsea ca notificarea zilnică să poată pleca.
--
-- 007 a creat tabelele și le-a lăsat goale: nimic nu a trimis vreodată un push,
-- fiindcă web-push nu era instalat și nu exista niciun scheduler. Cele două
-- coloane de mai jos sunt tot ce mai trebuie în schemă.
--
-- language pe subscripție, nu pe utilizator: users nu are o coloană de limbă,
-- iar preferences e validat cu un zod .strict() care oglindește exact
-- default-ul din 007. Limba e oricum o proprietate a browserului abonat.
--
-- dedupe_key + indexul unic sunt LACĂTUL. Dispecerul face
-- INSERT ... ON CONFLICT DO NOTHING RETURNING id înainte de a trimite: dacă nu
-- se întoarce niciun rând, altcineva a revendicat deja ziua aceea pentru acel
-- utilizator și nu se trimite nimic. Asta ține chiar dacă rulează două procese
-- compass-api în paralel -- ceea ce se întâmplă, câteva secunde, la fiecare
-- `pm2 restart`.
--
-- Indexul NU e parțial: în PostgreSQL NULL-urile sunt distincte într-un index
-- unic, deci rândurile existente (toate cu dedupe_key NULL) nu se ciocnesc.

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'ro';

ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_language_check;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_language_check
  CHECK (language IN ('ro', 'en', 'ru'));

ALTER TABLE notification_history
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_history_dedupe
  ON notification_history (user_id, dedupe_key);

COMMENT ON COLUMN push_subscriptions.language IS 'Limba în care pleacă push-ul către acest dispozitiv';
COMMENT ON COLUMN notification_history.dedupe_key IS 'Cheia de revendicare, ex. daily-prediction:2026-09-01. Indexul unic pe (user_id, dedupe_key) e ce oprește trimiterea dublă.';
