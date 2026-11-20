/**
 * Progressive Skills — skill groups (display only).
 *
 * Groups have no own list: they are the set of non-empty `group` values of the skills. Names are compared exactly
 * after trimming (case-sensitive).
 */

/** @returns {string} Trimmed group name of a skill ('' = ungrouped). */
export function skillGroup(skill) {
    return typeof skill?.group === 'string' ? skill.group.trim() : '';
}

/** @returns {string[]} Distinct non-empty group names, sorted (editor suggestions). */
export function collectGroups(skills) {
    return [...new Set(skills.map(skillGroup).filter(group => group !== ''))]
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Splits skills into display sections: ungrouped skills first (`group: null`), then one section per group in the
 * order of the group's first appearance. Empty sections are omitted; the skill order inside a section is kept.
 * @template T
 * @param {T[]} skills
 * @returns {{group: string|null, skills: T[]}[]}
 */
export function groupSkills(skills) {
    const ungrouped = { group: null, skills: [] };
    const sections = new Map();
    for (const skill of skills) {
        const group = skillGroup(skill);
        if (group === '') {
            ungrouped.skills.push(skill);
            continue;
        }
        if (!sections.has(group)) sections.set(group, { group, skills: [] });
        sections.get(group).skills.push(skill);
    }
    return [ungrouped, ...sections.values()].filter(section => section.skills.length > 0);
}
