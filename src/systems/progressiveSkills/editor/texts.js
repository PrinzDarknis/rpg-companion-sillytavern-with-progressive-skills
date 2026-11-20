/**
 * Progressive Skills — i18n keys of the config editor tab with their English fallbacks.
 */
import { createLookup } from '../shared/index.js';

const E = 'progressiveSkills.editor.';
const V = 'progressiveSkills.validation.';
const F = 'progressiveSkills.formula.';

export const EDITOR_TEXTS = {
    generalTitle: [`${E}generalTitle`, 'General'],
    enabled: [`${E}enabled`, 'Enable Progressive Skills'],
    enabledHint: [`${E}enabledHint`, 'Used only in the "separate" and "external" generation modes.'],
    includeDescriptions: [`${E}includeDescriptions`, 'Include skill descriptions in the chat context'],
    includeDescriptionsHint: [`${E}includeDescriptionsHint`,
        'Helps the AI use the skills more accurately in the story, but increases token usage.'],
    displayInOwnTab: [`${E}displayInOwnTab`, 'Show in own "Skills" tab'],
    displayInOwnTabHint: [`${E}displayInOwnTabHint`,
        'Moves the Progressive Skills section from the Status tab into its own tab (useful with many skills).'],
    maxDelta: [`${E}maxDelta`, 'Max. change per update'],
    maxDeltaHint: [`${E}maxDeltaHint`, 'Larger XP, increase or point proposals of the model are rejected.'],
    freePointsTitle: [`${E}freePointsTitle`, 'Free Skill Points'],
    freePointsEnabled: [`${E}freePointsEnabled`, 'Enable Free Skill Points'],
    freePointsStart: [`${E}freePointsStart`, 'Start points'],
    freePointsMax: [`${E}freePointsMax`, 'Maximum (empty = no maximum)'],
    freePointsGrowth: [`${E}freePointsGrowth`, 'Growth condition (when and how many points are earned)'],
    skillsTitle: [`${E}skillsTitle`, 'Skills'],
    skillsHint: [`${E}skillsHint`,
        'Start values apply to chats without Progressive Skills data. Current values and XP are edited on the dashboard.'],
    noSkills: [`${E}noSkills`, 'No skills yet.'],
    newSkillPlaceholder: [`${E}newSkillPlaceholder`, 'Name of the new skill'],
    addSkill: [`${E}addSkill`, 'Add skill'],
    deleteSkill: [`${E}deleteSkill`, 'Delete skill'],
    skillId: [`${E}skillId`, 'ID: {id}'],
    name: [`${E}name`, 'Name'],
    group: [`${E}group`, 'Group'],
    groupHint: [`${E}groupHint`, 'optional, e.g. Combat'],
    xpSuffix: [`${E}xpSuffix`, '+ XP'],
    skillHasErrors: [`${E}skillHasErrors`, 'This skill has errors'],
    description: [`${E}description`, 'Description'],
    startValue: [`${E}startValue`, 'Start value'],
    maximumValue: [`${E}maximumValue`, 'Maximum value'],
    growthCondition: [`${E}growthCondition`, 'Growth condition'],
    growthHintXp: [`${E}growthHintXp`, 'Describes when XP is awarded and how much (interpreted by the AI).'],
    growthHintDirect: [`${E}growthHintDirect`,
        'Describes when the skill itself increases and by how much (interpreted by the AI).'],
    progressionEnabled: [`${E}progressionEnabled`, 'XP progression'],
    startXp: [`${E}startXp`, 'Start XP'],
    threshold: [`${E}threshold`, 'XP threshold (number or formula)'],
    thresholdHint: [`${E}thresholdHint`,
        'Variables: skill, maxSkill, xp. Operators: + - * / % ( ). Functions: floor, ceil, round, min, max.'],
    severityFatal: [`${E}severityFatal`, 'Error'],
    severityRecovered: [`${E}severityRecovered`, 'Warning'],
    saveBlocked: [`${E}saveBlocked`, 'Progressive Skills: please fix the marked errors before saving.'],

    v_ID_INVALID: [`${V}ID_INVALID`, 'Invalid ID.'],
    v_ID_DUPLICATE: [`${V}ID_DUPLICATE`, 'Duplicate ID.'],
    v_NAME_EMPTY: [`${V}NAME_EMPTY`, 'Name must not be empty.'],
    v_NAME_DUPLICATE: [`${V}NAME_DUPLICATE`, 'A skill with this name already exists.'],
    v_NOT_INTEGER: [`${V}NOT_INTEGER`, '{field} must be a whole number.'],
    v_MAXIMUM_NOT_POSITIVE: [`${V}MAXIMUM_NOT_POSITIVE`, 'Maximum value must be greater than 0.'],
    v_START_VALUE_OUT_OF_RANGE: [`${V}START_VALUE_OUT_OF_RANGE`, 'Start value must be between 0 and the maximum value.'],
    v_START_XP_NEGATIVE: [`${V}START_XP_NEGATIVE`, 'Start XP must not be negative.'],
    v_THRESHOLD_EMPTY: [`${V}THRESHOLD_EMPTY`, 'XP threshold must not be empty.'],
    v_GROWTH_CONDITION_EMPTY: [`${V}GROWTH_CONDITION_EMPTY`, 'Growth condition must not be empty.'],
    v_FREE_POINTS_NEGATIVE: [`${V}FREE_POINTS_NEGATIVE`, 'Start points must not be negative.'],
    v_FREE_POINTS_MAX_INVALID: [`${V}FREE_POINTS_MAX_INVALID`,
        'Maximum must be a positive whole number and not below the start points.'],
    v_MAX_DELTA_INVALID: [`${V}MAX_DELTA_INVALID`, 'Max. change per update must be a positive whole number.'],

    f_UNKNOWN_VARIABLE: [`${F}UNKNOWN_VARIABLE`, 'Variable "{token}" is not defined (counts as 0).'],
    f_INVALID_VARIABLE_VALUE: [`${F}INVALID_VARIABLE_VALUE`, 'Variable "{token}" has no valid value.'],
    f_MISSING_OPERAND: [`${F}MISSING_OPERAND`, 'Missing operand near "{token}".'],
    f_ARGUMENT_COUNT: [`${F}ARGUMENT_COUNT`, 'Wrong number of arguments for "{token}".'],
    f_EMPTY_ARGUMENTS: [`${F}EMPTY_ARGUMENTS`, 'Function "{token}" needs at least one valid argument.'],
    f_UNKNOWN_FUNCTION: [`${F}UNKNOWN_FUNCTION`, 'Unknown function "{token}".'],
    f_UNKNOWN_OPERATOR: [`${F}UNKNOWN_OPERATOR`, 'Unknown operation "{token}".'],
    f_UNEXPECTED_CHARACTER: [`${F}UNEXPECTED_CHARACTER`, 'Unexpected character "{token}".'],
    f_UNEXPECTED_TOKEN: [`${F}UNEXPECTED_TOKEN`, 'Unexpected "{token}".'],
    f_UNBALANCED_PARENTHESES: [`${F}UNBALANCED_PARENTHESES`, 'Missing or extra parenthesis.'],
    f_INVALID_NUMBER: [`${F}INVALID_NUMBER`, 'Invalid number "{token}".'],
    f_EMPTY_EXPRESSION: [`${F}EMPTY_EXPRESSION`, 'The formula is empty.'],
    f_DIVISION_BY_ZERO: [`${F}DIVISION_BY_ZERO`, 'Division by zero for {variables}.'],
    f_NON_FINITE_RESULT: [`${F}NON_FINITE_RESULT`, 'Result is not a finite number.'],
    f_LIMIT_EXCEEDED: [`${F}LIMIT_EXCEEDED`, 'Formula is too long or too deeply nested.'],
    f_THRESHOLD_NOT_POSITIVE: [`${F}THRESHOLD_NOT_POSITIVE`, 'Result is not positive for {variables}.'],
    f_UNKNOWN: [`${F}UNKNOWN`, 'Formula problem ({code}).'],
};

/**
 * @param {(key: string) => (string|null|undefined)} translate - Returns the translation or a falsy value
 * @returns {(name: keyof EDITOR_TEXTS, params?: object) => string} Plain (unescaped) text
 */
export function createEditorTextLookup(translate) {
    return createLookup(EDITOR_TEXTS, translate);
}

/** @returns {boolean} Whether the table has an entry (used for code-based names like `f_<CODE>`). */
export function hasEditorText(name) {
    return Object.prototype.hasOwnProperty.call(EDITOR_TEXTS, name);
}
