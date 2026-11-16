/**
 * Progressive Skills — storage constants.
 *
 * The per-swipe payload lives under its own key (not inside `rpg_companion_swipes`) so that the existing
 * tracker restore logic (`getSwipeData`, `hasTrackerPayload`, inheritance) never sees a slot that holds only
 * Progressive Skills data.
 */
export const STORE_KEY = 'rpg_companion_progressive_skills';

/** Result code of saveManualEdit: the chat has no assistant message that could carry the edit. */
export const MANUAL_EDIT_NO_TARGET = 'NO_TARGET';
