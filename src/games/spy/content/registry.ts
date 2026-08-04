import type {
  SpyContentCategory,
  SpyContentPack,
  SpyContentPackSource,
  SpyContentWord,
} from "./types";

type SpyContentRegistryInput = {
  categories: readonly SpyContentCategory[];
  packs: readonly SpyContentPackSource[];
};

export type SpyContentRegistry = {
  getCategories: () => readonly SpyContentCategory[];
  getCategory: (categoryId: string) => SpyContentCategory | undefined;
  getPacksByCategory: (categoryId: string) => readonly SpyContentPack[];
  getPack: (
    categoryId: string,
    packId: string,
  ) => SpyContentPack | undefined;
  getWord: (
    categoryId: string,
    wordId: string,
  ) => SpyContentWord | undefined;
  getWordIds: (
    categoryId: string,
    selectedPackIds: readonly string[],
  ) => readonly string[];
};

function createRegistryKey(categoryId: string, itemId: string) {
  return `${categoryId}:${itemId}`;
}

export function createSpyContentRegistry({
  categories,
  packs: packSources,
}: SpyContentRegistryInput): SpyContentRegistry {
  const categoryById = new Map<string, SpyContentCategory>();
  const packByKey = new Map<string, SpyContentPack>();
  const packsByCategory = new Map<string, SpyContentPack[]>();
  const wordByKey = new Map<string, SpyContentWord>();

  categories.forEach((category) => {
    if (categoryById.has(category.id)) {
      throw new Error(`Duplicate Spy category id: ${category.id}`);
    }

    categoryById.set(category.id, category);
  });

  packSources.forEach((source) => {
    const category = categoryById.get(source.categoryId);

    if (!category) {
      throw new Error(
        `Unknown Spy category "${source.categoryId}" for pack "${source.id}"`,
      );
    }

    const packKey = createRegistryKey(source.categoryId, source.id);

    if (packByKey.has(packKey)) {
      throw new Error(
        `Duplicate Spy pack id "${source.id}" in category "${source.categoryId}"`,
      );
    }

    if (source.enabled && source.words.length === 0) {
      throw new Error(`Enabled Spy pack "${source.id}" has no words`);
    }

    const wordIds: string[] = [];

    source.words.forEach((word) => {
      const wordKey = createRegistryKey(source.categoryId, word.id);
      const existingWord = wordByKey.get(wordKey);

      if (existingWord) {
        if (
          existingWord.name !== word.name ||
          existingWord.imageKey !== word.imageKey
        ) {
          throw new Error(
            `Conflicting Spy word id "${word.id}" in category "${source.categoryId}"`,
          );
        }
      } else {
        wordByKey.set(wordKey, word);
      }

      wordIds.push(word.id);
    });

    const pack: SpyContentPack = {
      id: source.id,
      categoryId: source.categoryId,
      enabled: source.enabled,
      illustrationKey: source.illustrationKey,
      wordIds: [...new Set(wordIds)],
    };

    packByKey.set(packKey, pack);

    const categoryPacks = packsByCategory.get(source.categoryId) ?? [];
    categoryPacks.push(pack);
    packsByCategory.set(source.categoryId, categoryPacks);
  });

  return {
    getCategories: () => categories,

    getCategory: (categoryId) => categoryById.get(categoryId),

    getPacksByCategory: (categoryId) =>
      packsByCategory.get(categoryId) ?? [],

    getPack: (categoryId, packId) =>
      packByKey.get(createRegistryKey(categoryId, packId)),

    getWord: (categoryId, wordId) =>
      wordByKey.get(createRegistryKey(categoryId, wordId)),

    getWordIds: (categoryId, selectedPackIds) => {
      const selectedPackIdSet = new Set(selectedPackIds);

      return [
        ...new Set(
          (packsByCategory.get(categoryId) ?? [])
            .filter(
              (pack) =>
                pack.enabled && selectedPackIdSet.has(pack.id),
            )
            .flatMap((pack) => pack.wordIds),
        ),
      ];
    },
  };
}
