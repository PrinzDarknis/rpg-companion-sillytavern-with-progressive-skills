/**
 * Progressive Skills — manual edits of a skill's value and XP by the user (spec §10).
 *
 * Validated like every other change: the value must be an integer in 0..maximum, XP a non-negative integer.
 * XP is never reset by a manual value change; the threshold is derived from the new value whenever it is
 * displayed or used. XP at or above the new threshold is processed by the next XP gain (no level-up here).
 */
import { initStateFromConfig } from '../model/index.js';
import { HISTORY_TYPES, REJECTION_CODES } from './constants.js';
import { changeEntry, rejectionEntry } from './history.js';

/**
 * @param {unknown} previousState - Current state (may be missing)
 * @param {object} config - Normalized configuration
 * @param {{skillId: string, value?: number, xp?: number}} edit - Absolute new values; a missing field is kept
 * @param {string} source - Origin recorded in the history (default "ui")
 * @returns {{ok: boolean, changed: boolean, state: object, history: object[]}}
 *   On rejection `state` equals the unchanged input state; `changed` is false when the edit sets the current values.
 */
export function applyManualEdit(previousState, config, edit, source = 'ui') {
    const state = initStateFromConfig(config, previousState);
    const skill = config.skills.find(s => s.id === edit.skillId);
    const reject = code => ({
        ok: false,
        changed: false,
        state,
        history: [rejectionEntry(code, { skillId: edit.skillId, skill, source })],
    });

    if (!skill) return reject(REJECTION_CODES.UNKNOWN_SKILL);
    const before = { ...state.skills[skill.id] };
    const after = {
        value: edit.value === undefined ? before.value : edit.value,
        xp: edit.xp === undefined ? before.xp : edit.xp,
    };
    if (!Number.isSafeInteger(after.value) || after.value < 0 || after.value > skill.maximumValue) {
        return reject(REJECTION_CODES.INVALID_VALUE);
    }
    if (!Number.isSafeInteger(after.xp) || after.xp < 0) return reject(REJECTION_CODES.INVALID_XP);
    if (after.value === before.value && after.xp === before.xp) {
        return { ok: true, changed: false, state, history: [] };
    }

    state.skills[skill.id] = after;
    return { ok: true, changed: true, state, history: [changeEntry(HISTORY_TYPES.MANUAL_EDIT, { skill, before, after, source })] };
}
