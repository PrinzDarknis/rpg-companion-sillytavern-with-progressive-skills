/**
 * Progressive Skills — placement of the dashboard section in the tab layouts (desktop and mobile).
 *
 * The tab setup always creates a hidden "Skills" tab (button + content wrapper). With the preset option
 * `displayInOwnTab` (and the feature active) the existing section moves into that tab; otherwise it stays in the
 * Status tab directly after User Stats. The section itself is never re-rendered here.
 */

/** `data-tab` / `data-tab-content` value of the own tab. */
export const SKILLS_TAB = 'skills';

const SECTION = '#rpg-progressive-skills';

/** Tab button and content selectors of both layouts. */
const LAYOUTS = [
    { buttons: '.rpg-tabs-nav .rpg-tab-btn', contents: '.rpg-tab-content' },
    { buttons: '.rpg-mobile-tabs .rpg-mobile-tab', contents: '.rpg-mobile-tab-content' },
];

/**
 * Moves the section into the own tab or back after User Stats and shows/hides the tab button.
 * No-op when no tab layout exists; moves only when the place differs (detach keeps the handlers).
 * @param {object|null} config - Active configuration (null when the feature is inactive)
 */
export function placeProgressiveSkillsSection(config) {
    const $section = $(SECTION);
    if ($section.length === 0) return;
    const ownTab = Boolean(config?.displayInOwnTab);

    for (const layout of LAYOUTS) {
        const $button = $(`${layout.buttons}[data-tab="${SKILLS_TAB}"]`);
        const $tab = $(`${layout.contents}[data-tab-content="${SKILLS_TAB}"]`);
        if ($button.length === 0 || $tab.length === 0) continue;

        if (ownTab) {
            if ($section.parent()[0] !== $tab[0]) $tab.append($section.detach());
            $button.show();
        } else {
            moveAfterUserStats($section);
            $button.hide();
            if ($button.hasClass('active')) $(layout.buttons).not($button).first().trigger('click');
        }
    }
}

/** Puts the section directly after User Stats (its place in the Status tab). */
function moveAfterUserStats($section) {
    const $userStats = $('#rpg-user-stats');
    if ($userStats.length === 0 || $section.prev()[0] === $userStats[0]) return;
    $userStats.after($section.detach());
}

/**
 * @param {string} buttonClass - `rpg-tab-btn` (desktop) or `rpg-mobile-tab` (mobile)
 * @param {string} label - Translated, plain tab label
 * @returns {string} HTML of the hidden tab button
 */
export function skillsTabButtonHtml(buttonClass, label) {
    const escaped = $('<div>').text(label).html();
    return `<button class="${buttonClass}" data-tab="${SKILLS_TAB}" style="display: none;">`
        + `<i class="fa-solid fa-graduation-cap"></i><span data-i18n-key="progressiveSkills.tabName">${escaped}</span></button>`;
}
