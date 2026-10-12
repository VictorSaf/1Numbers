-- Jetoane semnate pentru acțiuni care trec prin email.
--
-- Un singur tabel pentru trei acțiuni -- verificarea adresei, resetarea parolei
-- și confirmarea ștergerii -- fiindcă toate au aceeași formă: un secret trimis
-- pe email, valabil puțin, folosit o dată.
--
-- Se ține HASH-ul, nu jetonul. Cine citește baza nu trebuie să poată intra în
-- conturi: un tabel cu jetoane în clar e o listă de chei de resetare pentru toți
-- utilizatorii care au cerut una în ultima oră. SHA-256 e destul aici -- jetonul
-- e aleator pe 32 de octeți și trăiește 30 de minute, deci nu are ce dicționar
-- să-l atace, spre deosebire de o parolă aleasă de om.
--
-- `used_at` există separat de ștergere ca să putem deosebi un link folosit de
-- unul expirat: omul care apasă a doua oară pe același link merită „l-ai
-- folosit deja”, nu „link invalid”.
--
-- Numerotare: 011 lipsește din secvență de dinaintea acestei migrații, iar 010
-- e luat de notification_dispatch. Următorul liber e 015.

CREATE TABLE IF NOT EXISTS auth_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Ce deblochează jetonul. CHECK, nu ENUM: un fel nou se adaugă cu o migrație
  -- de o linie, iar valorile rămân citibile într-un SELECT.
  kind       TEXT NOT NULL CHECK (kind IN ('verify_email', 'reset_password', 'delete_account')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at    TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Căutarea la validare se face DOAR după hash, niciodată după user_id: cine
-- prezintă jetonul nu spune încă cine e.
CREATE INDEX IF NOT EXISTS auth_tokens_hash_idx ON auth_tokens (token_hash);

-- Pentru limitarea de rată și pentru curățenie: câte cereri de un fel a făcut
-- un om în ultimul interval.
CREATE INDEX IF NOT EXISTS auth_tokens_user_kind_idx ON auth_tokens (user_id, kind, created_at DESC);

-- Adresa confirmată. NULL înseamnă neconfirmată -- inclusiv pentru conturile
-- care existau înainte de migrația asta, ceea ce e corect: n-am cerut nimănui
-- să confirme până acum, deci nimeni n-a confirmat.
--
-- Nu blochează folosirea aplicației. Blochează doar notificările, fiindcă
-- altfel am trimite mesaje unei adrese care poate nu-i aparține celui care a
-- scris-o.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
