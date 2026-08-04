import {
  SPY_PACK_ILLUSTRATIONS,
  SPY_WORD_IMAGES,
} from "./assets";
import { SPY_CONTENT_CATEGORIES } from "./categories";
import { createSpyContentRegistry } from "./registry";
import type { SpyContentPackSource } from "./types";
import dcScreenCharactersSource from "./ru/characters/dc-screen-characters.json";
import dota2HeroesSource from "./ru/characters/dota-2-heroes.json";
import marvelCinematicUniverseSource from "./ru/characters/marvel-cinematic-universe.json";
import workplacesSource from "./ru/locations/workplaces.json";

const PLACEHOLDER_LOCATION_PACKS = [
  {
    id: "nature",
    categoryId: "locations",
    enabled: false,
    illustrationKey: "nature",
    words: [],
  },
  {
    id: "transport",
    categoryId: "locations",
    enabled: false,
    illustrationKey: "transport",
    words: [],
  },
  {
    id: "cities",
    categoryId: "locations",
    enabled: false,
    illustrationKey: "cities",
    words: [],
  },
] as const satisfies readonly SpyContentPackSource[];

const BUILT_IN_PACK_SOURCES = [
  workplacesSource,
  ...PLACEHOLDER_LOCATION_PACKS,
  dota2HeroesSource,
  marvelCinematicUniverseSource,
  dcScreenCharactersSource,
] as readonly SpyContentPackSource[];

function validateBuiltInAssets(
  packSources: readonly SpyContentPackSource[],
) {
  packSources.forEach((pack) => {
    if (
      pack.illustrationKey &&
      !(pack.illustrationKey in SPY_PACK_ILLUSTRATIONS)
    ) {
      throw new Error(
        `Unknown Spy pack illustration key "${pack.illustrationKey}" in pack "${pack.id}"`,
      );
    }

    pack.words.forEach((word) => {
      if (word.imageKey && !(word.imageKey in SPY_WORD_IMAGES)) {
        throw new Error(
          `Unknown Spy word image key "${word.imageKey}" for word "${word.id}"`,
        );
      }
    });
  });
}

validateBuiltInAssets(BUILT_IN_PACK_SOURCES);

export const builtInSpyContentRegistry = createSpyContentRegistry({
  categories: SPY_CONTENT_CATEGORIES,
  packs: BUILT_IN_PACK_SOURCES,
});

export const BUILT_IN_SPY_CONTENT_LOCALE = "ru" as const;
