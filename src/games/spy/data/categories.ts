import {
  AnimalsCategoryIcon,
  CareerCategoryIcon,
  CharactersCategoryIcon,
  ItemsCategoryIcon,
  LocationsCategoryIcon,
  MySetsCategoryIcon,
  OtherCategoryIcon,
} from "@assets/Spy_game/icons";

export const SPY_CATEGORIES = [
  { id: "locations", Icon: LocationsCategoryIcon, width: 32, height: 42 },
  { id: "characters", Icon: CharactersCategoryIcon, width: 48, height: 42 },
  { id: "items", Icon: ItemsCategoryIcon, width: 47, height: 43 },
  { id: "animals", Icon: AnimalsCategoryIcon, width: 42, height: 44 },
  { id: "professions", Icon: CareerCategoryIcon, width: 42, height: 46 },
  { id: "other", Icon: OtherCategoryIcon, width: 37, height: 47 },
  { id: "mySets", Icon: MySetsCategoryIcon, width: 42, height: 44 },
] as const;

export type SpyCategoryId = (typeof SPY_CATEGORIES)[number]["id"];
