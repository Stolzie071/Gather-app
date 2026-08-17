import { getLocales } from "expo-localization";
import { I18n, useMakePlural as createPluralizer } from "i18n-js";
import { ru as russianPluralizer } from "make-plural/plurals";

import { spyEn } from "@/games/spy/localization/en";
import { spyRu } from "@/games/spy/localization/ru";
import { en } from "./translations/en";
import { ru } from "./translations/ru";

export type Language = "ru" | "en";

export const i18n = new I18n({
  ru: { ...ru, ...spyRu },
  en: { ...en, ...spyEn },
});

i18n.pluralization.register(
  "ru",
  createPluralizer({ pluralizer: russianPluralizer }),
);
i18n.defaultLocale = "ru";
i18n.enableFallback = true;

const deviceLanguage = getLocales()[0]?.languageCode;

i18n.locale = deviceLanguage === "en" ? "en" : "ru";
