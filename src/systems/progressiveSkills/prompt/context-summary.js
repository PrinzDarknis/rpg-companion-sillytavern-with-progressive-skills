/**
 * Progressive Skills — compact values block for the chat context of the main roleplay generation.
 */
import { isMaxed, oneLine } from './format.js';

/**
 * E.g. "Skills: Sword Fighting 40/100, Cooking 12/12 (max)\nFree skill points: 2".
 * @param {object} config - Normalized, enabled configuration
 * @param {object} state - Current state (aligned with the configuration)
 * @returns {string} Block without trailing newline; empty when there is nothing to show
 */
export function buildContextSummary(config, state) {
    const lines = [];
    if (config.skills.length > 0) {
        const items = config.skills.map(skill => {
            const entry = state.skills[skill.id];
            let item = `${oneLine(skill.name)} ${entry.value}/${skill.maximumValue}`;
            if (isMaxed(skill, entry)) item += ' (max)';
            const description = oneLine(skill.description);
            if (config.includeDescriptionsInContext && description) item += ` (${description})`;
            return item;
        });
        lines.push(`Skills: ${items.join(', ')}`);
    }
    if (config.freeSkillPoints.enabled) {
        lines.push(`Free skill points: ${state.freePoints}`);
    }
    return lines.join('\n');
}
