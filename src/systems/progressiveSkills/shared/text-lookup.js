/**
 * Progressive Skills — translated texts with English fallbacks.
 */

/**
 * Builds a text lookup for a table of `name: [i18nKey, englishFallback]`.
 * @param {Record<string, [string, string]>} table
 * @param {(key: string) => (string|null|undefined)} translate - Returns the translation or a falsy value
 * @returns {(name: string, params?: object) => string} Plain (unescaped) text; `{param}` placeholders are filled
 */
export function createLookup(table, translate) {
    return (name, params = {}) => {
        const [key, fallback] = table[name];
        const text = (translate && translate(key)) || fallback;
        return text.replace(/\{(\w+)\}/g, (match, param) => (param in params ? String(params[param]) : match));
    };
}
