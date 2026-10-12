/**
 * Ce fel de hartă e o hartă salvată.
 *
 * Patru valori, fiindcă patru sunt cazurile care se comportă diferit:
 * hărțile mele (singurele care pot fi cea activă), un om apropiat, un copil
 * — inclusiv unul căruia încă i se alege numele — și o firmă, unde data e cea
 * a înființării. Valorile sunt cele stocate în coloana `user_profiles.category`
 * și sunt în română fiindcă româna e limba de bază a produsului; etichetele
 * traduse stau în `translations.ts`, sub `people.categories`.
 *
 * Modulul e pur cu bună știință: nu importă React și nu importă hook-uri, ca să
 * poată fi testat direct și importat din orice strat.
 */

export const PROFILE_CATEGORIES = ['eu', 'apropiat', 'copil', 'afacere'] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export const DEFAULT_CATEGORY: ProfileCategory = 'eu';

export function isProfileCategory(value: unknown): value is ProfileCategory {
  return typeof value === 'string' && (PROFILE_CATEGORIES as readonly string[]).includes(value);
}

/** Categoria vine de pe rețea. Aici devine una dintre cele patru, o dată. */
export function normalizeCategory(value: unknown): ProfileCategory {
  return isProfileCategory(value) ? value : DEFAULT_CATEGORY;
}

/**
 * Orice nu e „eu" sunt datele altei persoane, ținute de acest utilizator.
 * O valoare necunoscută cade pe „eu": un fals pozitiv ar lipi nota despre
 * datele altcuiva pe harta proprie a omului.
 */
export function isAboutSomeoneElse(value: unknown): boolean {
  return normalizeCategory(value) !== 'eu';
}

export interface CategorizedProfile {
  category?: string | null;
}

export interface ProfileGroup<T> {
  category: ProfileCategory;
  profiles: T[];
}

/** Grupează în ordinea din PROFILE_CATEGORIES, fără grupuri goale. */
export function groupProfilesByCategory<T extends CategorizedProfile>(
  profiles: T[],
): ProfileGroup<T>[] {
  return PROFILE_CATEGORIES.map((category) => ({
    category,
    profiles: profiles.filter((profile) => normalizeCategory(profile.category) === category),
  })).filter((group) => group.profiles.length > 0);
}
