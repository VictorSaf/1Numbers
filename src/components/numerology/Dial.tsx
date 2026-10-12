import { dialPosition, type DialFigure } from "@/lib/dial";

/**
 * Cadranul: cele nouă cifre pe un cerc, ale tale aprinse.
 *
 * Aceeași figură la trei mărimi. `plate` e frontispiciul, `phone` e el pe
 * telefon, `echo` e versiunea mică ce revine în capitolele 2 și 3 -- acolo unde
 * textul vorbește despre coardă sau despre goluri, figura e chiar subiectul,
 * nu decorul, deci merită repetată.
 *
 * Culorile vin din tokenii `--plate-*`, care NU urmează tema. Placa e un obiect
 * fotografiat, iar o fotografie nu se inversează când omul trece pe temă
 * deschisă. Vezi comentariul din index.css.
 *
 * Lățimea vine din înveliș: `<div className="w-[128px]"><Dial …/></div>`.
 * Componenta nu-și pune width inline tocmai ca învelișul să poată hotărî.
 *
 * Pe cadran nu se folosește `--warn`. O cifră care lipsește e o absență, nu o
 * alarmă: se desenează ca inel gol. (Alama e la nuanța 46 tocmai ca să nu intre
 * peste warn, care e la 34 -- la 42 cele două citeau la fel.)
 */

type Size = "plate" | "echo" | "phone";

const SIZES: Record<Size, {
  box: number; ring: number; seat: number; dot: number;
  font: number; labels: boolean; octagram: boolean;
}> = {
  // Inelul stă mai strâns decât cutia, ca numele să încapă în afara lui.
  plate: { box: 560, ring: 180, seat: 30, dot: 4, font: 27, labels: true, octagram: true },
  phone: { box: 330, ring: 100, seat: 21, dot: 3, font: 19, labels: true, octagram: true },
  // La 200px, o etichetă ar avea 7px. Figura rămâne, cuvintele pleacă -- textul
  // de lângă ea spune oricum același lucru.
  echo: { box: 200, ring: 82, seat: 17, dot: 2.5, font: 15, labels: false, octagram: false },
};

/** Cât de mare e punctul. Greutatea se vede, altfel figura ascunde tocmai
 *  lucrul pentru care există: că trei numere cad în același loc. */
const seatRadius = (base: number, weight: number) => base * (1 + Math.min(weight - 1, 3) * 0.13);

