/**
 * Progressive Skills — "Progressive Skills" tab of the tracker editor (DOM glue).
 *
 * Works on a normalized draft that is written to `extensionSettings.trackerConfig.progressiveSkills` on the first
 * change (so opening the editor alone never adds the key). Cancel restores the whole tracker config (trackerEditor),
 * Save & Apply stores it in the active preset via applyTrackerConfig.
 *
 * Threshold formulas are validated once for all skills when the tab is rendered on editor open; afterwards only the
 * edited skill's threshold is re-validated (on input, and when its maximum value changes).
 */
import { i18n } from '../../core/i18n.js';
import { extensionSettings } from '../../core/state.js';
import { normalizeConfig } from '../progressiveSkills/model/index.js';
import {
    addSkill, buildEditorTabHtml, checkAllThresholds, checkThreshold, createEditorTextLookup, diagnosticsHtml,
    errorListHtml, getEditorErrors, getSaveBlockers, groupErrors, invalidFields, removeSkill, setConfigField,
} from '../progressiveSkills/editor/index.js';

const TAB = '#rpg-editor-tab-progressiveSkills';
const INVALID = 'rpg-pskills-ed-invalid';
/** Fields whose change re-renders the tab (they show or hide other fields). */
const REDRAW_FIELDS = new Set(['progression.enabled', 'freeSkillPoints.enabled']);

let draft = null;
let checks = {};
let addError = null;

const text = () => createEditorTextLookup(key => i18n.getTranslation(key));

/**
 * Renders the tab from the stored configuration and validates all thresholds once.
 * Called by trackerEditor.renderEditorUI (editor open, reset, import).
 */
export function renderProgressiveSkillsTab() {
    draft = normalizeConfig(extensionSettings.trackerConfig?.progressiveSkills);
    checks = checkAllThresholds(draft);
    addError = null;
    redraw();
}

/** Registers the delegated event handlers once (called by initTrackerEditor). */
export function initProgressiveSkillsTab() {
    $(document)
        .off('.pskillsEditor')
        .on('input.pskillsEditor', `${TAB} [data-pskills-field="progression.threshold"]`, function () {
            onFieldChange(this);
        })
        .on('change.pskillsEditor', `${TAB} [data-pskills-field]`, function () {
            if (this.dataset.pskillsField !== 'progression.threshold') onFieldChange(this);
        })
        .on('click.pskillsEditor', `${TAB} .rpg-pskills-ed-add-btn`, () => onAddSkill())
        .on('keydown.pskillsEditor', `${TAB} .rpg-pskills-ed-new-name`, event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onAddSkill();
            }
        })
        .on('click.pskillsEditor', `${TAB} .rpg-pskills-ed-delete`, function () {
            const skillId = $(this).closest('.rpg-pskills-ed-skill').attr('data-skill-id');
            if (removeSkill(currentDraft(), skillId)) {
                delete checks[skillId];
                commit();
                redraw();
            }
        });
}

/**
 * Save guard for "Save & Apply": blocks on configuration errors and fatal threshold diagnostics.
 * Shows the tab and a toast when blocked.
 * @returns {boolean} True when saving may proceed
 */
export function canSaveProgressiveSkills() {
    const config = currentDraft();
    const result = getSaveBlockers(config, checks);
    if (!result.blocked) return true;
    $('.rpg-editor-tab[data-tab="progressiveSkills"]').trigger('click');
    toastr.error(text()('saveBlocked'));
    return false;
}

function currentDraft() {
    if (!draft) {
        draft = normalizeConfig(extensionSettings.trackerConfig?.progressiveSkills);
        checks = checkAllThresholds(draft);
    }
    return draft;
}

/** Writes the draft into the tracker config (the object is shared, later changes are visible directly). */
function commit() {
    extensionSettings.trackerConfig.progressiveSkills = draft;
}

function onFieldChange(element) {
    const field = element.dataset.pskillsField;
    const skillId = $(element).closest('.rpg-pskills-ed-skill').attr('data-skill-id');
    const raw = element.type === 'checkbox' ? element.checked : element.value;
    if (!setConfigField(currentDraft(), { skillId, field, raw })) return;
    commit();

    if (REDRAW_FIELDS.has(field)) {
        redraw();
        return;
    }
    if (skillId !== undefined && (field === 'progression.threshold' || field === 'maximumValue')) {
        const skill = draft.skills.find(s => s.id === skillId);
        checks[skillId] = checkThreshold(skill);
        refreshThreshold(skill);
    }
    refreshErrors();
}

function onAddSkill() {
    const $input = $(`${TAB} .rpg-pskills-ed-new-name`);
    const result = addSkill(currentDraft(), $input.val());
    if (!result.ok) {
        addError = result.code;
        $(`${TAB} [data-pskills-errors="add"]`).html(errorListHtml([{ code: result.code }], text()));
        return;
    }
    addError = null;
    checks[result.skill.id] = checkThreshold(result.skill);
    commit();
    redraw();
    $(`${TAB} .rpg-pskills-ed-skill[data-skill-id="${result.skill.id}"] [data-pskills-field="name"]`).trigger('focus');
}

function redraw() {
    const config = currentDraft();
    const errors = getEditorErrors(config);
    $(TAB).html(buildEditorTabHtml({ config, checks, errors, addError }, text()));
}

/** Updates the diagnostics list and the invalid mark of one threshold field in place (keeps the focus). */
function refreshThreshold(skill) {
    const $card = $(`${TAB} .rpg-pskills-ed-skill`).filter((_, el) => el.dataset.skillId === skill.id);
    const check = checks[skill.id];
    const shown = skill.progression.enabled ? check : null;
    $card.find('.rpg-pskills-ed-diagnostics').html(diagnosticsHtml(shown, text()));
    const invalid = Boolean(shown && !shown.valid);
    $card.find('[data-pskills-field="progression.threshold"]').toggleClass(INVALID, invalid).attr('aria-invalid', invalid ? 'true' : null);
}

/** Updates all validation error lists and invalid marks in place (keeps the focus). */
function refreshErrors() {
    const errors = getEditorErrors(draft);
    const t = text();
    const groups = groupErrors(errors);
    const invalid = invalidFields(errors);

    $(`${TAB} [data-pskills-errors="general"]`).html(errorListHtml(groups.general, t));
    $(`${TAB} [data-pskills-errors="freePoints"]`).html(errorListHtml(groups.freePoints, t));
    $(`${TAB} .rpg-pskills-ed-skill`).each((_, card) => {
        $(card).find('[data-pskills-errors="skill"]').html(errorListHtml(groups.skills[card.dataset.skillId] ?? [], t));
    });
    $(`${TAB} [data-pskills-field]`).not('[data-pskills-field="progression.threshold"]').each((_, input) => {
        const skillId = $(input).closest('.rpg-pskills-ed-skill').attr('data-skill-id') ?? '';
        const isInvalid = invalid.has(`${skillId}|${input.dataset.pskillsField}`);
        $(input).toggleClass(INVALID, isInvalid).attr('aria-invalid', isInvalid ? 'true' : null);
    });
}
