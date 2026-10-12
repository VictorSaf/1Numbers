import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";

/**
 * Cine scrie textul zilei: un model, sau chiar aplicația.
 *
 * Nu e o setare de aspect. Pe `model`, propozițiile compuse din harta omului
 * pleacă spre un furnizor extern -- deci alegerea asta ESTE consimțământul din
 * politica de confidențialitate, iar aplicația trebuie să rămână întreagă când
 * omul spune nu.
 *
 * De aceea are două case:
 *
 *   cu cont     -- tabelul `user_consents`, care e un jurnal: fiecare acordare
 *                  și fiecare retragere e un rând, cu versiunea politicii. GDPR
 *                  cere să poți DEMONSTRA acordul, iar o valoare care trăiește
 *                  într-un browser nu demonstrează nimic.
 *   fără cont   -- localStorage, fiindcă nu există pe cine să legăm dovada. Tot
 *                  o alegere reală, doar că a browserului, nu a omului.
 *
 * Implicit e `model` doar pentru vizitatorul fără cont, unde nimic personal nu
 * e salvat oricum. Pentru un cont, lipsa unui rând înseamnă „n-a fost întrebat”,
 * iar atunci nu presupunem acordul: se așteaptă răspunsul.
 */

export type DayTextSource = "model" | "local";

const KEY = "day-text-source";

const readLocal = (): DayTextSource => {
  try {
    return localStorage.getItem(KEY) === "local" ? "local" : "model";
  } catch {
    return "model";
  }
};

const writeLocal = (next: DayTextSource) => {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Fereastră privată. Alegerea ține sesiunea asta.
  }
};

export const useDayTextSource = (): [DayTextSource, (next: DayTextSource) => void] => {
  /**
   * Are nevoie de un singur lucru -- există jeton? -- nu de tot contextul de
   * autentificare. Legat de context, hook-ul ar fi cerut un `AuthProvider` în
   * orice test care randează ziua, deși nu are nimic de-a face cu el.
   */
  const token = api.getToken();
  const [source, setSource] = useState<DayTextSource>(readLocal);

  // Cu cont, adevărul e pe server. Localul rămâne oglindă, ca pagina să nu
  // pâlpâie până sosește răspunsul.
  useEffect(() => {
    if (!token) {
      setSource(readLocal());
      return;
    }
    let alive = true;
    api
      .getConsents()
      .then((r) => {
        if (!alive) return;
        const acordat = r.consents.model;
        // `undefined` = niciodată întrebat. Nu se presupune acordul.
        const next: DayTextSource = acordat === true ? "model" : "local";
        setSource(next);
        writeLocal(next);
      })
      .catch(() => {
        // Serverul nu răspunde. Rămâne ce știe browserul, fără să inventăm un
        // acord pe care nu l-am citit.
      });
    return () => { alive = false; };
  }, [token]);

  const choose = useCallback(
    (next: DayTextSource) => {
      setSource(next);
      writeLocal(next);
      if (token) {
        void api.setConsent("model", next === "model").catch(() => {
          // Dacă scrierea nu reușește, alegerea rămâne locală pentru sesiune,
          // dar nu pretindem că e înregistrată.
        });
      }
    },
    [token],
  );

  return [source, choose];
};
