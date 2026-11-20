/**
 * Progressive Skills — HTML of the "Progressive Skills" tab in the tracker editor (spec §5).
 *
 * Inputs carry `data-pskills-field` (field path) and, inside a skill card, the card carries `data-skill-id`.
 * Skill cards are collapsible `<details>`, arranged by the editor layout (group sections, see layout.js).
 * Everything inserted is escaped.
 */
import { collectGroups } from '../model/index.js';
import { escapeHtml } from '../shared/index.js';
import { buildEditorLayout, syncEditorLayout } from './layout.js';
import { diagnosticMessage, validationMessage } from './messages.js';
import { skillSummaryText, skillsWithErrors } from './skill-summary.js';

const INVALID = 'rpg-pskills-ed-invalid';
/**
 * Id of the group suggestion list. It is rendered empty; only the focused group input gets `list` and the options
 * (see progressiveSkillsEditor.js). Many inputs with a permanent `list` attribute made the whole page sluggish in
 * desktop Chrome (the hidden editor stays in the DOM after closing).
 */
export const GROUPS_LIST_ID = 'rpg-pskills-ed-groups';

/** Validation error field → input field path (skill fields). */
const SKILL_ERROR_FIELDS = { startXp: 'progression.startXp', threshold: 'progression.threshold' };

/**
 * @param {object} view
 * @param {object} view.config - Draft configuration
 * @param {Record<string, object>} view.checks - checkThreshold results by skill id
 * @param {object[]} view.errors - From getEditorErrors
 * @param {string|null} [view.addError] - Result code of the last refused add
 * @param {object} [view.layout] - From buildEditorLayout (default: built from the config)
 * @param {Set<string>} [view.openSkills] - Ids of expanded skill cards (default: all collapsed)
 * @param {Set<string>} [view.closedGroups] - Names of collapsed group sections (default: all expanded)
 * @param {Function} text - From createEditorTextLookup
 */
export function buildEditorTabHtml(view, text) {
    const { config, checks, errors } = view;
    const groups = groupErrors(errors);
    const invalid = invalidFields(errors);
    const display = {
        layout: syncEditorLayout(view.layout ?? buildEditorLayout(config.skills), config.skills),
        openSkills: view.openSkills ?? new Set(),
        closedGroups: view.closedGroups ?? new Set(),
        withErrors: skillsWithErrors(config, checks, errors),
    };
    return '<div class="rpg-editor-section rpg-pskills-editor">'
        + generalHtml(config, groups.general, invalid, text)
        + freePointsHtml(config.freeSkillPoints, groups.freePoints, invalid, text)
        + skillsHtml(config, checks, groups.skills, invalid, view.addError ?? null, display, text)
        + '</div>';
}

/** `<option>`s of the group suggestions (datalist), from the groups of all skills. */
export function groupOptionsHtml(skills) {
    return collectGroups(skills).map(group => `<option value="${escapeHtml(group)}"></option>`).join('');
}

/**
 * Splits validation errors by where they are shown.
 * @returns {{general: object[], freePoints: object[], skills: Record<string, object[]>}}
 */
export function groupErrors(errors) {
    const groups = { general: [], freePoints: [], skills: {} };
    for (const error of errors) {
        if (error.skillId !== undefined) {
            if (error.field === 'threshold') continue; // shown by the formula diagnostics
            (groups.skills[error.skillId] ??= []).push(error);
        } else if (String(error.field ?? '').startsWith('freeSkillPoints.')) {
            groups.freePoints.push(error);
        } else {
            groups.general.push(error);
        }
    }
    return groups;
}

/** @returns {Set<string>} Keys `skillId|field` (or `|field` for global fields) of inputs to mark invalid. */
export function invalidFields(errors) {
    const keys = new Set();
    for (const error of errors) {
        const field = error.skillId !== undefined ? (SKILL_ERROR_FIELDS[error.field] ?? error.field) : error.field;
        keys.add(`${error.skillId ?? ''}|${field}`);
    }
    return keys;
}

