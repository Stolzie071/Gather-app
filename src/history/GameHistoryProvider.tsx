import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { GameHistoryEntry } from "@/history/types";
import { loadGameHistory } from "@/storage/gameHistoryStorage";

type GameHistoryContextValue = {
  history: readonly GameHistoryEntry[];
  isHistoryLoaded: boolean;
  refreshHistory: () => Promise<void>;
};

const GameHistoryContext = createContext<GameHistoryContextValue | null>(null);

export function GameHistoryProvider({ children }: PropsWithChildren) {
  const [history, setHistory] = useState<readonly GameHistoryEntry[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const activeLoadRef = useRef<Promise<GameHistoryEntry[]> | null>(null);

  const refreshHistory = useCallback(async () => {
    const request = activeLoadRef.current ?? loadGameHistory();
    activeLoadRef.current = request;

    try {
      const storedHistory = await request;
      setHistory(storedHistory);
    } catch (error: unknown) {
      console.warn("Failed to load game history", error);
    } finally {
      if (activeLoadRef.current === request) {
        activeLoadRef.current = null;
        setIsHistoryLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const value = useMemo(
    () => ({
      history,
      isHistoryLoaded,
      refreshHistory,
    }),
    [history, isHistoryLoaded, refreshHistory],
  );

  return (
    <GameHistoryContext.Provider value={value}>
      {children}
    </GameHistoryContext.Provider>
  );
}

export function useGameHistory() {
  const context = useContext(GameHistoryContext);

  if (!context) {
    throw new Error("useGameHistory must be used inside GameHistoryProvider");
  }

  return context;
}
