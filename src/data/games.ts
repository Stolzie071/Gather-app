import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { SpyDice } from "@assets/GamesSections";
import { SpyGameCardDice } from "@assets/Spy_game";
import type { GameRouteName } from "@/navigation/types";

export type Game = {
  id: string;
  route: GameRouteName;
  available: boolean;
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
    available: true,
    titleKey: "gameList.games.spy.title",
    playersKey: "gameList.games.spy.players",
    durationKey: "gameList.games.spy.duration",
    searchTerms: ["шпион", "spy"],
    Illustration: SpyGameCardDice,
  },
  {
    id: "alias",
    route: "AliasGame",
    available: false,
    titleKey: "gameList.games.alias.title",
    playersKey: "gameList.games.alias.players",
    durationKey: "gameList.games.alias.duration",
    searchTerms: ["alias", "алиас", "элиас"],
    Illustration: SpyDice,
  },
  {
    id: "mafia",
    route: "MafiaGame",
    available: false,
    titleKey: "gameList.games.mafia.title",
    playersKey: "gameList.games.mafia.players",
    durationKey: "gameList.games.mafia.duration",
    searchTerms: ["мафия", "mafia"],
    Illustration: SpyDice,
  },
];
