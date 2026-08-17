import type { GameHistoryEntry } from "@/history/types";
import type { Player } from "@/players/types";

export const DEV_STATISTICS_PLAYER: Player = {
  id: "dev-statistics-denis",
  name: "Денис",
  avatar: { type: "preset", id: "man-1" },
  createdAt: "2026-08-01T12:00:00.000Z",
};

type FixtureOptions = {
  gameId: string;
  index: number;
  isSpy?: boolean;
  isWinner?: boolean;
};

function createFixtureGame({
  gameId,
  index,
  isSpy = false,
  isWinner = false,
}: FixtureOptions): GameHistoryEntry {
  const completedAt = new Date(
    Date.parse("2026-08-03T20:43:00.000Z") - index * 60 * 60 * 1000,
  ).toISOString();

  return {
    id: `dev-denis-${gameId}-${index}`,
    gameId: gameId as GameHistoryEntry["gameId"],
    createdAt: completedAt,
    startedAt: completedAt,
    completedAt,
    playerIds: [DEV_STATISTICS_PLAYER.id],
    winnerIds: isWinner ? [DEV_STATISTICS_PLAYER.id] : [],
    spyIds: isSpy ? [DEV_STATISTICS_PLAYER.id] : [],
    categoryId: "locations",
    packIds: ["workplaces"],
    secretWordId: "cinema",
    secretWord: {
      id: "cinema",
      name: "Кинотеатр",
      categoryId: "locations",
    },
    spiesKnowEachOther: false,
    timerEnabled: true,
    timerMinutes: 10,
  };
}

const spyGames = Array.from({ length: 12 }, (_, index) =>
  createFixtureGame({
    gameId: "spy",
    index,
    isSpy: index < 5,
    isWinner: index < 2 || (index >= 5 && index < 10),
  }),
);

const aliasGames = Array.from({ length: 4 }, (_, index) =>
  createFixtureGame({
    gameId: "alias",
    index: 12 + index,
    isWinner: index < 2,
  }),
);

const mafiaGames = Array.from({ length: 3 }, (_, index) =>
  createFixtureGame({
    gameId: "mafia",
    index: 16 + index,
    isWinner: index === 0,
  }),
);

const otherGames = Array.from({ length: 8 }, (_, index) =>
  createFixtureGame({
    gameId: `dev-other-${index + 1}`,
    index: 19 + index,
    isWinner: index < 3,
  }),
);

export const DEV_STATISTICS_HISTORY: readonly GameHistoryEntry[] = [
  ...spyGames,
  ...aliasGames,
  ...mafiaGames,
  ...otherGames,
];
