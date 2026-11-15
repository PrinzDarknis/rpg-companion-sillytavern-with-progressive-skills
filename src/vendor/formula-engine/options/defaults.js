/** Default limits, exported for display purposes (e.g. "max. 500 characters" hints in editors). */
export const DEFAULT_LIMITS = Object.freeze({ maxLength: 500, maxDepth: 32 });
/** Hard upper bounds for configured limits; they keep time and call-stack usage bounded for any input. */
export const LIMIT_CAPS = Object.freeze({ maxLength: 20000, maxDepth: 256 });
