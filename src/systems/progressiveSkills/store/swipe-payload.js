/**
 * Progressive Skills — reading and writing the per-swipe payload of a chat message.
 *
 * Payload: { deltas: { analysis, spends, manual? }, state, history }
 *   deltas.analysis: the parsed AI analysis of this turn without spends ({ skillUpdates, pointsEarned? }) or null
 *   deltas.spends:   authorized point spends applied in this turn ([{ skillId, amount, source }])
 *   deltas.manual:   manual edits by the user ([{ skillId, value, xp, source }], absolute values; only when present)
 *   state:           resulting state after the deltas (see model/state.js)
 *   history:         history entries of this turn only
 *
 * Stored like the existing tracker data, keyed by swipe id and mirrored into both places:
 *   message.extra[STORE_KEY][swipeId] and message.swipe_info[swipeId].extra[STORE_KEY][swipeId]
 * Lookups use the swipe's own id only: after an overswipe SillyTavern copies the old swipe's `extra` into the
 * new swipe, so a payload under another key is never data of the current swipe.
 */
import { STORE_KEY } from './constants.js';

/** @returns {number} The selected swipe id of a message. */
export function getSelectedSwipeId(message) {
    const swipeId = Number(message?.swipe_id ?? 0);
    return Number.isSafeInteger(swipeId) && swipeId >= 0 ? swipeId : 0;
}

/** Own restore check (independent of `hasTrackerPayload`). */
export function hasProgressiveSkillsPayload(payload) {
    return isObject(payload) && isObject(payload.state);
}

/** @returns {boolean} True for messages that can carry tracker data (assistant messages). */
export function isAssistantMessage(message) {
    return isObject(message) && !message.is_user && !message.is_system;
}

/**
 * @param {object} message - Chat message
 * @param {number} [swipeId] - Defaults to the selected swipe
 * @returns {object|null} The payload stored for exactly this swipe, or null
 */
export function getSwipePayload(message, swipeId = getSelectedSwipeId(message)) {
    if (!isAssistantMessage(message)) return null;
    const sources = [
        message.extra?.[STORE_KEY],
        message.swipe_info?.[swipeId]?.extra?.[STORE_KEY],
    ];
    for (const store of sources) {
        const payload = isObject(store) ? store[String(swipeId)] : null;
        if (hasProgressiveSkillsPayload(payload)) return payload;
    }
    return null;
}

/**
 * Writes the payload for one swipe (replacing an earlier one). Each location gets its own copy.
 * @returns {boolean} False if the message cannot carry tracker data
 */
export function setSwipePayload(message, swipeId, payload) {
    if (!isAssistantMessage(message) || !hasProgressiveSkillsPayload(payload)) return false;
    if (!isObject(message.extra)) message.extra = {};
    writeInto(message.extra, swipeId, payload);

    const swipeInfo = Array.isArray(message.swipe_info) ? message.swipe_info[swipeId] : null;
    if (isObject(swipeInfo)) {
        if (!isObject(swipeInfo.extra)) swipeInfo.extra = {};
        writeInto(swipeInfo.extra, swipeId, payload);
    }
    return true;
}

function writeInto(extra, swipeId, payload) {
    if (!isObject(extra[STORE_KEY])) extra[STORE_KEY] = {};
    extra[STORE_KEY][String(swipeId)] = structuredClone(payload);
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
