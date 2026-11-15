/**
 * Progressive Skills — turning the model's "progressiveSkills" object into an analysis for applyAnalysis.
 *
 * Model output:  { skill_updates: [{ skill_id, xp_gained?, direct_increase?, reason? }],
 *                  free_skill_points?: { earned?, spent?: [{ skill_id, amount }] } }
 * Analysis:      { skillUpdates: [{ skillId, xpGained?, directIncrease?, reason? }], pointsEarned?, spends }
 *
 * Only the known keys are read; anything else (absolute values, thresholds, level-ups, authorization claims)
 * is ignored. Amounts are passed on as given (numbers, or short strings) so that applyAnalysis rejects invalid
 * ones with a history entry; 0 and missing amounts mean "no change". Unknown skill ids are passed on as well and
 * rejected there (UNKNOWN_SKILL). Lists are capped, reasons truncated.
 */
import { extractSection } from './extract-section.js';

export const RESPONSE_KEY = 'progressiveSkills';
const MAX_ENTRIES = 50;
const MAX_REASON_LENGTH = 200;
const MAX_ID_LENGTH = 100;

/**
 * @param {string} response - Raw model response
 * @returns {{found: false} | {found: true, error: string} | {found: true, analysis: object}}
 */
export function parseAnalysis(response) {
    const section = extractSection(response, RESPONSE_KEY);
    if (!section.found || section.error) return section;
    const raw = section.value;

    const skillUpdates = list(raw.skill_updates).map(toSkillUpdate).filter(Boolean);
    const analysis = { skillUpdates, spends: [] };
    const points = isObject(raw.free_skill_points) ? raw.free_skill_points : {};
    const earned = amount(points.earned);
    if (earned !== undefined) analysis.pointsEarned = earned;
    analysis.spends = list(points.spent).map(toSpend).filter(Boolean);
    return { found: true, analysis };
}

function toSkillUpdate(entry) {
    const skillId = id(entry?.skill_id);
    if (!skillId) return null;
    const xpGained = amount(entry.xp_gained);
    const directIncrease = amount(entry.direct_increase);
    if (xpGained === undefined && directIncrease === undefined) return null;
    const update = { skillId };
    if (xpGained !== undefined) update.xpGained = xpGained;
    if (directIncrease !== undefined) update.directIncrease = directIncrease;
    if (typeof entry.reason === 'string' && entry.reason.trim()) update.reason = entry.reason.trim().slice(0, MAX_REASON_LENGTH);
    return update;
}

function toSpend(entry) {
    const skillId = id(entry?.skill_id);
    const value = amount(entry?.amount);
    return skillId && value !== undefined ? { skillId, amount: value } : null;
}

/** undefined = no change (missing, null, 0, empty); numbers as given; anything else as a short string. */
function amount(value) {
    if (value === undefined || value === null || value === 0 || value === '') return undefined;
    if (typeof value === 'number') return value;
    return String(value).slice(0, 20);
}

function id(value) {
    return typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_ID_LENGTH) : null;
}

function list(value) {
    return Array.isArray(value) ? value.filter(isObject).slice(0, MAX_ENTRIES) : [];
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
