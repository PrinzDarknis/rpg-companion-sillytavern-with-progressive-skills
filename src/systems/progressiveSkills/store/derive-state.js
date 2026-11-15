/**
 * Progressive Skills — deriving the state at a position in the chat.
 *
 * The stored state of a swipe is the source of truth. A position without own data (no turn analysed yet,
 * feature was off, overswipe without tracker request, deleted message) takes the state of the closest earlier
 * assistant message whose selected swipe has data, else the start values of the configuration.
 */
import { initStateFromConfig } from '../model/index.js';
import { getSwipePayload } from './swipe-payload.js';

/**
 * Base state for message `messageIndex` (N-1 rule): only messages before the index are considered.
 * @param {object[]} chat - Chat messages
 * @param {number} messageIndex - Index of the message whose base is wanted (may equal chat.length)
 * @param {object} config - Normalized configuration
 * @returns {object} State aligned with the current configuration
 */
export function deriveState(chat, messageIndex, config) {
    const messages = Array.isArray(chat) ? chat : [];
    const start = Math.min(messageIndex, messages.length) - 1;
    for (let i = start; i >= 0; i--) {
        const payload = getSwipePayload(messages[i]);
        if (payload) return initStateFromConfig(config, payload.state);
    }
    return initStateFromConfig(config);
}

/**
 * State shown for message `messageIndex`: its selected swipe's own state, else the derived base (no deltas).
 */
export function resolveStateAt(chat, messageIndex, config) {
    const payload = getSwipePayload(chat?.[messageIndex]);
    return payload ? initStateFromConfig(config, payload.state) : deriveState(chat, messageIndex, config);
}

/** Current state of the chat (display on chat load, swipe switch and after deletions; base of the next turn). */
export function getCurrentState(chat, config) {
    return deriveState(chat, Array.isArray(chat) ? chat.length : 0, config);
}
