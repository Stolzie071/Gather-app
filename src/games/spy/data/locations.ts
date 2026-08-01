import type { ImageSourcePropType } from "react-native";

import { SpyCinemaLocation } from "@assets/Spy_game";

export type SpyLocation = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

export const SPY_LOCATIONS = [
  {
    id: "cinema",
    name: "Кинотеатр",
    image: SpyCinemaLocation,
  },
] as const satisfies readonly SpyLocation[];
