/**
 * Progressive Skills — runtime state (stored per message swipe).
 *
 * Shape: { schemaVersion, skills: { [skillId]: { value, xp } }, freePoints }
 */
import { SCHEMA_VERSION } from './constants.js';

/**
 * Builds the state for a configuration, reusing a previous state where possible:
 * - skills present in `previousState` keep their value and XP (by id; renames do not matter),
 *   capped to the current maximum;
 * - new skills start with their configured start values; skills deleted from the config are dropped;
 * - a missing or unusable previous state (not an object, other schema version) counts as "no state".
 * Changing a start value in the config therefore does not affect chats that already have state.
 * @param {object} config - Normalized configuration
 * @param {unknown} previousState - Stored state of the previous turn, if any
 */
export function initStateFromConfig(config, previousState = null) {
    const previous = isUsableState(previousState) ? previousState : null;
    const skills = {};
    for (const skill of config.skills) {
        const stored = previous?.skills?.[skill.id];
        const value = isCount(stored?.value) ? stored.value : skill.startValue;
        const xp = isCount(stored?.xp) ? stored.xp : skill.progression.startXp;
        skills[skill.id] = { value: Math.min(value, skill.maximumValue), xp };
    }
    const freePoints = isCount(previous?.freePoints) ? previous.freePoints : config.freeSkillPoints.start;
    return { schemaVersion: SCHEMA_VERSION, skills, freePoints };
}

function isUsableState(state) {
    return state !== null && typeof state === 'object' && state.schemaVersion === SCHEMA_VERSION
        && state.skills !== null && typeof state.skills === 'object';
}

function isCount(value) {
    return Number.isSafeInteger(value) && value >= 0;
}
