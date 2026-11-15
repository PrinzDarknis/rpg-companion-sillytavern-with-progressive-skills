import { sortDiagnostics } from '../diagnostics/index.js';
import { evaluate } from '../evaluation/index.js';
import { createSampleSets } from './sampling.js';
/**
 * Test run for editors: evaluates the expression with the corner and random sample sets.
 * Throws only for invalid options (`TypeError`).
 */
export function validate(expression, options) {
    if (options === null || typeof options !== 'object') {
        throw new TypeError('formula-engine: validate options must be an object');
    }
    const evaluateOptions = options.limits === undefined ? undefined : { limits: options.limits };
    const samples = createSampleSets(options).map(variables => Object.freeze({ variables, result: evaluate(expression, variables, evaluateOptions) }));
    const diagnostics = Object.freeze(sortDiagnostics(dedupe(samples.flatMap(sample => sample.result.diagnostics))));
    return Object.freeze({ valid: diagnostics.length === 0, diagnostics, samples: Object.freeze(samples) });
}
/** Keeps the first diagnostic per `code` + `start` + `end`. */
function dedupe(diagnostics) {
    const seen = new Set();
    return diagnostics.filter(diagnostic => {
        const key = `${diagnostic.code}|${diagnostic.start ?? ''}|${diagnostic.end ?? ''}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
