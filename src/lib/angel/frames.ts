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

const ALTERNATING: PatternFrame = {
  kind: "alternating",
  frequency: "rare",
  titleTpl: {
    ro: "{titleA} și {titleB}, pe rând",
    en: "{titleA} and {titleB}, taking turns",
    ru: "{titleA} и {titleB}, по очереди",
  },
  shortTpl: {
    ro: "Două energii care se schimbă între ele: {essenceA}, apoi {essenceB}.",
    en: "Two energies trading places: {essenceA}, then {essenceB}.",
    ru: "Две энергии меняются местами: {essenceA}, затем {essenceB}.",
  },
  spiritualTpl: {
    ro: "Ritm, nu conflict — două lucruri cerute alternativ.",
    en: "Rhythm rather than conflict — two things asked for in turn.",
    ru: "Ритм, а не конфликт — два требования по очереди.",
  },
  leadTpl: {
    ro: "În {sequence} nicio cifră nu câștigă. {digitA} și {digitB} se schimbă între ele, iar asta e chiar mesajul: nu ai de ales una, ai de învățat trecerea de la una la alta. Prima e {essenceA}. A doua e {essenceB}.",
    en: "In {sequence} neither digit wins. {digitA} and {digitB} trade places, and that is the message: you are not being asked to choose one but to learn the crossing between them. The first is {essenceA}. The second is {essenceB}.",
    ru: "В {sequence} ни одна цифра не побеждает. {digitA} и {digitB} меняются местами, и в этом послание: не выбрать одну, а научиться переходу между ними. Первая — {essenceA}. Вторая — {essenceB}.",
  },
  amplifyTpl: {
    ro: "Secvențele alternante apar de obicei în perioade în care oscilezi și îți reproșezi oscilația. Citite corect, spun contrariul: oscilația nu e defectul, e forma pe care o ia lucrul acesta atunci când e sănătos. Ce e greșit nu e trecerea de la una la alta, ci încercarea de a rămâne blocat într-una singură pentru că din afară pare mai coerent.",
    en: "Alternating sequences usually turn up in periods when you are swinging between two things and blaming yourself for swinging. Read correctly they say the opposite: the oscillation is not the fault, it is the shape this takes when it is healthy. What is wrong is not the crossing back and forth but the attempt to stay locked in one side because that looks more consistent from outside.",
    ru: "Чередующиеся последовательности обычно приходят в периоды, когда вы колеблетесь между двумя вещами и корите себя за это. Прочитанные верно, они говорят обратное: колебание — не изъян, а форма, которую это принимает, когда здорово. Неверно не переходить туда-обратно, а пытаться застрять в одной стороне, потому что снаружи это выглядит последовательнее.",
  },
  worksTpl: {
    ro: "Când ritmul e bun, prima energie îți dă asta: {strengthA}. Iar a doua îți dă asta: {strengthB}. Nu se anulează una pe alta — se odihnesc una pe alta, și fiecare devine posibilă pentru că cealaltă a mers înainte.",
    en: "When the rhythm is right, the first energy gives you this: {strengthA}. And the second gives you this: {strengthB}. They do not cancel each other — they rest on one another, and each becomes possible because the other went first.",
    ru: "Когда ритм верен, первая энергия даёт вот что: {strengthA}. А вторая — вот что: {strengthB}. Они не отменяют друг друга: они опираются одна на другую, и каждая становится возможной, потому что другая прошла раньше.",
  },
  breaksTpl: {
    ro: "Când ritmul se strică, prima alunecă în {shadowA}, iar a doua în {shadowB}. Semnul e simplu: treci de la una la alta din epuizare, nu din alegere — fugi din prima în a doua și înapoi, fără să te oprești în niciuna.",
    en: "When the rhythm breaks, the first slips into {shadowA} and the second into {shadowB}. The sign is simple: you move from one to the other out of exhaustion rather than choice — fleeing the first into the second and back, without settling in either.",
    ru: "Когда ритм ломается, первая соскальзывает в {shadowA}, а вторая — в {shadowB}. Признак прост: вы переходите от одной к другой от истощения, а не по выбору — бежите из первой во вторую и обратно, не задерживаясь ни в одной.",
  },
  adviceTpl: {
    ro: "Dă fiecăreia un interval clar în săptămâna asta, în loc să le amesteci",
    en: "Give each of them a clear slot this week instead of mixing them",
    ru: "Отведите каждой чёткий интервал на этой неделе, вместо того чтобы смешивать",
  },
};

