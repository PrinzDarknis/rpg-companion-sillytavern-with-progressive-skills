/**
 * Progressive Skills — applying the model response of a tracker update (separate/external mode).
 *
 * Called by apiClient.updateRPGData after the existing trackers were stored. Never throws: a failure here must
 * not affect the other trackers. The chat is saved by the caller (saveChatData).
 */
import { addDebugLog, extensionSettings } from '../../../core/state.js';
import { HISTORY_TYPES, spendPoints } from '../progression/index.js';
import { parseAnalysis } from '../response/index.js';
import { getSelectedSwipeId, saveTurn } from '../store/index.js';
import { getAnalysisTargetIndex } from './analysis-target.js';
import { getActiveConfig } from './settings.js';

/**
 * Point spends proposed by the model are never applied here (spec §5.4, §14). Each one is checked against the
 * stored state of this turn: valid ones are returned as `proposals` for the user's confirmation, invalid ones as
 * `invalidProposals` (with the rejection code) so the user learns why nothing happens.
 * @returns {{found: boolean, stored: boolean, pendingSpends: object[], proposals: object[], invalidProposals: object[]}|null}
 *   null when inactive or on failure. A proposal is `{ skillId, skillName, amount, messageIndex, swipeId }`.
 * @param {string} response - Raw model response
 * @param {object[]} chat
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
        const { proposals, invalidProposals } = checkProposals(result, config, chat, target);
        if (proposals.length > 0) debug('Progressive Skills point spends need confirmation', proposals);
        if (invalidProposals.length > 0) debug('Progressive Skills point spend proposals rejected', invalidProposals);
        return { found: parsed.found && !parsed.error, stored: true, pendingSpends: result.pendingSpends, proposals, invalidProposals };
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills update failed:', error);
        return null;
    }
}

/** Each proposal is checked on its own against the turn's state; the confirmation re-checks the current state. */
function checkProposals(result, config, chat, messageIndex) {
    const swipeId = getSelectedSwipeId(chat[messageIndex]);
    const proposals = [];
    const invalidProposals = [];
    for (const spend of result.pendingSpends) {
        const skillName = config.skills.find(skill => skill.id === spend.skillId)?.name ?? spend.skillId;
        const proposal = { skillId: spend.skillId, skillName, amount: spend.amount, messageIndex, swipeId };
        const checked = spendPoints(result.payload.state, config, spend, 'ai');
        if (checked.ok) proposals.push(proposal);
        else invalidProposals.push({ ...proposal, code: checked.history[0].code });
    }
    return { proposals, invalidProposals };
}

function debug(message, data) {
    if (extensionSettings.debugMode) addDebugLog(`[Progressive Skills] ${message}`, data);
}
