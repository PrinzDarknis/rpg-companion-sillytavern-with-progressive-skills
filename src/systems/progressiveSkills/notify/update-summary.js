/**
 * Progressive Skills — compact one-line summary of the changes of one model update (update toast).
 *
 * Example: `Sword Fighting +5 XP · Climbing +12 XP, +1 Lv. · Cooking +1 Lv. · +1 Point(s)`
 */
import { HISTORY_TYPES } from '../progression/index.js';

/** History types shown in the summary (applied changes of the model analysis). */
const SHOWN_TYPES = new Set([HISTORY_TYPES.XP_GAINED, HISTORY_TYPES.DIRECT_INCREASE, HISTORY_TYPES.POINTS_EARNED]);

const SEPARATOR = ' · ';

/**
 * @param {object[]} history - History entries of a stored turn
 * @returns {object[]} The applied changes made by the model analysis, in history order
 */
export function selectUpdateChanges(history) {
    return (history ?? []).filter(entry => SHOWN_TYPES.has(entry.type) && entry.source === 'ai');
}

/**
 * @param {object[]} changes - From selectUpdateChanges
 * @param {Function} text - From createNotifyTextLookup
 * @returns {string} Plain (unescaped) text; '' without changes
 */
export function buildUpdateSummary(changes, text) {
    return (changes ?? []).map(change => entryText(change, text)).filter(Boolean).join(SEPARATOR);
}

function entryText(change, text) {
    switch (change.type) {
        case HISTORY_TYPES.XP_GAINED: {
            const parts = [text('xp', { n: change.amount })];
            if (change.levelUps > 0) parts.push(text('level', { n: change.levelUps }));
            return `${change.skillName} ${parts.join(', ')}`;
        }
        case HISTORY_TYPES.DIRECT_INCREASE: {
            const gained = change.after.value - change.before.value;
            return gained > 0 ? `${change.skillName} ${text('level', { n: gained })}` : '';
        }
        case HISTORY_TYPES.POINTS_EARNED: {
            const gained = change.after.points - change.before.points;
            return gained > 0 ? text('points', { n: gained }) : '';
        }
        default:
            return '';
    }
}
