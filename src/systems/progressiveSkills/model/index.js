/**
 * Progressive Skills — data model (pure logic, no host or DOM imports).
 */
export { SCHEMA_VERSION, DEFAULT_MAX_DELTA, SKILL_DEFAULTS, FREE_POINTS_DEFAULTS } from './constants.js';
export { createSkillId } from './skill-id.js';
export { createDefaultConfig, createSkill, normalizeConfig } from './config.js';
export { skillGroup, collectGroups, groupSkills } from './groups.js';
export { initStateFromConfig } from './state.js';
export { VALIDATION_CODES, validateSkill, validateConfig } from './validation.js';
