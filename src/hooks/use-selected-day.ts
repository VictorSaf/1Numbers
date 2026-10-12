import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { formatCalendarDate, parseCalendarDate } from "@/lib/calendarDate";
import { clampToHorizon } from "@/lib/dayHorizon";

/**
 * Care zi se citește pe `/azi`.
 *
 * În adresă, nu doar în stare, din trei motive: butonul "înapoi" al
 * browserului funcționează, o zi se poate trimite cuiva, iar notificarea de
 * dimineață are unde să ducă omul fără să inventeze o rută.
 *
 * `?zi=` vine din afară -- dintr-un link vechi, dintr-o notificare, dintr-o
 * bară de adresă. Se încadrează în orizont; nu se crede pe cuvânt.
 *
 * `/azi` fără parametru rămâne azi, iar întoarcerea pe azi scoate parametrul
 * în loc să-l lase pe valoarea zilei curente: adresa canonică a zilei de azi
 * e `/azi`, o singură formă, nu două.
 */
export const useSelectedDay = (today: Date) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get("zi");

  const selectedDay = useMemo(() => {
    const parsed = parseCalendarDate(asked);
    return parsed ? clampToHorizon(parsed, today) : today;
  }, [asked, today]);

  const selectDay = useCallback(
    (date: Date) => {
      const next = clampToHorizon(date, today);
      const search = new URLSearchParams(params);
      if (formatCalendarDate(next) === formatCalendarDate(today)) search.delete("zi");
      else search.set("zi", formatCalendarDate(next));
      setParams(search);
    },
    [params, setParams, today],
  );

  return { selectedDay, selectDay };
};
