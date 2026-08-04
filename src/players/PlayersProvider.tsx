import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPlayerProfile } from "@/players/playerUtils";
import type { CreatePlayerInput, Player } from "@/players/types";
import {
  clearStoredPlayerPhotos,
  deleteStoredPlayerPhoto,
} from "@/storage/playerPhotoStorage";
import { loadPlayers, savePlayers } from "@/storage/playersStorage";

type PlayersContextValue = {
  players: readonly Player[];
  isPlayersLoaded: boolean;
  addPlayer: (input: CreatePlayerInput) => Player;
  commitPlayers: (players: readonly Player[]) => void;
  deletePlayer: (playerId: string) => void;
  clearPlayers: () => void;
  clearPlayerPhotos: () => void;
};

const PlayersContext = createContext<PlayersContextValue | null>(null);

export function PlayersProvider({ children }: PropsWithChildren) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoaded, setIsPlayersLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadPlayers()
      .then((storedPlayers) => {
        if (isMounted) {
          setPlayers(storedPlayers);
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to load players", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsPlayersLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlayersLoaded) {
      return;
    }

    savePlayers(players).catch((error: unknown) => {
      console.warn("Failed to save players", error);
    });
  }, [isPlayersLoaded, players]);

  const addPlayer = useCallback((input: CreatePlayerInput) => {
    const player = createPlayerProfile(input);

    setPlayers((currentPlayers) => [...currentPlayers, player]);

    return player;
  }, []);

  const commitPlayers = useCallback((playersToCommit: readonly Player[]) => {
    setPlayers((currentPlayers) => {
      const currentPlayerIds = new Set(
        currentPlayers.map((player) => player.id),
      );
      const newPlayers = playersToCommit.filter(
        (player) => !currentPlayerIds.has(player.id),
      );

      return newPlayers.length > 0
        ? [...currentPlayers, ...newPlayers]
        : currentPlayers;
    });
  }, []);

  const deletePlayer = useCallback(
    (playerId: string) => {
      const playerToDelete = players.find((player) => player.id === playerId);

      if (playerToDelete?.avatar.type === "photo") {
        try {
          deleteStoredPlayerPhoto(playerToDelete.avatar.fileName);
        } catch (error: unknown) {
          console.warn("Failed to delete player photo", error);
        }
      }

      setPlayers((currentPlayers) =>
        currentPlayers.filter((player) => player.id !== playerId),
      );
    },
    [players],
  );

  const clearPlayers = useCallback(() => {
    setPlayers([]);
  }, []);

  const clearPlayerPhotos = useCallback(() => {
    try {
      clearStoredPlayerPhotos();
    } catch (error: unknown) {
      console.warn("Failed to clear player photos", error);
    }

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.avatar.type === "photo"
          ? { ...player, avatar: { type: "default" } }
          : player,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      players,
      isPlayersLoaded,
      addPlayer,
      commitPlayers,
      deletePlayer,
      clearPlayers,
      clearPlayerPhotos,
    }),
    [
      addPlayer,
      clearPlayerPhotos,
      clearPlayers,
      commitPlayers,
      deletePlayer,
      isPlayersLoaded,
      players,
    ],
  );

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const context = useContext(PlayersContext);

  if (!context) {
    throw new Error("usePlayers must be used inside PlayersProvider");
  }

  return context;
}
