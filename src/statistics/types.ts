import type { GameHistoryEntry } from "@/history/types";
import type { Player } from "@/players/types";

export type PlayerStatistics = {
  player: Player;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  spyGames: number;
  spyWins: number;
  rank: number | null;
};

export type StatisticsOverview = {
  totalGames: number;
  uniquePlayerCount: number;
  mostPopularGameId: GameHistoryEntry["gameId"] | null;
};

export type AppStatistics = {
  overview: StatisticsOverview;
  players: readonly PlayerStatistics[];
};
