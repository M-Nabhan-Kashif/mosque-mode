import { registerPlugin } from '@capacitor/core';

export interface AudioControlPlugin {
  /**
   * Get current volume level (0-100)
   */
  getVolume(): Promise<{ volume: number }>;

  /**
   * Set volume level (0-100)
   */
  setVolume(options: { volume: number }): Promise<void>;

  /**
   * Get current vibrate mode status
   */
  getVibrateMode(): Promise<{ enabled: boolean }>;

  /**
   * Set vibrate mode
   */
  setVibrateMode(options: { enabled: boolean }): Promise<void>;

  /**
   * Get Do Not Disturb status
   */
  getDNDStatus(): Promise<{ enabled: boolean }>;

  /**
   * Get current ringer mode
   * Returns: 'silent' | 'vibrate' | 'normal'
   */
  getRingerMode(): Promise<{ mode: 'silent' | 'vibrate' | 'normal' }>;

  /**
   * Set ringer mode
   */
  setRingerMode(options: { mode: 'silent' | 'vibrate' | 'normal' }): Promise<void>;

  /**
   * Save current audio settings
   */
  saveAudioSettings(): Promise<{ 
    volume: number;
    ringerMode: 'silent' | 'vibrate' | 'normal';
  }>;

  /**
   * Restore previously saved audio settings
   */
  restoreAudioSettings(options: { 
    volume: number;
    ringerMode: 'silent' | 'vibrate' | 'normal';
  }): Promise<void>;

  /**
   * Apply mosque mode (save current settings and silence)
   */
  applyMosqueMode(): Promise<{ 
    previousVolume: number;
    previousRingerMode: 'silent' | 'vibrate' | 'normal';
  }>;

  /**
   * Restore from mosque mode
   */
  restoreFromMosqueMode(options: { 
    volume: number;
    ringerMode: 'silent' | 'vibrate' | 'normal';
  }): Promise<void>;
}

const AudioControl = registerPlugin<AudioControlPlugin>('AudioControl', {
  web: () => import('./AudioControlWeb').then(m => new m.AudioControlWeb()),
});

export default AudioControl;