/** List of validation errors (empty string when there are none). */
export function errorListHtml(errors, text) {
    if (errors.length === 0) return '';
    return errors.map(error => `<li>${escapeHtml(validationMessage(error, text))}</li>`).join('');
}

/** List of formula diagnostics of one threshold (empty string when valid). */
export function diagnosticsHtml(check, text) {
    if (!check || check.diagnostics.length === 0) return '';
    return check.diagnostics.map(diagnostic => {
        const fatal = diagnostic.severity === 'fatal';
        const label = text(fatal ? 'severityFatal' : 'severityRecovered');
        return `<li class="rpg-pskills-ed-diag-${fatal ? 'fatal' : 'recovered'}" data-code="${escapeHtml(diagnostic.code)}">`
            + `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(diagnosticMessage(diagnostic, text))}</li>`;
    }).join('');
}

function generalHtml(config, errors, invalid, text) {
    return `<h4><i class="fa-solid fa-chart-line"></i> ${escapeHtml(text('generalTitle'))}</h4>`
        + toggleHtml('rpg-pskills-ed-enabled', 'enabled', config.enabled, text('enabled'))
        + `<p class="rpg-editor-hint">${escapeHtml(text('enabledHint'))}</p>`
        + toggleHtml('rpg-pskills-ed-descriptions', 'includeDescriptionsInContext', config.includeDescriptionsInContext,
            text('includeDescriptions'))
        + `<p class="rpg-editor-hint">${escapeHtml(text('includeDescriptionsHint'))}</p>`
        + toggleHtml('rpg-pskills-ed-own-tab', 'displayInOwnTab', config.displayInOwnTab, text('displayInOwnTab'))
        + `<p class="rpg-editor-hint">${escapeHtml(text('displayInOwnTabHint'))}</p>`
        + numberHtml({ id: 'rpg-pskills-ed-max-delta', field: 'maxDelta', value: config.maxDelta, min: 1,
            label: text('maxDelta'), invalid: invalid.has('|maxDelta') })
        + `<p class="rpg-editor-hint">${escapeHtml(text('maxDeltaHint'))}</p>`
        + `<ul class="rpg-pskills-ed-errors" data-pskills-errors="general">${errorListHtml(errors, text)}</ul>`;
}

function freePointsHtml(points, errors, invalid, text) {
    return `<h4><i class="fa-solid fa-coins"></i> ${escapeHtml(text('freePointsTitle'))}</h4>`
        + toggleHtml('rpg-pskills-ed-points-enabled', 'freeSkillPoints.enabled', points.enabled, text('freePointsEnabled'))
        + `<div class="rpg-pskills-ed-points-fields${points.enabled ? '' : ' rpg-pskills-ed-hidden'}">`
        + '<div class="rpg-pskills-ed-grid">'
        + numberHtml({ id: 'rpg-pskills-ed-points-start', field: 'freeSkillPoints.start', value: points.start, min: 0,
            label: text('freePointsStart'), invalid: invalid.has('|freeSkillPoints.start') })
        + numberHtml({ id: 'rpg-pskills-ed-points-max', field: 'freeSkillPoints.max', value: points.max, min: 1,
            label: text('freePointsMax'), invalid: invalid.has('|freeSkillPoints.max') })
        + '</div>'
        + textareaHtml({ id: 'rpg-pskills-ed-points-growth', field: 'freeSkillPoints.growthCondition',
            value: points.growthCondition, label: text('freePointsGrowth'),
            invalid: invalid.has('|freeSkillPoints.growthCondition') })
        + '</div>'
        + `<ul class="rpg-pskills-ed-errors" data-pskills-errors="freePoints">${errorListHtml(errors, text)}</ul>`;
}