const MIRROR: PatternFrame = {
  kind: "mirror",
  frequency: "rare",
  titleTpl: {
    ro: "{titleA} și {titleB}, în oglindă",
    en: "{titleA} and {titleB}, mirrored",
    ru: "{titleA} и {titleB}, зеркально",
  },
  shortTpl: {
    ro: "Secvența se citește la fel în ambele sensuri. La margini stă {essenceA}.",
    en: "The sequence reads the same both ways. At the edges stands {essenceA}.",
    ru: "Последовательность читается одинаково в обе стороны. По краям стоит {essenceA}.",
  },
  spiritualTpl: {
    ro: "Un cerc închis — sfârșitul se întoarce în început.",
    en: "A closed circle — the end returns into the beginning.",
    ru: "Замкнутый круг — конец возвращается в начало.",
  },
  leadTpl: {
    ro: "{sequence} se citește identic de la stânga la dreapta și invers. La margini stă {digitA}, care e {essenceA}. La mijloc stă {digitB}, care e {essenceB}. Forma spune că ceva se întoarce de unde a plecat.",
    en: "{sequence} reads identically left to right and right to left. At the edges stands {digitA}, which is {essenceA}. At the centre stands {digitB}, which is {essenceB}. The shape says that something is returning to where it started.",
    ru: "{sequence} читается одинаково слева направо и справа налево. По краям стоит {digitA}, а это {essenceA}. В середине — {digitB}, а это {essenceB}. Форма говорит, что нечто возвращается туда, откуда вышло.",
  },
  amplifyTpl: {
    ro: "Secvențele în oglindă apar în perioade de repetare: o situație pe care ai mai trăit-o, o persoană de tipul celei de dinainte, o alegere care seamănă suspect cu una veche. Nu e nici pedeapsă, nici buclă. Un tipar revine pentru că prima dată l-ai traversat fără să-l vezi; a doua oară ai deja materialul ca să-l recunoști, și tocmai de aceea îl poți încheia.",
    en: "Mirror sequences show up in periods of repetition: a situation you have lived before, a person of the same kind as the last one, a choice that resembles an old one a little too closely. This is neither a punishment nor a loop. A pattern comes back because the first time you crossed it without seeing it; the second time you already have the material to recognise it, which is exactly why you can end it.",
    ru: "Зеркальные последовательности появляются в периоды повторения: ситуация, которую вы уже проживали, человек того же типа, что и прежде, выбор, подозрительно похожий на старый. Это не наказание и не петля. Закономерность возвращается потому, что в первый раз вы прошли её, не увидев; во второй у вас уже есть материал, чтобы её узнать, — и именно поэтому вы можете её закрыть.",
  },
  worksTpl: {
    ro: "Când o închizi bine, marginea îți dă asta: {strengthA}, iar miezul asta: {strengthB}. Un tipar încheiat nu dispare — se transformă în ceva ce știi și pe care nu mai trebuie să-l plătești a doua oară.",
    en: "When you close it well, the edge gives you this: {strengthA}, and the centre this: {strengthB}. A pattern that is finished does not vanish — it turns into something you know and no longer have to pay for twice.",
    ru: "Когда вы закрываете её верно, край даёт вот что: {strengthA}, а сердцевина — вот что: {strengthB}. Завершённая закономерность не исчезает: она превращается в знание, за которое не нужно платить дважды.",
  },
  breaksTpl: {
    ro: "Când o ratezi, marginea alunecă în {shadowA}, iar miezul în {shadowB} — și tiparul se pregătește să revină a treia oară, în alt costum. Semnul e că povestești situația nouă cu exact cuvintele cu care ai povestit-o pe cea veche.",
    en: "When you miss it, the edge slips into {shadowA} and the centre into {shadowB} — and the pattern prepares to return a third time in a different costume. The sign is that you describe the new situation in exactly the words you used for the old one.",
    ru: "Когда вы её упускаете, край соскальзывает в {shadowA}, а сердцевина — в {shadowB}, и закономерность готовится вернуться в третий раз, в другом костюме. Признак — вы описываете новую ситуацию ровно теми же словами, что и старую.",
  },
  adviceTpl: {
    ro: "Scrie în ce a semănat situația asta cu una veche — apoi ce faci altfel",
    en: "Write down how this resembles an old situation — then what you will do differently",
    ru: "Запишите, чем это похоже на старую ситуацию, — и что вы сделаете иначе",
  },
};

