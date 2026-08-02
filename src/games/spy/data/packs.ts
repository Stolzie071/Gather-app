import {
  CitiesPackIllustration,
  NaturePackIllustration,
  TransportPackIllustration,
  WorkplacesPackIllustration,
} from "@assets/Spy_game/Packs_page";
import { SPY_LOCATIONS, type SpyLocationId } from "./locations";
import type { SpyPack } from "@/games/spy/types";

type SpyLocationPack = SpyPack<SpyLocationId> & {
  Illustration: typeof NaturePackIllustration;
};

export const SPY_LOCATION_PACKS = [
  {
    id: "workplaces",
    Illustration: WorkplacesPackIllustration,
    wordIds: SPY_LOCATIONS.map(({ id }) => id),
    enabled: true,
  },
  {
    id: "nature",
    Illustration: NaturePackIllustration,
    wordIds: [],
    enabled: false,
  },
  {
    id: "transport",
    Illustration: TransportPackIllustration,
    wordIds: [],
    enabled: false,
  },
  {
    id: "cities",
    Illustration: CitiesPackIllustration,
    wordIds: [],
    enabled: false,
  },
] as const satisfies readonly SpyLocationPack[];

export type SpyLocationPackId = (typeof SPY_LOCATION_PACKS)[number]["id"];

export function getSpyLocationWordIds(
  selectedPackIds: readonly SpyLocationPackId[],
) {
  const selectedPackIdSet = new Set(selectedPackIds);

  return [
    ...new Set(
      SPY_LOCATION_PACKS.filter(({ id }) => selectedPackIdSet.has(id)).flatMap(
        ({ wordIds }) => wordIds,
      ),
    ),
  ];
}
