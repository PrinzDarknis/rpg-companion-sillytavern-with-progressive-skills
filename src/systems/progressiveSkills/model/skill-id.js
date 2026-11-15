/**
 * Progressive Skills — stable skill ids.
 *
 * The id is derived once from the initial name (readable for the AI, e.g. "feet_massage") and then stored;
 * renaming a skill never changes its id.
 */

const MAX_ID_LENGTH = 32;

/**
 * Creates a unique id from a display name.
 * @param {string} name - Initial display name
 * @param {Iterable<string>} existingIds - Ids already used in the configuration
 * @returns {string} e.g. "feet_massage", "feet_massage_2", or "skill" for names without latin letters/digits
 */
export function createSkillId(name, existingIds = []) {
    const used = new Set(existingIds);
    const base = slugify(name) || 'skill';
    if (!used.has(base)) return base;
    let counter = 2;
    while (used.has(`${base}_${counter}`)) counter++;
    return `${base}_${counter}`;
}

function slugify(name) {
    return String(name ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, MAX_ID_LENGTH)
        .replace(/_+$/g, '');
}
