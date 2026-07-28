import { createContext, useContext, type ReactNode } from "react";

import { i18n, type Language } from "./i18n";
import { useSettings } from "@/settings/SettingsProvider";

type LocalizationContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(
  null,
);

type LocalizationProviderProps = {
  children: ReactNode;
};

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const { settings, updateSetting } = useSettings();
  const language = settings.language;
  i18n.locale = language;

  const setLanguage = (nextLanguage: Language) => {
    i18n.locale = nextLanguage;
    updateSetting("language", nextLanguage);
  };

  const t = (key: string) => {
    return i18n.t(key);
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error("useLocalization must be used inside LocalizationProvider");
  }

  return context;
}
