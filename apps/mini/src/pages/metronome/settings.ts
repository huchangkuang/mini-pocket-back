import { getStorageSync, setStorageSync } from "@tarojs/taro";

export const METRONOME_SETTINGS_KEY = "metronome_settings";

export interface MetronomeSettings {
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

const DEFAULT_SETTINGS: MetronomeSettings = {
  soundEnabled: true,
  vibrateEnabled: false,
};

export function loadMetronomeSettings(): MetronomeSettings {
  try {
    const stored = getStorageSync(METRONOME_SETTINGS_KEY) as
      | MetronomeSettings
      | undefined;
    if (stored && typeof stored.soundEnabled === "boolean") {
      return {
        soundEnabled: stored.soundEnabled,
        vibrateEnabled: Boolean(stored.vibrateEnabled),
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveMetronomeSettings(settings: MetronomeSettings): void {
  setStorageSync(METRONOME_SETTINGS_KEY, settings);
}
