import type { SpyContentCategory } from "./types";

export const SPY_CONTENT_CATEGORIES = [
  {
    id: "locations",
    enabled: true,
    presentation: "image",
  },
  {
    id: "characters",
    enabled: false,
    presentation: "text",
  },
  {
    id: "items",
    enabled: false,
    presentation: "text",
  },
  {
    id: "animals",
    enabled: false,
    presentation: "text",
  },
  {
    id: "professions",
    enabled: false,
    presentation: "text",
  },
  {
    id: "other",
    enabled: false,
    presentation: "text",
  },
  {
    id: "mySets",
    enabled: false,
    presentation: "text",
  },
] as const satisfies readonly SpyContentCategory[];

export type SpyContentCategoryId =
  (typeof SPY_CONTENT_CATEGORIES)[number]["id"];
