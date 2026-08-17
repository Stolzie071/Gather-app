export type SpyDraft = {
  categoryId: string;
  packIds: readonly string[];
  playerIds: readonly string[];
  spyCount: number;
  spiesKnowEachOther: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
};

export type SpySessionPhase =
  | "revealing"
  | "playing"
  | "timeExpired"
  | "results";

export type SpySession = {
  id: string;
  gameId: "spy";
  createdAt: string;
  startedAt: string | null;
  draft: SpyDraft;
  secretWordId: string;
  spyIds: readonly string[];
  revealOrder: readonly string[];
  revealIndex: number;
  currentCardRevealed: boolean;
  allRolesRevealed: boolean;
  phase: SpySessionPhase;
  endsAt: string | null;
  winnerIds: readonly string[];
};
