import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { SpyDice } from "@assets/GamesSections";
import { SpyGameCardDice } from "@assets/Spy_game";
import type { GameRouteName } from "@/navigation/types";

export type Game = {
  id: string;
  route: GameRouteName;
  titleKey: string;
  playersKey: string;
  durationKey: string;
  searchTerms: string[];
  Illustration: ComponentType<SvgProps>;
};

export const games: Game[] = [
  {
    id: "spy",
    route: "SpyGame",
    titleKey: "gameList.games.spy.title",
    playersKey: "gameList.games.spy.players",
    durationKey: "gameList.games.spy.duration",
    searchTerms: ["шпион", "spy"],
    Illustration: SpyGameCardDice,
  },
  {
    id: "alias",
    route: "AliasGame",
    titleKey: "gameList.games.alias.title",
    playersKey: "gameList.games.alias.players",
    durationKey: "gameList.games.alias.duration",
    searchTerms: ["alias", "алиас", "элиас"],
    Illustration: SpyDice,
  },
  {
    id: "mafia",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
  {
    id: "mafia2",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
  {
    id: "mafia3",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
  {
    id: "mafia4",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
  {
    id: "mafia5",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
  {
    id: "mafia6",
    route: "MafiaGame",
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
];
