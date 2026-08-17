import { spyEn } from "@/games/spy/localization/en";
import { spyRu } from "@/games/spy/localization/ru";
import { SPY_CONTENT_CATEGORIES } from "../categories";
import { createSpyContentRegistry } from "../registry";
import { BUILT_IN_SPY_PACK_SOURCES } from "../sources";

describe("built-in Spy content", () => {
  const registry = createSpyContentRegistry({
    categories: SPY_CONTENT_CATEGORIES,
    packs: BUILT_IN_SPY_PACK_SOURCES,
  });

  test("combines two real character packs", () => {
    expect(
      registry.getWordIds("characters", [
        "dota-2-heroes",
        "marvel-cinematic-universe",
      ]),
    ).toHaveLength(173);
  });

  test("combines all real animal packs", () => {
    expect(
      registry.getWordIds("animals", [
        "domestic-animals",
        "wild-animals",
        "sea-animals",
      ]),
    ).toHaveLength(112);
  });

  test("combines school items and professions in the other category", () => {
    expect(
      registry.getWordIds("other", ["school-items", "professions"]),
    ).toHaveLength(105);
  });

  test("exposes items and professions as packs instead of categories", () => {
    const categoryIds = registry.getCategories().map(({ id }) => id);

    expect(categoryIds).toContain("other");
    expect(categoryIds).not.toContain("items");
    expect(categoryIds).not.toContain("professions");
    expect(
      registry.getPacksByCategory("other").map(({ id }) => id),
    ).toEqual(["school-items", "professions"]);
  });

  test("has Russian and English titles for every built-in pack", () => {
    const ruPackTitles = spyRu.spySetup.packs.items as Record<string, string>;
    const enPackTitles = spyEn.spySetup.packs.items as Record<string, string>;

    BUILT_IN_SPY_PACK_SOURCES.forEach(({ id }) => {
      expect(ruPackTitles[id]).toBeTruthy();
      expect(enPackTitles[id]).toBeTruthy();
    });
  });
});
