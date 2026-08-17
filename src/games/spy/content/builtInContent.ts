import {
  SPY_PACK_ILLUSTRATIONS,
  SPY_WORD_IMAGES,
} from "./assets";
import { SPY_CONTENT_CATEGORIES } from "./categories";
import { createSpyContentRegistry } from "./registry";
import { BUILT_IN_SPY_PACK_SOURCES } from "./sources";
import { validateSpyContentAssets } from "./validation";

validateSpyContentAssets({
  categories: SPY_CONTENT_CATEGORIES,
  packs: BUILT_IN_SPY_PACK_SOURCES,
  packIllustrationKeys: new Set(Object.keys(SPY_PACK_ILLUSTRATIONS)),
  wordImageKeys: new Set(Object.keys(SPY_WORD_IMAGES)),
});

export const builtInSpyContentRegistry = createSpyContentRegistry({
  categories: SPY_CONTENT_CATEGORIES,
  packs: BUILT_IN_SPY_PACK_SOURCES,
});
