import type { GameHistoryEntry } from "@/history/types";
import type { Player } from "@/players/types";
import type {
  AppStatistics,
  PlayerStatistics,
} from "@/statistics/types";

export function calculateStatistics(
  players: readonly Player[],
  history: readonly GameHistoryEntry[],
): AppStatistics {
  const gamesByPlayerId = new Map<string, GameHistoryEntry[]>();
  const gameCounts = new Map<GameHistoryEntry["gameId"], number>();
  const uniquePlayerIds = new Set<string>();

  history.forEach((game) => {
    gameCounts.set(game.gameId, (gameCounts.get(game.gameId) ?? 0) + 1);

    game.playerIds.forEach((playerId) => {
      uniquePlayerIds.add(playerId);

      const playerGames = gamesByPlayerId.get(playerId);

      if (playerGames) {
        playerGames.push(game);
      } else {
        gamesByPlayerId.set(playerId, [game]);
      }
    });
  });

  const playerStatistics: PlayerStatistics[] = players
    .flatMap((player) => {
      const playerGames = gamesByPlayerId.get(player.id);

      if (!playerGames?.length) {
        return [];
      }

      const wins = playerGames.filter((game) =>
        game.winnerIds.includes(player.id),
      ).length;
      const spyGames = playerGames.filter((game) =>
        game.spyIds.includes(player.id),
      );

      return [
        {
          player,
          gamesPlayed: playerGames.length,
          wins,
          winRate: Math.round((wins / playerGames.length) * 100),
          spyGames: spyGames.length,
          spyWins: spyGames.filter((game) =>
            game.winnerIds.includes(player.id),
          ).length,
          rank: null,
        },
      ];
    })
    .sort(
      (left, right) =>
        right.wins - left.wins ||
        right.winRate - left.winRate ||
        left.player.name.localeCompare(right.player.name),
    )
    .map((statistics, index) => ({
      ...statistics,
      rank: index < 3 ? index + 1 : null,
    }));

  let mostPopularGameId: GameHistoryEntry["gameId"] | null = null;
  let mostPopularGameCount = 0;

  gameCounts.forEach((count, gameId) => {
    if (count > mostPopularGameCount) {
      mostPopularGameId = gameId;
      mostPopularGameCount = count;
    }
  });

  return {
    overview: {
      totalGames: history.length,
      uniquePlayerCount: uniquePlayerIds.size,
      mostPopularGameId,
    },
    players: playerStatistics,
  };
}
