/**
 * Progressive Skills — changes of the draft configuration made in the config editor.
 *
 * All functions mutate the given (normalized) draft. Field values are parsed by their type; invalid numbers are
 * stored as NaN, so validateConfig reports them and saving stays blocked until they are fixed.
 */
import { VALIDATION_CODES, createSkill } from '../model/index.js';
import { parseInteger } from '../shared/index.js';

/** Editable fields of a skill and their input type. */
export const SKILL_FIELDS = Object.freeze({
    name: 'text',
    description: 'text',
    startValue: 'integer',
    maximumValue: 'integer',
    growthCondition: 'text',
    'progression.enabled': 'boolean',
    'progression.startXp': 'integer',
    'progression.threshold': 'text',
});

/** Editable global fields and their input type. */
export const CONFIG_FIELDS = Object.freeze({
    enabled: 'boolean',
    includeDescriptionsInContext: 'boolean',
    displayInOwnTab: 'boolean',
    maxDelta: 'integer',
    'freeSkillPoints.enabled': 'boolean',
    'freeSkillPoints.start': 'integer',
    'freeSkillPoints.max': 'optionalInteger',
    'freeSkillPoints.growthCondition': 'text',
});

/**
 * Adds a skill. The stable id is derived once from this name; empty and duplicate names are refused.
 * @returns {{ok: true, skill: object} | {ok: false, code: string}}
 */
export function addSkill(config, rawName) {
    const name = String(rawName ?? '').trim();
    if (name === '') return { ok: false, code: VALIDATION_CODES.NAME_EMPTY };
    if (isDuplicateName(config, name)) return { ok: false, code: VALIDATION_CODES.NAME_DUPLICATE };
    const skill = createSkill(name, config.skills.map(s => s.id));
    config.skills.push(skill);
    return { ok: true, skill };
}

/** @returns {boolean} False when no skill has this id. */
export function removeSkill(config, skillId) {
    const index = config.skills.findIndex(skill => skill.id === skillId);
    if (index === -1) return false;
    config.skills.splice(index, 1);
    return true;
}

/**
 * Sets one field from an input value.
 * @param {object} config - Draft configuration
 * @param {{skillId?: string, field: string, raw: unknown}} change - `skillId` for skill fields
 * @returns {boolean} False for unknown skills or fields
 */
export function setConfigField(config, { skillId, field, raw }) {
    const fields = skillId === undefined ? CONFIG_FIELDS : SKILL_FIELDS;
    const type = fields[field];
    if (!type) return false;
    const target = skillId === undefined ? config : config.skills.find(skill => skill.id === skillId);
    if (!target) return false;
    setPath(target, field, parseValue(type, raw));
    return true;
}

function parseValue(type, raw) {
    switch (type) {
        case 'boolean': return raw === true || raw === 'true';
        case 'integer': return parseInteger(raw);
        case 'optionalInteger': return String(raw ?? '').trim() === '' ? null : parseInteger(raw);
        default: return String(raw ?? '');
    }
}

function setPath(target, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const parent = keys.reduce((object, key) => object[key], target);
    parent[last] = value;
}

function isDuplicateName(config, name) {
    const lower = name.toLowerCase();
    return config.skills.some(skill => skill.name.trim().toLowerCase() === lower);
}
