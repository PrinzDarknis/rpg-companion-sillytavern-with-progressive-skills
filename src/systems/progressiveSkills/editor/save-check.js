/**
 * Progressive Skills — may the configuration be saved?
 *
 * Only while the feature is enabled (user decision, step 09): a disabled configuration is never used, so it may be
 * saved incomplete — errors are still shown in the tab. When enabled,
 * saving is blocked by configuration errors (validateConfig) and by fatal threshold diagnostics of skills with
 * progression enabled. Recovered diagnostics only mark the field (tolerant policy). Thresholds of skills without
 * progression are not used and never block.
 */
import { getEditorErrors } from './editor-errors.js';
import { checkThreshold } from './formula-check.js';

/**
 * @param {object} config - Draft configuration
 * @param {Record<string, object>} checks - Cached checkThreshold results by skill id; missing ones are computed
 * @returns {{blocked: boolean, errors: object[], fatalThresholds: string[]}}
 */
export function getSaveBlockers(config, checks = {}) {
    if (!config.enabled) return { blocked: false, errors: [], fatalThresholds: [] };
    const errors = getEditorErrors(config);
    const fatalThresholds = config.skills
        .filter(skill => skill.progression.enabled)
        .filter(skill => (checks[skill.id] ?? checkThreshold(skill)).fatal)
        .map(skill => skill.id);
    return { blocked: errors.length > 0 || fatalThresholds.length > 0, errors, fatalThresholds };
}

/** @returns {Record<string, object>} checkThreshold result for every skill (used once when the editor opens). */
export function checkAllThresholds(config) {
    return Object.fromEntries(config.skills.map(skill => [skill.id, checkThreshold(skill)]));
}
