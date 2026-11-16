/**
 * Progressive Skills — parsing integer input fields.
 */

/**
 * @param {unknown} raw - Input text, e.g. "12" or " -3 "
 * @returns {number} The integer, or NaN for empty, fractional or other text (validation reports it)
 */
export function parseInteger(raw) {
    const text = String(raw ?? '').trim();
    return /^-?\d+$/.test(text) ? Number(text) : NaN;
}
