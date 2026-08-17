export type SpyHistorySecretWord = {
  id: string;
  name: string;
  categoryId: string;
};

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
  secretWord: SpyHistorySecretWord | null;
  spiesKnowEachOther: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
};

export type GameHistoryEntry = SpyGameHistoryEntry;
