/**
 * Progressive Skills — HTML escaping for user-written texts (names, descriptions) and all other values.
 */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** @returns {string} Text safe for HTML element content and quoted attribute values. */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ENTITIES[char]);
}
