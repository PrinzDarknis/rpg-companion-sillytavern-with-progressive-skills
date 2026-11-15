/**
 * formula-engine — public entry point.
 *
 * - Evaluating never throws for any expression or variables; problems are reported as diagnostics.
 *   Recoverable problems evaluate with a fallback; the first fatal problem stops the evaluation.
 * - Only invalid options throw a `TypeError`.
 * - No dynamic code execution of any kind.
 */
export { evaluate } from './evaluation/index.js';
export { validate } from './validate/index.js';
export { DEFAULT_LIMITS } from './options/index.js';
