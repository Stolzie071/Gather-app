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
  createCustomSpyPack,
  createCustomSpyPackSource,
  updateCustomSpyPack,
} from "@/games/spy/customPacks/customPackUtils";
import type {
  CustomSpyPack,
  CustomSpyPackInput,
} from "@/games/spy/customPacks/types";
import {
  loadCustomSpyPacks,
  saveCustomSpyPacks,
} from "@/storage/spyCustomPacksStorage";
import { SPY_CONTENT_CATEGORIES } from "./categories";
import { createSpyContentRegistry, type SpyContentRegistry } from "./registry";
import { BUILT_IN_SPY_PACK_SOURCES } from "./sources";

type SpyContentContextValue = {
  registry: SpyContentRegistry;
  customPacks: readonly CustomSpyPack[];
  isContentLoaded: boolean;
  createCustomPack: (input: CustomSpyPackInput) => CustomSpyPack;
  updateCustomPack: (packId: string, input: CustomSpyPackInput) => void;
  deleteCustomPack: (packId: string) => void;
  getCustomPack: (packId: string) => CustomSpyPack | undefined;
};

const SpyContentContext = createContext<SpyContentContextValue | null>(null);

export function SpyContentProvider({ children }: PropsWithChildren) {
  const [customPacks, setCustomPacks] = useState<CustomSpyPack[]>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadCustomSpyPacks()
      .then((storedPacks) => {
        if (isMounted) {
          setCustomPacks(storedPacks);
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to load custom Spy packs", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsContentLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isContentLoaded) {
      return;
    }

    saveCustomSpyPacks(customPacks).catch((error: unknown) => {
      console.warn("Failed to save custom Spy packs", error);
    });
  }, [customPacks, isContentLoaded]);

  const registry = useMemo(
    () =>
      createSpyContentRegistry({
        categories: SPY_CONTENT_CATEGORIES,
        packs: [
          ...BUILT_IN_SPY_PACK_SOURCES,
          ...customPacks.map(createCustomSpyPackSource),
        ],
      }),
    [customPacks],
  );

  const createCustomPack = useCallback((input: CustomSpyPackInput) => {
    const pack = createCustomSpyPack(input);
    setCustomPacks((currentPacks) => [pack, ...currentPacks]);
    return pack;
  }, []);

  const updateCustomPack = useCallback(
    (packId: string, input: CustomSpyPackInput) => {
      setCustomPacks((currentPacks) =>
        currentPacks.map((pack) =>
          pack.id === packId ? updateCustomSpyPack(pack, input) : pack,
        ),
      );
    },
    [],
  );

  const deleteCustomPack = useCallback((packId: string) => {
    setCustomPacks((currentPacks) =>
      currentPacks.filter((pack) => pack.id !== packId),
    );
  }, []);

  const customPackById = useMemo(
    () => new Map(customPacks.map((pack) => [pack.id, pack])),
    [customPacks],
  );
  const getCustomPack = useCallback(
    (packId: string) => customPackById.get(packId),
    [customPackById],
  );

  const value = useMemo(
    () => ({
      registry,
      customPacks,
      isContentLoaded,
      createCustomPack,
      updateCustomPack,
      deleteCustomPack,
      getCustomPack,
    }),
    [
      createCustomPack,
      customPacks,
      deleteCustomPack,
      getCustomPack,
      isContentLoaded,
      registry,
      updateCustomPack,
    ],
  );

  return (
    <SpyContentContext.Provider value={value}>
      {children}
    </SpyContentContext.Provider>
  );
}

export function useSpyContent() {
  const context = useContext(SpyContentContext);

  if (!context) {
    throw new Error("useSpyContent must be used inside SpyContentProvider");
  }

  return context;
}
