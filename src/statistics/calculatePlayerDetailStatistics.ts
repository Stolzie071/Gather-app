import type { GameHistoryEntry } from "@/history/types";
import type { Player } from "@/players/types";

export type PlayerGameDistributionItem = {
  id: string;
  count: number;
  isOther: boolean;
};

export type PlayerDetailStatistics = {
  player: Player;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  lastGame: GameHistoryEntry | null;
  distribution: readonly PlayerGameDistributionItem[];
  spy: {
    gamesPlayed: number;
    gamesAsSpy: number;
    winsAsSpy: number;
    winsAsCivilian: number;
  };
};

export function calculatePlayerDetailStatistics(
  player: Player,
  history: readonly GameHistoryEntry[],
): PlayerDetailStatistics {
  const playerGames = history
    .filter((game) => game.playerIds.includes(player.id))
    .slice()
    .sort(
      (first, second) =>
        Date.parse(second.completedAt) - Date.parse(first.completedAt),
    );
  const wins = playerGames.filter((game) =>
    game.winnerIds.includes(player.id),
  ).length;
  const gameCounts = new Map<string, number>();

  playerGames.forEach((game) => {
    const gameId = String(game.gameId);
    gameCounts.set(gameId, (gameCounts.get(gameId) ?? 0) + 1);
  });

  const sortedGameCounts = [...gameCounts.entries()].sort(
    ([leftId, leftCount], [rightId, rightCount]) =>
      rightCount - leftCount || leftId.localeCompare(rightId),
  );
  const topGameCounts = sortedGameCounts.slice(0, 3);
  const otherGamesCount = sortedGameCounts
    .slice(3)
    .reduce((total, [, count]) => total + count, 0);

  const spyGames = playerGames.filter((game) => game.gameId === "spy");
  const gamesAsSpy = spyGames.filter((game) =>
    game.spyIds.includes(player.id),
  );

  return {
    player,
    gamesPlayed: playerGames.length,
    wins,
    winRate:
      playerGames.length > 0
        ? Math.round((wins / playerGames.length) * 100)
        : 0,
    lastGame: playerGames[0] ?? null,
    distribution: [
      ...topGameCounts.map(([id, count]) => ({
        id,
        count,
        isOther: false,
      })),
      { id: "other", count: otherGamesCount, isOther: true },
    ],
    spy: {
      gamesPlayed: spyGames.length,
      gamesAsSpy: gamesAsSpy.length,
      winsAsSpy: gamesAsSpy.filter((game) =>
        game.winnerIds.includes(player.id),
      ).length,
      winsAsCivilian: spyGames.filter(
        (game) =>
          !game.spyIds.includes(player.id) &&
          game.winnerIds.includes(player.id),
      ).length,
    },
  };
}
