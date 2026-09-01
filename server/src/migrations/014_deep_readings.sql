-- Citirea întreagă: harta legată, nu enumerată.
--
-- Raportul spune ce înseamnă fiecare număr, separat. Nimic nu leagă Drumul de
-- Destin, de datoria karmică, de vârful în care ești acum -- pentru omul ăsta
-- anume. Asta e diferența dintre o enciclopedie și o citire.
--
-- Se ține minte fiindcă e scumpă: intrare mare, ieșire lungă, model puternic.
-- Cheia e amprenta hărții, nu data: harta nu se schimbă de la o zi la alta, iar
-- dacă se schimbă (alt nume, altă dată), e altă hartă și merită altă citire.

CREATE TABLE IF NOT EXISTS deep_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  language    TEXT NOT NULL,
  -- Amprenta hărții din care s-a scris: cifrele, în ordine. Dacă se schimbă,
  -- citirea veche rămâne (e a altei hărți) și se scrie una nouă.
  chart_hash  TEXT NOT NULL,
  body        JSONB NOT NULL,
  source      TEXT NOT NULL,
  model       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, language, chart_hash)
);

CREATE INDEX IF NOT EXISTS idx_deep_readings_profile
  ON deep_readings (profile_id, created_at DESC);
