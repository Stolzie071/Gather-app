import { createSpyGameHistoryEntry } from "../createSpyGameHistoryEntry";
import type { SpySession } from "@/games/spy/types";

const session: SpySession = {
  id: "spy-session-1",
  gameId: "spy",
  createdAt: "2026-08-10T12:00:00.000Z",
  startedAt: "2026-08-10T12:01:00.000Z",
  draft: {
    categoryId: "locations",
    packIds: ["workplaces"],
    playerIds: ["player-1", "player-2", "player-3"],
    spyCount: 1,
    spiesKnowEachOther: false,
    timerEnabled: true,
    timerMinutes: 6,
  },
  secretWordId: "cinema",
  spyIds: ["player-3"],
  revealOrder: ["player-2", "player-3", "player-1"],
  revealIndex: 3,
  currentCardRevealed: true,
  allRolesRevealed: true,
  phase: "results",
  endsAt: null,
  winnerIds: ["player-1", "player-2"],
};

describe("createSpyGameHistoryEntry", () => {
  test("stores a stable snapshot of the secret word", () => {
    const entry = createSpyGameHistoryEntry(
      session,
      "Кинотеатр",
      new Date("2026-08-10T12:10:00.000Z"),
    );

    expect(entry.secretWord).toEqual({
      id: "cinema",
      name: "Кинотеатр",
      categoryId: "locations",
    });
    expect(entry.secretWordId).toBe("cinema");
  });
});
