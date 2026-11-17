/**
 * Progressive Skills — inline forms of the dashboard section: manual edit of a skill, point spending, free-point
 * balance (spec §5.4, §10). Each form shows the entered text and the error of a rejected submission.
 */
import { escapeHtml } from '../shared/index.js';
import { spendErrorName } from '../spend/index.js';

const EDIT_ERRORS = {
    INVALID_VALUE: 'editInvalidValue',
    INVALID_XP: 'editInvalidXp',
    NO_TARGET: 'editNoTarget',
};

/** Manual edit: value always, XP only with progression enabled. */
export function editFormHtml(skill, editing, text) {
    const value = editing.value ?? String(skill.value);
    const fields = [numberFieldHtml(text('editValue'), 'rpg-pskills-edit-value', value, { min: 0, max: skill.maximum })];
    if (skill.progression) {
        const xp = editing.xp ?? String(skill.progression.xp);
        fields.push(numberFieldHtml(text('editXp'), 'rpg-pskills-edit-xp', xp, { min: 0 }));
    }
    const error = editing.error ? text(EDIT_ERRORS[editing.error] ?? 'editFailed', { max: skill.maximum }) : null;
    return formHtml('rpg-pskills-edit', fields, text('editSave'), text, error);
}

/** Point spending on one skill; the hint tells that XP is reset (spec §7.3). */
export function spendFormHtml(skill, freePoints, spending, text) {
    const max = Math.max(1, Math.min(freePoints.available, skill.maximum - skill.value));
    const amount = spending.amount ?? '1';
    const fields = [numberFieldHtml(text('spendAmount'), 'rpg-pskills-spend-amount', amount, { min: 1, max })];
    if (skill.progression) fields.push(`<div class="rpg-pskills-hint">${escapeHtml(text('spendXpReset'))}</div>`);
    const error = spending.error ? text(spendErrorName(spending.error), { maxDelta: spending.maxDelta ?? '' }) : null;
    return formHtml('rpg-pskills-spend', fields, text('spendSave'), text, error);
}

/** Free-point balance (absolute value, 0..pool maximum). */
export function pointsFormHtml(freePoints, editing, text) {
    const value = editing.value ?? String(freePoints.available);
    const bounds = freePoints.max === null ? { min: 0 } : { min: 0, max: freePoints.max };
    const fields = [numberFieldHtml(text('freePoints'), 'rpg-pskills-points-value', value, bounds)];
    let error = null;
    if (editing.error === 'INVALID_POINTS') {
        error = freePoints.max === null ? text('pointsInvalidNoMax') : text('pointsInvalid', { max: freePoints.max });
    } else if (editing.error) {
        error = text(editing.error === 'NO_TARGET' ? 'editNoTarget' : 'editFailed');
    }
    return formHtml('rpg-pskills-points', fields, text('editSave'), text, error);
}

/** Common form layout with the classes `<prefix>-form`, `<prefix>-save` and `<prefix>-cancel`. */
function formHtml(prefix, fields, saveLabel, text, error) {
    const parts = [`<div class="${prefix}-form">`, ...fields,
        `<button type="button" class="${prefix}-save">${escapeHtml(saveLabel)}</button>`,
        `<button type="button" class="${prefix}-cancel">${escapeHtml(text('editCancel'))}</button>`];
    if (error) parts.push(`<div class="rpg-pskills-edit-error" role="alert">${escapeHtml(error)}</div>`);
    parts.push('</div>');
    return parts.join('');
}

function numberFieldHtml(label, className, value, { min, max }) {
    const maxAttr = max === undefined ? '' : ` max="${escapeHtml(max)}"`;
    return '<label class="rpg-pskills-edit-field">'
        + `<span>${escapeHtml(label)}</span>`
        + `<input type="number" class="${className}" min="${escapeHtml(min)}"${maxAttr} step="1" value="${escapeHtml(value)}">`
        + '</label>';
}
