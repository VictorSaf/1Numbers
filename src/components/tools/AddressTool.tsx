import { useMemo, useState } from "react";
import { addressSchools, type AddressSchoolId } from "@/lib/tools/address";
import { Field, SchoolsCompare, ToolBlock } from "./SchoolsCompare";
import { useToolLang, type Lang } from "./toolLang";

const COPY: Record<Lang, {
  title: string; lede: string; building: string; apartment: string; apartmentHint: string;
  schools: Record<AddressSchoolId, { label: string; method: string }>;
  chinese: string; chineseLede: string; score: string; four: string; eight: string; none: string; seq: string;
  unitLabel: string; buildingLabel: string;
}> = {
  ro: {
    title: "Numărul casei",
    lede: "Aceeași adresă, citită de mai multe școli. Unde dau cifre diferite, diferența e informația.",
    building: "Numărul clădirii",
    apartment: "Apartamentul (opțional)",
    apartmentHint: "La bloc, cele mai multe surse citesc apartamentul, nu blocul.",
    schools: {
      "pyth-unit": { label: "Pitagoreic — locuința ta", method: "Apartamentul dacă există, altfel clădirea; literele cu valoarea pitagoreică." },
      "pyth-building": { label: "Pitagoreic — clădirea", method: "Numărul blocului, pe care îl împarți cu toți vecinii." },
      "unit-digits": { label: "Doar cifrele", method: "Litera din număr (12B) se ignoră." },
      "chaldean-unit": { label: "Caldeean (Cheiro)", method: "Aceeași unitate, literele pe tabelul caldeean." },
    },
    chinese: "Homofonele chinezești",
    chineseLede: "Altă scară: nu reduce nimic, ascultă cum sună cifrele. 4 ≈ „moarte”, 8 ≈ „prosperitate”. N-are distanță față de cifrele de mai sus.",
    score: "scor", four: "conține 4", eight: "conține 8", none: "fără 4 și fără 8", seq: "secvențe norocoase",
    unitLabel: "locuința", buildingLabel: "clădirea",
  },
  en: {
    title: "House number",
    lede: "One address, read by several schools. Where they give different digits, the difference is the information.",
    building: "Building number",
    apartment: "Apartment (optional)",
    apartmentHint: "In a block, most sources read the apartment, not the building.",
    schools: {
      "pyth-unit": { label: "Pythagorean — your home", method: "The apartment if there is one, otherwise the building; letters at their Pythagorean value." },
      "pyth-building": { label: "Pythagorean — the building", method: "The building number, shared with every neighbour." },
      "unit-digits": { label: "Digits only", method: "A letter in the number (12B) is ignored." },
      "chaldean-unit": { label: "Chaldean (Cheiro)", method: "The same home, letters on the Chaldean table." },
    },
    chinese: "Chinese homophones",
    chineseLede: "A different scale: it reduces nothing, it listens to how the digits sound. 4 ≈ \"death\", 8 ≈ \"prosperity\". It has no distance to the digits above.",
    score: "score", four: "contains 4", eight: "contains 8", none: "no 4 and no 8", seq: "lucky sequences",
    unitLabel: "home", buildingLabel: "building",
  },
  ru: {
    title: "Номер дома",
    lede: "Один адрес в прочтении нескольких школ. Где цифры расходятся, расхождение и есть информация.",
    building: "Номер дома",
    apartment: "Квартира (необязательно)",
    apartmentHint: "В многоквартирном доме большинство источников читает квартиру, а не дом.",
    schools: {
      "pyth-unit": { label: "Пифагорейская — ваше жильё", method: "Квартира, если есть, иначе дом; буквы по пифагорейской таблице." },
      "pyth-building": { label: "Пифагорейская — дом", method: "Номер дома, общий со всеми соседями." },
      "unit-digits": { label: "Только цифры", method: "Буква в номере (12Б) не учитывается." },
      "chaldean-unit": { label: "Халдейская (Хейро)", method: "То же жильё, буквы по халдейской таблице." },
    },
    chinese: "Китайские омофоны",
    chineseLede: "Другая шкала: ничего не сводит, слушает звучание цифр. 4 ≈ «смерть», 8 ≈ «процветание». Расстояния до цифр выше у неё нет.",
    score: "балл", four: "есть 4", eight: "есть 8", none: "нет ни 4, ни 8", seq: "счастливые последовательности",
    unitLabel: "жильё", buildingLabel: "дом",
  },
};

const AddressTool = () => {
  const lang = useToolLang();
  const t = COPY[lang];
  const [building, setBuilding] = useState("");
  const [apartment, setApartment] = useState("");

  const r = useMemo(
    () => (/\d/.test(building) || /\d/.test(apartment) ? addressSchools({ building, apartment }) : null),
    [building, apartment],
  );

  const homophones = r
    ? [
        { key: "unit", label: t.unitLabel, h: r.homophone.unit },
        ...(r.homophone.building ? [{ key: "building", label: t.buildingLabel, h: r.homophone.building }] : []),
      ]
    : [];

  return (
    <div data-testid="tool-address" className="space-y-10">
      <ToolBlock title={t.title} lede={t.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="addr-building" label={t.building} value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="12B" />
          <Field id="addr-apartment" label={t.apartment} hint={t.apartmentHint} value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="45" />
        </div>
        {r && (
          <SchoolsCompare
            rows={r.models.map((m) => ({ id: m.id, ...t.schools[m.id], value: m.value, steps: m.steps }))}
            pairs={r.pairs}
            verdict={r.verdict}
            spread={r.spread}
          />
        )}
      </ToolBlock>

      {r && (
        <ToolBlock title={t.chinese} lede={t.chineseLede}>
          <div data-homophone className="grid gap-6 sm:grid-cols-2">
            {homophones.map(({ key, label, h }) => (
              <div key={key} className={`border-t pt-4 ${h.has4 && !h.has8 ? "border-tension" : h.has8 && !h.has4 ? "border-harmony" : "border-line"}`}>
                <div className="flex items-baseline gap-3">
                  <span className="num text-2xl text-primary">{h.digits || "—"}</span>
                  <span className="text-sm text-foreground/90">{label}</span>
                </div>
                <p className="num mt-1.5 text-xs text-muted-foreground">
                  {t.score} {h.score} · {[h.has4 && t.four, h.has8 && t.eight].filter(Boolean).join(" · ") || t.none}
                  {h.sequences.length > 0 && ` · ${t.seq}: ${h.sequences.join(", ")}`}
                </p>
              </div>
            ))}
          </div>
        </ToolBlock>
      )}
    </div>
  );
};

export default AddressTool;
