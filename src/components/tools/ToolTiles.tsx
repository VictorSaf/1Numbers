import { ReactNode } from "react";

/**
 * Uneltele, ca lansator.
 *
 * Erau opt file într-o bandă: la 1280px se înfășurau pe două rânduri, la 390px
 * șase din opt cădeau în afara ecranului. Mai important, o filă spune „ești
 * aici, printre altele"; o unealtă e o destinație în sine, iar `/unelte` e un
 * hol cu opt uși, nu un document cu opt capitole.
 *
 * Ce le deosebește NU e opt chenare colorate -- exact decorul scos din restul
 * aplicației. E figura fiecăreia: un desen mic care arată ce PRODUCE unealta.
 * Grila calendarului, pătratul Lo Shu, cifrele care se repetă, curba anului.
 * Diversitatea poartă atunci informație, nu ornament.
 *
 * Anatomia e comună, ca grila să se citească drept un set: filet, figura,
 * titlu în Literata, un rând care spune ce primești.
 */

const FIG = "h-[92px] w-[168px] text-foreground/55";

/** Fiecare zi a lunii, cu cifra ei. */
const Calendar = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    {Array.from({ length: 28 }, (_, i) => {
      const x = 0 + (i % 7) * 23;
      const y = 10 + Math.floor(i / 7) * 20;
      const marcat = [3, 9, 16, 24].includes(i);
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="16"
          height="14"
          rx="1"
          className={marcat ? "fill-gilt/30 stroke-gilt" : "stroke-current"}
          strokeWidth="1.25"
        />
      );
    })}
  </svg>
);

/** Ce ai din belșug și ce lipsește, în pătratul chinezesc. */
const LoShu = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <g className="num" fontSize="17" textAnchor="middle" dominantBaseline="central">
      {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((n, i) => {
        const x = 14 + (i % 3) * 26;
        const y = 20 + Math.floor(i / 3) * 26;
        // Golul din pătrat e chiar produsul uneltei: cifra care îți lipsește.
        if (n === 7) return <circle key={i} cx={x} cy={y} r="7" className="stroke-current" strokeDasharray="2 3" strokeWidth="1" />;
        return (
          <text key={i} x={x} y={y} className={n === 5 ? "fill-gilt" : "fill-current"}>
            {n}
          </text>
        );
      })}
    </g>
    <rect x="1" y="7" width="78" height="78" className="stroke-current" strokeWidth="1.25" />
    <path d="M27 7v78M53 7v78M1 33h78M1 59h78" className="stroke-current" strokeWidth="1" opacity="0.45" />
  </svg>
);

/** Ce înseamnă cifrele care se repetă. */
const Angel = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <g className="num" dominantBaseline="central">
      <text x="0" y="16" fontSize="15" className="fill-current" textAnchor="start" opacity="0.7">111</text>
      <text x="0" y="46" fontSize="27" className="fill-gilt" textAnchor="start">444</text>
      <text x="0" y="78" fontSize="15" className="fill-current" textAnchor="start" opacity="0.7">777</text>
    </g>
  </svg>
);

/** Ce se schimbă dacă îți schimbi numele. */
const NameChange = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={`a${i}`} x={i * 18} y="10" width="14" height="18" className="stroke-current" strokeWidth="1.25" />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={`b${i}`} x={i * 18} y="58" width="14" height="18" className="stroke-gilt" strokeWidth="1.25" />
    ))}
    <path d="M43 33v20m0 0l-4.5-5.5m4.5 5.5l4.5-5.5" className="stroke-current" strokeWidth="1.25" />
    <g className="num" fontSize="15" dominantBaseline="central">
      <text x="102" y="19" className="fill-current">7</text>
      <text x="102" y="67" className="fill-gilt">3</text>
    </g>
  </svg>
);

/** Cifra unui nume de firmă, înainte s-o înregistrezi. */
const Business = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <rect x="1" y="9" width="128" height="68" className="stroke-current" strokeWidth="1.25" />
    <path d="M15 30h100" className="stroke-gilt" strokeWidth="1.25" />
    <path d="M15 42h72M15 51h86" className="stroke-current" strokeWidth="1.25" opacity="0.6" />
    <text x="65" y="66" className="num fill-gilt" fontSize="17" textAnchor="middle" dominantBaseline="central">
      8
    </text>
  </svg>
);

