/**
 * Progressive Skills Rendering Module
 * Read-only dashboard section, independent of the existing Skills display. Shows the state of the displayed
 * chat position (selected swipes), so it covers chat load, swipe switch, overswipe and deletions.
 */

import { getContext } from '../../../../../../extensions.js';
import { $progressiveSkillsContainer } from '../../core/state.js';
import { i18n } from '../../core/i18n.js';
import { getActiveConfig } from '../progressiveSkills/integration/index.js';
import { getCurrentState } from '../progressiveSkills/store/index.js';
import { buildDashboardHtml, buildDashboardModel, createTextLookup } from '../progressiveSkills/dashboard/index.js';

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
        $progressiveSkillsContainer.html(buildDashboardHtml(buildDashboardModel(config, state), text));
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills rendering failed:', error);
    }
}
