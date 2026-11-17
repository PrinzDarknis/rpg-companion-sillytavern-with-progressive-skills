/**
 * Progressive Skills Rendering Module
 * Dashboard section, independent of the existing Skills display. Shows the state of the displayed chat position
 * (selected swipes), so it covers chat load, swipe switch, overswipe and deletions. Inline forms (one open at a
 * time): manual edit of a skill (value, XP), spending free points on a skill, editing the free-point balance.
 * Every change is validated and stored on the latest assistant message.
 */

import { getContext } from '../../../../../../extensions.js';
import { $progressiveSkillsContainer } from '../../core/state.js';
import { i18n } from '../../core/i18n.js';
import { saveChatData } from '../../core/persistence.js';
import {
    applyManualSkillEdit, getActiveConfig, setFreeSkillPoints, spendSkillPoints,
} from '../progressiveSkills/integration/index.js';
import { getCurrentState } from '../progressiveSkills/store/index.js';
import { buildDashboardHtml, buildDashboardModel, createTextLookup } from '../progressiveSkills/dashboard/index.js';
import { parseInteger } from '../progressiveSkills/shared/index.js';

/**
 * Open inline form or null: { kind: 'edit' | 'spend' | 'points', skillId?, error?, ...entered text }.
 */
let form = null;

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
        if (!isFormValid(config)) form = null;
        const options = {
            editing: form?.kind === 'edit' ? form : null,
            spending: form?.kind === 'spend' ? { ...form, maxDelta: config.maxDelta } : null,
            pointsEditing: form?.kind === 'points' ? form : null,
        };
        $progressiveSkillsContainer.html(buildDashboardHtml(buildDashboardModel(config, state), text, options));
        bindHandlers($progressiveSkillsContainer);
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills rendering failed:', error);
    }
}

/** A form for a deleted skill, or a point form while Free Skill Points are off, is closed. */
function isFormValid(config) {
    if (!form) return true;
    if (form.kind !== 'edit' && !config.freeSkillPoints.enabled) return false;
    return form.kind === 'points' || config.skills.some(skill => skill.id === form.skillId);
}

/** Per form kind: the input fields read on submit and the store function. */
const FORMS = {
    edit: {
        selector: '.rpg-pskills-edit-form',
        submit(skillId, $form) {
            const $xp = $form.find('.rpg-pskills-edit-xp');
            const value = String($form.find('.rpg-pskills-edit-value').val() ?? '');
            const xp = $xp.length ? String($xp.val() ?? '') : undefined;
            const edit = { skillId, value: parseInteger(value) };
            if (xp !== undefined) edit.xp = parseInteger(xp);
            return { result: applyManualSkillEdit(chat(), edit), entered: { value, xp } };
        },
    },
    spend: {
        selector: '.rpg-pskills-spend-form',
        submit(skillId, $form) {
            const amount = String($form.find('.rpg-pskills-spend-amount').val() ?? '');
            return { result: spendSkillPoints(chat(), { skillId, amount: parseInteger(amount) }), entered: { amount } };
        },
    },
    points: {
        selector: '.rpg-pskills-points-form',
        submit(skillId, $form) {
            const value = String($form.find('.rpg-pskills-points-value').val() ?? '');
            return { result: setFreeSkillPoints(chat(), parseInteger(value)), entered: { value } };
        },
    },
};

function chat() {
    return getContext()?.chat || [];
}

/** Delegated handlers on the container (re-bound on every render; the container element itself persists). */
function bindHandlers($container) {
    const skillIdOf = element => $(element).closest('.rpg-pskills-skill').attr('data-skill-id');
    const toggle = (kind, skillId) => {
        form = form?.kind === kind && form.skillId === skillId ? null : { kind, skillId };
        renderProgressiveSkills();
    };
    const close = () => {
        form = null;
        renderProgressiveSkills();
    };
    $container
        .off('.pskillsEdit')
        .on('click.pskillsEdit', '.rpg-pskills-edit-btn', function () { toggle('edit', skillIdOf(this)); })
        .on('click.pskillsEdit', '.rpg-pskills-spend-btn', function () { toggle('spend', skillIdOf(this)); })
        .on('click.pskillsEdit', '.rpg-pskills-points-edit-btn', () => toggle('points', undefined));

    for (const [kind, { selector }] of Object.entries(FORMS)) {
        const prefix = selector.replace(/-form$/, '');
        $container
            .on('click.pskillsEdit', `${prefix}-cancel`, close)
            .on('click.pskillsEdit', `${prefix}-save`, function () {
                submit(kind, skillIdOf(this), $(this).closest(selector));
            })
            .on('keydown.pskillsEdit', `${selector} input`, function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submit(kind, skillIdOf(this), $(this).closest(selector));
                } else if (event.key === 'Escape') {
                    close();
                }
            });
    }
}

/** Validates and stores the entered values; keeps the form open with a message when they are rejected. */
function submit(kind, skillId, $form) {
    const { result, entered } = FORMS[kind].submit(skillId, $form);
    if (result.ok) {
        form = null;
        if (result.changed) saveChatData();
    } else {
        form = { kind, skillId, error: result.code, ...entered };
    }
    renderProgressiveSkills();
}
