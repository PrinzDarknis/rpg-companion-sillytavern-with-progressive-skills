/**
 * Progressive Skills — storing a user action (manual edit, point spend, confirmed or declined proposal).
 *
 * An action belongs to the latest assistant message (its selected swipe), because that swipe holds the state the
 * dashboard shows. It is appended to the swipe's `deltas.actions` and the swipe is recomputed with `saveTurn`, so
 * the action survives a later recomputation of the same swipe (tracker refresh).
 */
import { ACTION_TYPES, applyUserAction, REJECTION_CODES } from '../progression/index.js';
import { ACTION_NO_TARGET, ACTION_EXPIRED } from './constants.js';
import { getCurrentState } from './derive-state.js';
import { saveTurn } from './save-turn.js';
import { getStoredActions } from './stored-actions.js';
import { getSelectedSwipeId, getSwipePayload, isAssistantMessage } from './swipe-payload.js';

/** @returns {number} Index of the latest assistant message, or -1 when the chat has none. */
export function findActionTarget(chat) {
    const messages = Array.isArray(chat) ? chat : [];
    for (let i = messages.length - 1; i >= 0; i--) {
        if (isAssistantMessage(messages[i])) return i;
    }
    return -1;
}

/**
 * Validates an action against the current state and stores it on the latest assistant message.
 * The caller saves the chat afterwards.
 * @param {object[]} chat
 * @param {object} config - Normalized, enabled configuration
 * @param {object} action - See ACTION_TYPES
 * @param {{messageIndex: number, swipeId: number}} [expected] - The swipe the action was offered for (model
 *   proposals): the action is only stored while that swipe is still the selected swipe of the latest assistant
 *   message, otherwise the result code is EXPIRED
 * @returns {{ok: true, changed: boolean, state: object} | {ok: false, code: string}}
 *   code: a rejection code of the progression rules, NO_TARGET (no assistant message) or EXPIRED
 */
export function saveUserAction(chat, config, action, expected) {
    const target = findActionTarget(chat);
    if (expected && (target !== expected.messageIndex || getSelectedSwipeId(chat[target]) !== expected.swipeId)) {
        return { ok: false, code: ACTION_EXPIRED };
    }
    const checked = applyUserAction(getCurrentState(chat, config), config, action);
    if (!checked.ok) return { ok: false, code: checked.history[0]?.code ?? REJECTION_CODES.INVALID_AMOUNT };
    // Nothing to store for an edit to the current values; a declined proposal changes nothing but is recorded.
    if (!checked.changed && checked.history.length === 0) return { ok: true, changed: false, state: checked.state };

    if (target === -1) return { ok: false, code: ACTION_NO_TARGET };
    const payload = getSwipePayload(chat[target]);
    const result = saveTurn(chat, target, config, {
        analysis: payload?.deltas?.analysis ?? null,
        actions: [...getStoredActions(payload), { ...action }],
    });
    if (!result) return { ok: false, code: ACTION_NO_TARGET };
    return { ok: true, changed: checked.changed, state: result.payload.state };
}

/** Manual edit of a skill's value/XP (spec §10). See saveUserAction. */
export function saveManualEdit(chat, config, edit) {
    const action = { type: ACTION_TYPES.EDIT, skillId: edit.skillId, source: 'ui' };
    if (edit.value !== undefined) action.value = edit.value;
    if (edit.xp !== undefined) action.xp = edit.xp;
    return saveUserAction(chat, config, action);
}
