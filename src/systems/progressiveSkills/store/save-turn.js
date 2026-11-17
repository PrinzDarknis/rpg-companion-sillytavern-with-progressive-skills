/**
 * Progressive Skills — computing and storing the result of one turn on a swipe.
 *
 * state(swipe) = apply(deltas(swipe), deriveState(chat, N)) — recomputing with the same deltas gives the same
 * state, so idempotency holds by construction (no audit key).
 */
import { applyAnalysis, applyUserAction } from '../progression/index.js';
import { deriveState } from './derive-state.js';
import { getStoredActions } from './stored-actions.js';
import { getSelectedSwipeId, getSwipePayload, setSwipePayload } from './swipe-payload.js';

/**
 * Applies deltas to a base state: the analysis first, then the user actions in their recorded order.
 * @param {unknown} baseState - State of the previous turn
 * @param {object} config - Normalized configuration
 * @param {{analysis?: object|null, actions?: object[]}} deltas - actions: see ACTION_TYPES
 * @returns {{state: object, history: object[], pendingSpends: object[]}}
 */
export function applyDeltas(baseState, config, deltas = {}) {
    const result = applyAnalysis(baseState, config, deltas.analysis ?? {});
    let state = result.state;
    const history = [...result.history];
    for (const action of deltas.actions ?? []) {
        const applied = applyUserAction(state, config, action);
        state = applied.state;
        history.push(...applied.history);
    }
    return { state, history, pendingSpends: result.pendingSpends };
}

/**
 * Computes the turn for the selected (or given) swipe of `chat[messageIndex]` and stores it there.
 * Model-proposed spends are not applied: they are returned as `pendingSpends` (need user confirmation).
 * User actions already stored on the swipe are kept when `deltas.actions` is not given (e.g. a tracker refresh
 * of the same swipe), so they are not lost when the turn is recomputed.
 * The caller saves the chat afterwards (e.g. saveChatDebounced).
 * @param {object[]} chat
 * @param {number} messageIndex - Assistant message of this turn
 * @param {object} config - Normalized configuration
 * @param {{analysis?: object|null, actions?: object[]}} deltas
 * @param {number} [swipeId] - Defaults to the selected swipe
 * @returns {{payload: object, pendingSpends: object[]}|null} null when the feature is disabled or the message
 *   cannot carry data — nothing is written then and existing data stays untouched
 */
export function saveTurn(chat, messageIndex, config, deltas = {}, swipeId) {
    const message = chat?.[messageIndex];
    if (!config?.enabled || !message) return null;
    const targetSwipeId = swipeId ?? getSelectedSwipeId(message);

    const actions = deltas.actions ?? getStoredActions(getSwipePayload(message, targetSwipeId));
    const base = deriveState(chat, messageIndex, config);
    const { state, history, pendingSpends } = applyDeltas(base, config, { analysis: deltas.analysis, actions });
    const payload = {
        deltas: {
            analysis: stripSpends(deltas.analysis),
            actions: actions.map(action => ({ ...action })),
        },
        state,
        history,
    };
    if (!setSwipePayload(message, targetSwipeId, payload)) return null;
    return { payload, pendingSpends };
}

function stripSpends(analysis) {
    if (!analysis) return null;
    const copy = structuredClone(analysis);
    delete copy.spends;
    return copy;
}