function skillsHtml(config, checks, errorsBySkill, invalid, addError, display, text) {
    const byId = new Map(config.skills.map(skill => [skill.id, skill]));
    const cardsHtml = ids => ids.map(id => byId.get(id)).map(skill => skillHtml(skill, {
        check: checks[skill.id],
        errors: errorsBySkill[skill.id] ?? [],
        invalid,
        open: display.openSkills.has(skill.id),
        hasErrors: display.withErrors.has(skill.id),
    }, text)).join('');
    const sectionHtml = section => (section.group === null
        ? cardsHtml(section.skillIds)
        : groupSectionHtml(section, !display.closedGroups.has(section.group), cardsHtml(section.skillIds)));
    const content = config.skills.length === 0
        ? `<p class="rpg-pskills-ed-empty">${escapeHtml(text('noSkills'))}</p>`
        : display.layout.sections.map(sectionHtml).join('') + cardsHtml(display.layout.appended);
    return `<h4><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(text('skillsTitle'))}</h4>`
        + `<p class="rpg-editor-hint">${escapeHtml(text('skillsHint'))}</p>`
        + `<datalist id="${GROUPS_LIST_ID}"></datalist>`
        + `<div class="rpg-pskills-ed-skills">${content}</div>`
        + '<div class="rpg-pskills-ed-add">'
        + `<input type="text" class="rpg-text-input rpg-pskills-ed-new-name" placeholder="${escapeHtml(text('newSkillPlaceholder'))}"`
        + ` aria-label="${escapeHtml(text('newSkillPlaceholder'))}">`
        + `<button type="button" class="rpg-btn-secondary rpg-pskills-ed-add-btn"><i class="fa-solid fa-plus"></i> ${escapeHtml(text('addSkill'))}</button>`
        + '</div>'
        + `<ul class="rpg-pskills-ed-errors" data-pskills-errors="add">${addError ? errorListHtml([{ code: addError }], text) : ''}</ul>`;
}

/** A group section: collapsible, empty sections are never rendered (the layout keeps them until the next open). */
function groupSectionHtml(section, open, cards) {
    if (cards === '') return '';
    return `<details class="rpg-pskills-ed-group" data-group="${escapeHtml(section.group)}"${open ? ' open' : ''}>`
        + `<summary class="rpg-pskills-ed-group-summary">${escapeHtml(section.group)}</summary>`
        + `<div class="rpg-pskills-ed-group-skills">${cards}</div>`
        + '</details>';
}

/** Summary line of a skill card: name (+ XP) and an error mark shown while the card has errors (CSS). */
export function skillSummaryHtml(skill, text) {
    return `<span class="rpg-pskills-ed-summary-text">${escapeHtml(skillSummaryText(skill, text))}</span>`
        + `<i class="fa-solid fa-triangle-exclamation rpg-pskills-ed-summary-error" title="${escapeHtml(text('skillHasErrors'))}"`
        + ` aria-label="${escapeHtml(text('skillHasErrors'))}"></i>`;
}

