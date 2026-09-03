-- Momentul ultimei schimbări de parolă, ca să putem deconecta de peste tot.
--
-- Emailul de resetare promite: „după ce îl folosești, te deconectăm de pe toate
-- dispozitivele". Promisiunea are nevoie de asta ca s-o poată ține.
--
-- JWT-ul e semnat pe șapte zile și nu există logout pe server: cine ți-a furat
-- parola și s-a autentificat rămâne autentificat o săptămână după ce ți-o
-- schimbi. Adică exact scenariul pentru care omul cere resetarea.
--
-- Cum se rezolvă: fiecare JWT poartă deja `iat`. Middleware-ul compară `iat` cu
-- valoarea de aici și refuză jetoanele emise ÎNAINTE de ultima schimbare.
--
-- Costul: o citire după cheia primară la fiecare cerere autentificată. E o
-- schimbare reală pe calea fierbinte și merită spusă, nu ascunsă -- dar
-- alternativa e ca „te-am deconectat de peste tot" să fie o minciună.
--
-- Implicit `now()` pentru rândurile existente, nu NULL: un cont creat înainte de
-- migrația asta n-a avut parola schimbată niciodată, iar `now()` invalidează
-- sesiunile deschise acum. Trei conturi, toate ale noastre. Pe o bază cu
-- utilizatori reali s-ar fi pus `created_at`, ca să nu deconectăm pe nimeni
-- pentru o migrație.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