/** Anul care vine, lună cu lună. */
const Forecast = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <path d="M0 78h166" className="stroke-current" strokeWidth="1.25" opacity="0.7" />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M${4 + i * 14} 78v5`} className="stroke-current" strokeWidth="1.25" opacity="0.7" />
    ))}
    <path
      d="M4 62 18 53 32 60 46 40 60 47 74 27 88 34 102 21 116 30 130 14 144 23 158 8"
      className="stroke-gilt"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="158" cy="8" r="3.5" className="fill-gilt" />
  </svg>
);

/**
 * Uneltele cu mai multe școli au aceeași figură de bază: două sau trei răspunsuri
 * pe aceeași întrebare, cu distanța dintre ele trasă ca un filet. Ce diferă e
 * conținutul răspunsurilor — exact ce produce fiecare.
 */
const Answers = ({ values, mark }: { values: string[]; mark?: number }) => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <g className="num" fontSize="19" dominantBaseline="central">
      {values.map((v, i) => (
        <text key={i} x={i * 58} y="38" className={i === mark ? "fill-gilt" : "fill-current"}>
          {v}
        </text>
      ))}
    </g>
    {values.slice(1).map((_, i) => (
      <path key={i} d={`M${i * 58 + 4} 64h${54}`} className={i === 0 ? "stroke-gilt" : "stroke-current"} strokeWidth="1.25" />
    ))}
  </svg>
);

const House = () => <Answers values={["45C", "3", "9"]} mark={1} />;
const Phone = () => <Answers values={["168", "9", "8"]} mark={2} />;
const BabyName = () => <Answers values={["1", "3", "2"]} mark={0} />;
const Money = () => <Answers values={["2676", "6"]} mark={1} />;
const LifeCode = () => <Answers values={["35", "8", "25"]} mark={0} />;

/** Un interval de zile, cu cele alese de fiecare convenție. */
const EventDate = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    <path d="M0 46h166" className="stroke-current" strokeWidth="1.25" opacity="0.7" />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M${4 + i * 14} 40v12`} className="stroke-current" strokeWidth="1.25" opacity="0.5" />
    ))}
    {[2, 6, 9].map((i) => (
      <circle key={`a${i}`} cx={4 + i * 14} cy="26" r="3.5" className="fill-gilt" />
    ))}
    {[0, 6, 11].map((i) => (
      <circle key={`b${i}`} cx={4 + i * 14} cy="66" r="3.5" className="stroke-current" strokeWidth="1.25" />
    ))}
  </svg>
);

/** Anii fiecărei metode, pe o axă; unde cad împreună. */
const Turning = () => (
  <svg viewBox="0 0 168 92" className={FIG} fill="none" aria-hidden="true">
    {[20, 46, 72].map((y, row) => (
      <g key={y}>
        <path d={`M0 ${y}h166`} className="stroke-current" strokeWidth="1" opacity="0.4" />
        {[[30, 80, 130], [52, 80, 140], [40, 80, 120]][row].map((x) => (
          <path key={x} d={`M${x} ${y - 6}v12`} className={x === 80 ? "stroke-gilt" : "stroke-current"} strokeWidth="1.5" />
        ))}
      </g>
    ))}
  </svg>
);

export interface Tool {
  value: string;
  label: string;
  note: string;
}

const FIGURI: Record<string, () => ReactNode> = {
  calendar: Calendar,
  loshu: LoShu,
  angel: Angel,
  "name-change": NameChange,
  business: Business,
  forecast: Forecast,
  address: House,
  phone: Phone,
  "baby-name": BabyName,
  "money-code": Money,
  "life-code": LifeCode,
  "event-date": EventDate,
  "turning-years": Turning,
};

export const ToolTiles = ({
  tools,
  onOpen,
}: {
  tools: Tool[];
  onOpen: (value: string) => void;
}) => (
  <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    {tools.map((tool) => {
      const Figura = FIGURI[tool.value];
      return (
        <button
          key={tool.value}
          type="button"
          onClick={() => onOpen(tool.value)}
          className="group flex flex-col items-start border-t border-line pt-4 text-left transition-colors hover:border-gilt"
        >
          {/* Numele apare O SINGURĂ dată. Un rând mono cu aceeași etichetă
              deasupra titlului ar fi fost eticheta scrisă de două ori. */}
          <span className="w-full text-foreground transition-opacity group-hover:opacity-100 opacity-85">
            {Figura ? <Figura /> : null}
          </span>
          <span className="mt-5 font-heading text-lg leading-tight text-foreground">{tool.label}</span>
          <span className="mt-1.5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{tool.note}</span>
        </button>
      );
    })}
  </div>
);

export default ToolTiles;
