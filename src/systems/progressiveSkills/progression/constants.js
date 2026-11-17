/**
 * Progressive Skills — progression constants.
 */

/** Types of history entries. */
export const HISTORY_TYPES = Object.freeze({
    XP_GAINED: 'xp_gained',
    DIRECT_INCREASE: 'direct_increase',
    POINTS_EARNED: 'points_earned',
    POINTS_SPENT: 'points_spent',
    MANUAL_EDIT: 'manual_edit',
    REJECTED: 'rejected',
});

/** Why a proposed change was not applied. */
export const REJECTION_CODES = Object.freeze({
    UNKNOWN_SKILL: 'UNKNOWN_SKILL',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    AMOUNT_TOO_LARGE: 'AMOUNT_TOO_LARGE',
    WRONG_MODE: 'WRONG_MODE',
    SKILL_MAXED: 'SKILL_MAXED',
    FREE_POINTS_DISABLED: 'FREE_POINTS_DISABLED',
    POINT_POOL_FULL: 'POINT_POOL_FULL',
    INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
    EXCEEDS_MAXIMUM: 'EXCEEDS_MAXIMUM',
    INVALID_VALUE: 'INVALID_VALUE',
    INVALID_XP: 'INVALID_XP',
    INVALID_POINTS: 'INVALID_POINTS',
    DECLINED: 'DECLINED',
});

/** Types of user actions stored per swipe in `deltas.actions` (applied in order after the analysis). */
export const ACTION_TYPES = Object.freeze({
    /** Spend free points on a skill: { skillId, amount, source: 'ui' | 'ai-confirmed' } */
    SPEND: 'spend',
    /** Manual edit of a skill: { skillId, value?, xp?, source } (absolute values) */
    EDIT: 'edit',
    /** Manual edit of the free-point balance: { value, source } (absolute value) */
    POINTS: 'points',
    /** A model spend proposal the user declined: { skillId, amount, source: 'ai' } (history only) */
    DECLINE: 'decline',
});
