/**
 * Progressive Skills — access to the configuration in the extension settings.
 */
import { extensionSettings } from '../../../core/state.js';
import { normalizeConfig } from '../model/index.js';

/** @returns {object} Normalized configuration from `trackerConfig.progressiveSkills`. */
export function getConfig() {
    return normalizeConfig(extensionSettings.trackerConfig?.progressiveSkills);
}

/**
 * Feature is used only when enabled and in separate/external mode (together mode is out of scope).
 * @returns {object|null} The normalized configuration, or null when inactive
 */
export function getActiveConfig() {
    const mode = extensionSettings.generationMode;
    if (mode !== 'separate' && mode !== 'external') return null;
    const config = getConfig();
    return config.enabled ? config : null;
}
