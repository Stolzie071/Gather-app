import type { SpySession } from "@/games/spy/types";
import type { SpyContentRegistry } from "./registry";
import type {
  SpyContentCategory,
  SpyContentPackSource,
} from "./types";

type SpyContentAssetValidationInput = {
  categories: readonly SpyContentCategory[];
  packs: readonly SpyContentPackSource[];
  packIllustrationKeys: ReadonlySet<string>;
  wordImageKeys: ReadonlySet<string>;
};

export function validateSpyContentAssets({
  categories,
  packs,
  packIllustrationKeys,
  wordImageKeys,
}: SpyContentAssetValidationInput) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  packs.forEach((pack) => {
    const category = categoryById.get(pack.categoryId);

    if (!category) {
      throw new Error(
        `Unknown Spy category "${pack.categoryId}" for pack "${pack.id}"`,
      );
    }

    if (pack.enabled && !pack.illustrationKey) {
      throw new Error(
        `Enabled Spy pack "${pack.id}" has no illustration key`,
      );
    }

    if (
      pack.illustrationKey &&
      !packIllustrationKeys.has(pack.illustrationKey)
    ) {
      throw new Error(
        `Unknown Spy pack illustration key "${pack.illustrationKey}" in pack "${pack.id}"`,
      );
    }

    pack.words.forEach((word) => {
      if (category.presentation === "image" && !word.imageKey) {
        throw new Error(
          `Spy word "${word.id}" in image category "${category.id}" has no image key`,
        );
      }

      if (word.imageKey && !wordImageKeys.has(word.imageKey)) {
        throw new Error(
          `Unknown Spy word image key "${word.imageKey}" for word "${word.id}"`,
        );
      }
    });
  });
}

export function getSpySessionContentError(
  session: SpySession,
  registry: SpyContentRegistry,
) {
  try {
    const availableWordIds = registry.getWordIds(
      session.draft.categoryId,
      session.draft.packIds,
    );

    if (!availableWordIds.includes(session.secretWordId)) {
      return `Secret Spy word "${session.secretWordId}" is not available in the saved packs`;
    }

    if (
      !registry.getWord(session.draft.categoryId, session.secretWordId)
    ) {
      return `Unknown secret Spy word: ${session.secretWordId}`;
    }

    return null;
  } catch (error: unknown) {
    return error instanceof Error
      ? error.message
      : "Saved Spy session contains invalid content";
  }
}
