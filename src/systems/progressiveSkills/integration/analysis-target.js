/**
 * Progressive Skills — which message a tracker update analyses.
 *
 * Like the existing tracker data (apiClient.updateRPGData) the result belongs to the last chat message when it is
 * an assistant message; its base state is that of the messages before it (N-1).
 */
import { isAssistantMessage } from '../store/index.js';

/** @returns {number} Index of the analysed message, or -1 when the last message is not an assistant message. */
export function getAnalysisTargetIndex(chat) {
    const last = Array.isArray(chat) ? chat.length - 1 : -1;
    return last >= 0 && isAssistantMessage(chat[last]) ? last : -1;
}
