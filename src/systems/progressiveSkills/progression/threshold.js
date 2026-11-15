/**
 * Progressive Skills — XP threshold of a skill at a given value (spec §6).
 */
import { evaluate } from '../../../vendor/formula-engine/index.js';

/**
 * Evaluates the skill's threshold formula with the variables `skill`, `maxSkill` and `xp`.
 * Recovered engine diagnostics are accepted (tolerant policy). Fractional results are rounded up, because XP
 * values are integers.
 * @param {object} skill - Skill from the normalized configuration
 * @param {number} value - Skill value the threshold is evaluated for
 * @param {number} xp - Current XP
 * @returns {{suspended: false, threshold: number, diagnostics: Array} | {suspended: true, threshold: null, diagnostics: Array}}
 *   `suspended` when the formula has a fatal error or the result is not positive: no level-ups until it is fixed
 */
export function evaluateThreshold(skill, value, xp) {
    const result = evaluate(skill.progression.threshold, { skill: value, maxSkill: skill.maximumValue, xp });
    const threshold = Math.ceil(result.value);
    if (!result.success || threshold <= 0) {
        return { suspended: true, threshold: null, diagnostics: result.diagnostics };
    }
    return { suspended: false, threshold, diagnostics: result.diagnostics };
}
