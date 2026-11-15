/**
 * Progressive Skills — spending free skill points on a skill (spec §5.4, §7.3).
 *
 * Only called for authorized spends: a dashboard action by the user, or a model proposal the user confirmed.
 * The spend is atomic: points are deducted only together with the full skill increase.
 */
import { initStateFromConfig } from '../model/index.js';
import { checkAmount } from './amount.js';
import { HISTORY_TYPES, REJECTION_CODES } from './constants.js';
import { changeEntry, rejectionEntry } from './history.js';
import { raiseByPoints } from './skill-changes.js';

/**
 * @param {unknown} previousState - Current state (may be missing)
 * @param {object} config - Normalized configuration
 * @param {{skillId: string, amount: number}} spend
 * @param {string} source - Origin recorded in the history, e.g. "ui" or "ai-confirmed"
 * @returns {{ok: boolean, state: object, history: object[]}} On rejection `state` equals the unchanged input state.
 */
export function spendPoints(previousState, config, spend, source) {
    const state = initStateFromConfig(config, previousState);
    const skill = config.skills.find(s => s.id === spend.skillId);
    const reject = code => ({
        ok: false,
        state,
        history: [rejectionEntry(code, { skillId: spend.skillId, skill, amount: spend.amount, source })],
    });

    if (!config.freeSkillPoints.enabled) return reject(REJECTION_CODES.FREE_POINTS_DISABLED);
    if (!skill) return reject(REJECTION_CODES.UNKNOWN_SKILL);
    const invalid = checkAmount(spend.amount, config.maxDelta);
    if (invalid) return reject(invalid);
    if (spend.amount > state.freePoints) return reject(REJECTION_CODES.INSUFFICIENT_POINTS);

    const before = { ...state.skills[skill.id] };
    const result = raiseByPoints(skill, before, spend.amount);
    if (!result.ok) return reject(result.code);

    const after = { value: result.value, xp: result.xp };
    state.skills[skill.id] = after;
    const pointsBefore = state.freePoints;
    state.freePoints -= spend.amount;
    const entry = changeEntry(HISTORY_TYPES.POINTS_SPENT, { skill, amount: spend.amount, before, after, source });
    entry.points = { before: pointsBefore, after: state.freePoints };
    return { ok: true, state, history: [entry] };
}
