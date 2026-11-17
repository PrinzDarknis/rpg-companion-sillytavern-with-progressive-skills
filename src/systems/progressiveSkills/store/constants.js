/**
 * Progressive Skills — storage constants.
 *
 * The per-swipe payload lives under its own key (not inside `rpg_companion_swipes`) so that the existing
 * tracker restore logic (`getSwipeData`, `hasTrackerPayload`, inheritance) never sees a slot that holds only
 * Progressive Skills data.
 */
export const STORE_KEY = 'rpg_companion_progressive_skills';

/** Result code of saveUserAction: the chat has no assistant message that could carry the action. */
export const ACTION_NO_TARGET = 'NO_TARGET';

/** Result code of saveUserAction: the swipe a model proposal was made for is no longer the current one. */
export const ACTION_EXPIRED = 'EXPIRED';
