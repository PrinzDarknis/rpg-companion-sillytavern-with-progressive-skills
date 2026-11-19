/**
 * Progressive Skills — i18n keys of the compact update toast with English fallbacks.
 */
import { createLookup } from '../shared/index.js';

export const NOTIFY_TEXTS = {
    xp: ['progressiveSkills.toast.xp', '+{n} XP'],
    level: ['progressiveSkills.toast.level', '+{n} Lv.'],
    points: ['progressiveSkills.toast.points', '+{n} Point(s)'],
};

/**
 * @param {(key: string) => (string|null|undefined)} translate
 * @returns {(name: keyof NOTIFY_TEXTS, params?: object) => string} Plain (unescaped) text
 */
export function createNotifyTextLookup(translate) {
    return createLookup(NOTIFY_TEXTS, translate);
}
