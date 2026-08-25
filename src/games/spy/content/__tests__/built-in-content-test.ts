import { spyEn } from "@/games/spy/localization/en";
import { spyRu } from "@/games/spy/localization/ru";
import { SPY_PACK_ILLUSTRATIONS, SPY_WORD_IMAGES } from "../assets";
import { SPY_CONTENT_CATEGORIES } from "../categories";
import { createSpyContentRegistry } from "../registry";
import { BUILT_IN_SPY_PACK_SOURCES } from "../sources";
import { validateSpyContentAssets } from "../validation";

describe("built-in Spy content", () => {
  const registry = createSpyContentRegistry({
    categories: SPY_CONTENT_CATEGORIES,
    packs: BUILT_IN_SPY_PACK_SOURCES,
  });

  test("combines all playable location packs", () => {
    expect(
      registry.getWordIds("locations", [
        "nature",
        "entertainment",
        "cities",
      ]),
    ).toHaveLength(62);
  });

  test("registers an illustration for every playable location", () => {
    expect(() =>
      validateSpyContentAssets({
        categories: SPY_CONTENT_CATEGORIES,
        packs: BUILT_IN_SPY_PACK_SOURCES,
        packIllustrationKeys: new Set(
          Object.keys(SPY_PACK_ILLUSTRATIONS),
        ),
        wordImageKeys: new Set(Object.keys(SPY_WORD_IMAGES)),
      }),
    ).not.toThrow();
  });

  test("uses the board-game-club illustration for Anticafe", () => {
    expect(
      registry.getWord("locations", "entertainment-anticafe"),
    ).toMatchObject({
      name: "Антикафе",
      imageKey: "entertainment-anticafe",
    });
  });

  test("lists playable location packs before unfinished packs", () => {
    expect(
      registry
        .getPacksByCategory("locations")
        .map(({ id, enabled, wordIds }) => ({
          id,
          enabled,
          wordCount: wordIds.length,
        })),
    ).toEqual([
      { id: "nature", enabled: true, wordCount: 20 },
      { id: "entertainment", enabled: true, wordCount: 20 },
      { id: "cities", enabled: true, wordCount: 22 },
      { id: "workplaces", enabled: false, wordCount: 0 },
      { id: "transport", enabled: false, wordCount: 0 },
    ]);
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
