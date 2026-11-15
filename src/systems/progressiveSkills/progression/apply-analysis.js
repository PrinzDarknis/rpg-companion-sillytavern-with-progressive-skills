/**
 * Progressive Skills — applying the result of one AI analysis to the state (spec §7, §8.1, §9.3).
 *
 * Analysis (produced by the response parser):
 *   { skillUpdates: [{ skillId, xpGained?, directIncrease?, reason? }], pointsEarned?, spends: [{ skillId, amount }] }
 *
 * Every entry is its own transaction: it is computed on a copy and committed only when valid; an invalid entry
 * is rejected (history entry) without affecting the others. Point spends proposed by the model are never applied
 * here — they are returned as `pendingSpends` and need the user's confirmation (see spendPoints).
 */
import { initStateFromConfig } from '../model/index.js';
import { checkAmount } from './amount.js';
import { HISTORY_TYPES, REJECTION_CODES } from './constants.js';
import { changeEntry, rejectionEntry } from './history.js';
import { gainXp, increaseDirectly } from './skill-changes.js';

/**
 * @param {unknown} previousState - State of the previous turn (may be missing)
 * @param {object} config - Normalized configuration
 * @param {object} analysis - Parsed AI analysis
 * @param {string} source - Origin recorded in the history (default "ai")
 * @returns {{state: object, history: object[], pendingSpends: Array<{skillId: string, amount: number}>}}
 */
export function applyAnalysis(previousState, config, analysis, source = 'ai') {
    const state = initStateFromConfig(config, previousState);
    const skills = new Map(config.skills.map(skill => [skill.id, skill]));
    const history = [];

    for (const update of analysis.skillUpdates ?? []) {
        applySkillUpdate(state, skills, update, config.maxDelta, source, history);
    }
    if (analysis.pointsEarned !== undefined) {
        applyPointsEarned(state, config.freeSkillPoints, analysis.pointsEarned, config.maxDelta, source, history);
    }
    return { state, history, pendingSpends: [...(analysis.spends ?? [])] };
}

function applySkillUpdate(state, skills, update, maxDelta, source, history) {
    const skill = skills.get(update.skillId);
    const reason = update.reason;
    if (!skill) {
        history.push(rejectionEntry(REJECTION_CODES.UNKNOWN_SKILL, { skillId: update.skillId, reason, source }));
        return;
    }
    // Only the delta that matches the skill's mode counts (spec §8.1); the other one is ignored.
    const isXp = skill.progression.enabled;
    const amount = isXp ? update.xpGained : update.directIncrease;
    if (amount === undefined) {
        const given = isXp ? update.directIncrease : update.xpGained;
        history.push(rejectionEntry(REJECTION_CODES.WRONG_MODE, { skill, amount: given, reason, source }));
        return;
    }
    const invalid = checkAmount(amount, maxDelta);
    if (invalid) {
        history.push(rejectionEntry(invalid, { skill, amount, reason, source }));
        return;
    }

    const before = { ...state.skills[skill.id] };
    const result = isXp ? gainXp(skill, before, amount) : increaseDirectly(skill, before, amount);
    if (!result.ok) {
        history.push(rejectionEntry(result.code, { skill, amount, reason, source }));
        return;
    }
    const after = { value: result.value, xp: result.xp };
    state.skills[skill.id] = after;
    const type = isXp ? HISTORY_TYPES.XP_GAINED : HISTORY_TYPES.DIRECT_INCREASE;
    history.push(changeEntry(type, {
        skill, amount, before, after, levelUps: result.levelUps, thresholdSuspended: result.thresholdSuspended, reason, source,
    }));
}

function applyPointsEarned(state, freeSkillPoints, amount, maxDelta, source, history) {
    if (!freeSkillPoints.enabled) {
        history.push(rejectionEntry(REJECTION_CODES.FREE_POINTS_DISABLED, { amount, source }));
        return;
    }
    const invalid = checkAmount(amount, maxDelta);
    if (invalid) {
        history.push(rejectionEntry(invalid, { amount, source }));
        return;
    }
    const before = state.freePoints;
    const max = freeSkillPoints.max ?? Number.MAX_SAFE_INTEGER;
    if (before >= max) {
        history.push(rejectionEntry(REJECTION_CODES.POINT_POOL_FULL, { amount, source }));
        return;
    }
    state.freePoints = Math.min(before + amount, max);
    history.push(changeEntry(HISTORY_TYPES.POINTS_EARNED, { amount, before: { points: before }, after: { points: state.freePoints }, source }));
}
