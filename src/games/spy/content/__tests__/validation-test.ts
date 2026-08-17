import type { SpySession } from "@/games/spy/types";
import { createSpyContentRegistry } from "../registry";
import type {
  SpyContentCategory,
  SpyContentPackSource,
} from "../types";
import {
  getSpySessionContentError,
  validateSpyContentAssets,
} from "../validation";

const categories = [
  { id: "locations", enabled: true, presentation: "image" },
] as const satisfies readonly SpyContentCategory[];

const validPacks = [
  {
    id: "workplaces",
    categoryId: "locations",
    enabled: true,
    illustrationKey: "workplaces",
    words: [{ id: "cinema", name: "Кинотеатр", imageKey: "cinema" }],
  },
] as const satisfies readonly SpyContentPackSource[];

function createSession(overrides?: Partial<SpySession>): SpySession {
  return {
    id: "spy-test",
    gameId: "spy",
    createdAt: "2026-01-01T00:00:00.000Z",
    startedAt: null,
    draft: {
      categoryId: "locations",
      packIds: ["workplaces"],
      playerIds: ["one", "two", "three"],
      spyCount: 1,
      spiesKnowEachOther: false,
      timerEnabled: true,
      timerMinutes: 6,
    },
    secretWordId: "cinema",
    spyIds: ["one"],
    revealOrder: ["two", "one", "three"],
    revealIndex: 0,
    currentCardRevealed: false,
    allRolesRevealed: false,
    phase: "revealing",
    endsAt: null,
    winnerIds: [],
    ...overrides,
  };
}

describe("Spy content asset validation", () => {
  test("accepts a complete image pack", () => {
    expect(() =>
      validateSpyContentAssets({
        categories,
        packs: validPacks,
        packIllustrationKeys: new Set(["workplaces"]),
        wordImageKeys: new Set(["cinema"]),
      }),
    ).not.toThrow();
  });

  test("rejects an enabled pack without an illustration", () => {
    const packs = [
      {
        ...validPacks[0],
        illustrationKey: undefined,
      },
    ] satisfies readonly SpyContentPackSource[];

    expect(() =>
      validateSpyContentAssets({
        categories,
        packs,
        packIllustrationKeys: new Set(),
        wordImageKeys: new Set(["cinema"]),
      }),
    ).toThrow("has no illustration key");
  });

  test("rejects an image word without an image key", () => {
    const packs = [
      {
        ...validPacks[0],
        words: [{ id: "cinema", name: "Кинотеатр" }],
      },
    ] satisfies readonly SpyContentPackSource[];

    expect(() =>
      validateSpyContentAssets({
        categories,
        packs,
        packIllustrationKeys: new Set(["workplaces"]),
        wordImageKeys: new Set(),
      }),
    ).toThrow("has no image key");
  });
});

describe("saved Spy session content validation", () => {
  const registry = createSpyContentRegistry({
    categories,
    packs: validPacks,
  });

  test("accepts a session whose word belongs to the saved packs", () => {
    expect(getSpySessionContentError(createSession(), registry)).toBeNull();
  });

  test("rejects a session with a removed secret word", () => {
    expect(
      getSpySessionContentError(
        createSession({ secretWordId: "removed-word" }),
        registry,
      ),
    ).toContain("is not available in the saved packs");
  });

  test("rejects a session with a removed pack", () => {
    const session = createSession();
    session.draft = { ...session.draft, packIds: ["removed-pack"] };

    expect(getSpySessionContentError(session, registry)).toContain(
      "Unknown Spy pack",
    );
  });
});
