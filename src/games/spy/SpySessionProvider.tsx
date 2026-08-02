import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSpySession } from "@/games/spy/logic/createSpySession";
import type { SpyDraft, SpySession } from "@/games/spy/types";
import {
  loadActiveSpySession,
  persistActiveSpySession,
} from "@/storage/spySessionStorage";

type StartSpySessionInput = {
  draft: SpyDraft;
  availableWordIds: readonly string[];
};

type SpySessionContextValue = {
  activeSession: SpySession | null;
  isSessionLoaded: boolean;
  needsRecovery: boolean;
  startSession: (input: StartSpySessionInput) => SpySession;
  updateSession: (updater: (session: SpySession) => SpySession) => void;
  resumeSession: () => void;
  clearSession: () => void;
};

const SpySessionContext = createContext<SpySessionContextValue | null>(null);

export function SpySessionProvider({ children }: PropsWithChildren) {
  const [activeSession, setActiveSession] = useState<SpySession | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadActiveSpySession()
      .then((storedSession) => {
        if (!isMounted) {
          return;
        }

        setActiveSession(storedSession);
        setNeedsRecovery(Boolean(storedSession));
      })
      .catch((error: unknown) => {
        console.warn("Failed to load active Spy game", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsSessionLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSessionLoaded) {
      return;
    }

    persistActiveSpySession(activeSession).catch((error: unknown) => {
      console.warn("Failed to save active Spy game", error);
    });
  }, [activeSession, isSessionLoaded]);

  const startSession = useCallback((input: StartSpySessionInput) => {
    const session = createSpySession(input);

    setNeedsRecovery(false);
    setActiveSession(session);
    return session;
  }, []);

  const updateSession = useCallback(
    (updater: (session: SpySession) => SpySession) => {
      setActiveSession((currentSession) =>
        currentSession ? updater(currentSession) : currentSession,
      );
    },
    [],
  );

  const resumeSession = useCallback(() => {
    setNeedsRecovery(false);
  }, []);

  const clearSession = useCallback(() => {
    setNeedsRecovery(false);
    setActiveSession(null);
  }, []);

  const value = useMemo(
    () => ({
      activeSession,
      isSessionLoaded,
      needsRecovery,
      startSession,
      updateSession,
      resumeSession,
      clearSession,
    }),
    [
      activeSession,
      clearSession,
      isSessionLoaded,
      needsRecovery,
      resumeSession,
      startSession,
      updateSession,
    ],
  );

  return (
    <SpySessionContext.Provider value={value}>
      {children}
    </SpySessionContext.Provider>
  );
}

export function useSpySession() {
  const context = useContext(SpySessionContext);

  if (!context) {
    throw new Error("useSpySession must be used inside SpySessionProvider");
  }

  return context;
}
