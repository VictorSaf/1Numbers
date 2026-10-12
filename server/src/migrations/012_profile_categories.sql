-- Fiecare hartă salvată are un fel.
--
-- O hartă salvată e ceva ce ține utilizatorul, nu o persoană cu cont. Categoria
-- spune ce fel de hartă e și, pentru tot ce nu e 'eu', marchează rândul ca
-- fiind despre altcineva.
--
--   eu        hărțile titularului, inclusiv variantele de nume
--   apropiat  partener, familie, prieten: o persoană pe care o cunoaște
--   copil     un copil, sau un nume care se alege pentru unul
--   afacere   o firmă sau un brand; birth_date poartă data înființării
--
-- Coloana e TEXT cu CHECK, nu un ENUM: un ENUM cere o migrație și un lock ca să
-- primească o valoare nouă, iar setul ăsta e făcut să crească.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'eu';

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_category_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_category_check
  CHECK (category IN ('eu', 'apropiat', 'copil', 'afacere'));

-- Numai o hartă a titularului poate fi cea activă. Profilul activ alimentează
-- /azi și prefill-urile din toată aplicația; dacă harta unui copil devine
-- activă, aplicația începe să arate previziunile copilului drept ale
-- utilizatorului, fără să spună nimănui că s-a schimbat ceva.
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_active_is_self_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_active_is_self_check
  CHECK (is_active = false OR category = 'eu');

CREATE INDEX IF NOT EXISTS idx_user_profiles_category
  ON user_profiles(user_id, category);

COMMENT ON COLUMN user_profiles.category IS
  'Ce fel de hartă e: eu | apropiat | copil | afacere. Orice altceva decât eu sunt datele altei persoane, ținute numai de acest utilizator.';
