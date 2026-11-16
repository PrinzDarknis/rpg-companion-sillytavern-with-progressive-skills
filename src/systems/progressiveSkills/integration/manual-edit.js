/**
 * Progressive Skills — manual edit of a skill from the dashboard (spec §10).
 */
import { saveManualEdit } from '../store/index.js';
import { getActiveConfig } from './settings.js';

/** Result code when the feature is not active. */
export const MANUAL_EDIT_INACTIVE = 'INACTIVE';

/**
 * Validates and stores a manual edit on the latest assistant message. The caller saves the chat and re-renders.
 * @param {object[]} chat
 * @param {{skillId: string, value?: number, xp?: number}} edit
 * @returns {{ok: true, changed: boolean, state: object} | {ok: false, code: string}}
 */
export function applyManualSkillEdit(chat, edit) {
    const config = getActiveConfig();
    if (!config) return { ok: false, code: MANUAL_EDIT_INACTIVE };
    return saveManualEdit(chat, config, edit);
}
