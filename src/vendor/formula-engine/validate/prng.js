/**
 * Small deterministic PRNG (mulberry32). Returns a function producing numbers in `[0, 1)`.
 * Not cryptographically secure — only used for reproducible test values.
 */
export function createPrng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
