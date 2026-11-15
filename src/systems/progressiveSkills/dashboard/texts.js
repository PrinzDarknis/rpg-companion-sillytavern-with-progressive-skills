/**
 * Progressive Skills — i18n keys of the dashboard section with their English fallbacks.
 */
export const DASHBOARD_TEXTS = {
    title: ['progressiveSkills.title', 'Progressive Skills'],
    empty: ['progressiveSkills.empty', 'No skills configured yet.'],
    description: ['progressiveSkills.description', 'Description'],
    statusXp: ['progressiveSkills.status.xp', 'XP progression'],
    statusDirect: ['progressiveSkills.status.direct', 'Direct growth'],
    statusMaxed: ['progressiveSkills.status.maxed', 'Maxed'],
    xp: ['progressiveSkills.xp', 'XP'],
    remaining: ['progressiveSkills.remaining', '{remaining} XP to next level'],
    thresholdInvalid: ['progressiveSkills.thresholdInvalid',
        'Threshold invalid — XP keeps accumulating, no level-ups until fixed'],
    freePoints: ['progressiveSkills.freePoints', 'Free skill points'],
};

/**
 * Builds the text lookup used by the HTML builder.
 * @param {(key: string) => (string|null|undefined)} translate - Returns the translation or a falsy value
 * @returns {(name: keyof DASHBOARD_TEXTS, params?: object) => string} Plain (unescaped) text
 */
export function createTextLookup(translate) {
    return (name, params = {}) => {
        const [key, fallback] = DASHBOARD_TEXTS[name];
        const text = (translate && translate(key)) || fallback;
        return text.replace(/\{(\w+)\}/g, (match, param) => (param in params ? String(params[param]) : match));
    };
}
