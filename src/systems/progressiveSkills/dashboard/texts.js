/**
 * Progressive Skills — i18n keys of the dashboard section with their English fallbacks.
 */
import { createLookup } from '../shared/index.js';
import { SPEND_TEXTS } from '../spend/index.js';

export const DASHBOARD_TEXTS = {
    title: ['progressiveSkills.title', 'Progressive Skills'],
    empty: ['progressiveSkills.empty', 'No skills configured yet.'],
    description: ['progressiveSkills.description', 'Description'],
    statusXp: ['progressiveSkills.status.xp', 'XP progression'],
    statusDirect: ['progressiveSkills.status.direct', 'Direct growth'],
    statusMaxed: ['progressiveSkills.status.maxed', 'Maxed'],
    xp: ['progressiveSkills.xp', 'XP'],
    remaining: ['progressiveSkills.remaining', '{remaining} XP to next level'],
    thresholdInvalid: ['progressiveSkills.thresholdInvalid',
        'Threshold invalid — XP keeps accumulating, no level-ups until fixed'],
    freePoints: ['progressiveSkills.freePoints', 'Free skill points'],
    edit: ['progressiveSkills.edit.button', 'Edit value and XP'],
    editValue: ['progressiveSkills.edit.value', 'Value'],
    editXp: ['progressiveSkills.edit.xp', 'XP'],
    editSave: ['progressiveSkills.edit.save', 'Save'],
    editCancel: ['progressiveSkills.edit.cancel', 'Cancel'],
    editInvalidValue: ['progressiveSkills.edit.invalidValue', 'Value must be a whole number between 0 and {max}.'],
    editInvalidXp: ['progressiveSkills.edit.invalidXp', 'XP must be a whole number of at least 0.'],
    editNoTarget: ['progressiveSkills.edit.noTarget', 'There is no message yet that could store the change.'],
    editFailed: ['progressiveSkills.edit.failed', 'The change could not be applied.'],
    spend: ['progressiveSkills.spend.button', 'Spend free skill points'],
    spendAmount: ['progressiveSkills.spend.amount', 'Points'],
    spendSave: ['progressiveSkills.spend.save', 'Spend'],
    spendXpReset: ['progressiveSkills.spend.xpReset', 'XP is reset to 0.'],
    pointsEdit: ['progressiveSkills.points.edit', 'Edit free skill points'],
    pointsInvalid: ['progressiveSkills.points.invalid', 'Free skill points must be a whole number between 0 and {max}.'],
    pointsInvalidNoMax: ['progressiveSkills.points.invalidNoMax', 'Free skill points must be a whole number of at least 0.'],
};

/**
 * Builds the text lookup used by the HTML builder.
 * @param {(key: string) => (string|null|undefined)} translate - Returns the translation or a falsy value
 * @returns {(name: keyof DASHBOARD_TEXTS | keyof SPEND_TEXTS, params?: object) => string} Plain (unescaped) text
 */
export function createTextLookup(translate) {
    return createLookup({ ...DASHBOARD_TEXTS, ...SPEND_TEXTS }, translate);
}
