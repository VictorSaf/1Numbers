/**
 * Ramele de tipar — ce înseamnă FORMA unei secvențe, independent de cifrele ei.
 *
 * Interpretarea finală = ramă + arhetip. Șabloanele acceptă:
 *   {sequence} secvența · {digitA} {digitB} cifrele
 *   {titleA} {essenceA} {strengthA} {shadowA} — arhetipul primei cifre
 *   {titleB} {essenceB} {strengthB} {shadowB} — arhetipul celei de-a doua
 * Pentru repetări, B e identic cu A, ca substituția să fie uniformă.
 *
 * {essenceX} e o frază nominală care poate conține o linie de pauză, așa că
 * apare doar la final de propoziție, după „e” sau după două puncte. Oriunde
 * altundeva ar rupe fraza.
 */

import type { Lang } from "@/lib/numerology-plus";
import type { PatternKind } from "./patterns";

export interface PatternFrame {
  kind: PatternKind;
  frequency: "common" | "uncommon" | "rare";
  titleTpl: Record<Lang, string>;
  shortTpl: Record<Lang, string>;
  spiritualTpl: Record<Lang, string>;
  /** Primul paragraf din fullMeaning: ce e forma. */
  leadTpl: Record<Lang, string>;
  /** Al doilea: ce adaugă repetiția sau relația. */
  amplifyTpl: Record<Lang, string>;
  /** Al treilea: cum arată când funcționează. Folosește {strengthA}. */
  worksTpl: Record<Lang, string>;
  /** Al patrulea: cum arată când se distorsionează. Folosește {shadowA}. */
  breaksTpl: Record<Lang, string>;
  /** Al patrulea rând de sfat, cel legat de formă. */
  adviceTpl: Record<Lang, string>;
}

const TRIPLE: PatternFrame = {
  kind: "triple",
  frequency: "common",
  titleTpl: {
    ro: "{titleA}, de trei ori",
    en: "{titleA}, three times over",
    ru: "{titleA}, трижды",
  },
  shortTpl: {
    ro: "Cifra {digitA} revine până o observi: e {essenceA}.",
    en: "The digit {digitA} keeps returning until you notice it: it is {essenceA}.",
    ru: "Цифра {digitA} возвращается, пока вы её не заметите: это {essenceA}.",
  },
  spiritualTpl: {
    ro: "Pragul la care o coincidență încetează să mai fie coincidență.",
    en: "The threshold at which a coincidence stops being one.",
    ru: "Порог, на котором совпадение перестаёт быть совпадением.",
  },
  leadTpl: {
    ro: "Când aceeași cifră apare de trei ori, nu citești trei numere, ci unul singur spus mai tare. {sequence} este {digitA} adus la o intensitate la care nu-l mai poți trata ca pe un detaliu de fundal: e {essenceA}.",
    en: "When the same digit appears three times you are not reading three numbers but one said louder. {sequence} is {digitA} raised to an intensity at which you can no longer treat it as background detail: it is {essenceA}.",
    ru: "Когда одна и та же цифра появляется трижды, вы читаете не три числа, а одно, сказанное громче. {sequence} — это {digitA}, доведённая до силы, при которой её уже не спишешь на фон: это {essenceA}.",
  },
  amplifyTpl: {
    ro: "Repetiția nu schimbă înțelesul cifrei, îi schimbă urgența. Trei este numărul la care atenția se predă: prima dată treci pe lângă, a doua oară remarci, a treia oară te întorci și te uiți. De aceea tripletele sunt secvențele pe care le rețin oamenii — nu pentru că ar fi mai puternice în sine, ci pentru că trei e exact pragul la care mintea acceptă că vede un tipar, nu o întâmplare.",
    en: "Repetition does not change what the digit means; it changes how urgent it is. Three is the count at which attention gives in: the first time you walk past, the second time you notice, the third time you turn around and look. That is why triples are the sequences people remember — not because they are stronger in themselves, but because three is exactly the threshold at which the mind accepts it is seeing a pattern rather than an accident.",
    ru: "Повтор не меняет значение цифры — он меняет её срочность. Три — то самое число, на котором внимание сдаётся: в первый раз вы проходите мимо, во второй замечаете, в третий оборачиваетесь и смотрите. Поэтому тройки запоминаются — не потому, что сильнее сами по себе, а потому, что три и есть порог, на котором ум признаёт: это закономерность, а не случайность.",
  },
  worksTpl: {
    ro: "Când energia asta lucrează în favoarea ta, arată așa: {strengthA}. Perioada în care vezi {sequence} des e, de regulă, perioada în care exact această capacitate e cerută de context — nu întâmplător, ci pentru că ai ajuns în punctul unde ea face diferența.",
    en: "When this energy works in your favour it looks like this: {strengthA}. The stretch in which you keep seeing {sequence} is usually the stretch in which exactly this capacity is what the situation asks for — not by chance, but because you have reached the point where it makes the difference.",
    ru: "Когда эта энергия работает на вас, это выглядит так: {strengthA}. Период, в котором вы часто видите {sequence}, обычно и есть период, когда именно эта способность требуется обстоятельствами — не случайно, а потому, что вы дошли до точки, где она решает.",
  },
  breaksTpl: {
    ro: "Când se distorsionează, arată așa: {shadowA}. Dacă te regăsești mai degrabă aici decât în paragraful de dinainte, {sequence} nu e o confirmare, ci o corectură — aceeași energie, întoarsă împotriva ta. Întrebarea utilă nu e „ce înseamnă {sequence}”, ci „unde anume, în ultima lună, am alunecat în asta”.",
    en: "When it distorts it looks like this: {shadowA}. If you recognise yourself here rather than in the paragraph before, {sequence} is not a confirmation but a correction — the same energy turned against you. The useful question is not “what does {sequence} mean” but “where exactly, in the past month, did I slide into that”.",
    ru: "Когда она искажается, это выглядит так: {shadowA}. Если вы узнаёте себя скорее здесь, чем в предыдущем абзаце, {sequence} — не подтверждение, а поправка: та же энергия, обращённая против вас. Полезный вопрос не «что значит {sequence}», а «где именно за последний месяц я в это соскользнул».",
  },
  adviceTpl: {
    ro: "Notează unde ai văzut {sequence} — locul contează mai mult decât numărul",
    en: "Note where you saw {sequence} — the place matters more than the number",
    ru: "Запишите, где вы видели {sequence} — место важнее самого числа",
  },
};

