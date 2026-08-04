export type GameRouteName = "SpyGame" | "AliasGame" | "MafiaGame";

export type RootStackParamList = {
  Home: undefined;
  Statistics: undefined;
  PlayerStatistics: { playerId: string };
  GameList: undefined;
  SpyGame: undefined;
  SpySetup: undefined;
  SpyReveal: undefined;
  SpyTimer: undefined;
  SpyResults: undefined;
  AliasGame: undefined;
  MafiaGame: undefined;
};
