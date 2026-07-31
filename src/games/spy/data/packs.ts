import {
  CitiesPackIllustration,
  NaturePackIllustration,
  TransportPackIllustration,
  WorkplacesPackIllustration,
} from "@assets/Spy_game/Packs_page";

export const SPY_LOCATION_PACKS = [
  {
    id: "nature",
    Illustration: NaturePackIllustration,
    wordCount: 2,
  },
  {
    id: "workplaces",
    Illustration: WorkplacesPackIllustration,
    wordCount: 42,
  },
  {
    id: "transport",
    Illustration: TransportPackIllustration,
    wordCount: 52,
  },
  {
    id: "cities",
    Illustration: CitiesPackIllustration,
    wordCount: 23,
  },
] as const;

export type SpyLocationPackId = (typeof SPY_LOCATION_PACKS)[number]["id"];
