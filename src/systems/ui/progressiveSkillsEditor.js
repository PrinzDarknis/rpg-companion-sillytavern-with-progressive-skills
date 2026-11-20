/**
 * Progressive Skills — "Progressive Skills" tab of the tracker editor (DOM glue).
 *
 * Works on a normalized draft that is written to `extensionSettings.trackerConfig.progressiveSkills` on the first
 * change (so opening the editor alone never adds the key). Cancel restores the whole tracker config (trackerEditor),
 * Save & Apply stores it in the active preset via applyTrackerConfig.
 *
 * Threshold formulas are validated once for all skills when the tab is rendered on editor open; afterwards only the
 * edited skill's threshold is re-validated (on input, and when its maximum value changes).
 *
 * Skill cards are collapsible and arranged by group. The arrangement (layout) is built only when the tab is rendered
 * on editor open; while editing it stays frozen (no card moves), new skills are appended expanded at the bottom.
 * The open/closed state of cards and group sections is read from the DOM before every redraw, so redraws keep it.
 */
import { i18n } from '../../core/i18n.js';
import { extensionSettings } from '../../core/state.js';
import { normalizeConfig } from '../progressiveSkills/model/index.js';
import {
    GROUPS_LIST_ID, addSkill, buildEditorLayout, buildEditorTabHtml, checkAllThresholds, checkThreshold, createEditorTextLookup,
    diagnosticsHtml, errorListHtml, getEditorErrors, getSaveBlockers, groupErrors, groupOptionsHtml, invalidFields,
    removeSkill, setConfigField, skillSummaryHtml, skillsWithErrors, syncEditorLayout,
} from '../progressiveSkills/editor/index.js';

const TAB = '#rpg-editor-tab-progressiveSkills';
const INVALID = 'rpg-pskills-ed-invalid';
const HAS_ERRORS = 'rpg-pskills-ed-has-errors';
const CARD = '.rpg-pskills-ed-skill';
const GROUP = '.rpg-pskills-ed-group';
/** Fields whose change re-renders the tab (they show or hide other fields). */
const REDRAW_FIELDS = new Set(['progression.enabled', 'freeSkillPoints.enabled']);

let draft = null;
let checks = {};
let addError = null;
/** Display state of the current editor session (see the module comment). */
let layout = null;
const openSkills = new Set();
const closedGroups = new Set();

const text = () => createEditorTextLookup(key => i18n.getTranslation(key));

/**
 * Renders the tab from the stored configuration and validates all thresholds once.
 * Called by trackerEditor.renderEditorUI (editor open, reset, import).
 */
