/**
 * Progressive Skills — content of the confirmation toast for a point spend proposed by the model (spec §5.4).
 *
 * Everything inserted is escaped: the skill name may be an id invented by the model.
 */
import { escapeHtml } from '../shared/index.js';

/** CSS classes of the toast buttons (used by the UI glue to bind the handlers). */
export const PROPOSAL_CLASSES = Object.freeze({
    apply: 'rpg-pskills-proposal-apply',
    decline: 'rpg-pskills-proposal-decline',
});

/**
 * @param {{skillName: string, amount: number}} proposal
 * @param {(name: string, params?: object) => string} text - From createSpendTextLookup
 * @returns {string} HTML of the toast message (message text + apply/decline buttons)
 */
export function buildProposalHtml(proposal, text) {
    const message = text('proposalMessage', { amount: proposal.amount, skill: proposal.skillName });
    return '<div class="rpg-pskills-proposal">'
        + `<div class="rpg-pskills-proposal-text">${escapeHtml(message)}</div>`
        + '<div class="rpg-pskills-proposal-buttons">'
        + `<button type="button" class="menu_button ${PROPOSAL_CLASSES.apply}">${escapeHtml(text('proposalApply'))}</button>`
        + `<button type="button" class="menu_button ${PROPOSAL_CLASSES.decline}">${escapeHtml(text('proposalDecline'))}</button>`
        + '</div></div>';
}
