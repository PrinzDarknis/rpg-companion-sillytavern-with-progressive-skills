/**
 * Progressive Skills — progression constants.
 */

/** Types of history entries. */
export const HISTORY_TYPES = Object.freeze({
    XP_GAINED: 'xp_gained',
    DIRECT_INCREASE: 'direct_increase',
    POINTS_EARNED: 'points_earned',
    POINTS_SPENT: 'points_spent',
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
});
