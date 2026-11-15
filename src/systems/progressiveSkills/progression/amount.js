/**
 * Progressive Skills — checks for proposed amounts.
 */
import { REJECTION_CODES } from './constants.js';

/**
 * Checks a proposed delta: positive integer up to the configured maximum (spec §8.1: reject excessively large deltas).
 * @param {unknown} amount
 * @param {number} maxDelta - `config.maxDelta`
 * @returns {string|null} Rejection code, or null when the amount is valid
 */
export function checkAmount(amount, maxDelta) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return REJECTION_CODES.INVALID_AMOUNT;
    if (amount > maxDelta) return REJECTION_CODES.AMOUNT_TOO_LARGE;
    return null;
}
