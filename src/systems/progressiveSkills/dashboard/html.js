/**
 * Progressive Skills — HTML of the dashboard section (read-only display, spec §10).
 *
 * Everything inserted is escaped, including translations and numbers.
 */
import { escapeHtml } from '../shared/index.js';

/**
 * @param {{skills: object[], freePoints: object|null}} model - From buildDashboardModel
 * @param {(name: string, params?: object) => string} text - From createTextLookup
 * @param {{editing?: {skillId: string, error?: string|null, value?: string, xp?: string}|null}} [options]
 *   `editing`: the skill whose manual-edit form is open; `error` is an edit result code, `value`/`xp` the entered text
 * @returns {string}
 */
export function buildDashboardHtml(model, text, options = {}) {
    const editing = options.editing ?? null;
    const parts = [`<div class="rpg-pskills-header"><h4 class="rpg-pskills-title">${escapeHtml(text('title'))}</h4>`];
    if (model.freePoints) parts.push(freePointsHtml(model.freePoints, text));
    parts.push('</div>');
    if (model.skills.length === 0) {
        parts.push(`<div class="rpg-pskills-empty">${escapeHtml(text('empty'))}</div>`);
    } else {
        parts.push('<div class="rpg-pskills-list">', ...model.skills.map(skill => skillHtml(skill, text, editing?.skillId === skill.id ? editing : null)), '</div>');
    }
    return parts.join('');
}

function freePointsHtml(points, text) {
    const value = points.max === null ? `${points.available}` : `${points.available}/${points.max}`;
    return `<div class="rpg-pskills-free-points"><span class="rpg-pskills-free-points-label">${escapeHtml(text('freePoints'))}:</span>`
        + ` <span class="rpg-pskills-free-points-value">${escapeHtml(value)}</span></div>`;
}

function skillHtml(skill, text, editing) {
    const classes = ['rpg-pskills-skill'];
    if (skill.maxed) classes.push('rpg-pskills-maxed');
    if (skill.progression?.suspended) classes.push('rpg-pskills-suspended');
    return `<div class="${classes.join(' ')}" data-skill-id="${escapeHtml(skill.id)}">`
        + '<div class="rpg-pskills-row">'
        + `<span class="rpg-pskills-name">${escapeHtml(skill.name)}`
        + ` <span class="rpg-pskills-level">${escapeHtml(skill.value)}</span></span>`
        + statusHtml(skill, text)
        + `<span class="rpg-pskills-value">${escapeHtml(`${skill.value}/${skill.maximum}`)}</span>`
        + `<button type="button" class="rpg-pskills-edit-btn" title="${escapeHtml(text('edit'))}" aria-label="${escapeHtml(text('edit'))}">`
        + '<i class="fa-solid fa-pen"></i></button>'
        + '</div>'
        + (editing ? editFormHtml(skill, editing, text) : '')
        + (skill.progression ? progressionHtml(skill.progression, text) : '')
        + descriptionHtml(skill.description, text)
        + '</div>';
}

const STATUS = {
    maxed: 'statusMaxed',
    xp: 'statusXp',
    direct: 'statusDirect',
};

function statusHtml(skill, text) {
    let kind = skill.progression ? 'xp' : 'direct';
    if (skill.maxed) kind = 'maxed';
    return `<span class="rpg-pskills-status rpg-pskills-status-${kind}">${escapeHtml(text(STATUS[kind]))}</span>`;
}

/** Maxed skills show no XP values; a suspended threshold shows the hint instead of the bar. */
function progressionHtml(progression, text) {
    if (progression.maxed) return '';
    if (progression.suspended) {
        return '<div class="rpg-pskills-xp">'
            + `<span class="rpg-pskills-xp-value">${escapeHtml(`${text('xp')} ${progression.xp}`)}</span>`
            + `<div class="rpg-pskills-hint">${escapeHtml(text('thresholdInvalid'))}</div>`
            + '</div>';
    }
    return '<div class="rpg-pskills-xp">'
        + '<div class="rpg-pskills-xp-row">'
        + `<span class="rpg-pskills-xp-value">${escapeHtml(`${text('xp')} ${progression.xp}/${progression.threshold}`)}</span>`
        + `<span class="rpg-pskills-xp-remaining">${escapeHtml(text('remaining', { remaining: progression.remaining }))}</span>`
        + '</div>'
        + barHtml('rpg-pskills-bar-xp', progression.xpPercent, progression.xp, progression.threshold)
        + '</div>';
}

function barHtml(kind, percent, now, max) {
    return `<div class="rpg-pskills-bar ${kind}" role="progressbar" aria-valuemin="0"`
        + ` aria-valuenow="${escapeHtml(now)}" aria-valuemax="${escapeHtml(max)}">`
        + `<div class="rpg-pskills-bar-fill" style="width: ${escapeHtml(percent.toFixed(1))}%"></div></div>`;
}

function descriptionHtml(description, text) {
    if (!description || description.trim() === '') return '';
    return '<details class="rpg-pskills-description">'
        + `<summary>${escapeHtml(text('description'))}</summary>`
        + `<div class="rpg-pskills-description-text">${escapeHtml(description)}</div>`
        + '</details>';
}

const EDIT_ERRORS = {
    INVALID_VALUE: 'editInvalidValue',
    INVALID_XP: 'editInvalidXp',
    NO_TARGET: 'editNoTarget',
};

/** Inline form for a manual edit: value always, XP only with progression enabled. */
function editFormHtml(skill, editing, text) {
    const value = editing.value ?? String(skill.value);
    const parts = ['<div class="rpg-pskills-edit-form">',
        '<label class="rpg-pskills-edit-field">', `<span>${escapeHtml(text('editValue'))}</span>`,
        `<input type="number" class="rpg-pskills-edit-value" min="0" max="${escapeHtml(skill.maximum)}" step="1" value="${escapeHtml(value)}">`,
        '</label>'];
    if (skill.progression) {
        const xp = editing.xp ?? String(skill.progression.xp);
        parts.push('<label class="rpg-pskills-edit-field">', `<span>${escapeHtml(text('editXp'))}</span>`,
            `<input type="number" class="rpg-pskills-edit-xp" min="0" step="1" value="${escapeHtml(xp)}">`, '</label>');
    }
    parts.push(
        `<button type="button" class="rpg-pskills-edit-save">${escapeHtml(text('editSave'))}</button>`,
        `<button type="button" class="rpg-pskills-edit-cancel">${escapeHtml(text('editCancel'))}</button>`,
    );
    if (editing.error) {
        const message = text(EDIT_ERRORS[editing.error] ?? 'editFailed', { max: skill.maximum });
        parts.push(`<div class="rpg-pskills-edit-error" role="alert">${escapeHtml(message)}</div>`);
    }
    parts.push('</div>');
    return parts.join('');
}
