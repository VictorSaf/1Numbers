-- Acordurile, ca jurnal, nu ca bifă.
--
-- GDPR nu cere doar să ceri acordul, ci să poți DEMONSTRA că l-ai avut. O
-- coloană boolean pe `users` n-o poate: spune ce e adevărat acum, nu ce era
-- adevărat când ai trimis datele. Deci fiecare acordare și fiecare retragere e
-- un rând nou, iar starea de acum e ultimul rând pentru (om, fel).
--
-- `policy_version` există pentru momentul în care se schimbă politica: trebuie
-- să știm cine a acceptat care variantă și pe cine reîntrebăm. Fără el,
-- schimbarea politicii înseamnă ori să reîntrebi pe toți, ori să pretinzi că
-- acordul vechi acoperă textul nou.
--
-- Trei feluri, și doar două sunt consimțământ în sensul din regulament:
--   model         -- textul zilei și consultantul, art. 6(1)(a)
--   notifications -- notificările push
--   terms         -- acceptarea termenilor, care e altceva: temeiul e
--                    contractul, nu consimțământul. Stă aici fiindcă are
--                    aceeași nevoie de dovadă și aceeași versionare.
--
-- Numerotare: 011 lipsește din secvență și n-a existat niciodată.

CREATE TABLE IF NOT EXISTS user_consents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('model', 'notifications', 'terms')),
  policy_version TEXT NOT NULL,
  -- Exact unul dintre ele e non-NULL: rândul e ori o acordare, ori o retragere.
  granted_at     TIMESTAMP WITH TIME ZONE,
  withdrawn_at   TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_consents_one_side CHECK (
    (granted_at IS NOT NULL AND withdrawn_at IS NULL)
    OR (granted_at IS NULL AND withdrawn_at IS NOT NULL)
  )
);

-- Starea de acum se citește ca „ultimul rând pentru (om, fel)".
CREATE INDEX IF NOT EXISTS user_consents_current_idx
  ON user_consents (user_id, kind, created_at DESC);
