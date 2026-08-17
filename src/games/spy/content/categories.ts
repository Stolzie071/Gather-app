import type { SpyContentCategory } from "./types";

export const SPY_CONTENT_CATEGORIES = [
  {
    id: "locations",
    enabled: true,
    presentation: "image",
  },
  {
    id: "characters",
    enabled: true,
    presentation: "text",
  },
  {
    id: "animals",
    enabled: true,
    presentation: "text",
  },
  {
    id: "other",
    enabled: true,
    presentation: "text",
  },
  {
    id: "mySets",
    enabled: true,
    presentation: "text",
  },
] as const satisfies readonly SpyContentCategory[];

export type SpyContentCategoryId =
  (typeof SPY_CONTENT_CATEGORIES)[number]["id"];
