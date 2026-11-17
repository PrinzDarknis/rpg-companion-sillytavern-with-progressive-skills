/**
 * Progressive Skills — manual edit of the free-point balance by the user (spec §5.4, §10).
 *
 * The balance must be an integer in 0..the configured pool maximum (or the safe integer bound without one).
 */
import { initStateFromConfig } from '../model/index.js';
import { HISTORY_TYPES, REJECTION_CODES } from './constants.js';
import { changeEntry, rejectionEntry } from './history.js';

/**
 * @param {unknown} previousState - Current state (may be missing)
 * @param {object} config - Normalized configuration
 * @param {{value: number}} edit - Absolute new balance
 * @param {string} source - Origin recorded in the history (default "ui")
 * @returns {{ok: boolean, changed: boolean, state: object, history: object[]}}
 *   On rejection `state` equals the unchanged input state; `changed` is false when the edit sets the current balance.
 */
export function applyPointsEdit(previousState, config, edit, source = 'ui') {
    const state = initStateFromConfig(config, previousState);
    const reject = code => ({ ok: false, changed: false, state, history: [rejectionEntry(code, { amount: edit.value, source })] });

    if (!config.freeSkillPoints.enabled) return reject(REJECTION_CODES.FREE_POINTS_DISABLED);
    const max = config.freeSkillPoints.max ?? Number.MAX_SAFE_INTEGER;
    if (!Number.isSafeInteger(edit.value) || edit.value < 0 || edit.value > max) return reject(REJECTION_CODES.INVALID_POINTS);
    const before = state.freePoints;
    if (edit.value === before) return { ok: true, changed: false, state, history: [] };

    state.freePoints = edit.value;
    const entry = changeEntry(HISTORY_TYPES.MANUAL_EDIT, { before: { points: before }, after: { points: edit.value }, source });
    return { ok: true, changed: true, state, history: [entry] };
}
