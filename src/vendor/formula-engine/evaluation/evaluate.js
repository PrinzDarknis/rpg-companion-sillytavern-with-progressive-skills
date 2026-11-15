import { DiagnosticCollector, FatalStop } from '../diagnostics/index.js';
import { resolveLimits } from '../options/index.js';
import { evaluateSource } from './evaluator.js';
const NO_VARIABLES = Object.freeze({});
/**
 * Evaluates an expression. Never throws for any expression or variables; only invalid options throw a
 * `TypeError`. A non-string expression is treated as empty.
 */
export function evaluate(expression, variables, options) {
    const limits = resolveLimits(options);
    const diagnostics = new DiagnosticCollector();
    const source = typeof expression === 'string' ? expression : '';
    const values = variables !== null && typeof variables === 'object' && !Array.isArray(variables) ? variables : NO_VARIABLES;
    let value = 0;
    try {
        value = evaluateSource(source, values, limits, diagnostics);
    }
    catch (error) {
        if (!(error instanceof FatalStop))
            throw error;
    }
    const success = !diagnostics.hasFatal;
    return Object.freeze({ success, value: success && value !== 0 ? value : 0, diagnostics: diagnostics.diagnostics });
}
