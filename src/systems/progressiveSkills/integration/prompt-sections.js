/**
 * Progressive Skills — prompt parts for promptBuilder.js. Each returns null when the feature is inactive, so
 * the existing prompts stay byte-identical.
 */
import { buildAnalysisInstructions, buildContextSummary, buildDeltaSchemaJSON } from '../prompt/index.js';
import { deriveState, getCurrentState } from '../store/index.js';
import { getAnalysisTargetIndex } from './analysis-target.js';
import { getActiveConfig } from './settings.js';

/**
 * Parts for the separate/external tracker request.
 * @param {object[]} chat
 * @param {string} userName
 * @returns {{schemaJSON: string, instructions: string}|null}
 */
export function getTrackerPromptParts(chat, userName) {
    const config = getActiveConfig();
    if (!config) return null;
    const target = getAnalysisTargetIndex(chat);
    const state = deriveState(chat, target === -1 ? chat?.length ?? 0 : target, config);
    return {
        schemaJSON: buildDeltaSchemaJSON(config),
        instructions: buildAnalysisInstructions(config, state, userName),
    };
}

/**
 * Values block for the contextual summary of the main roleplay generation.
 * @returns {string|null}
 */
export function getContextSummaryBlock(chat) {
    const config = getActiveConfig();
    if (!config) return null;
    return buildContextSummary(config, getCurrentState(chat, config)) || null;
}
