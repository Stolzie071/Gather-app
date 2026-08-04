import type { ImageSourcePropType } from "react-native";

import { getSpyWordImage } from "@/games/spy/content/assets";
import { builtInSpyContentRegistry } from "@/games/spy/content/builtInContent";
import type { SpyWord } from "@/games/spy/types";

const SPY_LOCATION_IDS = [
  "cinema",
  "airport",
  "bank",
  "hospital",
  "hotel",
  "museum",
  "restaurant",
  "school",
  "supermarket",
  "train-station",
] as const;

export type SpyLocationId = (typeof SPY_LOCATION_IDS)[number];

type SpyLocationWord = Omit<SpyWord, "image"> & {
  image: ImageSourcePropType;
};

function getRequiredLocation(
  locationId: SpyLocationId,
): SpyLocationWord {
  const word = builtInSpyContentRegistry.getWord("locations", locationId);

  if (!word) {
    throw new Error(`Missing built-in Spy location "${locationId}"`);
  }

  const image = getSpyWordImage(word.imageKey);

  if (!image) {
    throw new Error(`Missing image for built-in Spy location "${locationId}"`);
  }

  return {
    id: word.id,
    name: word.name,
    image,
  };
}

export const SPY_LOCATIONS = SPY_LOCATION_IDS.map(getRequiredLocation);

export function getSpyLocationById(locationId: string) {
  return SPY_LOCATIONS.find(({ id }) => id === locationId);
}
