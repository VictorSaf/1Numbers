/**
 * Cele două secvențe a căror semnificație NU se poate deriva din cifrele lor.
 *
 * Testul de admitere: nota trebuie să spună ceva ce nicio ramă de formă și
 * niciun arhetip nu poate produce. Trec două. 1234 nu trece — sensul lui vine
 * din forma ascendentă, care e o ramă. „777 aduce noroc" nu trece — e o glosă
 * populară peste arhetipul lui 7, nu o informație în plus.
 *
 * Nota se adaugă ÎNAINTEA textului compus, nu în locul lui: dacă arhetipul lui
 * 6 se schimbă, 666 se actualizează ca toate celelalte.
 */

import type { Lang } from "@/lib/numerology-plus";

export const CULTURAL_NOTES: Record<string, Record<Lang, string>> = {
  "666": {
    ro: "Înainte de orice altceva: 666 nu e numărul răului. Asocierea vine dintr-un singur verset din Apocalipsă, scris despre un împărat roman, iar în cele mai vechi manuscrise cifra e 616. În numerologie, șase e cifra grijii și a responsabilității față de casă, și nimic din ea nu se schimbă pentru că apare de trei ori.",
    en: "Before anything else: 666 is not the number of evil. The association comes from a single verse in Revelation, written about a Roman emperor, and in the oldest manuscripts the figure is 616. In numerology six is the digit of care and of responsibility toward the home, and nothing about it changes because it appears three times.",
    ru: "Прежде всего: 666 — не число зла. Ассоциация идёт из одного стиха Откровения, написанного о римском императоре, а в древнейших рукописях там стоит 616. В нумерологии шесть — цифра заботы и ответственности за дом, и ничего в ней не меняется оттого, что она появляется трижды.",
  },
  "1111": {
    ro: "Dintre toate secvențele, 1111 e singura cu o poveste proprie, independentă de numerologie: obiceiul de a-ți pune o dorință când ceasul arată 11:11. Nu e o tradiție veche — s-a răspândit odată cu ceasurile digitale, în anii optzeci. Merită știut, pentru că explică de ce vezi 1111 mai des decât alte secvențe: e singura pe care destui oameni o caută activ pe ecran.",
    en: "Of all the sequences, 1111 is the only one with a story of its own, independent of numerology: the habit of making a wish when the clock reads 11:11. It is not an old tradition — it spread with digital clocks, in the eighties. It is worth knowing, because it explains why you see 1111 more often than other sequences: it is the one enough people actively watch the screen for.",
    ru: "Из всех последовательностей 1111 — единственная со своей историей, независимой от нумерологии: привычка загадывать желание, когда часы показывают 11:11. Это не древняя традиция — она распространилась вместе с электронными часами, в восьмидесятые. Это стоит знать: именно этим объясняется, почему 1111 попадается чаще других — её достаточно многие целенаправленно высматривают на экране.",
  },
};
