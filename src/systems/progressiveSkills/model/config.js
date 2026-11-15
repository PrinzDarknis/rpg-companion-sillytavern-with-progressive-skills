/**
 * Progressive Skills — configuration (stored in extensionSettings.trackerConfig.progressiveSkills).
 *
 * Shape:
 *   { schemaVersion, enabled, includeDescriptionsInContext, maxDelta, skills: Skill[], freeSkillPoints }
 *   includeDescriptionsInContext: also send skill descriptions in the chat context (values are always sent)
 *   maxDelta: largest accepted single delta (XP, direct increase, points) per proposal; larger ones are rejected
 *   Skill = { id, name, description, startValue, maximumValue, growthCondition,
 *             progression: { enabled, startXp, threshold } }
 *   freeSkillPoints = { enabled, start, max (number | null), growthCondition }
 *
 * `threshold` is always stored as a string (a fixed number like "12" or a formula like "10 + floor(skill / 5)").
 */
import { DEFAULT_MAX_DELTA, FREE_POINTS_DEFAULTS, SCHEMA_VERSION, SKILL_DEFAULTS } from './constants.js';
import { createSkillId } from './skill-id.js';

/** @returns {object} A new, disabled configuration without skills. */
export function createDefaultConfig() {
    return {
        schemaVersion: SCHEMA_VERSION,
        enabled: false,
        includeDescriptionsInContext: false,
        maxDelta: DEFAULT_MAX_DELTA,
        skills: [],
        freeSkillPoints: { ...FREE_POINTS_DEFAULTS },
    };
}

/**
 * Creates a skill with default values and a unique id.
 * @param {string} name - Display name
 * @param {Iterable<string>} existingIds - Ids already used in the configuration
 */
export function createSkill(name, existingIds = []) {
    return {
        ...SKILL_DEFAULTS,
        id: createSkillId(name, existingIds),
        name: String(name ?? ''),
        progression: { ...SKILL_DEFAULTS.progression },
    };
}

/**
 * Returns a complete configuration: missing or wrongly typed fields get their defaults. Anything that is not
 * an object yields the default configuration. Values are not range-checked here (see validateConfig).
 * @param {unknown} raw - Stored configuration (may be missing or from an older preset)
 */
export function normalizeConfig(raw) {
    const config = createDefaultConfig();
    if (!isObject(raw)) return config;

    config.enabled = pick(raw.enabled, 'boolean', config.enabled);
    config.includeDescriptionsInContext = pick(raw.includeDescriptionsInContext, 'boolean', config.includeDescriptionsInContext);
    config.maxDelta = pick(raw.maxDelta, 'number', config.maxDelta);
    const usedIds = [];
    config.skills = (Array.isArray(raw.skills) ? raw.skills : []).filter(isObject).map(skill => {
        const normalized = normalizeSkill(skill, usedIds);
        usedIds.push(normalized.id);
        return normalized;
    });
    const points = isObject(raw.freeSkillPoints) ? raw.freeSkillPoints : {};
    config.freeSkillPoints = {
        enabled: pick(points.enabled, 'boolean', FREE_POINTS_DEFAULTS.enabled),
        start: pick(points.start, 'number', FREE_POINTS_DEFAULTS.start),
        max: typeof points.max === 'number' ? points.max : null,
        growthCondition: pick(points.growthCondition, 'string', FREE_POINTS_DEFAULTS.growthCondition),
    };
    return config;
}

function normalizeSkill(raw, usedIds) {
    const name = pick(raw.name, 'string', SKILL_DEFAULTS.name);
    const progression = isObject(raw.progression) ? raw.progression : {};
    const threshold = typeof progression.threshold === 'number' ? String(progression.threshold) : progression.threshold;
    return {
        id: typeof raw.id === 'string' && raw.id !== '' ? raw.id : createSkillId(name, usedIds),
        name,
        description: pick(raw.description, 'string', SKILL_DEFAULTS.description),
        startValue: pick(raw.startValue, 'number', SKILL_DEFAULTS.startValue),
        maximumValue: pick(raw.maximumValue, 'number', SKILL_DEFAULTS.maximumValue),
        growthCondition: pick(raw.growthCondition, 'string', SKILL_DEFAULTS.growthCondition),
        progression: {
            enabled: pick(progression.enabled, 'boolean', SKILL_DEFAULTS.progression.enabled),
            startXp: pick(progression.startXp, 'number', SKILL_DEFAULTS.progression.startXp),
            threshold: pick(threshold, 'string', SKILL_DEFAULTS.progression.threshold),
        },
    };
}

function pick(value, type, fallback) {
    return typeof value === type ? value : fallback;
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
