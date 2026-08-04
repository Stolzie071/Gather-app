import type { ComponentType } from "react";
import type { ImageSourcePropType } from "react-native";
import type { SvgProps } from "react-native-svg";

import {
  SpyAirportLocation,
  SpyBankLocation,
  SpyCinemaLocation,
  SpyHospitalLocation,
  SpyHotelLocation,
  SpyMuseumLocation,
  SpyRestaurantLocation,
  SpySchoolLocation,
  SpySupermarketLocation,
  SpyTrainStationLocation,
} from "@assets/Spy_game";
import {
  CitiesPackIllustration,
  NaturePackIllustration,
  TransportPackIllustration,
  WorkplacesPackIllustration,
} from "@assets/Spy_game/Packs_page";

export const SPY_WORD_IMAGES = {
  cinema: SpyCinemaLocation,
  airport: SpyAirportLocation,
  bank: SpyBankLocation,
  hospital: SpyHospitalLocation,
  hotel: SpyHotelLocation,
  museum: SpyMuseumLocation,
  restaurant: SpyRestaurantLocation,
  school: SpySchoolLocation,
  supermarket: SpySupermarketLocation,
  "train-station": SpyTrainStationLocation,
} as const satisfies Record<string, ImageSourcePropType>;

export const SPY_PACK_ILLUSTRATIONS = {
  workplaces: WorkplacesPackIllustration,
  nature: NaturePackIllustration,
  transport: TransportPackIllustration,
  cities: CitiesPackIllustration,
} as const satisfies Record<string, ComponentType<SvgProps>>;

export type SpyWordImageKey = keyof typeof SPY_WORD_IMAGES;
export type SpyPackIllustrationKey = keyof typeof SPY_PACK_ILLUSTRATIONS;

export function getSpyWordImage(imageKey: string | undefined) {
  if (!imageKey) {
    return undefined;
  }

  return SPY_WORD_IMAGES[imageKey as SpyWordImageKey];
}

export function getSpyPackIllustration(
  illustrationKey: string | undefined,
) {
  if (!illustrationKey) {
    return undefined;
  }

  return SPY_PACK_ILLUSTRATIONS[
    illustrationKey as SpyPackIllustrationKey
  ];
}
