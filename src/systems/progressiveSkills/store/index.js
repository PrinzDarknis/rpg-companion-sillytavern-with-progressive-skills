/**
 * Progressive Skills — persistence adapter (per chat message swipe; no host imports).
 */
export { STORE_KEY, MANUAL_EDIT_NO_TARGET } from './constants.js';
export {
    getSelectedSwipeId, hasProgressiveSkillsPayload, isAssistantMessage, getSwipePayload, setSwipePayload,
} from './swipe-payload.js';
export { deriveState, resolveStateAt, getCurrentState } from './derive-state.js';
export { applyDeltas, saveTurn } from './save-turn.js';
export { findManualEditTarget, saveManualEdit } from './manual-edit.js';
