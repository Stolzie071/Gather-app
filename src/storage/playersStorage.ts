import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Player, PlayerAvatar } from "@/players/types";

const LEGACY_PLAYERS_KEY = "@gather/players";
const PLAYERS_KEY = "@gather/players-v2";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPlayerAvatar(value: unknown): PlayerAvatar | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.type === "default") {
    return { type: "default" };
  }

  if (
    value.type === "photo" &&
    typeof value.fileName === "string" &&
    value.fileName.length > 0
  ) {
    return { type: "photo", fileName: value.fileName };
  }

  return null;
}

function readPlayer(value: unknown): Player | null {
  if (!isRecord(value)) {
    return null;
  }

  const avatar = readPlayerAvatar(value.avatar);

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.name !== "string" ||
    value.name.trim().length === 0 ||
    typeof value.createdAt !== "string" ||
    !avatar
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    avatar,
    createdAt: value.createdAt,
  };
}

export async function loadPlayers(): Promise<Player[]> {
  await AsyncStorage.removeItem(LEGACY_PLAYERS_KEY);

  const storedValue = await AsyncStorage.getItem(PLAYERS_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  const players: Player[] = [];
  const usedIds = new Set<string>();

  parsedValue.forEach((value) => {
    const player = readPlayer(value);

    if (player && !usedIds.has(player.id)) {
      players.push(player);
      usedIds.add(player.id);
    }
  });

  return players;
}

export async function savePlayers(players: readonly Player[]) {
  await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}
