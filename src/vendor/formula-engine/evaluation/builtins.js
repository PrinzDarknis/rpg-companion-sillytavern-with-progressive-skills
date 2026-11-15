const unary = (fn) => Object.freeze({ minArgs: 1, maxArgs: 1, skipsInvalidArguments: false, apply: (args) => fn(args[0] ?? 0) });
const variadic = (fn) => Object.freeze({ minArgs: 1, maxArgs: Infinity, skipsInvalidArguments: true, apply: (args) => fn(...args) });
/** Lookup by name. A `Map`, so prototype names (`constructor`, ...) are never found. */
export const BUILTIN_FUNCTIONS = new Map([
    ['floor', unary(Math.floor)],
    ['ceil', unary(Math.ceil)],
    ['round', unary(Math.round)],
    ['min', variadic(Math.min)],
    ['max', variadic(Math.max)],
]);
