/**
 * Progressive Skills — reading the user actions stored on a swipe.
 */
import { ACTION_TYPES } from '../progression/index.js';

/**
 * @param {object|null} payload - Swipe payload (see swipe-payload.js)
 * @returns {object[]} The recorded user actions in order. Payloads written before `deltas.actions` existed
 *   (development data with `deltas.spends` / `deltas.manual`) are read in their former order: spends, then edits.
 */
export function getStoredActions(payload) {
    const deltas = payload?.deltas;
    if (!deltas) return [];
    if (Array.isArray(deltas.actions)) return deltas.actions;
    return [
        ...(deltas.spends ?? []).map(spend => ({ type: ACTION_TYPES.SPEND, ...spend })),
        ...(deltas.manual ?? []).map(edit => ({ type: ACTION_TYPES.EDIT, ...edit })),
    ];
}
