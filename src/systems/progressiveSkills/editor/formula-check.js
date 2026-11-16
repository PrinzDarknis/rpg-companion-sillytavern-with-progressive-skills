/**
 * Progressive Skills — live validation of a threshold formula in the config editor (spec §6.4).
 *
 * Runs the engine's `validate()` with corner and random values in the valid ranges and adds the extension's
 * own rule "the threshold must be positive". Only used by the editor — never on every evaluation.
 */
import { validate } from '../../../vendor/formula-engine/index.js';

/** Upper bound of the sampled `xp` values (XP may accumulate beyond the threshold while it is suspended). */
export const XP_SAMPLE_MAX = 1000;

/** Extension diagnostic: the formula evaluates to a value that rounds to 0 or less for some valid input. */
export const THRESHOLD_NOT_POSITIVE = 'THRESHOLD_NOT_POSITIVE';

/**
 * @param {object} skill - Skill of the (draft) configuration
 * @returns {{valid: boolean, fatal: boolean, diagnostics: Array<{code: string, severity: string, token?: string,
 *   variables?: object}>}} `valid` = no diagnostics at all; `fatal` = blocks saving
 */
export function checkThreshold(skill) {
    const max = Number.isSafeInteger(skill.maximumValue) && skill.maximumValue > 0 ? skill.maximumValue : 1;
    const result = validate(String(skill.progression.threshold ?? ''), {
        variables: { skill: [0, max], maxSkill: [max, max], xp: [0, XP_SAMPLE_MAX] },
    });

    const diagnostics = result.diagnostics.map(diagnostic => withVariables(diagnostic, result.samples));
    if (!diagnostics.some(diagnostic => diagnostic.severity === 'fatal')) {
        const sample = result.samples.find(s => s.result.success && !(Math.ceil(s.result.value) > 0));
        if (sample) {
            diagnostics.push({ code: THRESHOLD_NOT_POSITIVE, severity: 'fatal', variables: { ...sample.variables } });
        }
    }
    return {
        valid: diagnostics.length === 0,
        fatal: diagnostics.some(diagnostic => diagnostic.severity === 'fatal'),
        diagnostics,
    };
}

/** Adds the variables of the first sample that produced the diagnostic (useful for value-dependent errors). */
function withVariables(diagnostic, samples) {
    const copy = { ...diagnostic };
    const sample = samples.find(s => s.result.diagnostics.some(d => d.code === diagnostic.code && d.start === diagnostic.start));
    if (sample) copy.variables = { ...sample.variables };
    return copy;
}
