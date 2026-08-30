/**
 * The achievement catalogue, keyed by id, valued by the XP that awarding it is
 * worth.
 *
 * /award-achievement used to take both the id and the reward from the request
 * body, checking only that the reward was a number -- so any authenticated
 * client could invent an achievement and pay itself whatever it liked. The
 * caps table for /add-xp had the right shape all along; this is the same idea
 * for the other two routes that move XP.
 *
 * Copied from src/lib/gamification.ts, which is where the client reads the same
 * list. The server cannot import across that boundary, so the two are kept in
 * step by ACHIEVEMENT_XP_CAP being the only thing the server will pay out.
 */
export const ACHIEVEMENT_XP_CAP: Record<string, number> = {
  first_steps: 50,
  streak_3: 30,
  streak_7: 100,
  streak_30: 500,
  streak_100: 2000,
  number_explorer: 100,
  compatibility_pro: 150,
  compatibility_master: 500,
  journal_keeper: 300,
  scholar: 500,
  social_butterfly: 200,
  lo_shu_master: 250,
  angel_whisperer: 300,
  level_5: 300,
  level_7: 700,
  level_9: 1000,
  master_number: 100,
  perfect_profile: 50,
};
