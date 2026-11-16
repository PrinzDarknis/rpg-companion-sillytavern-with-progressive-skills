/**
 * Progressive Skills — computing and storing the result of one turn on a swipe.
 *
 * state(swipe) = apply(deltas(swipe), deriveState(chat, N)) — recomputing with the same deltas gives the same
 * state, so idempotency holds by construction (no audit key).
 */
import { applyAnalysis, applyManualEdit, spendPoints } from '../progression/index.js';
import { deriveState } from './derive-state.js';
import { getSelectedSwipeId, getSwipePayload, setSwipePayload } from './swipe-payload.js';

/**
 * Applies deltas to a base state: analysis first, then authorized spends, then manual edits.
 * @param {unknown} baseState - State of the previous turn
 * @param {object} config - Normalized configuration
 * @param {{analysis?: object|null, spends?: Array<{skillId: string, amount: number, source?: string}>,
 *   manual?: Array<{skillId: string, value?: number, xp?: number, source?: string}>}} deltas
 * @returns {{state: object, history: object[], pendingSpends: object[]}}
 */
export function applyDeltas(baseState, config, deltas = {}) {
    const result = applyAnalysis(baseState, config, deltas.analysis ?? {});
    let state = result.state;
    const history = [...result.history];
    for (const spend of deltas.spends ?? []) {
        const spent = spendPoints(state, config, spend, spend.source ?? 'ui');
        state = spent.state;
        history.push(...spent.history);
    }
    for (const edit of deltas.manual ?? []) {
        const edited = applyManualEdit(state, config, edit, edit.source ?? 'ui');
        state = edited.state;
        history.push(...edited.history);
    }
    return { state, history, pendingSpends: result.pendingSpends };
}

/**
 * Computes the turn for the selected (or given) swipe of `chat[messageIndex]` and stores it there.
 * Model-proposed spends are not applied: they are returned as `pendingSpends` (need user confirmation).
 * Manual edits already stored on the swipe are kept when `deltas.manual` is not given (e.g. a tracker refresh
 * of the same swipe), so they are not lost when the turn is recomputed.
 * The caller saves the chat afterwards (e.g. saveChatDebounced).
 * @param {object[]} chat
 * @param {number} messageIndex - Assistant message of this turn
 * @param {object} config - Normalized configuration
 * @param {{analysis?: object|null, spends?: object[], manual?: object[]}} deltas
 * @param {number} [swipeId] - Defaults to the selected swipe
 * @returns {{payload: object, pendingSpends: object[]}|null} null when the feature is disabled or the message
 *   cannot carry data — nothing is written then and existing data stays untouched
 */
export function saveTurn(chat, messageIndex, config, deltas = {}, swipeId) {
    const message = chat?.[messageIndex];
    if (!config?.enabled || !message) return null;
    const targetSwipeId = swipeId ?? getSelectedSwipeId(message);

    const manual = deltas.manual ?? getSwipePayload(message, targetSwipeId)?.deltas?.manual ?? [];
    const base = deriveState(chat, messageIndex, config);
    const { state, history, pendingSpends } = applyDeltas(base, config, { ...deltas, manual });
    const payload = {
        deltas: {
            analysis: stripSpends(deltas.analysis),
            spends: (deltas.spends ?? []).map(spend => ({ ...spend })),
        },
        state,
        history,
    };
    // Only written when present, so payloads without manual edits keep their step-06 shape.
    if (manual.length > 0) payload.deltas.manual = manual.map(edit => ({ ...edit }));
    if (!setSwipePayload(message, targetSwipeId, payload)) return null;
    return { payload, pendingSpends };
}

function stripSpends(analysis) {
    if (!analysis) return null;
    const copy = structuredClone(analysis);
    delete copy.spends;
    return copy;
}
