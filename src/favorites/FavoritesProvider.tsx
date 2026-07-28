import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadFavoriteGameIds,
  saveFavoriteGameIds,
} from "@/storage/favoritesStorage";

type FavoritesContextValue = {
  favoriteGameIds: ReadonlySet<string>;
  isFavorite: (gameId: string) => boolean;
  toggleFavorite: (gameId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favoriteGameIds, setFavoriteGameIds] = useState(
    () => new Set<string>(),
  );
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadFavoriteGameIds()
      .then((storedGameIds) => {
        if (isMounted) {
          setFavoriteGameIds(new Set(storedGameIds));
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to load favorite games", error);
      })
      .finally(() => {
        if (isMounted) {
          setStorageLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    saveFavoriteGameIds(favoriteGameIds).catch((error: unknown) => {
      console.warn("Failed to save favorite games", error);
    });
  }, [favoriteGameIds, storageLoaded]);

  const isFavorite = useCallback(
    (gameId: string) => favoriteGameIds.has(gameId),
    [favoriteGameIds],
  );

  const toggleFavorite = useCallback((gameId: string) => {
    setFavoriteGameIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(gameId)) {
        nextIds.delete(gameId);
      } else {
        nextIds.add(gameId);
      }

      return nextIds;
    });
  }, []);

  const value = useMemo(
    () => ({
      favoriteGameIds,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteGameIds, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
