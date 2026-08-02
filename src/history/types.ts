export type SpyGameHistoryEntry = {
  id: string;
  gameId: "spy";
  createdAt: string;
  startedAt: string;
  completedAt: string;
  playerIds: readonly string[];
  winnerIds: readonly string[];
  spyIds: readonly string[];
  categoryId: string;
  packIds: readonly string[];
  secretWordId: string;
  spiesKnowEachOther: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
};

export type GameHistoryEntry = SpyGameHistoryEntry;
