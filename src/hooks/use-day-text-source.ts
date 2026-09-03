import { useCallback, useEffect, useState } from "react";

/**
 * Cine scrie textul zilei: un model, sau chiar aplicația.
 *
 * Calea compusă local exista deja în `Today.tsx`, dar numai ca plan B pentru
 * erori -- invizibilă, și doar când serverul cădea. Aici devine o alegere.
 *
 * Contează dincolo de preferință: pe `model` pleacă spre un furnizor extern
 * propozițiile compuse din harta omului. Cine nu vrea asta trebuie să aibă
 * unde spune, iar aplicația trebuie să rămână întreagă când o spune.
 *
 * Stă în `localStorage` deocamdată, deci nu călătorește între dispozitive.
 * La sarcina 2.5 se mută în tabelul de consimțăminte, unde îi e locul: un
 * acord care trăiește într-un browser nu e un acord pe care îl poți dovedi.
 * Există ca hook tocmai ca mutarea aia să fie un singur fișier.
 */

export type DayTextSource = "model" | "local";

const KEY = "day-text-source";

const read = (): DayTextSource => {
  try {
    return localStorage.getItem(KEY) === "local" ? "local" : "model";
  } catch {
    // Fereastră privată, stocare blocată. Implicit rămâne `model`.
    return "model";
  }
};

export const useDayTextSource = (): [DayTextSource, (next: DayTextSource) => void] => {
  const [source, setSource] = useState<DayTextSource>(read);

  // Alte file ale aceleiași aplicații: preferința e a omului, nu a filei.
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === KEY) setSource(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const choose = useCallback((next: DayTextSource) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Nu se poate ține minte, dar alegerea funcționează în sesiunea asta.
    }
    setSource(next);
  }, []);

  return [source, choose];
};
