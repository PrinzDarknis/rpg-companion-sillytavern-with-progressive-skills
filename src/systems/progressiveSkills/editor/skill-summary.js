/**
 * Progressive Skills — summary line of a collapsible skill card in the config editor.
 */
/**
 * Skill name (or the id while the name is empty), plus the XP suffix while progression is enabled.
 * @returns {string} Plain (unescaped) text
 */
export function skillSummaryText(skill, text) {
    const name = skill.name.trim() === '' ? skill.id : skill.name.trim();
    return skill.progression.enabled ? `${name} ${text('xpSuffix')}` : name;
}

/**
 * Ids of skills that show errors: validation errors (incl. those of the threshold field) or an invalid threshold
 * of a skill with progression enabled. Used to mark collapsed cards.
 * @param {object} config - Draft configuration
 * @param {Record<string, object>} checks - checkThreshold results by skill id
 * @param {object[]} errors - From getEditorErrors
 * @returns {Set<string>}
 */
export function skillsWithErrors(config, checks, errors) {
    const ids = new Set(errors.filter(error => error.skillId !== undefined).map(error => error.skillId));
    for (const skill of config.skills) {
        const check = checks[skill.id];
        if (skill.progression.enabled && check && !check.valid) ids.add(skill.id);
    }
    return ids;
}
