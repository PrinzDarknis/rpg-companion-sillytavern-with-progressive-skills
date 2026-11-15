/**
 * Progressive Skills — locating the "progressiveSkills" object in a raw model response.
 *
 * Only the object behind the key is parsed (strict JSON.parse, no repair), so a broken part elsewhere in the
 * response does not matter. Occurrences are tried from last to first: thinking text usually comes first.
 */

/**
 * @param {string} text - Raw model response
 * @param {string} key - Object key to look for
 * @returns {{found: boolean, value?: object, error?: string}}
 */
export function extractSection(text, key) {
    if (typeof text !== 'string') return { found: false };
    const marker = `"${key}"`;
    let error = null;
    for (let at = text.lastIndexOf(marker); at !== -1; at = at > 0 ? text.lastIndexOf(marker, at - 1) : -1) {
        const start = findObjectStart(text, at + marker.length);
        if (start === -1) continue;
        const end = findObjectEnd(text, start);
        if (end === -1) {
            error = error ?? 'unterminated object';
            continue;
        }
        try {
            const value = JSON.parse(text.slice(start, end + 1));
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) return { found: true, value };
            error = error ?? 'not an object';
        } catch (e) {
            error = error ?? e.message;
        }
    }
    return error ? { found: true, error } : { found: false };
}

/** Index of the "{" after `key:` (only whitespace and one colon allowed in between), else -1. */
function findObjectStart(text, from) {
    const match = /^\s*:\s*\{/.exec(text.slice(from, from + 200));
    return match ? from + match[0].length - 1 : -1;
}

/** Index of the matching "}" (string-aware), else -1. */
function findObjectEnd(text, start) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (escaped) {
            escaped = false;
        } else if (char === '\\') {
            escaped = inString;
        } else if (char === '"') {
            inString = !inString;
        } else if (!inString) {
            if (char === '{') depth++;
            else if (char === '}' && --depth === 0) return i;
        }
    }
    return -1;
}
