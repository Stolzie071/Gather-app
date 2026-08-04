import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import { en } from "./translations/en";
import { ru } from "./translations/ru";
import {
  enSpyContentTranslations,
  ruSpyContentTranslations,
} from "./translations/spyContent";

export type Language = "ru" | "en";

export const i18n = new I18n({
  ru: {
    ...ru,
    spySetup: {
      ...ru.spySetup,
      packs: {
        ...ru.spySetup.packs,
        ...ruSpyContentTranslations.packs,
        items: {
          ...ru.spySetup.packs.items,
          ...ruSpyContentTranslations.packs.items,
        },
      },
    },
  },
  en: {
    ...en,
    spySetup: {
      ...en.spySetup,
      packs: {
        ...en.spySetup.packs,
        ...enSpyContentTranslations.packs,
        items: {
          ...en.spySetup.packs.items,
          ...enSpyContentTranslations.packs.items,
        },
      },
    },
  },
});

i18n.defaultLocale = "ru";
i18n.enableFallback = true;

const deviceLanguage = getLocales()[0]?.languageCode;

i18n.locale = deviceLanguage === "en" ? "en" : "ru";