const ASCENDING: PatternFrame = {
  kind: "ascending",
  frequency: "rare",
  titleTpl: {
    ro: "De la {titleA} la {titleB}",
    en: "From {titleA} to {titleB}",
    ru: "От {titleA} к {titleB}",
  },
  shortTpl: {
    ro: "O secvență care urcă. Pornește din {essenceA}.",
    en: "A sequence that climbs. It starts in {essenceA}.",
    ru: "Последовательность, идущая вверх. Она начинается в {essenceA}.",
  },
  spiritualTpl: {
    ro: "Ordine — pași în șir, fără sărituri.",
    en: "Order — steps in a row, with nothing skipped.",
    ru: "Порядок — шаги подряд, без пропусков.",
  },
  leadTpl: {
    ro: "{sequence} nu repetă nimic: urcă. Fiecare cifră o urmează pe cea dinainte fără să sară niciuna, iar asta e tot mesajul. Punctul de plecare e {digitA}, care e {essenceA}. Punctul în care ajungi e {digitB}, care e {essenceB}.",
    en: "{sequence} repeats nothing: it climbs. Each digit follows the one before without skipping any, and that is the entire message. The starting point is {digitA}, which is {essenceA}. Where you arrive is {digitB}, which is {essenceB}.",
    ru: "{sequence} ничего не повторяет: она поднимается. Каждая цифра следует за предыдущей без пропусков, и в этом всё послание. Точка выхода — {digitA}, а это {essenceA}. Точка прихода — {digitB}, а это {essenceB}.",
  },
  amplifyTpl: {
    ro: "O secvență ascendentă apare, aproape întotdeauna, în perioade în care cauți scurtătura. Forma ei o refuză: nu poți ajunge la ultima cifră fără să treci prin toate cele dinainte. Nu e o promisiune că va merge ușor — e o observație despre ordine. Ce sari acum se întoarce mai târziu ca lipsă, într-un moment în care e mai scump de reparat.",
    en: "An ascending sequence turns up, almost always, in periods when you are looking for the shortcut. Its shape refuses one: you cannot reach the last digit without passing through every digit before it. This is not a promise that things will be easy — it is an observation about order. What you skip now comes back later as a gap, at a moment when it costs more to repair.",
    ru: "Восходящая последовательность приходит почти всегда в те периоды, когда вы ищете короткий путь. Её форма отказывает в нём: нельзя дойти до последней цифры, не пройдя все предыдущие. Это не обещание, что будет легко, — это наблюдение о порядке. Пропущенное сейчас вернётся позже пробелом, в момент, когда чинить его дороже.",
  },
  worksTpl: {
    ro: "La bază, {digitA} îți dă asta: {strengthA}. La capăt, {digitB} îți dă asta: {strengthB}. Când respecți ordinea, progresul nu se simte spectaculos — se simte inevitabil, ceea ce e cu mult mai bine.",
    en: "At the base, {digitA} gives you this: {strengthA}. At the top, {digitB} gives you this: {strengthB}. When you respect the order, progress does not feel spectacular — it feels inevitable, which is considerably better.",
    ru: "В основании {digitA} даёт вот что: {strengthA}. На вершине {digitB} даёт вот что: {strengthB}. Когда порядок соблюдён, прогресс ощущается не эффектным, а неизбежным — что намного лучше.",
  },
  breaksTpl: {
    ro: "Când forțezi ritmul, baza alunecă în {shadowA} și vârful în {shadowB}. Se recunoaște ușor: ai multe lucruri începute la nivelul de sus și niciunul terminat la cel de jos.",
    en: "When you force the pace, the base slips into {shadowA} and the top into {shadowB}. It is easy to recognise: you have many things started at the upper level and nothing finished at the lower one.",
    ru: "Когда вы форсируете темп, основание соскальзывает в {shadowA}, а вершина — в {shadowB}. Узнать легко: у вас много начатого на верхнем уровне и ничего завершённого на нижнем.",
  },
  adviceTpl: {
    ro: "Scrie pașii în ordine și fă-l azi pe primul, nu pe cel mai interesant",
    en: "Write the steps in order and do the first one today, not the most interesting one",
    ru: "Запишите шаги по порядку и сделайте сегодня первый, а не самый интересный",
  },
};

