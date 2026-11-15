import { DEFAULT_LIMITS, LIMIT_CAPS } from './defaults.js';
/** Applies defaults and checks the options; throws a `TypeError` for programmer errors. */
export function resolveLimits(options) {
    if (options === undefined)
        return DEFAULT_LIMITS;
    if (options === null || typeof options !== 'object') {
        throw new TypeError('formula-engine: options must be an object');
    }
    const { limits } = options;
    if (limits === undefined)
        return DEFAULT_LIMITS;
    if (limits === null || typeof limits !== 'object') {
        throw new TypeError('formula-engine: limits must be an object');
    }
    return Object.freeze({
        maxLength: resolveLimit('maxLength', limits.maxLength),
        maxDepth: resolveLimit('maxDepth', limits.maxDepth),
    });
}
function resolveLimit(name, value) {
    if (value === undefined)
        return DEFAULT_LIMITS[name];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > LIMIT_CAPS[name]) {
        throw new TypeError(`formula-engine: limits.${name} must be an integer from 1 to ${LIMIT_CAPS[name]}`);
    }
    return value;
}
