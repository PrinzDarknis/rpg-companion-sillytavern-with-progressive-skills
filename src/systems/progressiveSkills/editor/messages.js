/**
 * Progressive Skills — translated messages for validation errors and formula diagnostics.
 */
import { hasEditorText } from './texts.js';

const FIELD_TEXTS = {
    startValue: 'startValue',
    maximumValue: 'maximumValue',
    startXp: 'startXp',
    maxDelta: 'maxDelta',
    'freeSkillPoints.start': 'freePointsStart',
    'freeSkillPoints.max': 'freePointsMax',
};

/**
 * @param {{code: string, field?: string}} error - From validateConfig
 * @param {Function} text - From createEditorTextLookup
 */
export function validationMessage(error, text) {
    const name = `v_${error.code}`;
    if (!hasEditorText(name)) return error.code;
    const field = FIELD_TEXTS[error.field] ? text(FIELD_TEXTS[error.field]) : (error.field ?? '');
    return text(name, { field });
}

/**
 * @param {{code: string, severity: string, token?: string, variables?: object}} diagnostic - From checkThreshold
 * @param {Function} text - From createEditorTextLookup
 */
export function diagnosticMessage(diagnostic, text) {
    const name = `f_${diagnostic.code}`;
    const params = { token: diagnostic.token ?? '', variables: formatVariables(diagnostic.variables), code: diagnostic.code };
    return hasEditorText(name) ? text(name, params) : text('f_UNKNOWN', params);
}

/** e.g. "skill = 0, maxSkill = 100, xp = 0" */
function formatVariables(variables) {
    if (!variables) return '';
    return Object.entries(variables).map(([name, value]) => `${name} = ${value}`).join(', ');
}
