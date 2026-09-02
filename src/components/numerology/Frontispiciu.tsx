import { ReactNode, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildDial, type DialLang } from "@/lib/dial";
import { dialThesis } from "@/lib/thesis";
import { Dial } from "@/components/numerology/Dial";
import { ARCANA_BY_N } from "@/lib/numerology-plus/content/arcana";
import { NAVAGRAHA } from "@/lib/numerology-plus/systems";
import { NAVAGRAHA_I18N } from "@/lib/numerology-plus/content/navagraha-i18n";

/**
 * Capul hărții: figura, propoziția, și ce ține de cifra care adună.
 *
 * Ce era înainte aici: o insignă „Profilul tău", numele, un subtitlu, și trei
 * butoane. Adică antetul unui document -- nimic din el nu spunea nimic despre
 * omul care tocmai își deschisese harta, și pagina intra direct în material de
 * referință.
 *
 * Placa e închisă în ambele teme, deliberat. E un obiect fotografiat, iar o
 * fotografie nu se inversează când omul trece pe temă deschisă. Tokenii
 * `--plate-*` există tocmai ca asta să fie o decizie scrisă, nu o scăpare.
 */

interface Copy {
  kicker: string;
  belongs: string;
  arcana: string;
  planet: string;
  day: string;
  gem: string;
}

const COPY: Record<DialLang, Copy> = {
  ro: { kicker: "harta ta", belongs: "ce ține de", arcana: "arcana", planet: "planeta", day: "ziua", gem: "piatra" },
  en: { kicker: "your map", belongs: "what belongs to", arcana: "arcana", planet: "planet", day: "day", gem: "stone" },
  ru: { kicker: "ваша карта", belongs: "что относится к", arcana: "аркан", planet: "планета", day: "день", gem: "камень" },
};

export const Frontispiciu = ({
  fullName,
  birthDate,
  actions,
}: {
  fullName: string;
  birthDate: Date;
  actions?: ReactNode;
}) => {
  const { language } = useLanguage();
  const lang = (language in COPY ? language : "ro") as DialLang;
  const copy = COPY[lang];

  const figure = useMemo(() => buildDial(fullName, birthDate, lang), [fullName, birthDate, lang]);
  const thesis = useMemo(() => dialThesis(figure, lang), [figure, lang]);

  // Cifra care adună harta e cea care merită arcana și planeta. La egalitate,
  // prima de pe inel -- oricum e o alegere între lucruri la fel de adevărate.
  const dominant = [...figure.points].sort((a, b) => b.weight - a.weight)[0];
  const n = dominant?.n ?? 1;
  const arcana = ARCANA_BY_N[n];
  // Planeta, ziua și piatra vin din tabelul tradus. `NAVAGRAHA` le are numai
  // în română: pe pagina engleză ar fi scris „safir galben" sub „stone".
  // Sanscrita vine tot de acolo -- Guru e Guru în orice limbă.
  const graha = NAVAGRAHA_I18N[lang]?.[n];
  const sanskrit = NAVAGRAHA[n]?.sanskrit;

  const born = birthDate.toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "ro-RO");

  return (
    <section className="relative overflow-hidden rounded-2xl bg-plate">
      <div className="plate-sky" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-12 lg:py-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-plate-gilt-dim" />
            <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-plate-gilt">
              {copy.kicker}
            </span>
            <span className="num text-[0.7rem] text-plate-muted">{born}</span>
          </div>

          <h2 className="mt-4 font-heading text-3xl leading-[1.08] text-plate-ink sm:text-4xl lg:text-5xl">
            {fullName}
          </h2>

          <div className="mt-5 h-px bg-gradient-to-r from-plate-gilt-dim to-transparent" />

          <p className="mt-5 max-w-lg font-heading text-lg leading-relaxed text-plate-ink sm:text-xl lg:text-[1.45rem]">
            {thesis.lead}
          </p>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-plate-muted sm:text-[0.95rem]">
            {thesis.note}
          </p>

          {/* Cifra are arcană, planetă, zi și piatră. Erau toate în motor, la
              Matrița Destinului și la vedic -- adică la capitolul șase, unde
              nimeni nu ajungea cu ele în minte. */}
          {arcana && (
            <div className="mt-7 flex items-start gap-5">
              <img
                src={`/tarot/${n}.jpg`}
                alt={arcana.title[lang]}
                width={86}
                height={147}
                loading="lazy"
                decoding="async"
                className="w-[76px] shrink-0 rounded-md border border-plate-gilt-dim shadow-[0_12px_28px_-14px_rgba(0,0,0,.9)] sm:w-[86px]"
              />
              <dl className="min-w-0 space-y-1.5 text-sm">
                <div className="num mb-2.5 text-[0.6rem] uppercase tracking-[0.18em] text-plate-gilt-dim">
                  {copy.belongs} {dominant?.master ?? n}
                </div>
                {[
                  [copy.arcana, arcana.title[lang]],
                  graha && [copy.planet, sanskrit ? `${graha.planet} · ${sanskrit}` : graha.planet],
                  graha && graha.day !== null && [copy.day, graha.day],
                  graha && [copy.gem, graha.gem],
                ]
                  .filter((row): row is [string, string] => Array.isArray(row))
                  .map(([label, value]) => (
                    <div key={label} className="flex gap-2.5">
                      <dt className="num w-14 shrink-0 text-[0.65rem] uppercase tracking-wider text-plate-gilt">
                        {label}
                      </dt>
                      <dd className="min-w-0 text-plate-ink/85">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {actions && <div className="mt-8 flex flex-wrap items-center gap-2.5">{actions}</div>}
        </div>

        {/* Aceeași figură, două proporții: pe telefon inelul stă mai strâns și
            literele sunt mai mari relativ la el, altfel numele ar avea 6px. */}
        {/* Ascunderea stă pe ÎNVELIȘ, nu pe svg: componenta pune
            `display: block` ca stil inline, iar un stil inline bate orice
            clasă -- `hidden` n-avea nicio putere și se vedeau amândouă. */}
        <div className="order-first lg:order-none">
          <div className="hidden w-full lg:block">
            <Dial figure={figure} size="plate" />
          </div>
          <div className="mx-auto w-full max-w-[340px] lg:hidden">
            <Dial figure={figure} size="phone" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Frontispiciu;
