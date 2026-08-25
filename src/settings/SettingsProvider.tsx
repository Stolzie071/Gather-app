import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useKeepAwake } from "expo-keep-awake";

import { i18n } from "@/localization/i18n";
import {
  type AppSettings,
  loadSettings,
  saveSettings,
} from "@/storage/settingsStorage";

const DEFAULT_SETTINGS: AppSettings = {
  language: i18n.locale === "en" ? "en" : "ru",
  darkThemeEnabled: false,
  soundVolume: 0.8,
  musicVolume: 0.8,
  hapticsEnabled: true,
  keepAwakeEnabled: false,
};

type SettingsContextValue = {
  settings: AppSettings;
  updateSetting: <Key extends keyof AppSettings>(
    key: Key,
    value: AppSettings[Key],
  ) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function KeepAwakeController() {
  useKeepAwake("gather-user-setting");

  return null;
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadSettings(DEFAULT_SETTINGS)
      .then((storedSettings) => {
        if (isMounted) {
          setSettings(storedSettings);
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to load settings", error);
      })
      .finally(() => {
        if (isMounted) {
          setStorageLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    saveSettings(settings).catch((error: unknown) => {
      console.warn("Failed to save settings", error);
    });
  }, [settings, storageLoaded]);

  const updateSetting = useCallback(
    <Key extends keyof AppSettings>(
      key: Key,
      value: AppSettings[Key],
    ) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value,
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings, updateSetting],
  );

  return (
    <SettingsContext.Provider value={value}>
      {storageLoaded && settings.keepAwakeEnabled ? (
        <KeepAwakeController />
      ) : null}
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
