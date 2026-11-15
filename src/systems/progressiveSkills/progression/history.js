/**
 * Progressive Skills — history entries (spec §11).
 *
 * Entry: { type, skillId?, skillName?, amount?, before?, after?, levelUps?, thresholdSuspended?, code?, reason?, source }
 * `before` / `after` are `{ value, xp }` for skill changes and `{ points }` for point-pool changes.
 */
import { HISTORY_TYPES } from './constants.js';

/** @returns {object} A history entry for an applied change. */
export function changeEntry(type, { skill, amount, before, after, levelUps, thresholdSuspended, reason, source }) {
    const entry = { type, amount, before, after, source };
    if (skill) Object.assign(entry, { skillId: skill.id, skillName: skill.name });
    if (levelUps !== undefined) entry.levelUps = levelUps;
    if (thresholdSuspended) entry.thresholdSuspended = true;
    if (reason) entry.reason = reason;
    return entry;
}

/** @returns {object} A history entry for a rejected change. */
export function rejectionEntry(code, { skillId, skill, amount, reason, source }) {
    const entry = { type: HISTORY_TYPES.REJECTED, code, source };
    const id = skill?.id ?? skillId;
    if (id !== undefined) entry.skillId = id;
    if (skill) entry.skillName = skill.name;
    if (amount !== undefined) entry.amount = amount;
    if (reason) entry.reason = reason;
    return entry;
}
