import { createPrng } from './prng.js';
export const DEFAULT_SAMPLES = 32;
export const DEFAULT_SEED = 1;
/**
 * Variable sets for `validate`: "all minimum", "all maximum", then `samples` random sets (seeded PRNG).
 * Without variables a single empty set is returned. Throws a `TypeError` for invalid ranges, `samples`
 * or `seed`.
 */
export function createSampleSets(options) {
    const { variables, samples = DEFAULT_SAMPLES, seed = DEFAULT_SEED } = options;
    if (variables === null || typeof variables !== 'object' || Array.isArray(variables)) {
        throw new TypeError('formula-engine: validate variables must be an object of [min, max] ranges');
    }
    if (typeof samples !== 'number' || !Number.isSafeInteger(samples) || samples < 0) {
        throw new TypeError('formula-engine: samples must be a non-negative integer');
    }
    if (typeof seed !== 'number' || !Number.isFinite(seed)) {
        throw new TypeError('formula-engine: seed must be a finite number');
    }
    const ranges = Object.keys(variables).map(name => toRange(name, variables[name]));
    if (ranges.length === 0)
        return [Object.freeze({})];
    const random = createPrng(seed);
    const sets = [build(ranges, min => min), build(ranges, (_min, max) => max)];
    for (let i = 0; i < samples; i++) {
        sets.push(build(ranges, (min, max) => min + Math.floor(random() * (max - min + 1))));
    }
    return sets;
}
function toRange(name, range) {
    if (Array.isArray(range) && range.length === 2) {
        const [min, max] = range;
        if (Number.isSafeInteger(min) && Number.isSafeInteger(max) && min <= max) {
            return [name, min, max];
        }
    }
    throw new TypeError(`formula-engine: range of "${name}" must be [min, max] with integers and min <= max`);
}
function build(ranges, pick) {
    const set = {};
    for (const [name, min, max] of ranges)
        set[name] = pick(min, max);
    return Object.freeze(set);
}