export const Dial = ({
  figure,
  size = "plate",
  className,
}: {
  figure: DialFigure;
  size?: Size;
  className?: string;
}) => {
  const s = SIZES[size];
  const c = s.box / 2;
  const at = (n: number, radius = s.ring) => {
    const p = dialPosition(n);
    return { x: c + p.x * radius, y: c + p.y * radius };
  };

  const occupied = new Map(figure.points.map((p) => [p.n, p]));
  // Capătul care se aprinde e cel mai ușor: excepția, nu grămada. La greutate
  // egală, capătul dinspre care e numită puntea.
  const outlier = figure.chord
    ? [figure.chord.from, figure.chord.to].sort(
        (x, z) => (occupied.get(x)?.weight ?? 0) - (occupied.get(z)?.weight ?? 0),
      )[0]
    : null;

  const missing = new Set(figure.missing);
  const idle = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !occupied.has(n) && !missing.has(n));

  const square = (turn: number) =>
    [0, 1, 2, 3]
      .map((k) => {
        const a = ((-90 + turn + k * 90) * Math.PI) / 180;
        const r = s.ring * 0.673;
        return `${(c + Math.cos(a) * r).toFixed(1)},${(c + Math.sin(a) * r).toFixed(1)}`;
      })
      .join(" ");

  const said = [
    figure.points.map((p) => `${p.master ?? p.n} — ${p.labels.join(", ")}`).join("; "),
    figure.chord &&
      `distanță de ${figure.chord.distance} între ${figure.chord.fromLabel} și ${figure.chord.toLabel}`,
    figure.missing.length > 0 && `lipsesc ${figure.missing.join(" și ")}`,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <svg
      viewBox={`0 0 ${s.box} ${s.box}`}
      role="img"
      aria-label={said}
      className={className}
      /* Doar `display`. Lățimea o dă ÎNVELIȘUL, nu componenta: un
         `width: 100%` scris aici e stil inline, iar un stil inline bate orice
         clasă -- un `w-[128px]` pus de consumator n-ar avea nicio putere.
         Aceeași capcană a ascuns cadranul de telefon sub cel de desktop. */
      style={{ display: "block" }}
    >
      <circle
        cx={c} cy={c} r={s.ring} fill="none"
        className="stroke-plate-gilt-dim" strokeWidth={size === "echo" ? 0.75 : 1}
      />
      {s.octagram && (
        <>
          <circle cx={c} cy={c} r={s.ring + 8} fill="none" className="stroke-plate-gilt-dim" strokeWidth={0.5} opacity={0.6} />
          <polygon points={square(0)} fill="none" className="stroke-plate-gilt-dim" strokeWidth={0.75} opacity={0.75} />
          <polygon points={square(45)} fill="none" className="stroke-plate-gilt-dim" strokeWidth={0.75} opacity={0.75} />
        </>
      )}

      {/* Coarda trece prin mijloc, fiindcă asta face și în viața omului:
          distanța dintre două numere se traversează, nu se ocolește. */}
      {figure.chord &&
        (() => {
          const a = at(figure.chord.from);
          const b = at(figure.chord.to);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          // Cu cât puntea e mai largă, cu atât coarda se lasă mai spre centru --
          // dar niciodată dincolo de el: la distanța maximă trece exact prin
          // mijlocul cadranului, ceea ce e chiar înțelesul figurii.
          const sag = Math.min(figure.chord.distance / 8, 1);
          const ctrl = { x: mid.x + (c - mid.x) * sag, y: mid.y + (c - mid.y) * sag };
          // Vârful unei pătratice stă la jumătatea drumului dintre mijlocul
          // coardei și control, nu pe control. Eticheta pusă pe control ateriza
          // la câțiva zeci de pixeli de linia pe care o descrie.
          const apex = { x: (a.x + 2 * ctrl.x + b.x) / 4, y: (a.y + 2 * ctrl.y + b.y) / 4 };
          return (
            <g data-chord={figure.chord.distance}>
              <path
                d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`}
                fill="none" className="stroke-plate-tension"
                strokeWidth={size === "echo" ? 1.1 : 1.25}
                strokeDasharray="1 5" strokeLinecap="round"
              />
              <text
                x={apex.x} y={apex.y + s.font * 0.16} textAnchor="middle"
                className="num fill-plate-tension" fontSize={s.font * 0.5}
              >
                {figure.chord.distance}
              </text>
            </g>
          );
        })()}

      {idle.map((n) => {
        const p = at(n);
        return <circle key={n} cx={p.x} cy={p.y} r={s.dot} className="fill-plate-gilt-dim" />;
      })}

      {[...missing].map((n) => {
        const p = at(n);
        return (
          <g key={n} data-missing={n}>
            <circle
              cx={p.x} cy={p.y} r={s.seat * 0.5} fill="none"
              className="stroke-plate-muted" strokeWidth={1}
              strokeDasharray="3 4" opacity={0.7}
            />
            <text
              x={p.x} y={p.y + s.font * 0.2} textAnchor="middle"
              className="num fill-plate-muted" fontSize={s.font * 0.5}
            >
              {n}
            </text>
          </g>
        );
      })}

      {figure.points.map((p) => {
        const pos = at(p.n);
        const r = seatRadius(s.seat, p.weight);
        const lit = p.n === outlier;
        const u = dialPosition(p.n);
        // Blocul de nume se ancorează după unde stă punctul pe cerc: sus urcă,
        // jos coboară, pe laterale se centrează pe rând și fuge în afară.
        // Centrat mereu, textul unui punct de la ora 3 călărea cercul; iar două
        // nume pe un rând („DRUM · DESTIN") ieșeau din cadru.
        const side = Math.abs(u.x) >= 0.35;
        const anchor = side ? (u.x > 0 ? "start" : "end") : "middle";
        const out = at(p.n, s.ring + r + s.font * 0.42);
        const lh = s.font * 0.44;
        const top = side
          ? -((p.short.length - 1) * lh) / 2 + s.font * 0.12
          : u.y < 0
            ? -p.short.length * lh
            : s.font * 0.42;

        return (
          <g key={p.n}>
            <circle
              cx={pos.x} cy={pos.y} r={r * 1.5}
              className={lit ? "fill-plate-tension" : "fill-plate-gilt"} opacity={0.1}
            />
            <circle
              data-seat={p.n} data-weight={p.weight}
              cx={pos.x} cy={pos.y} r={r}
              className={`fill-plate-2 ${lit ? "stroke-plate-tension" : "stroke-plate-gilt"}`}
              strokeWidth={1.25}
            />
            <text
              x={pos.x} y={pos.y + s.font * 0.34} textAnchor="middle"
              className={`num ${lit ? "fill-plate-tension" : "fill-plate-gilt-hi"}`}
              fontSize={p.master ? s.font * 0.78 : s.font}
            >
              {p.master ?? p.n}
            </text>
            {s.labels &&
              p.short.map((name, i) => (
                <text
                  key={name}
                  x={out.x + (side ? (u.x > 0 ? s.font * 0.18 : -s.font * 0.18) : 0)}
                  y={out.y + top + i * lh}
                  textAnchor={anchor}
                  className={`num ${lit ? "fill-plate-tension" : "fill-plate-gilt"}`}
                  fontSize={s.font * 0.34}
                  letterSpacing="1.2"
                >
                  {name}
                </text>
              ))}
          </g>
        );
      })}
    </svg>
  );
};

export default Dial;
