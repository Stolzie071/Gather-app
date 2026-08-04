import {
  CitiesPackIllustration,
  NaturePackIllustration,
  TransportPackIllustration,
  WorkplacesPackIllustration,
} from "@assets/Spy_game/Packs_page";
import { builtInSpyContentRegistry } from "@/games/spy/content/builtInContent";
import type { SpyPack } from "@/games/spy/types";
import type { SpyLocationId } from "./locations";

type SpyLocationPack = SpyPack<SpyLocationId> & {
  Illustration: typeof NaturePackIllustration;
};

const workplacesPack = builtInSpyContentRegistry.getPack(
  "locations",
  "workplaces",
);

if (!workplacesPack) {
  throw new Error('Missing built-in Spy location pack "workplaces"');
}

export const SPY_LOCATION_PACKS = [
  {
    id: "workplaces",
    Illustration: WorkplacesPackIllustration,
    wordIds: workplacesPack.wordIds as readonly SpyLocationId[],
    enabled: workplacesPack.enabled,
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
  return builtInSpyContentRegistry.getWordIds(
    "locations",
    selectedPackIds,
  ) as readonly SpyLocationId[];
}
