/**
 * Progressive Skills — compact toast with the applied changes of a tracker update, e.g.
 * `Sword Fighting +5 XP · Climbing +12 XP, +1 Lv. · +1 Point(s)`.
 *
 * Global setting `showProgressiveSkillsUpdateToast` (default on; a missing value counts as on). No toast without
 * changes. Spend proposals keep their own confirmation toasts (progressiveSkillsSpendConfirm.js).
 */
import { i18n } from '../../core/i18n.js';
import { extensionSettings } from '../../core/state.js';
import { buildUpdateSummary, createNotifyTextLookup } from '../progressiveSkills/notify/index.js';

/** Skill names are user text: toastr escapes the plain-text message. */
const OPTIONS = { escapeHtml: true };

/**
 * @param {{changes?: object[]}|null} result - From processTrackerResponse (null when inactive or failed)
 */
export function showUpdateToast(result) {
    try {
        if (!result || extensionSettings.showProgressiveSkillsUpdateToast === false) return;
        const summary = buildUpdateSummary(result.changes, createNotifyTextLookup(key => i18n.getTranslation(key)));
        if (summary) toastr.info(summary, '', OPTIONS);
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills update toast failed:', error);
    }
}
