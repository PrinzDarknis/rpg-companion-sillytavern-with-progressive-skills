/**
 * Progressive Skills — confirmation of point spends proposed by the model (spec §5.4, §14).
 *
 * A proposal is never applied by itself: it is shown as a sticky toast with "Apply" / "Decline". The user's click
 * is the authorization. The outcome is stored on the swipe the proposal was made for (only while that swipe is
 * still the current one), so a later swipe switch or regeneration neither asks again nor applies twice.
 * Open toasts are removed when a new tracker update arrives or the chat changes (the proposal is dropped then).
 */
import { getContext } from '../../../../../../extensions.js';
import { i18n } from '../../core/i18n.js';
import { saveChatData } from '../../core/persistence.js';
import { confirmProposedSpend, declineProposedSpend, getActiveConfig } from '../progressiveSkills/integration/index.js';
import { PROPOSAL_CLASSES, buildProposalHtml, createSpendTextLookup, spendErrorName } from '../progressiveSkills/spend/index.js';
import { renderProgressiveSkills } from '../rendering/progressiveSkills.js';

/** Open proposal toasts (jQuery elements). */
const openToasts = new Set();

const STICKY = {
    timeOut: 0,
    extendedTimeOut: 0,
    tapToDismiss: false,
    closeButton: false,
    escapeHtml: false, // the content is built from escaped parts
};

/** Plain-text toasts: the skill name may come from the model. */
const PLAIN = { escapeHtml: true };

/**
 * Shows the proposals of a tracker update. Replaces the toasts of an earlier update.
 * @param {{proposals?: object[], invalidProposals?: object[]}|null} result - From processTrackerResponse
 */
export function showSpendProposals(result) {
    try {
        if (!result) return;
        clearSpendProposals();
        const text = texts();
        for (const proposal of result.invalidProposals ?? []) showNotSpent(proposal, proposal.code, text);
        for (const proposal of result.proposals ?? []) showProposal(proposal, text);
    } catch (error) {
        console.error('[RPG Companion] Progressive Skills spend confirmation failed:', error);
    }
}

/** Removes all open proposal toasts without storing anything (e.g. on chat change). */
export function clearSpendProposals() {
    for (const $toast of openToasts) toastr.clear($toast, { force: true });
    openToasts.clear();
}

function showProposal(proposal, text) {
    const chatId = getContext()?.chatId;
    const $toast = toastr.info(buildProposalHtml(proposal, text), text('proposalTitle'), STICKY);
    if (!$toast) return;
    openToasts.add($toast);
    const decide = accept => {
        openToasts.delete($toast);
        toastr.clear($toast, { force: true });
        if (getContext()?.chatId !== chatId) return; // chat changed: the proposal is dropped
        decideProposal(proposal, accept, text);
    };
    $toast.find(`.${PROPOSAL_CLASSES.apply}`).on('click', event => {
        event.stopPropagation();
        decide(true);
    });
    $toast.find(`.${PROPOSAL_CLASSES.decline}`).on('click', event => {
        event.stopPropagation();
        decide(false);
    });
}

function decideProposal(proposal, accept, text) {
    const chat = getContext()?.chat || [];
    const result = accept ? confirmProposedSpend(chat, proposal) : declineProposedSpend(chat, proposal);
    if (!result.ok) {
        // A declined proposal that can no longer be recorded needs no message.
        if (accept) showNotSpent(proposal, result.code, text);
        return;
    }
    saveChatData();
    renderProgressiveSkills();
    if (accept) toastr.success(text('applied', params(proposal)), '', PLAIN);
    else toastr.info(text('declined', params(proposal)), '', PLAIN);
}

function showNotSpent(proposal, code, text) {
    const reason = text(spendErrorName(code), { maxDelta: getActiveConfig()?.maxDelta ?? '' });
    toastr.warning(text('notSpentMessage', { ...params(proposal), reason }), text('notSpentTitle'), PLAIN);
}

function params(proposal) {
    return { amount: proposal.amount, skill: proposal.skillName };
}

function texts() {
    return createSpendTextLookup(key => i18n.getTranslation(key));
}
