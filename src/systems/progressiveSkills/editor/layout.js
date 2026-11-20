/**
 * Progressive Skills — display order of the skill cards in the config editor.
 *
 * The layout is built once when the tab is rendered (editor open, reset, import): ungrouped skills first, then one
 * section per group (see groupSkills). While editing it stays frozen, so no card moves when its group, name or
 * settings change; skills added later go to `appended` (below all sections). The configured skill order is not
 * changed — the layout only affects the display.
 */
import { groupSkills } from '../model/index.js';

/**
 * @param {object[]} skills - Configured skills
 * @returns {{sections: {group: string|null, skillIds: string[]}[], appended: string[]}}
 */
export function buildEditorLayout(skills) {
    return {
        sections: groupSkills(skills).map(section => ({ group: section.group, skillIds: section.skills.map(s => s.id) })),
        appended: [],
    };
}

/**
 * Aligns a layout with the current skills without re-sorting: ids of deleted skills are dropped, skills not in
 * the layout yet are appended in configuration order. Returns a new layout.
 */
export function syncEditorLayout(layout, skills) {
    const existing = new Set(skills.map(skill => skill.id));
    const keep = ids => ids.filter(id => existing.has(id));
    const sections = layout.sections.map(section => ({ group: section.group, skillIds: keep(section.skillIds) }));
    const appended = keep(layout.appended);
    const placed = new Set([...sections.flatMap(section => section.skillIds), ...appended]);
    for (const skill of skills) {
        if (!placed.has(skill.id)) appended.push(skill.id);
    }
    return { sections, appended };
}
