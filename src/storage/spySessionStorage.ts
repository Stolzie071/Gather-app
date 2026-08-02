import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  SpyDraft,
  SpySession,
  SpySessionPhase,
} from "@/games/spy/types";

const ACTIVE_SPY_SESSION_KEY = "@gather/active-spy-session-v1";

let persistenceQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : null;
}

function readNullableDate(value: unknown) {
  return value === null ? null : readDate(value);
}

function readUniqueStrings(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const strings = value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );

  return strings.length === value.length && new Set(strings).size === strings.length
    ? strings
    : null;
}

function readDraft(value: unknown): SpyDraft | null {
  if (!isRecord(value)) {
    return null;
  }

  const packIds = readUniqueStrings(value.packIds);
  const playerIds = readUniqueStrings(value.playerIds);

  if (
    typeof value.categoryId !== "string" ||
    value.categoryId.length === 0 ||
    !packIds ||
    packIds.length === 0 ||
    !playerIds ||
    playerIds.length < 3 ||
    playerIds.length > 12 ||
    typeof value.spyCount !== "number" ||
    !Number.isInteger(value.spyCount) ||
    value.spyCount < 1 ||
    value.spyCount >= playerIds.length ||
    typeof value.spiesKnowEachOther !== "boolean" ||
    typeof value.timerEnabled !== "boolean" ||
    typeof value.timerMinutes !== "number" ||
    !Number.isInteger(value.timerMinutes) ||
    value.timerMinutes < 1 ||
    value.timerMinutes > 60
  ) {
    return null;
  }

  return {
    categoryId: value.categoryId,
    packIds,
    playerIds,
    spyCount: value.spyCount,
    spiesKnowEachOther: value.spiesKnowEachOther,
    timerEnabled: value.timerEnabled,
    timerMinutes: value.timerMinutes,
  };
}

function readPhase(value: unknown): SpySessionPhase | null {
  return value === "revealing" ||
    value === "playing" ||
    value === "timeExpired" ||
    value === "results"
    ? value
    : null;
}

function readSpySession(value: unknown): SpySession | null {
  if (!isRecord(value) || value.gameId !== "spy") {
    return null;
  }

  const createdAt = readDate(value.createdAt);
  const startedAt = readNullableDate(value.startedAt);
  const endsAt = readNullableDate(value.endsAt);
  const draft = readDraft(value.draft);
  const spyIds = readUniqueStrings(value.spyIds);
  const revealOrder = readUniqueStrings(value.revealOrder);
  const winnerIds = readUniqueStrings(value.winnerIds);
  const phase = readPhase(value.phase);

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    !createdAt ||
    value.startedAt !== null && !startedAt ||
    value.endsAt !== null && !endsAt ||
    !draft ||
    typeof value.secretWordId !== "string" ||
    value.secretWordId.length === 0 ||
    !spyIds ||
    spyIds.length !== draft.spyCount ||
    !revealOrder ||
    revealOrder.length !== draft.playerIds.length ||
    typeof value.revealIndex !== "number" ||
    !Number.isInteger(value.revealIndex) ||
    value.revealIndex < 0 ||
    value.revealIndex >= revealOrder.length ||
    typeof value.currentCardRevealed !== "boolean" ||
    typeof value.allRolesRevealed !== "boolean" ||
    !phase ||
    !winnerIds
  ) {
    return null;
  }

  const playerIdSet = new Set(draft.playerIds);

  if (
    revealOrder.some((playerId) => !playerIdSet.has(playerId)) ||
    spyIds.some((playerId) => !playerIdSet.has(playerId)) ||
    winnerIds.some((playerId) => !playerIdSet.has(playerId))
  ) {
    return null;
  }

  return {
    id: value.id,
    gameId: "spy",
    createdAt,
    startedAt,
    draft,
    secretWordId: value.secretWordId,
    spyIds,
    revealOrder,
    revealIndex: value.revealIndex,
    currentCardRevealed: value.currentCardRevealed,
    allRolesRevealed: value.allRolesRevealed,
    phase,
    endsAt,
    winnerIds,
  };
}

export async function loadActiveSpySession() {
  const storedValue = await AsyncStorage.getItem(ACTIVE_SPY_SESSION_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    const session = readSpySession(parsedValue);

    if (!session) {
      await AsyncStorage.removeItem(ACTIVE_SPY_SESSION_KEY);
    }

    return session;
  } catch {
    await AsyncStorage.removeItem(ACTIVE_SPY_SESSION_KEY);
    return null;
  }
}

export function persistActiveSpySession(session: SpySession | null) {
  const operation = persistenceQueue.then(async () => {
    if (session) {
      await AsyncStorage.setItem(
        ACTIVE_SPY_SESSION_KEY,
        JSON.stringify(session),
      );
    } else {
      await AsyncStorage.removeItem(ACTIVE_SPY_SESSION_KEY);
    }
  });

  persistenceQueue = operation.catch(() => undefined);

  return operation;
}
