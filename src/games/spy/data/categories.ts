import {
  AnimalsCategoryIcon,
  CareerCategoryIcon,
  CharactersCategoryIcon,
  ItemsCategoryIcon,
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
  items: {
    Icon: ItemsCategoryIcon,
    width: 47,
    height: 43,
  },
  animals: {
    Icon: AnimalsCategoryIcon,
    width: 42,
    height: 44,
  },
  professions: {
    Icon: CareerCategoryIcon,
    width: 42,
    height: 46,
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

export const SPY_CATEGORIES = SPY_CONTENT_CATEGORIES.map((category) => ({
  ...category,
  ...CATEGORY_VISUALS[category.id],
}));

export type SpyCategoryId = (typeof SPY_CONTENT_CATEGORIES)[number]["id"];
