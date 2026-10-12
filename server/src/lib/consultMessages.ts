import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPTS, SCOPE_CLAUSE, Lang } from './aiPrompts';

export type ConsultTurn = { role: 'user' | 'assistant'; content: string };

/**
 * Compune cererea. Funcție pură: fără rețea, fără mediu, fără bază de date.
 *
 * Două decizii merită spuse aici, fiindcă nu se citesc din cod:
 *
 * 1. Profilul NU merge în `system`, deși acolo ar fi cel mai natural loc pentru
 *    un prefix stabil. Textul profilului vine de la client, iar `system` e
 *    câmpul pe care routes/ai.ts l-a închis tocmai ca să nu poată clientul
 *    îndrepta modelul spre altă sarcină. Merge în primul mesaj, ca date, într-un
 *    plic delimitat.
 *
 * 2. Punctul de cache stă pe profil, adică pe singurul lucru care nu se schimbă
 *    în timpul unei conversații. Ordinea de randare fiind tools -> system ->
 *    messages, tot ce urmează (istoric, întrebare) crește după punct și nu-l
 *    invalidează.
 */
export function buildConsultMessages(input: {
  language: Lang;
  profileContext: string;
  history: ConsultTurn[];
  question: string;
}): { system: Anthropic.TextBlockParam[]; messages: Anthropic.MessageParam[] } {
  const { language, profileContext, history, question } = input;

  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: `${SYSTEM_PROMPTS[language]}\n\n${SCOPE_CLAUSE[language]}` },
  ];

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `<profil_numerologic>\n${profileContext}\n</profil_numerologic>`,
          cache_control: { type: 'ephemeral' },
        },
      ],
    },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user' as const, content: question },
  ];

  return { system, messages };
}
