/**
 * Progressive Skills — display model of the dashboard section (spec §10).
 *
 * Turns configuration + displayed state into plain numbers and flags, so the HTML builder needs no logic.
 */
import { groupSkills, skillGroup } from '../model/index.js';
import { evaluateThreshold } from '../progression/index.js';

/**
 * @param {object} config - Normalized, enabled configuration
 * @param {object} state - Displayed state (aligned with the configuration)
 * @returns {{skills: object[], sections: {group: string|null, skills: object[]}[],
 *   freePoints: {available: number, max: number|null}|null}}
 *   `sections`: the skills by group (ungrouped first, see groupSkills); `freePoints` is null when Free Skill Points
 *   are disabled
 */
export function buildDashboardModel(config, state) {
    const skills = config.skills.map(skill => buildSkill(skill, state.skills[skill.id]));
    return {
        skills,
        sections: groupSkills(skills),
        freePoints: config.freeSkillPoints.enabled
            ? { available: state.freePoints, max: config.freeSkillPoints.max }
            : null,
    };
}

/**
 * `progression` is null when XP progression is off (direct growth, no XP shown). With progression on:
 * maxed → no XP values; suspended (unusable threshold) → XP only, no bar; else XP/threshold, remaining XP, bar.
 */
function buildSkill(skill, entry) {
    const value = entry.value;
    const maximum = skill.maximumValue;
    const maxed = value >= maximum;
    return {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        group: skillGroup(skill),
        value,
        maximum,
        maxed,
        progression: skill.progression.enabled ? buildProgression(skill, entry, maxed) : null,
    };
}

function buildProgression(skill, entry, maxed) {
    if (maxed) return { maxed: true, suspended: false, xp: entry.xp, threshold: null, remaining: null, xpPercent: 100 };
    const { suspended, threshold } = evaluateThreshold(skill, entry.value, entry.xp);
    if (suspended) return { maxed: false, suspended: true, xp: entry.xp, threshold: null, remaining: null, xpPercent: null };
    return {
        maxed: false,
        suspended: false,
        xp: entry.xp,
        threshold,
        remaining: Math.max(0, threshold - entry.xp),
        xpPercent: percent(entry.xp, threshold),
    };
}

/** Bar fill in percent, clamped to 0..100. */
function percent(part, whole) {
    if (!(whole > 0)) return 0;
    return Math.min(100, Math.max(0, (part / whole) * 100));
}
