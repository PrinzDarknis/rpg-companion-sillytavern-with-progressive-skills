/**
 * Progressive Skills — validation errors as shown in the config editor.
 */
import { VALIDATION_CODES, validateConfig } from '../model/index.js';

/**
 * validateConfig, but a duplicate name is reported on every skill that carries it (validateConfig reports only
 * the later ones) — so renaming a skill to an existing name marks the renamed skill too.
 * @param {object} config - Draft configuration
 * @returns {object[]} Errors `{ code, skillId?, field? }`
 */
export function getEditorErrors(config) {
    const { errors } = validateConfig(config);
    const duplicates = new Set(errors
        .filter(error => error.code === VALIDATION_CODES.NAME_DUPLICATE)
        .map(error => nameKey(config.skills.find(skill => skill.id === error.skillId))));
    if (duplicates.size === 0) return errors;

    const others = errors.filter(error => error.code !== VALIDATION_CODES.NAME_DUPLICATE);
    const flagged = config.skills
        .filter(skill => duplicates.has(nameKey(skill)))
        .map(skill => ({ code: VALIDATION_CODES.NAME_DUPLICATE, skillId: skill.id, field: 'name' }));
    return [...others, ...flagged];
}

function nameKey(skill) {
    return skill ? skill.name.trim().toLowerCase() : '';
}
