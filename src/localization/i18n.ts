import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import { en } from "./translations/en";
import { ru } from "./translations/ru";

export type Language = "ru" | "en";

const ruTranslations = {
  ...ru,
  spySetup: {
    ...ru.spySetup,
    packs: {
      ...ru.spySetup.packs,
      charactersSubtitle: "Из каких наборов будут выбраны персонажи?",
      locationCount: {
        one: "%{count} локация",
        few: "%{count} локации",
        many: "%{count} локаций",
        other: "%{count} локаций",
      },
      characterCount: {
        one: "%{count} персонаж",
        few: "%{count} персонажа",
        many: "%{count} персонажей",
        other: "%{count} персонажей",
      },
      items: {
        ...ru.spySetup.packs.items,
        "dota-2-heroes": "Герои Dota 2",
        "marvel-cinematic-universe": "Персонажи Marvel (КВМ)",
        "dc-screen-characters": "Персонажи DC (DCU)",
      },
    },
  },
};

const enTranslations = {
  ...en,
  spySetup: {
    ...en.spySetup,
    packs: {
      ...en.spySetup.packs,
      charactersSubtitle: "Which packs should the characters come from?",
      locationCount: {
        one: "%{count} location",
        few: "%{count} locations",
        many: "%{count} locations",
        other: "%{count} locations",
      },
      characterCount: {
        one: "%{count} character",
        few: "%{count} characters",
        many: "%{count} characters",
        other: "%{count} characters",
      },
      items: {
        ...en.spySetup.packs.items,
        "dota-2-heroes": "Dota 2 Heroes",
        "marvel-cinematic-universe": "Marvel Characters (MCU)",
        "dc-screen-characters": "DC Characters (DCU)",
      },
    },
  },
};

export const i18n = new I18n({
  ru: ruTranslations,
  en: enTranslations,
});

i18n.defaultLocale = "ru";
i18n.enableFallback = true;

const deviceLanguage = getLocales()[0]?.languageCode;

i18n.locale = deviceLanguage === "en" ? "en" : "ru";
