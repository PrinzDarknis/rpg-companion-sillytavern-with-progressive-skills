/**
 * Progressive Skills — i18n keys of point spending (dashboard form and confirmation toast) with English fallbacks.
 */
import { createLookup } from '../shared/index.js';

export const SPEND_TEXTS = {
    proposalTitle: ['progressiveSkills.spend.proposalTitle', 'Spend skill points?'],
    proposalMessage: ['progressiveSkills.spend.proposalMessage', 'The model suggests spending {amount} free skill point(s) on {skill}.'],
    proposalApply: ['progressiveSkills.spend.apply', 'Apply'],
    proposalDecline: ['progressiveSkills.spend.decline', 'Decline'],
    applied: ['progressiveSkills.spend.applied', 'Spent {amount} skill point(s) on {skill}.'],
    declined: ['progressiveSkills.spend.declined', 'Declined: {amount} skill point(s) on {skill}.'],
    notSpentTitle: ['progressiveSkills.spend.notSpentTitle', 'Skill points not spent'],
    notSpentMessage: ['progressiveSkills.spend.notSpentMessage', '{amount} skill point(s) on {skill}: {reason}'],
    errorInsufficient: ['progressiveSkills.spend.error.insufficient', 'Not enough free skill points.'],
    errorExceedsMaximum: ['progressiveSkills.spend.error.exceedsMaximum', 'The skill would exceed its maximum value.'],
    errorMaxed: ['progressiveSkills.spend.error.maxed', 'The skill is already at its maximum value.'],
    errorInvalidAmount: ['progressiveSkills.spend.error.invalidAmount', 'The amount must be a whole number of at least 1.'],
    errorTooLarge: ['progressiveSkills.spend.error.tooLarge', 'The amount is larger than the maximum change per update ({maxDelta}).'],
    errorDisabled: ['progressiveSkills.spend.error.disabled', 'Free skill points are disabled.'],
    errorUnknownSkill: ['progressiveSkills.spend.error.unknownSkill', 'There is no skill with this id.'],
    errorNoTarget: ['progressiveSkills.spend.error.noTarget', 'There is no message yet that could store the change.'],
    errorExpired: ['progressiveSkills.spend.error.expired', 'The suggestion is outdated: the chat has changed since.'],
    errorFailed: ['progressiveSkills.spend.error.failed', 'The change could not be applied.'],
};

/** Text names of the result codes of a spend (rejection codes and store/integration codes). */
const ERROR_NAMES = {
    INSUFFICIENT_POINTS: 'errorInsufficient',
    EXCEEDS_MAXIMUM: 'errorExceedsMaximum',
    SKILL_MAXED: 'errorMaxed',
    INVALID_AMOUNT: 'errorInvalidAmount',
    AMOUNT_TOO_LARGE: 'errorTooLarge',
    FREE_POINTS_DISABLED: 'errorDisabled',
    UNKNOWN_SKILL: 'errorUnknownSkill',
    NO_TARGET: 'errorNoTarget',
    EXPIRED: 'errorExpired',
};

/** @returns {keyof SPEND_TEXTS} The text name for a spend result code (generic text for unknown codes). */
export function spendErrorName(code) {
    return ERROR_NAMES[code] ?? 'errorFailed';
}

/**
 * @param {(key: string) => (string|null|undefined)} translate
 * @returns {(name: keyof SPEND_TEXTS, params?: object) => string} Plain (unescaped) text
 */
export function createSpendTextLookup(translate) {
    return createLookup(SPEND_TEXTS, translate);
}
