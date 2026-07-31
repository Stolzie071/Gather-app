import type { CreatePlayerInput, Player } from "@/players/types";

export function createPlayerId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `player_${timestamp}_${randomPart}`;
}

export function normalizePlayerName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function getComparablePlayerName(name: string) {
  return normalizePlayerName(name).toLocaleLowerCase();
}

export function createPlayerProfile(input: CreatePlayerInput): Player {
  const name = normalizePlayerName(input.name);

  if (!name) {
    throw new Error("Player name cannot be empty");
  }

  return {
    id: createPlayerId(),
    name,
    avatar: input.avatar ?? { type: "default" },
    createdAt: new Date().toISOString(),
  };
}
