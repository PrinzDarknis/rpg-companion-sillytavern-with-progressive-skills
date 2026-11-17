/**
 * Progressive Skills — user actions from the dashboard and the spend confirmation (spec §5.4, §10).
 *
 * Every function validates against the current state and stores the action on the latest assistant message.
 * The caller saves the chat and re-renders.
 * Result: {ok: true, changed: boolean, state: object} | {ok: false, code: string}
 */
import { ACTION_TYPES } from '../progression/index.js';
import { saveManualEdit, saveUserAction } from '../store/index.js';
import { getActiveConfig } from './settings.js';

/** Result code when the feature is not active. */
export const ACTION_INACTIVE = 'INACTIVE';

/** @param {{skillId: string, value?: number, xp?: number}} edit - Absolute values */
export function applyManualSkillEdit(chat, edit) {
    return withConfig(config => saveManualEdit(chat, config, edit));
}

/** A direct user action is authorized by definition (spec §5.4 rule 4). */
export function spendSkillPoints(chat, { skillId, amount }) {
    return withConfig(config => saveUserAction(chat, config, { type: ACTION_TYPES.SPEND, skillId, amount, source: 'ui' }));
}

/** Sets the free-point balance (absolute value). */
export function setFreeSkillPoints(chat, value) {
    return withConfig(config => saveUserAction(chat, config, { type: ACTION_TYPES.POINTS, value, source: 'ui' }));
}

/**
 * The user confirmed a model spend proposal: the confirmation is the authorization (no message matching).
 * @param {{skillId: string, amount: number, messageIndex: number, swipeId: number}} proposal - From processTrackerResponse
 */
export function confirmProposedSpend(chat, proposal) {
    const { skillId, amount } = proposal;
    return withConfig(config => saveUserAction(chat, config, { type: ACTION_TYPES.SPEND, skillId, amount, source: 'ai-confirmed' }, proposal));
}

/** The user declined a model spend proposal: recorded in the history, nothing is applied. */
export function declineProposedSpend(chat, proposal) {
    const { skillId, amount } = proposal;
    return withConfig(config => saveUserAction(chat, config, { type: ACTION_TYPES.DECLINE, skillId, amount, source: 'ai' }, proposal));
}

function withConfig(run) {
    const config = getActiveConfig();
    return config ? run(config) : { ok: false, code: ACTION_INACTIVE };
}
