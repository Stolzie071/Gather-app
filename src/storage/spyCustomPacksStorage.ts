import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  CustomSpyPack,
  CustomSpyWord,
} from "@/games/spy/customPacks/types";

const CUSTOM_SPY_PACKS_KEY = "@gather/spy-custom-packs-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readWord(value: unknown): CustomSpyWord | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.name !== "string" ||
    !value.name.trim()
  ) {
    return null;
  }

  return { id: value.id, name: value.name.trim() };
}

function readPack(value: unknown): CustomSpyPack | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !Array.isArray(value.words)
  ) {
    return null;
  }

  const words = value.words
    .map(readWord)
    .filter((word): word is CustomSpyWord => word !== null);

  if (words.length === 0) {
    return null;
  }

  const uniqueWords = words.filter(
    (word, index) => words.findIndex(({ id }) => id === word.id) === index,
  );

  return {
    id: value.id,
    name: value.name.trim(),
    words: uniqueWords,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseStoredCustomSpyPacks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const packs = value
    .map(readPack)
    .filter((pack): pack is CustomSpyPack => pack !== null);

  return packs.filter(
    (pack, index) => packs.findIndex(({ id }) => id === pack.id) === index,
  );
}

export async function loadCustomSpyPacks() {
  const storedValue = await AsyncStorage.getItem(CUSTOM_SPY_PACKS_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  return parseStoredCustomSpyPacks(parsedValue);
}

export async function saveCustomSpyPacks(
  packs: readonly CustomSpyPack[],
) {
  await AsyncStorage.setItem(CUSTOM_SPY_PACKS_KEY, JSON.stringify(packs));
}
