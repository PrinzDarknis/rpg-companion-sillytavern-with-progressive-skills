/**
 * Progressive Skills — applying one stored user action (spec §5.4, §10).
 *
 * User actions are recorded per swipe in chronological order (`deltas.actions`), so a point spend after a manual
 * edit (or the other way round) is recomputed exactly as the user did it.
 */
import { initStateFromConfig } from '../model/index.js';
import { ACTION_TYPES, REJECTION_CODES } from './constants.js';
import { rejectionEntry } from './history.js';
import { applyManualEdit } from './manual-edit.js';
import { applyPointsEdit } from './points-edit.js';
import { spendPoints } from './spend-points.js';

/**
 * @param {unknown} previousState
 * @param {object} config - Normalized configuration
 * @param {object} action - See ACTION_TYPES
 * @returns {{ok: boolean, changed: boolean, state: object, history: object[]}}
 *   A declined proposal is ok and unchanged; it only adds a rejection entry (code DECLINED) to the history.
 */
export function applyUserAction(previousState, config, action) {
    const source = action.source ?? 'ui';
    switch (action.type) {
        case ACTION_TYPES.SPEND: {
            const result = spendPoints(previousState, config, action, source);
            return { ...result, changed: result.ok };
        }
        case ACTION_TYPES.EDIT:
            return applyManualEdit(previousState, config, action, source);
        case ACTION_TYPES.POINTS:
            return applyPointsEdit(previousState, config, action, source);
        case ACTION_TYPES.DECLINE: {
            const skill = config.skills.find(s => s.id === action.skillId);
            const entry = rejectionEntry(REJECTION_CODES.DECLINED, { skillId: action.skillId, skill, amount: action.amount, source: action.source ?? 'ai' });
            return { ok: true, changed: false, state: initStateFromConfig(config, previousState), history: [entry] };
        }
        default:
            return { ok: false, changed: false, state: initStateFromConfig(config, previousState), history: [] };
    }
}
