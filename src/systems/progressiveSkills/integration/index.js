/**
 * Progressive Skills — integration with the extension (settings, prompts, tracker updates).
 */
export { getConfig, getActiveConfig } from './settings.js';
export { getAnalysisTargetIndex } from './analysis-target.js';
export { getTrackerPromptParts, getContextSummaryBlock } from './prompt-sections.js';
export { processTrackerResponse } from './tracker-update.js';
export {
    ACTION_INACTIVE, applyManualSkillEdit, spendSkillPoints, setFreeSkillPoints, confirmProposedSpend, declineProposedSpend,
} from './user-actions.js';