const QUAD: PatternFrame = {
  kind: "quad",
  frequency: "uncommon",
  titleTpl: {
    ro: "{titleA}, dus până la capăt",
    en: "{titleA}, taken all the way",
    ru: "{titleA}, доведённый до предела",
  },
  shortTpl: {
    ro: "A patra repetare nu mai cere atenție, ci decizie: e {essenceA}.",
    en: "A fourth repetition asks not for attention but for a decision: it is {essenceA}.",
    ru: "Четвёртый повтор просит не внимания, а решения: это {essenceA}.",
  },
  spiritualTpl: {
    ro: "O ușă care stă deschisă un timp limitat.",
    en: "A door that stays open for a limited time.",
    ru: "Дверь, открытая ограниченное время.",
  },
  leadTpl: {
    ro: "Patru repetări ale aceleiași cifre nu mai sunt un semnal, sunt o insistență. {sequence} spune {digitA} de patru ori la rând, iar la a patra oară mesajul nu mai e „uită-te”, ci „ai văzut deja, ce faci cu asta”. Energia rămâne aceeași: e {essenceA}.",
    en: "Four repetitions of the same digit are no longer a signal but an insistence. {sequence} says {digitA} four times over, and by the fourth the message is not “look” but “you have already looked — now what”. The energy is unchanged: it is {essenceA}.",
    ru: "Четыре повтора одной цифры — уже не сигнал, а настойчивость. {sequence} произносит {digitA} четыре раза подряд, и к четвёртому послание звучит не «посмотри», а «ты уже посмотрел — и что дальше». Энергия та же: это {essenceA}.",
  },
  amplifyTpl: {
    ro: "Diferența dintre trei și patru repetări e diferența dintre a observa și a răspunde. Tripletele apar cât ceva încă se conturează; cvadruplele apar, de obicei, după ce ai amânat deja o alegere pe care o știai. De aceea secvențele de patru cifre se văd cel mai des pe ceas: la oră exactă, într-un moment în care nu faci nimic altceva decât să aștepți. Nu ceasul le produce — atenția ta liberă le observă.",
    en: "The difference between three repetitions and four is the difference between noticing and answering. Triples show up while something is still taking shape; quadruples usually show up after you have already postponed a choice you knew about. That is why four-digit sequences are most often seen on a clock: at an exact hour, in a moment when you are doing nothing but waiting. The clock does not produce them — your unoccupied attention notices them.",
    ru: "Разница между тремя и четырьмя повторами — это разница между «заметить» и «ответить». Тройки появляются, пока что-то только складывается; четвёрки — обычно после того, как вы уже отложили выбор, о котором знали. Поэтому четырёхзначные последовательности чаще всего видны на часах: в ровный час, когда вы не делаете ничего, кроме ожидания. Их создают не часы — их замечает ваше свободное внимание.",
  },
  worksTpl: {
    ro: "Dacă răspunzi, se vede așa: {strengthA}. Ce distinge o perioadă de {sequence} bine folosită de una irosită nu e intensitatea trăirii, ci dacă a rămas ceva în urma ei — o decizie luată, o conversație purtată, un lucru început efectiv.",
    en: "If you answer, it looks like this: {strengthA}. What separates a {sequence} stretch well used from one wasted is not the intensity of the feeling but whether anything remains after it — a decision taken, a conversation held, something actually begun.",
    ru: "Если вы отвечаете, это выглядит так: {strengthA}. Хорошо использованный период {sequence} отличается от растраченного не силой переживания, а тем, осталось ли что-то после: принятое решение, состоявшийся разговор, действительно начатое дело.",
  },
  breaksTpl: {
    ro: "Dacă nu răspunzi, se vede așa: {shadowA}. Riscul specific al cvadruplelor e să confunzi semnul cu fapta: să colecționezi apariții, să le fotografiezi, să le povestești — și să nu schimbi nimic. Un semn pe care îl observi de zece ori și nu îl urmezi niciodată nu mai e un semn, e un obicei.",
    en: "If you do not answer, it looks like this: {shadowA}. The specific risk of quadruples is mistaking the sign for the act: collecting sightings, photographing them, telling people about them — and changing nothing. A sign you notice ten times and never follow stops being a sign and becomes a habit.",
    ru: "Если вы не отвечаете, это выглядит так: {shadowA}. Особый риск четвёрок — спутать знак с поступком: коллекционировать появления, фотографировать их, рассказывать о них — и ничего не менять. Знак, замеченный десять раз и ни разу не исполненный, перестаёт быть знаком и становится привычкой.",
  },
  adviceTpl: {
    ro: "Alege o singură acțiune și fă-o în 48 de ore, altfel {sequence} rămâne decor",
    en: "Pick one action and do it within 48 hours, or {sequence} stays decoration",
    ru: "Выберите одно действие и сделайте его за 48 часов, иначе {sequence} останется декорацией",
  },
};

export const PATTERN_FRAMES: Partial<Record<PatternKind, PatternFrame>> = {
  triple: TRIPLE,
  quad: QUAD,
};
