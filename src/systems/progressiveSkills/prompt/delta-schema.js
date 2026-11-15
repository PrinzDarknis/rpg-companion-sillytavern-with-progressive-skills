/**
 * Progressive Skills — the "progressiveSkills" entry of the unified tracker JSON format (spec §8.1).
 */

/**
 * JSON template for the tracker format block (first line without indentation, like the other tracker
 * templates). Only the variants that the configuration needs are shown.
 * @param {object} config - Normalized, enabled configuration
 * @returns {string}
 */
export function buildDeltaSchemaJSON(config) {
    const examples = [];
    if (config.skills.some(skill => skill.progression.enabled)) {
        examples.push('{"skill_id": "skill id", "xp_gained": X, "reason": "short reason"}');
    }
    if (config.skills.some(skill => !skill.progression.enabled)) {
        examples.push('{"skill_id": "skill id", "direct_increase": X, "reason": "short reason"}');
    }

    let json = '{\n';
    json += '  "skill_updates": [\n';
    json += examples.map(example => `    ${example}`).join(',\n') + '\n';
    json += '  ]';
    if (config.freeSkillPoints.enabled) {
        json += ',\n  "free_skill_points": {"earned": X, "spent": [{"skill_id": "skill id", "amount": X}]}';
    }
    json += '\n}';
    return json;
}
