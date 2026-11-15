/**
 * Progressive Skills — instructions for the tracker analysis request (spec §5.3, §5.4, §8, §8.2).
 */
import { describeXp, isMaxed, oneLine } from './format.js';

/**
 * @param {object} config - Normalized, enabled configuration
 * @param {object} state - Base state of the analysed turn (aligned with the configuration)
 * @param {string} userName - Name of the protagonist
 * @returns {string} Section text (starts with a blank line)
 */
export function buildAnalysisInstructions(config, state, userName) {
    const name = oneLine(userName) || 'the protagonist';
    let text = '\n\nPROGRESSIVE SKILLS:\n';
    text += `In "progressiveSkills", report how ${name}'s skills progress through the events of the last assistant message `
        + '(and the user message it answers). Earlier progress is already counted.\n';
    text += '- Report changes only, as positive whole numbers. Never report current values, XP totals, thresholds or '
        + 'level-ups; they are calculated automatically.\n';
    text += '- Skills marked [XP]: when the growth condition is met, report "xp_gained" as the condition describes. '
        + 'Skills marked [direct]: when the growth condition is met, report "direct_increase" as the condition describes.\n';
    text += '- Report progress only for things that actually happened in the scene and meet the growth condition. '
        + 'A skill being mentioned, planned or wished for is not progress. Do not invent events.\n';
    text += '- Skills marked maxed cannot progress; do not report them.\n';
    text += '- If nothing qualifies, return an empty "skill_updates" list.\n';

    if (config.freeSkillPoints.enabled) {
        const condition = oneLine(config.freeSkillPoints.growthCondition) || 'never, unless the story clearly grants them';
        const max = config.freeSkillPoints.max === null ? '' : ` (max ${config.freeSkillPoints.max})`;
        text += `- Free skill points: ${state.freePoints} available${max}. Report "earned" only when this condition is met: ${condition}\n`;
        text += `- Report "spent" only when the user explicitly asks in their own message to spend free skill points on a `
            + 'specific skill. Never infer it from a wish to improve, train or practise. Otherwise leave "spent" empty.\n';
    }

    text += '\nSkills (id | name | mode | value | progress | growth condition | description):\n';
    for (const skill of config.skills) {
        const entry = state.skills[skill.id];
        const mode = skill.progression.enabled ? 'XP' : 'direct';
        const progress = skill.progression.enabled ? describeXp(skill, entry) : (isMaxed(skill, entry) ? 'maxed' : '-');
        const fields = [
            skill.id, oneLine(skill.name), `[${mode}]`, `${entry.value}/${skill.maximumValue}`, progress,
            oneLine(skill.growthCondition) || '-', oneLine(skill.description) || '-',
        ];
        text += `- ${fields.join(' | ')}\n`;
    }
    return text;
}
