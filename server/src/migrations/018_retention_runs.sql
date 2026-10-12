-- Jurnalul rulărilor jobului de retenție (server/src/jobs/retention.ts).
--
-- Un job de curățenie care nu scrie nimic despre el însuși e o promisiune,
-- nu o garanție: fără un rând aici, nimeni nu poate spune dacă a rulat
-- azi-noapte sau acum două săptămâni. `deleted` ține câte rânduri a șters
-- din fiecare tabel -- daily_readings, user_activity_log,
-- notification_history, auth_tokens -- ca politica de la /confidentialitate
-- (90 zile, 12 luni, 7 zile după expirare) să rămână verificabilă, nu doar
-- scrisă.
--
-- journal_entries și user_profiles nu apar niciodată în `deleted`: sunt ale
-- omului și stau până le șterge el, prin /api/account/delete sau /export.

CREATE TABLE IF NOT EXISTS retention_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted     JSONB NOT NULL,
  duration_ms INTEGER NOT NULL
);
