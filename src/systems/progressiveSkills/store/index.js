/**
 * Progressive Skills — persistence adapter (per chat message swipe; no host imports).
 */
export { STORE_KEY } from './constants.js';
export {
    getSelectedSwipeId, hasProgressiveSkillsPayload, isAssistantMessage, getSwipePayload, setSwipePayload,
} from './swipe-payload.js';
export { deriveState, resolveStateAt, getCurrentState } from './derive-state.js';
export { applyDeltas, saveTurn } from './save-turn.js';
