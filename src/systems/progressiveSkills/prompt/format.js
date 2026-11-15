/**
 * Progressive Skills — small text helpers for prompt sections.
 */
import { evaluateThreshold } from '../progression/index.js';

/** Collapses whitespace so user-written texts stay on one prompt line. */
export function oneLine(text) {
    return String(text ?? '').replace(/\s+/g, ' ').trim();
}

/** @returns {boolean} True when the skill is at its maximum value. */
export function isMaxed(skill, entry) {
    return entry.value >= skill.maximumValue;
}

/**
 * Progress text of a skill with XP progression, e.g. "XP 4/12", "maxed" or "XP 4 (threshold invalid)".
 * @param {object} skill - Skill from the normalized configuration
 * @param {{value: number, xp: number}} entry - State entry of the skill
 */
export function describeXp(skill, entry) {
    if (isMaxed(skill, entry)) return 'maxed';
    const { suspended, threshold } = evaluateThreshold(skill, entry.value, entry.xp);
    return suspended ? `XP ${entry.xp} (threshold invalid)` : `XP ${entry.xp}/${threshold}`;
}
