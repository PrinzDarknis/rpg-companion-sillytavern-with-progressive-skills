/**
 * Progressive Skills Rendering Module
 * Dashboard section, independent of the existing Skills display. Shows the state of the displayed chat position
 * (selected swipes), so it covers chat load, swipe switch, overswipe and deletions. Each skill has a manual-edit
 * form (value, XP) that stores a validated edit on the latest assistant message.
 */

import { getContext } from '../../../../../../extensions.js';
import { $progressiveSkillsContainer } from '../../core/state.js';
import { i18n } from '../../core/i18n.js';
import { saveChatData } from '../../core/persistence.js';
import { applyManualSkillEdit, getActiveConfig } from '../progressiveSkills/integration/index.js';
import { getCurrentState } from '../progressiveSkills/store/index.js';
import { buildDashboardHtml, buildDashboardModel, createTextLookup } from '../progressiveSkills/dashboard/index.js';
import { parseInteger } from '../progressiveSkills/shared/index.js';

/** Open manual-edit form: { skillId, error?, value?, xp? } or null. */
let editing = null;

/**
 * Shows the section only while the feature is active (enabled, separate/external mode).
 * @returns {object|null} The active configuration, or null when hidden
 */
export function updateProgressiveSkillsVisibility() {
    const $container = $progressiveSkillsContainer;
    if (!$container || $container.length === 0) return null;
    const config = getActiveConfig();
    if (config) {
        $container.show();
    } else {
        $container.hide();
    }
    return config;
}

/**
 * Renders the Progressive Skills section. Never throws: a failure here must not affect the other panels.
 */
export function renderProgressiveSkills() {
    try {
        const config = updateProgressiveSkillsVisibility();
        if (!config) {
            $progressiveSkillsContainer?.empty();
            return;
        }
        const state = getCurrentState(getContext()?.chat || [], config);
        const text = createTextLookup(key => i18n.getTranslation(key));
        if (editing && !config.skills.some(skill => skill.id === editing.skillId)) editing = null;
        $progressiveSkillsContainer.html(buildDashboardHtml(buildDashboardModel(config, state), text, { editing }));
        bindEditHandlers($progressiveSkillsContainer);
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills rendering failed:', error);
    }
}

/** Delegated handlers on the container (re-bound on every render; the container element itself persists). */
function bindEditHandlers($container) {
    const skillIdOf = element => $(element).closest('.rpg-pskills-skill').attr('data-skill-id');
    $container
        .off('.pskillsEdit')
        .on('click.pskillsEdit', '.rpg-pskills-edit-btn', function () {
            const skillId = skillIdOf(this);
            editing = editing?.skillId === skillId ? null : { skillId };
            renderProgressiveSkills();
        })
        .on('click.pskillsEdit', '.rpg-pskills-edit-cancel', () => {
            editing = null;
            renderProgressiveSkills();
        })
        .on('click.pskillsEdit', '.rpg-pskills-edit-save', function () {
            saveEdit(skillIdOf(this), $(this).closest('.rpg-pskills-edit-form'));
        })
        .on('keydown.pskillsEdit', '.rpg-pskills-edit-form input', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveEdit(skillIdOf(this), $(this).closest('.rpg-pskills-edit-form'));
            } else if (event.key === 'Escape') {
                editing = null;
                renderProgressiveSkills();
            }
        });
}

/** Validates and stores the entered values; keeps the form open with a message when they are rejected. */
function saveEdit(skillId, $form) {
    const $xp = $form.find('.rpg-pskills-edit-xp');
    const valueText = String($form.find('.rpg-pskills-edit-value').val() ?? '');
    const xpText = $xp.length ? String($xp.val() ?? '') : undefined;
    const edit = { skillId, value: parseInteger(valueText) };
    if (xpText !== undefined) edit.xp = parseInteger(xpText);

    const result = applyManualSkillEdit(getContext()?.chat || [], edit);
    if (result.ok) {
        editing = null;
        if (result.changed) saveChatData();
    } else {
        editing = { skillId, error: result.code, value: valueText, xp: xpText };
    }
    renderProgressiveSkills();
}
