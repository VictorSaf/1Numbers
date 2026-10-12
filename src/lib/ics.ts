/**
 * Zilele personale, ca fișier de calendar (.ics), generat în browser.
 *
 * Nimic nu pleacă din pagină: fișierul se construiește aici și se descarcă.
 * Ziua personală depinde de când începe anul personal — 1 ianuarie (Decoz) sau
 * ziua ta (școala kabbalistică). Unde cele două dau altă zi, evenimentul le
 * poartă pe amândouă; nu alegem una în tăcere (R9).
 */

import { personalYear, personalMonth, personalDay } from "@/lib/numerology-plus/pythagorean";
import type { BirthDate } from "@/lib/numerology-plus/core";

export type IcsLang = "ro" | "en" | "ru";

const LABEL: Record<IcsLang, { day: string; jan: string; bday: string; cal: string }> = {
  ro: { day: "Ziua personală", jan: "anul de la 1 ianuarie", bday: "anul de la aniversare", cal: "Zilele personale" },
  en: { day: "Personal day", jan: "year from 1 January", bday: "year from your birthday", cal: "Personal days" },
  ru: { day: "Личный день", jan: "год с 1 января", bday: "год со дня рождения", cal: "Личные дни" },
};

export interface DayPair {
  date: Date;
  jan: number;
  birthday: number;
}

/** Ziua personală în ambele convenții pentru fiecare zi din interval. */
export function personalDays(b: BirthDate, from: Date, days: number): DayPair[] {
  const out: DayPair[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const passed = m > b.month || (m === b.month && d.getDate() >= b.day);
    const jan = personalDay(personalMonth(personalYear(b, y), m), d.getDate()).value;
    const bd = personalDay(personalMonth(personalYear(b, passed ? y : y - 1), m), d.getDate()).value;
    out.push({ date: d, jan, birthday: bd });
  }
  return out;
}

const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** RFC 5545: rânduri CRLF, evenimente pe toată ziua (DTEND exclusiv). */
export function buildIcs(b: BirthDate, from: Date, days: number, lang: IcsLang = "ro", stamp = new Date()): string {
  const t = LABEL[lang];
  const dtstamp = `${ymd(stamp)}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Numerology Compass//personal days//RO",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${t.cal}`,
  ];
  for (const p of personalDays(b, from, days)) {
    const next = new Date(p.date.getFullYear(), p.date.getMonth(), p.date.getDate() + 1);
    const summary = p.jan === p.birthday ? `${t.day} ${p.jan}` : `${t.day} ${p.jan} / ${p.birthday}`;
    const desc = p.jan === p.birthday ? "" : `${p.jan}: ${t.jan}\\n${p.birthday}: ${t.bday}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:pd-${ymd(p.date)}@numerology-compass`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${ymd(p.date)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:${summary}`,
      ...(desc ? [`DESCRIPTION:${desc}`] : []),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/**
 * Ora personală — „Hourly vibration" din Ai Numerology. Formula nu e publicată;
 * două convenții plauzibile [neconfirmat]: ziua personală + ora pe ceasul de
 * 24 de ore, sau pe cel de 12.
 */
export function personalHours(pd: number) {
  const r = (n: number) => { let x = n; while (x > 9) x = String(x).split("").reduce((a, c) => a + Number(c), 0); return x; };
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    h24: r(pd + h) || 9,
    h12: r(pd + (h % 12 || 12)),
  }));
}
