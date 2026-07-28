import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Language } from "@/localization/i18n";

const SETTINGS_KEY = "@gather/settings";

export type AppSettings = {
  language: Language;
  darkThemeEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  hapticsEnabled: boolean;
  keepAwakeEnabled: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readVolume(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

export async function loadSettings(
  defaultSettings: AppSettings,
): Promise<AppSettings> {
  const storedValue = await AsyncStorage.getItem(SETTINGS_KEY);

  if (!storedValue) {
    return defaultSettings;
  }

  const parsedValue: unknown = JSON.parse(storedValue);

  if (!isRecord(parsedValue)) {
    return defaultSettings;
  }

  return {
    language:
      parsedValue.language === "ru" || parsedValue.language === "en"
        ? parsedValue.language
        : defaultSettings.language,
    darkThemeEnabled: readBoolean(
      parsedValue.darkThemeEnabled,
      defaultSettings.darkThemeEnabled,
    ),
    soundVolume: readVolume(
      parsedValue.soundVolume,
      defaultSettings.soundVolume,
    ),
    musicVolume: readVolume(
      parsedValue.musicVolume,
      defaultSettings.musicVolume,
    ),
    hapticsEnabled: readBoolean(
      parsedValue.hapticsEnabled,
      defaultSettings.hapticsEnabled,
    ),
    keepAwakeEnabled: readBoolean(
      parsedValue.keepAwakeEnabled,
      defaultSettings.keepAwakeEnabled,
    ),
  };
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