const DESCENDING: PatternFrame = {
  kind: "descending",
  frequency: "rare",
  titleTpl: {
    ro: "De la {titleA} înapoi la {titleB}",
    en: "From {titleA} back to {titleB}",
    ru: "От {titleA} обратно к {titleB}",
  },
  shortTpl: {
    ro: "O secvență care coboară. Se desface din {essenceA}.",
    en: "A sequence that descends. It unwinds from {essenceA}.",
    ru: "Последовательность, идущая вниз. Она разматывается из {essenceA}.",
  },
  spiritualTpl: {
    ro: "Numărătoare inversă — ceva se apropie de capăt.",
    en: "A countdown — something is nearing its end.",
    ru: "Обратный отсчёт — нечто подходит к концу.",
  },
  leadTpl: {
    ro: "{sequence} coboară treaptă cu treaptă. Pleacă din {digitA}, care e {essenceA}, și se întoarce la {digitB}, care e {essenceB}. Numărătoarea inversă e singura formă care are un capăt încorporat în ea.",
    en: "{sequence} descends step by step. It leaves from {digitA}, which is {essenceA}, and returns to {digitB}, which is {essenceB}. A countdown is the one shape with an ending built into it.",
    ru: "{sequence} спускается ступень за ступенью. Она уходит из {digitA}, а это {essenceA}, и возвращается к {digitB}, а это {essenceB}. Обратный отсчёт — единственная форма, в которую конец встроен изначально.",
  },
  amplifyTpl: {
    ro: "Secvențele descrescătoare apar în perioade de încheiere, nu de început. Nu prevestesc o pierdere: descriu o desfacere. Ceva ce ai construit ajunge la forma lui minimă și nu mai are nevoie de tot ce ai pus în el. Greșeala obișnuită e să citești coborârea ca pe un eșec și să adaugi efort exact acolo unde ce trebuie e să scazi.",
    en: "Descending sequences show up in periods of ending, not beginning. They do not foretell a loss: they describe an unwinding. Something you built is reaching its minimal form and no longer needs everything you put into it. The usual mistake is to read the descent as failure and to add effort exactly where what is needed is subtraction.",
    ru: "Нисходящие последовательности приходят в периоды завершения, а не начала. Они не предвещают потерю — они описывают разматывание. То, что вы построили, доходит до своей минимальной формы и больше не нуждается во всём, что вы в него вложили. Обычная ошибка — прочесть спуск как провал и добавить усилий там, где нужно вычитать.",
  },
  worksTpl: {
    ro: "Făcută bine, coborârea îți lasă asta din punctul de plecare: {strengthA}, și asta din punctul de sosire: {strengthB}. Un lucru încheiat corect nu se simte gol, ci ușor.",
    en: "Done well, the descent leaves you this from where it started: {strengthA}, and this from where it lands: {strengthB}. Something ended properly does not feel empty, it feels light.",
    ru: "Сделанный верно, спуск оставляет вам вот что от точки выхода: {strengthA}, и вот что от точки прихода: {strengthB}. Правильно завершённое ощущается не пустым, а лёгким.",
  },
  breaksTpl: {
    ro: "Făcută prost, se rupe în {shadowA} la plecare și în {shadowB} la sosire. Semnul e că ții în viață ceva doar ca să nu recunoști că s-a terminat — și plătești pentru asta cu energie de care ai nevoie în altă parte.",
    en: "Done badly, it breaks into {shadowA} at the start and {shadowB} at the end. The sign is that you are keeping something alive only so as not to admit it is over — and paying for it with energy you need elsewhere.",
    ru: "Сделанный плохо, он ломается в {shadowA} на выходе и в {shadowB} на приходе. Признак — вы поддерживаете что-то живым только чтобы не признать, что оно кончилось, и платите за это энергией, нужной в другом месте.",
  },
  adviceTpl: {
    ro: "Numește lucrul care s-a terminat de fapt și închide-l oficial",
    en: "Name the thing that has actually ended and close it formally",
    ru: "Назовите то, что действительно закончилось, и закройте это официально",
  },
};

export const PATTERN_FRAMES: Record<PatternKind, PatternFrame> = {
  triple: TRIPLE,
  quad: QUAD,
  alternating: ALTERNATING,
  mirror: MIRROR,
  ascending: ASCENDING,
  descending: DESCENDING,
};
