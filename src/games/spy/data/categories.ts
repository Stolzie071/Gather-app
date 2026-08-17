import {
  AnimalsCategoryIcon,
  CharactersCategoryIcon,
  LocationsCategoryIcon,
  MySetsCategoryIcon,
  OtherCategoryIcon,
} from "@assets/Spy_game/icons";
import { SPY_CONTENT_CATEGORIES } from "@/games/spy/content/categories";

const CATEGORY_VISUALS = {
  locations: {
    Icon: LocationsCategoryIcon,
    width: 32,
    height: 42,
  },
  characters: {
    Icon: CharactersCategoryIcon,
    width: 48,
    height: 42,
  },
  animals: {
    Icon: AnimalsCategoryIcon,
    width: 42,
    height: 44,
  },
  other: {
    Icon: OtherCategoryIcon,
    width: 37,
    height: 47,
  },
  mySets: {
    Icon: MySetsCategoryIcon,
    width: 42,
    height: 44,
  },
} as const;

const categoryViewModels = SPY_CONTENT_CATEGORIES.map((category) => ({
  ...category,
  ...CATEGORY_VISUALS[category.id],
}));

export const SPY_CATEGORIES = [
  ...categoryViewModels.filter(({ enabled }) => enabled),
  ...categoryViewModels.filter(({ enabled }) => !enabled),
];

export type SpyCategoryId = (typeof SPY_CONTENT_CATEGORIES)[number]["id"];
