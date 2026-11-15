/**
 * Progressive Skills — storage constants.
 *
 * The per-swipe payload lives under its own key (not inside `rpg_companion_swipes`) so that the existing
 * tracker restore logic (`getSwipeData`, `hasTrackerPayload`, inheritance) never sees a slot that holds only
 * Progressive Skills data.
 */
export const STORE_KEY = 'rpg_companion_progressive_skills';
