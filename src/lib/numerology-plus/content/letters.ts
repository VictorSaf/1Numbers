/**
 * Semnificația literelor — pentru Piatra de Temelie, Piatra de Vârf și Prima Vocală.
 * 26 de litere × 3 limbi. Text scurt: apare ca legendă sub o literă mare în UI.
 */

import type { Lang } from './arcana.js';

export interface LetterMeaning {
  ch: string;
  value: number;
  trait: Record<Lang, string>;
}

const L = (ch: string, value: number, ro: string, en: string, ru: string): LetterMeaning =>
  ({ ch, value, trait: { ro, en, ru } });

export const LETTER_MEANINGS: LetterMeaning[] = [
  L('A', 1, 'Pornești singur și decizi repede. Nu aștepți permisiune.',
           'You set out alone and decide fast. You do not wait for permission.',
           'Вы стартуете в одиночку и решаете быстро. Разрешения не ждёте.'),
  L('B', 2, 'Simți înainte să analizezi. Te retragi când e prea mult.',
           'You feel before you analyse. You withdraw when it becomes too much.',
           'Вы чувствуете раньше, чем анализируете. Отступаете, когда слишком.'),
  L('C', 3, 'Comunici din prima și te exprimi ușor. Optimism ca reflex.',
           'You communicate immediately and express yourself easily. Optimism as a reflex.',
           'Вы сразу вступаете в контакт и легко выражаетесь. Оптимизм рефлекторно.'),
  L('D', 4, 'Ai nevoie de un plan înainte să te miști. Constant, uneori inflexibil.',
           'You need a plan before you move. Steady, sometimes inflexible.',
           'Вам нужен план до движения. Постоянны, порой негибки.'),
  L('E', 5, 'Cauți libertate și variație. Te plictisești vizibil.',
           'You seek freedom and variety. You get visibly bored.',
           'Ищете свободу и разнообразие. Скука заметна.'),
  L('F', 6, 'Îți asumi responsabilitatea altora, adesea prea repede.',
           'You take on other people’s responsibility, often too quickly.',
           'Берёте чужую ответственность, часто слишком быстро.'),
  L('G', 7, 'Vrei să înțelegi mecanismul înainte să participi. Independent.',
           'You want to understand the mechanism before joining in. Independent.',
           'Хотите понять механизм прежде, чем участвовать. Независимы.'),
  L('H', 8, 'Gândești în termeni de rezultat și resurse. Ambiție reținută.',
           'You think in terms of result and resources. Restrained ambition.',
           'Мыслите результатом и ресурсами. Сдержанные амбиции.'),
  L('I', 9, 'Emoție intensă, percepție fină. Te consumi ușor.',
           'Intense emotion, fine perception. You burn through yourself easily.',
           'Сильные эмоции, тонкое восприятие. Легко истощаетесь.'),
  L('J', 1, 'Idee proprie, drum propriu. Îți place să deschizi drumuri.',
           'Your own idea, your own road. You like opening paths.',
           'Своя идея, свой путь. Любите прокладывать дороги.'),
  L('K', 2, 'Intuiție puternică, tensiune internă pe măsură.',
           'Strong intuition, with matching internal tension.',
           'Сильная интуиция и соразмерное внутреннее напряжение.'),
  L('L', 3, 'Gândire mobilă, prietenos, uneori indecis.',
           'Mobile thinking, friendly, sometimes indecisive.',
           'Подвижное мышление, дружелюбие, иногда нерешительность.'),
  L('M', 4, 'Energie fizică, muncă susținută, răbdare lungă.',
           'Physical energy, sustained work, long patience.',
           'Физическая энергия, устойчивая работа, долгое терпение.'),
  L('N', 5, 'Curiozitate și opinii. Te opui când ceva nu se leagă.',
           'Curiosity and opinions. You push back when something does not add up.',
           'Любопытство и мнения. Возражаете, когда не сходится.'),
  L('O', 6, 'Voință tăcută, tenacitate. Nu renunți ușor.',
           'Quiet will, tenacity. You do not give up easily.',
           'Тихая воля, упорство. Не сдаётесь легко.'),
  L('P', 7, 'Analitic, detașat, uneori distant fără să vrei.',
           'Analytical, detached, sometimes distant without meaning to be.',
           'Аналитичны, отстранённы, порой невольно холодны.'),
  L('Q', 8, 'Neconvențional și magnetic. Direcție neașteptată.',
           'Unconventional and magnetic. Unexpected direction.',
           'Нестандартны и притягательны. Неожиданное направление.'),
  L('R', 9, 'Grijă pentru ceilalți, capacitate de a duce greutate.',
           'Care for others, capacity to carry weight.',
           'Забота о других, способность нести вес.'),
  L('S', 1, 'Intensitate emoțională, început dramatic. Charisma.',
           'Emotional intensity, dramatic beginnings. Charisma.',
           'Эмоциональная интенсивность, драматичное начало. Харизма.'),
  L('T', 2, 'Tensiune între datorie și dorință. Sacrificiu.',
           'Tension between duty and desire. Sacrifice.',
           'Напряжение между долгом и желанием. Жертва.'),
  L('U', 3, 'Receptiv, norocos, uneori nehotărât.',
           'Receptive, fortunate, sometimes irresolute.',
           'Восприимчивы, удачливы, иногда нерешительны.'),
  L('V', 4, 'Viziune și construcție. Vezi mai departe decât spui.',
           'Vision and construction. You see further than you say.',
           'Видение и строительство. Видите дальше, чем говорите.'),
  L('W', 5, 'Multe direcții simultan. Energie greu de canalizat.',
           'Many directions at once. Energy that is hard to channel.',
           'Много направлений сразу. Энергию трудно направить.'),
  L('X', 6, 'Extreme și alegeri tăioase. Senzualitate.',
           'Extremes and sharp choices. Sensuality.',
           'Крайности и резкие выборы. Чувственность.'),
  L('Y', 7, 'Oscilezi între variante. Intuiție care cere spațiu.',
           'You oscillate between options. Intuition that needs room.',
           'Колеблетесь между вариантами. Интуиция требует простора.'),
  L('Z', 8, 'Speranță și judecată. Ajungi la concluzii ferme.',
           'Hope and judgment. You arrive at firm conclusions.',
           'Надежда и суждение. Приходите к твёрдым выводам.'),
];

export const LETTER_BY_CH: Record<string, LetterMeaning> =
  Object.fromEntries(LETTER_MEANINGS.map((l) => [l.ch, l]));
