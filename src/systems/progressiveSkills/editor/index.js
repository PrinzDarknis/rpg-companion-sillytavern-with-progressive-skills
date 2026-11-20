/**
 * Progressive Skills — config editor tab (pure logic, no host or DOM imports).
 */
export { EDITOR_TEXTS, createEditorTextLookup } from './texts.js';
export { XP_SAMPLE_MAX, THRESHOLD_NOT_POSITIVE, checkThreshold } from './formula-check.js';
export { validationMessage, diagnosticMessage } from './messages.js';
export { SKILL_FIELDS, CONFIG_FIELDS, addSkill, removeSkill, setConfigField } from './config-edits.js';
export { getSaveBlockers, checkAllThresholds } from './save-check.js';
export { getEditorErrors } from './editor-errors.js';
export { buildEditorLayout, syncEditorLayout } from './layout.js';
export { skillSummaryText, skillsWithErrors } from './skill-summary.js';
export {
    GROUPS_LIST_ID, buildEditorTabHtml, groupErrors, invalidFields, errorListHtml, diagnosticsHtml, groupOptionsHtml, skillSummaryHtml,
} from './tab-html.js';
