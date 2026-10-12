-- Ziua scrisă de model, ținută minte o dată pe zi.
--
-- Cache-ul nu e aici pentru bani, ci pentru adevăr: fără el, omul reîncarcă
-- pagina și ziua îi spune altceva. O citire care se schimbă la refresh nu e o
-- citire, e un generator de vorbe -- și încrederea moare acolo.
--
-- Cheia e (profil, zi): o generare pe zi, oricâte vizite. Asta plafonează și
-- costul, și eventualul abuz, la un singur apel scurt per om per zi.

CREATE TABLE IF NOT EXISTS daily_readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- Ziua de calendar a omului, nu un timestamp: ziua personală ține de dată.
  on_date      DATE NOT NULL,
  language     TEXT NOT NULL,
  -- Ziua personală calculată de motor. Ținută ca să pot verifica mai târziu
  -- că textul păstrat corespunde cifrei, fără să recalculez tot.
  personal_day INTEGER NOT NULL,
  -- Cele patru bucăți, exact cum le arată ecranul.
  body         JSONB NOT NULL,
  -- 'model' sau 'composed'. Fără asta nu pot măsura cât de des cade modelul,
  -- iar o interfață care nu știe ce arată sfârșește prin a minți.
  source       TEXT NOT NULL,
  model        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, on_date, language)
);

CREATE INDEX IF NOT EXISTS idx_daily_readings_profile_date
  ON daily_readings (profile_id, on_date DESC);
