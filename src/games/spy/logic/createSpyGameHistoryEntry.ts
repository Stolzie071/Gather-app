import type { SpySession } from "@/games/spy/types";
import type { SpyGameHistoryEntry } from "@/history/types";

export function createSpyGameHistoryEntry(
  session: SpySession,
  secretWordName: string,
  completedAt = new Date(),
): SpyGameHistoryEntry {
  const playerIds = [...new Set(session.revealOrder)];
  const playerIdSet = new Set(playerIds);
  const winnerIds = [...new Set(session.winnerIds)].filter((playerId) =>
    playerIdSet.has(playerId),
  );
  const spyIds = [...new Set(session.spyIds)].filter((playerId) =>
    playerIdSet.has(playerId),
  );

  if (!session.draft.categoryId) {
    throw new Error("Cannot complete a Spy game without a category");
  }

  if (playerIds.length === 0) {
    throw new Error("Cannot complete a Spy game without players");
  }

  if (winnerIds.length === 0) {
    throw new Error("Cannot complete a Spy game without winners");
  }

  if (!secretWordName.trim()) {
    throw new Error("Cannot complete a Spy game without a secret word name");
  }

  return {
    id: session.id,
    gameId: "spy",
    createdAt: session.createdAt,
    startedAt: session.startedAt ?? session.createdAt,
    completedAt: completedAt.toISOString(),
    playerIds,
    winnerIds,
    spyIds,
    categoryId: session.draft.categoryId,
    packIds: [...new Set(session.draft.packIds)],
    secretWordId: session.secretWordId,
    secretWord: {
      id: session.secretWordId,
      name: secretWordName,
      categoryId: session.draft.categoryId,
    },
    spiesKnowEachOther: session.draft.spiesKnowEachOther,
    timerEnabled: session.draft.timerEnabled,
    timerMinutes: session.draft.timerMinutes,
  };
}
