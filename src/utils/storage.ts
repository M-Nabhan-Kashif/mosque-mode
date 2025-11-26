import { Preferences } from '@capacitor/preferences';
import { UserSettings, AudioSettings } from '@/types/mosque';

const SETTINGS_KEY = 'mosque_app_settings';
const AUDIO_SETTINGS_KEY = 'saved_audio_settings';

export const defaultSettings: UserSettings = {
  enabled: true,
  geofenceRadius: 100,
  notificationsEnabled: true,
};

/**
 * Save user settings to local storage
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await Preferences.set({
      key: SETTINGS_KEY,
      value: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Load user settings from local storage
 */
export async function loadSettings(): Promise<UserSettings> {
  try {
    const result = await Preferences.get({ key: SETTINGS_KEY });
    
    if (result.value) {
      return JSON.parse(result.value);
    }
    
    // Return default settings if none exist
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

/**
 * Clear all settings
 */
export async function clearSettings(): Promise<void> {
  try {
    await Preferences.remove({ key: SETTINGS_KEY });
  } catch (error) {
    console.error('Error clearing settings:', error);
    throw error;
  }
}

/**
 * Save audio settings before entering mosque mode
 */
export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  try {
    await Preferences.set({
      key: AUDIO_SETTINGS_KEY,
      value: JSON.stringify(settings)
    });
  } catch (error) {
    console.error('Error saving audio settings:', error);
    throw error;
  }
}

/**
 * Load saved audio settings
 */
export async function loadAudioSettings(): Promise<AudioSettings | null> {
  try {
    const { value } = await Preferences.get({ key: AUDIO_SETTINGS_KEY });
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading audio settings:', error);
    return null;
  }
}

/**
 * Clear saved audio settings
 */
export async function clearAudioSettings(): Promise<void> {
  try {
    await Preferences.remove({ key: AUDIO_SETTINGS_KEY });
  } catch (error) {
    console.error('Error clearing audio settings:', error);
    throw error;
  }
}
