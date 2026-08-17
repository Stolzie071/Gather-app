export type SpyWordPresentation = "image" | "text";

export type SpyContentCategory = {
  id: string;
  enabled: boolean;
  presentation: SpyWordPresentation;
};

export type SpyContentWord = {
  id: string;
  name: string;
  imageKey?: string;
};

export type SpyContentPack = {
  id: string;
  categoryId: string;
  enabled: boolean;
  illustrationKey?: string;
  wordIds: readonly string[];
};

export type SpyContentPackSource = {
  id: string;
  categoryId: string;
  enabled: boolean;
  illustrationKey?: string;
  words: readonly SpyContentWord[];
};
