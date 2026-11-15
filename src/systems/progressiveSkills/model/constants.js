/**
 * Progressive Skills — schema version and default values.
 */

/** Stored in config and state; bump together with a migration when the shape changes. */
export const SCHEMA_VERSION = 1;

/** Defaults for a newly created skill. */
export const SKILL_DEFAULTS = Object.freeze({
    name: '',
    description: '',
    startValue: 0,
    maximumValue: 100,
    growthCondition: '',
    progression: Object.freeze({
        enabled: true,
        startXp: 0,
        threshold: '10',
    }),
});

/** Defaults for the free skill point pool. `max: null` = no configured maximum. */
export const FREE_POINTS_DEFAULTS = Object.freeze({
    enabled: false,
    start: 0,
    max: null,
    growthCondition: '',
});
