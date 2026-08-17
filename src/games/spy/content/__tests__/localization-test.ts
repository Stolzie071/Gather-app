import { I18n, useMakePlural as createPluralizer } from "i18n-js";
import { ru as russianPluralizer } from "make-plural/plurals";

import { spyEn } from "@/games/spy/localization/en";
import { spyRu } from "@/games/spy/localization/ru";
import { SPY_CONTENT_CATEGORIES } from "../categories";

describe("Spy localization", () => {
  test.each(SPY_CONTENT_CATEGORIES.map(({ id }) => id))(
    "contains setup and reveal copy for the %s category in both languages",
    (categoryId) => {
      expect(spyRu.spySetup.category[categoryId]).toBeDefined();
      expect(spyEn.spySetup.category[categoryId]).toBeDefined();
      expect(spyRu.spyReveal.categories[categoryId]).toBeDefined();
      expect(spyEn.spyReveal.categories[categoryId]).toBeDefined();
    },
  );

  test("uses Russian plural rules for word counts", () => {
    const i18n = new I18n({ ru: spyRu });
    i18n.locale = "ru";
    i18n.pluralization.register(
      "ru",
      createPluralizer({ pluralizer: russianPluralizer }),
    );

    expect(
      i18n.t("spySetup.category.characters.wordCount", { count: 1 }),
    ).toBe("1 персонаж");
    expect(
      i18n.t("spySetup.category.characters.wordCount", { count: 2 }),
    ).toBe("2 персонажа");
    expect(
      i18n.t("spySetup.category.characters.wordCount", { count: 5 }),
    ).toBe("5 персонажей");
    expect(
      i18n.t("spySetup.category.characters.wordCount", { count: 22 }),
    ).toBe("22 персонажа");
  });
});
