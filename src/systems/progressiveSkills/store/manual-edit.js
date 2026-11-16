/**
 * Progressive Skills — storing a manual edit of the user (spec §10).
 *
 * The edit belongs to the latest assistant message (its selected swipe), because that swipe holds the state
 * the dashboard shows. It is recorded as a delta (`deltas.manual`) and the swipe is recomputed with `saveTurn`,
 * so the edit survives a later recomputation of the same swipe.
 */
import { applyManualEdit } from '../progression/index.js';
import { MANUAL_EDIT_NO_TARGET as NO_TARGET } from './constants.js';
import { getCurrentState } from './derive-state.js';
import { saveTurn } from './save-turn.js';
import { getSwipePayload, isAssistantMessage } from './swipe-payload.js';

/** @returns {number} Index of the latest assistant message, or -1 when the chat has none. */
export function findManualEditTarget(chat) {
    const messages = Array.isArray(chat) ? chat : [];
    for (let i = messages.length - 1; i >= 0; i--) {
        if (isAssistantMessage(messages[i])) return i;
    }
    return -1;
}

/**
 * Validates a manual edit against the current state and stores it on the latest assistant message.
 * The caller saves the chat afterwards.
 * @param {object[]} chat
 * @param {object} config - Normalized, enabled configuration
 * @param {{skillId: string, value?: number, xp?: number}} edit
 * @returns {{ok: true, changed: boolean, state: object} | {ok: false, code: string}}
 *   code: a rejection code of the progression rules, or NO_TARGET when the chat has no assistant message
 */
export function saveManualEdit(chat, config, edit) {
    const checked = applyManualEdit(getCurrentState(chat, config), config, edit);
    if (!checked.ok) return { ok: false, code: checked.history[0].code };
    if (!checked.changed) return { ok: true, changed: false, state: checked.state };

    const target = findManualEditTarget(chat);
    if (target === -1) return { ok: false, code: NO_TARGET };
    const stored = getSwipePayload(chat[target])?.deltas ?? {};
    const entry = { skillId: edit.skillId, source: 'ui' };
    if (edit.value !== undefined) entry.value = edit.value;
    if (edit.xp !== undefined) entry.xp = edit.xp;
    const result = saveTurn(chat, target, config, {
        analysis: stored.analysis ?? null,
        spends: stored.spends ?? [],
        manual: [...(stored.manual ?? []), entry],
    });
    if (!result) return { ok: false, code: NO_TARGET };
    return { ok: true, changed: true, state: result.payload.state };
}
