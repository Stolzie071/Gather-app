import AsyncStorage from "@react-native-async-storage/async-storage";

import type { GameHistoryEntry, SpyGameHistoryEntry } from "@/history/types";

const GAME_HISTORY_KEY = "@gather/game-history-v1";

let writeQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readUniqueStrings(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const strings = value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );

  return strings.length === value.length ? [...new Set(strings)] : null;
}

function readDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : null;
}

function readSpyGameHistoryEntry(value: unknown): SpyGameHistoryEntry | null {
  if (!isRecord(value) || value.gameId !== "spy") {
    return null;
  }

  const createdAt = readDate(value.createdAt);
  const startedAt = readDate(value.startedAt);
  const completedAt = readDate(value.completedAt);
  const playerIds = readUniqueStrings(value.playerIds);
  const winnerIds = readUniqueStrings(value.winnerIds);
  const spyIds = readUniqueStrings(value.spyIds);
  const packIds = readUniqueStrings(value.packIds);

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    !createdAt ||
    !startedAt ||
    !completedAt ||
    !playerIds ||
    playerIds.length === 0 ||
    !winnerIds ||
    winnerIds.length === 0 ||
    !spyIds ||
    spyIds.length === 0 ||
    typeof value.categoryId !== "string" ||
    value.categoryId.length === 0 ||
    !packIds ||
    packIds.length === 0 ||
    typeof value.secretWordId !== "string" ||
    value.secretWordId.length === 0 ||
    typeof value.spiesKnowEachOther !== "boolean" ||
    typeof value.timerEnabled !== "boolean" ||
    typeof value.timerMinutes !== "number" ||
    !Number.isFinite(value.timerMinutes) ||
    value.timerMinutes < 1
  ) {
    return null;
  }

  const playerIdSet = new Set(playerIds);

  if (
    winnerIds.some((playerId) => !playerIdSet.has(playerId)) ||
    spyIds.some((playerId) => !playerIdSet.has(playerId))
  ) {
    return null;
  }

  return {
    id: value.id,
    gameId: "spy",
    createdAt,
    startedAt,
    completedAt,
    playerIds,
    winnerIds,
    spyIds,
    categoryId: value.categoryId,
    packIds,
    secretWordId: value.secretWordId,
    spiesKnowEachOther: value.spiesKnowEachOther,
    timerEnabled: value.timerEnabled,
    timerMinutes: value.timerMinutes,
  };
}

export async function loadGameHistory(): Promise<GameHistoryEntry[]> {
  const storedValue = await AsyncStorage.getItem(GAME_HISTORY_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  const entries: GameHistoryEntry[] = [];
  const usedIds = new Set<string>();

  parsedValue.forEach((value) => {
    const entry = readSpyGameHistoryEntry(value);

    if (entry && !usedIds.has(entry.id)) {
      entries.push(entry);
      usedIds.add(entry.id);
    }
  });

  return entries;
}

async function saveGameHistory(entries: readonly GameHistoryEntry[]) {
  await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(entries));
}

export function appendGameHistoryEntry(entry: GameHistoryEntry) {
  let wasAdded = false;

  const operation = writeQueue.then(async () => {
    const currentEntries = await loadGameHistory();

    if (currentEntries.some(({ id }) => id === entry.id)) {
      return;
    }

    await saveGameHistory([entry, ...currentEntries]);
    wasAdded = true;
  });

  writeQueue = operation.catch(() => undefined);

  return operation.then(() => wasAdded);
}

export function clearGameHistory() {
  const operation = writeQueue.then(() =>
    AsyncStorage.removeItem(GAME_HISTORY_KEY),
  );

  writeQueue = operation.catch(() => undefined);

  return operation;
}
