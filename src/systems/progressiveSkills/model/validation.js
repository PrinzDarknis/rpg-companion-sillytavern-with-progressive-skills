/**
 * Progressive Skills — configuration validation (spec §5.2, §5.4, §13).
 *
 * Returns structured errors `{ code, skillId?, field? }`; the UI maps `code` to translated texts.
 * Threshold formulas are checked separately with the formula engine (config UI).
 */

/** Error codes returned by validateConfig / validateSkill. */
export const VALIDATION_CODES = Object.freeze({
    ID_INVALID: 'ID_INVALID',
    ID_DUPLICATE: 'ID_DUPLICATE',
    NAME_EMPTY: 'NAME_EMPTY',
    NAME_DUPLICATE: 'NAME_DUPLICATE',
    NOT_INTEGER: 'NOT_INTEGER',
    MAXIMUM_NOT_POSITIVE: 'MAXIMUM_NOT_POSITIVE',
    START_VALUE_OUT_OF_RANGE: 'START_VALUE_OUT_OF_RANGE',
    START_XP_NEGATIVE: 'START_XP_NEGATIVE',
    THRESHOLD_EMPTY: 'THRESHOLD_EMPTY',
    GROWTH_CONDITION_EMPTY: 'GROWTH_CONDITION_EMPTY',
    FREE_POINTS_NEGATIVE: 'FREE_POINTS_NEGATIVE',
    FREE_POINTS_MAX_INVALID: 'FREE_POINTS_MAX_INVALID',
    MAX_DELTA_INVALID: 'MAX_DELTA_INVALID',
});

const C = VALIDATION_CODES;

/**
 * Validates one skill on its own (no duplicate checks).
 * @param {object} skill - Normalized skill
 * @returns {Array<{code: string, skillId: string, field: string}>}
 */
export function validateSkill(skill) {
    const errors = [];
    const add = (code, field) => errors.push({ code, skillId: skill.id, field });

    if (typeof skill.id !== 'string' || skill.id.trim() === '') add(C.ID_INVALID, 'id');
    if (skill.name.trim() === '') add(C.NAME_EMPTY, 'name');
    if (skill.growthCondition.trim() === '') add(C.GROWTH_CONDITION_EMPTY, 'growthCondition');

    const integers = { startValue: skill.startValue, maximumValue: skill.maximumValue, startXp: skill.progression.startXp };
    for (const [field, value] of Object.entries(integers)) {
        if (!Number.isSafeInteger(value)) add(C.NOT_INTEGER, field);
    }
    if (skill.maximumValue <= 0) add(C.MAXIMUM_NOT_POSITIVE, 'maximumValue');
    if (skill.startValue < 0 || skill.startValue > skill.maximumValue) add(C.START_VALUE_OUT_OF_RANGE, 'startValue');
    if (skill.progression.startXp < 0) add(C.START_XP_NEGATIVE, 'startXp');
    if (skill.progression.enabled && skill.progression.threshold.trim() === '') add(C.THRESHOLD_EMPTY, 'threshold');
    return errors;
}

/**
 * Validates a whole configuration: every skill, unique ids and names (case-insensitive), free points.
 * @param {object} config - Normalized configuration
 * @returns {{valid: boolean, errors: Array<{code: string, skillId?: string, field?: string}>}}
 */
export function validateConfig(config) {
    const errors = config.skills.flatMap(validateSkill);
    if (!Number.isSafeInteger(config.maxDelta) || config.maxDelta <= 0) {
        errors.push({ code: C.MAX_DELTA_INVALID, field: 'maxDelta' });
    }

    const ids = new Set();
    const names = new Set();
    for (const skill of config.skills) {
        if (ids.has(skill.id)) errors.push({ code: C.ID_DUPLICATE, skillId: skill.id, field: 'id' });
        ids.add(skill.id);
        const name = skill.name.trim().toLowerCase();
        if (name !== '' && names.has(name)) errors.push({ code: C.NAME_DUPLICATE, skillId: skill.id, field: 'name' });
        names.add(name);
    }

    const points = config.freeSkillPoints;
    if (!Number.isSafeInteger(points.start)) errors.push({ code: C.NOT_INTEGER, field: 'freeSkillPoints.start' });
    else if (points.start < 0) errors.push({ code: C.FREE_POINTS_NEGATIVE, field: 'freeSkillPoints.start' });
    if (points.max !== null && (!Number.isSafeInteger(points.max) || points.max <= 0 || points.start > points.max)) {
        errors.push({ code: C.FREE_POINTS_MAX_INVALID, field: 'freeSkillPoints.max' });
    }
    if (points.enabled && points.growthCondition.trim() === '') {
        errors.push({ code: C.GROWTH_CONDITION_EMPTY, field: 'freeSkillPoints.growthCondition' });
    }
    return { valid: errors.length === 0, errors };
}
