/**
 * Progressive Skills — changes of a single skill (spec §7.1, §7.2, §7.4, §7.5).
 *
 * Each function receives the skill config and its current `{ value, xp }` and returns either
 * `{ ok: true, value, xp, ... }` or `{ ok: false, code }`. Inputs are never mutated.
 */
import { REJECTION_CODES } from './constants.js';
import { evaluateThreshold } from './threshold.js';

/**
 * Adds XP and processes level-ups: while below the maximum and XP ≥ threshold, raise the value by one,
 * subtract the threshold used, re-evaluate the threshold. At the maximum, XP becomes 0.
 * An unusable threshold (fatal formula error, result ≤ 0) only blocks level-ups: the XP is still added and
 * accumulates until the user fixes the formula; the next gain then processes the overflow automatically
 * (user decision). The result reports this as `thresholdSuspended: true`.
 * @param {object} skill - Skill config (progression enabled)
 * @param {{value: number, xp: number}} current
 * @param {number} amount - Valid positive XP gain
 */
export function gainXp(skill, current, amount) {
    if (!skill.progression.enabled) return { ok: false, code: REJECTION_CODES.WRONG_MODE };
    if (current.value >= skill.maximumValue) return { ok: false, code: REJECTION_CODES.SKILL_MAXED };

    let { value } = current;
    let xp = current.xp + amount;
    let levelUps = 0;
    let next = evaluateThreshold(skill, value, xp);
    while (!next.suspended && value < skill.maximumValue && xp >= next.threshold) {
        xp -= next.threshold;
        value++;
        levelUps++;
        if (value >= skill.maximumValue) break;
        next = evaluateThreshold(skill, value, xp);
    }
    if (value >= skill.maximumValue) {
        return { ok: true, value, xp: 0, levelUps, thresholdSuspended: false };
    }
    return { ok: true, value, xp, levelUps, thresholdSuspended: next.suspended };
}

/**
 * Raises a skill without progression directly, capped at its maximum.
 * @param {object} skill - Skill config (progression disabled)
 * @param {{value: number, xp: number}} current
 * @param {number} amount - Valid positive increase
 */
export function increaseDirectly(skill, current, amount) {
    if (skill.progression.enabled) return { ok: false, code: REJECTION_CODES.WRONG_MODE };
    if (current.value >= skill.maximumValue) return { ok: false, code: REJECTION_CODES.SKILL_MAXED };
    return { ok: true, value: Math.min(current.value + amount, skill.maximumValue), xp: current.xp };
}

/**
 * Raises a skill by spent points (any progression setting). The full amount must fit below the maximum.
 * With progression enabled, XP is reset to 0 (agreed behaviour, spec §7.3).
 * @param {object} skill - Skill config
 * @param {{value: number, xp: number}} current
 * @param {number} amount - Valid positive number of points
 */
export function raiseByPoints(skill, current, amount) {
    if (current.value >= skill.maximumValue) return { ok: false, code: REJECTION_CODES.SKILL_MAXED };
    if (current.value + amount > skill.maximumValue) return { ok: false, code: REJECTION_CODES.EXCEEDS_MAXIMUM };
    const value = current.value + amount;
    const xp = skill.progression.enabled ? 0 : current.xp; // without progression, stored XP is preserved (spec §5.5)
    return { ok: true, value, xp };
}