function skillHtml(skill, { check, errors, invalid, open, hasErrors }, text) {
    const id = skill.id;
    const prefix = `rpg-pskills-ed-${id}`;
    const has = field => invalid.has(`${id}|${field}`);
    const progression = skill.progression;
    const thresholdInvalid = progression.enabled && check && !check.valid;
    const classes = `rpg-pskills-ed-skill${hasErrors ? ' rpg-pskills-ed-has-errors' : ''}`;
    return `<details class="${classes}" data-skill-id="${escapeHtml(id)}"${open ? ' open' : ''}>`
        + `<summary class="rpg-pskills-ed-skill-summary">${skillSummaryHtml(skill, text)}</summary>`
        + '<div class="rpg-pskills-ed-skill-body">'
        + '<div class="rpg-pskills-ed-skill-header">'
        + textHtml({ id: `${prefix}-name`, field: 'name', value: skill.name, label: text('name'), invalid: has('name') })
        + textHtml({ id: `${prefix}-group`, field: 'group', value: skill.group, label: text('group'), invalid: false,
            autocomplete: 'off', placeholder: text('groupHint') })
        + `<span class="rpg-pskills-ed-id">${escapeHtml(text('skillId', { id }))}</span>`
        + `<button type="button" class="rpg-pskills-ed-delete" title="${escapeHtml(text('deleteSkill'))}"`
        + ` aria-label="${escapeHtml(text('deleteSkill'))}"><i class="fa-solid fa-trash"></i></button>`
        + '</div>'
        + textareaHtml({ id: `${prefix}-description`, field: 'description', value: skill.description,
            label: text('description'), invalid: false })
        + '<div class="rpg-pskills-ed-grid">'
        + numberHtml({ id: `${prefix}-start`, field: 'startValue', value: skill.startValue, min: 0,
            label: text('startValue'), invalid: has('startValue') })
        + numberHtml({ id: `${prefix}-max`, field: 'maximumValue', value: skill.maximumValue, min: 1,
            label: text('maximumValue'), invalid: has('maximumValue') })
        + '</div>'
        + textareaHtml({ id: `${prefix}-growth`, field: 'growthCondition', value: skill.growthCondition,
            label: text('growthCondition'), invalid: has('growthCondition') })
        + `<p class="rpg-editor-hint rpg-pskills-ed-growth-hint">${escapeHtml(text(progression.enabled ? 'growthHintXp' : 'growthHintDirect'))}</p>`
        + toggleHtml(`${prefix}-progression`, 'progression.enabled', progression.enabled, text('progressionEnabled'))
        + `<div class="rpg-pskills-ed-xp-fields${progression.enabled ? '' : ' rpg-pskills-ed-hidden'}">`
        + numberHtml({ id: `${prefix}-start-xp`, field: 'progression.startXp', value: progression.startXp, min: 0,
            label: text('startXp'), invalid: has('progression.startXp') })
        + textHtml({ id: `${prefix}-threshold`, field: 'progression.threshold', value: progression.threshold,
            label: text('threshold'), invalid: thresholdInvalid, extraClass: 'rpg-pskills-ed-threshold' })
        + `<p class="rpg-editor-hint">${escapeHtml(text('thresholdHint'))}</p>`
        + `<ul class="rpg-pskills-ed-diagnostics">${progression.enabled ? diagnosticsHtml(check, text) : ''}</ul>`
        + '</div>'
        + `<ul class="rpg-pskills-ed-errors" data-pskills-errors="skill">${errorListHtml(errors, text)}</ul>`
        + '</div>'
        + '</details>';
}

function toggleHtml(id, field, checked, label) {
    return '<div class="rpg-editor-toggle-row">'
        + `<input type="checkbox" id="${escapeHtml(id)}" data-pskills-field="${escapeHtml(field)}"${checked ? ' checked' : ''}>`
        + `<label for="${escapeHtml(id)}">${escapeHtml(label)}</label>`
        + '</div>';
}

function inputAttributes({ id, field, invalid, extraClass = '' }) {
    const classes = ['rpg-text-input', extraClass, invalid ? INVALID : ''].filter(Boolean).join(' ');
    return `id="${escapeHtml(id)}" class="${classes}" data-pskills-field="${escapeHtml(field)}"`
        + `${invalid ? ' aria-invalid="true"' : ''}`;
}

function numberHtml({ id, field, value, min, label, invalid }) {
    const shown = Number.isFinite(value) ? String(value) : '';
    return '<div class="rpg-pskills-ed-field">'
        + `<label for="${escapeHtml(id)}">${escapeHtml(label)}</label>`
        + `<input type="number" step="1" min="${min}" value="${escapeHtml(shown)}" ${inputAttributes({ id, field, invalid })}>`
        + '</div>';
}

function textHtml({ id, field, value, label, invalid, extraClass, autocomplete, placeholder }) {
    const extras = (autocomplete ? ` autocomplete="${escapeHtml(autocomplete)}"` : '')
        + (placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : '');
    return '<div class="rpg-pskills-ed-field">'
        + `<label for="${escapeHtml(id)}">${escapeHtml(label)}</label>`
        + `<input type="text" value="${escapeHtml(value)}"${extras} ${inputAttributes({ id, field, invalid, extraClass })}>`
        + '</div>';
}

function textareaHtml({ id, field, value, label, invalid }) {
    return '<div class="rpg-pskills-ed-field">'
        + `<label for="${escapeHtml(id)}">${escapeHtml(label)}</label>`
        + `<textarea rows="2" ${inputAttributes({ id, field, invalid })}>${escapeHtml(value)}</textarea>`
        + '</div>';
}
