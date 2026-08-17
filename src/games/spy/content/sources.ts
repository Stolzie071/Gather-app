import type { SpyContentPackSource } from "./types";
import domesticAnimalsSource from "./ru/animals/domestic-animals.json";
import seaAnimalsSource from "./ru/animals/sea-animals.json";
import wildAnimalsSource from "./ru/animals/wild-animals.json";
import dcScreenCharactersSource from "./ru/characters/dc-screen-characters.json";
import dota2HeroesSource from "./ru/characters/dota-2-heroes.json";
import marvelCinematicUniverseSource from "./ru/characters/marvel-cinematic-universe.json";
import workplacesSource from "./ru/locations/workplaces.json";
import professionsSource from "./ru/other/professions.json";
import schoolItemsSource from "./ru/other/school-items.json";

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

export const BUILT_IN_SPY_PACK_SOURCES = [
  workplacesSource,
  ...PLACEHOLDER_LOCATION_PACKS,
  dota2HeroesSource,
  marvelCinematicUniverseSource,
  dcScreenCharactersSource,
  domesticAnimalsSource,
  wildAnimalsSource,
  seaAnimalsSource,
  schoolItemsSource,
  professionsSource,
] as readonly SpyContentPackSource[];