export function renderProgressiveSkillsTab() {
    draft = normalizeConfig(extensionSettings.trackerConfig?.progressiveSkills);
    checks = checkAllThresholds(draft);
    addError = null;
    resetDisplayState();
    render();
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
        .on('focusin.pskillsEditor', `${TAB} [data-pskills-field="group"]`, function () {
            attachGroupSuggestions(this);
        })
        .on('focusout.pskillsEditor', `${TAB} [data-pskills-field="group"]`, function () {
            detachGroupSuggestions(this);
        })
        .on('click.pskillsEditor', `${TAB} .rpg-pskills-ed-add-btn`, () => onAddSkill())
        .on('keydown.pskillsEditor', `${TAB} .rpg-pskills-ed-new-name`, event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onAddSkill();
            }
        })
        .on('click.pskillsEditor', `${TAB} .rpg-pskills-ed-delete`, function () {
            const skillId = $(this).closest(CARD).attr('data-skill-id');
            if (removeSkill(currentDraft(), skillId)) {
                delete checks[skillId];
                openSkills.delete(skillId);
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
    expandSkills([...result.errors.map(error => error.skillId).filter(id => id !== undefined), ...result.fatalThresholds]);
    $('.rpg-editor-tab[data-tab="progressiveSkills"]').trigger('click');
    toastr.error(text()('saveBlocked'));
    return false;
}

function currentDraft() {
    if (!draft) {
        draft = normalizeConfig(extensionSettings.trackerConfig?.progressiveSkills);
        checks = checkAllThresholds(draft);
        resetDisplayState();
    }
    return draft;
}

/** Writes the draft into the tracker config (the object is shared, later changes are visible directly). */
function commit() {
    extensionSettings.trackerConfig.progressiveSkills = draft;
}

function onFieldChange(element) {
    const field = element.dataset.pskillsField;
    const skillId = $(element).closest(CARD).attr('data-skill-id');
    const raw = element.type === 'checkbox' ? element.checked : element.value;
    if (!setConfigField(currentDraft(), { skillId, field, raw })) return;
    commit();

    if (REDRAW_FIELDS.has(field)) {
        redraw();
        return;
    }
    if (field === 'name') refreshSummary(skillId);
    if (field === 'group') refreshGroupOptions();
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
    openSkills.add(result.skill.id);
    commit();
    redraw();
    findCard(result.skill.id).find('[data-pskills-field="name"]').trigger('focus');
}

/** New editor session: layout sorted by group, all cards collapsed, all group sections expanded. */
function resetDisplayState() {
    layout = buildEditorLayout(draft.skills);
    openSkills.clear();
    closedGroups.clear();
}

/** Re-renders the tab and keeps the layout and the open/closed state of the current session. */
function redraw() {
    captureOpenState();
    render();
}

function render() {
    const config = currentDraft();
    layout = syncEditorLayout(layout ?? buildEditorLayout(config.skills), config.skills);
    const errors = getEditorErrors(config);
    $(TAB).html(buildEditorTabHtml({ config, checks, errors, addError, layout, openSkills, closedGroups }, text()));
}

/** Reads which cards and group sections the user expanded or collapsed (before the DOM is replaced). */
function captureOpenState() {
    $(`${TAB} ${CARD}`).each((_, card) => {
        if (card.open) openSkills.add(card.dataset.skillId);
        else openSkills.delete(card.dataset.skillId);
    });
    $(`${TAB} ${GROUP}`).each((_, section) => {
        if (section.open) closedGroups.delete(section.dataset.group);
        else closedGroups.add(section.dataset.group);
    });
}

/** Expands the given skill cards and their group sections (save guard). */
function expandSkills(skillIds) {
    for (const skillId of new Set(skillIds)) {
        const $card = findCard(skillId);
        $card.prop('open', true);
        $card.closest(GROUP).prop('open', true);
        openSkills.add(skillId);
    }
}

function findCard(skillId) {
    return $(`${TAB} ${CARD}`).filter((_, el) => el.dataset.skillId === skillId);
}

/** Updates the summary line (name, + XP) of one card in place. */
function refreshSummary(skillId) {
    const skill = draft.skills.find(s => s.id === skillId);
    if (skill) findCard(skillId).children('summary').html(skillSummaryHtml(skill, text()));
}

/**
 * Group suggestions exist only while a group input is focused: only that input gets `list` and the datalist gets
 * the current groups. Permanent `list` attributes on all group inputs made desktop Chrome sluggish page-wide.
 */
function attachGroupSuggestions(input) {
    $(`${TAB} #${GROUPS_LIST_ID}`).html(groupOptionsHtml(currentDraft().skills));
    input.setAttribute('list', GROUPS_LIST_ID);
}

function detachGroupSuggestions(input) {
    input.removeAttribute('list');
    $(`${TAB} #${GROUPS_LIST_ID}`).empty();
}

/** Updates the group suggestions of the focused group input in place (e.g. after Enter; keeps the focus). */
function refreshGroupOptions() {
    if ($(`${TAB} [list="${GROUPS_LIST_ID}"]`).length === 0) return;
    $(`${TAB} #${GROUPS_LIST_ID}`).html(groupOptionsHtml(draft.skills));
}

/** Updates the diagnostics list and the invalid mark of one threshold field in place (keeps the focus). */
function refreshThreshold(skill) {
    const $card = findCard(skill.id);
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
    const withErrors = skillsWithErrors(draft, checks, errors);
    $(`${TAB} ${CARD}`).each((_, card) => {
        $(card).find('[data-pskills-errors="skill"]').html(errorListHtml(groups.skills[card.dataset.skillId] ?? [], t));
        $(card).toggleClass(HAS_ERRORS, withErrors.has(card.dataset.skillId));
    });
    $(`${TAB} [data-pskills-field]`).not('[data-pskills-field="progression.threshold"]').each((_, input) => {
        const skillId = $(input).closest(CARD).attr('data-skill-id') ?? '';
        const isInvalid = invalid.has(`${skillId}|${input.dataset.pskillsField}`);
        $(input).toggleClass(INVALID, isInvalid).attr('aria-invalid', isInvalid ? 'true' : null);
    });
}
