/**
 * Progressive Skills — applying the model response of a tracker update (separate/external mode).
 *
 * Called by apiClient.updateRPGData after the existing trackers were stored. Never throws: a failure here must
 * not affect the other trackers. The chat is saved by the caller (saveChatData).
 */
import { addDebugLog, extensionSettings } from '../../../core/state.js';
import { HISTORY_TYPES } from '../progression/index.js';
import { parseAnalysis } from '../response/index.js';
import { saveTurn } from '../store/index.js';
import { getAnalysisTargetIndex } from './analysis-target.js';
import { getActiveConfig } from './settings.js';

/**
 * @param {string} response - Raw model response
 * @param {object[]} chat
 * @returns {{found: boolean, stored: boolean, pendingSpends: object[]}|null} null when inactive or on failure
 */
export function processTrackerResponse(response, chat) {
    try {
        const config = getActiveConfig();
        if (!config) return null;
        const target = getAnalysisTargetIndex(chat);
        if (target === -1) return null;

        const parsed = parseAnalysis(response);
        if (parsed.error) debug('Progressive Skills section could not be parsed', parsed.error);
        // A missing or broken section still stores the turn (no deltas), so the swipe has its own state.
        const analysis = parsed.analysis ?? null;
        const result = saveTurn(chat, target, config, { analysis });
        if (!result) return null;

        const rejected = result.payload.history.filter(entry => entry.type === HISTORY_TYPES.REJECTED);
        if (rejected.length > 0) debug('Progressive Skills changes rejected', rejected);
        if (result.pendingSpends.length > 0) debug('Progressive Skills point spends need confirmation', result.pendingSpends);
        return { found: parsed.found && !parsed.error, stored: true, pendingSpends: result.pendingSpends };
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills update failed:', error);
        return null;
    }
}

function debug(message, data) {
    if (extensionSettings.debugMode) addDebugLog(`[Progressive Skills] ${message}`, data);
}
