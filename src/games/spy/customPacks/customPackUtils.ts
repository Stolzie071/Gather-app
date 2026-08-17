import type {
  CustomSpyPack,
  CustomSpyPackInput,
  CustomSpyWord,
} from "./types";
import type { SpyContentPackSource } from "@/games/spy/content/types";

function createId(prefix: string) {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `${prefix}_${timestamp}_${randomPart}`;
}

export function normalizeCustomSpyText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createWords(wordNames: readonly string[]): CustomSpyWord[] {
  const usedNames = new Set<string>();

  return wordNames.reduce<CustomSpyWord[]>((words, wordName) => {
    const name = normalizeCustomSpyText(wordName);
    const normalizedName = name.toLocaleLowerCase("ru-RU");

    if (!name || usedNames.has(normalizedName)) {
      return words;
    }

    usedNames.add(normalizedName);
    words.push({ id: createId("custom_word"), name });
    return words;
  }, []);
}

export function createCustomSpyPack(
  input: CustomSpyPackInput,
): CustomSpyPack {
  const name = normalizeCustomSpyText(input.name);
  const words = createWords(input.words);

  if (!name) {
    throw new Error("Custom Spy pack name cannot be empty");
  }

  if (words.length === 0) {
    throw new Error("Custom Spy pack must contain at least one word");
  }

  const now = new Date().toISOString();

  return {
    id: createId("custom_pack"),
    name,
    words,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCustomSpyPack(
  currentPack: CustomSpyPack,
  input: CustomSpyPackInput,
): CustomSpyPack {
  const name = normalizeCustomSpyText(input.name);
  const nextWordNames = input.words
    .map(normalizeCustomSpyText)
    .filter(Boolean);

  if (!name) {
    throw new Error("Custom Spy pack name cannot be empty");
  }

  if (nextWordNames.length === 0) {
    throw new Error("Custom Spy pack must contain at least one word");
  }

  const existingWordsByName = new Map(
    currentPack.words.map((word) => [
      word.name.toLocaleLowerCase("ru-RU"),
      word,
    ]),
  );
  const usedNames = new Set<string>();
  const words = nextWordNames.reduce<CustomSpyWord[]>((result, wordName) => {
    const normalizedName = wordName.toLocaleLowerCase("ru-RU");

    if (usedNames.has(normalizedName)) {
      return result;
    }

    usedNames.add(normalizedName);
    result.push(
      existingWordsByName.get(normalizedName) ?? {
        id: createId("custom_word"),
        name: wordName,
      },
    );
    return result;
  }, []);

  return {
    ...currentPack,
    name,
    words,
    updatedAt: new Date().toISOString(),
  };
}

export function createCustomSpyPackSource(
  pack: CustomSpyPack,
): SpyContentPackSource {
  return {
    id: pack.id,
    categoryId: "mySets",
    enabled: true,
    words: pack.words,
  };
}
