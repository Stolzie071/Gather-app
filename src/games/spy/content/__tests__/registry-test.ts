import { createSpyContentRegistry } from "../registry";
import type {
  SpyContentCategory,
  SpyContentPackSource,
} from "../types";

const categories = [
  { id: "characters", enabled: true, presentation: "text" },
  { id: "animals", enabled: true, presentation: "text" },
  { id: "disabled", enabled: false, presentation: "text" },
] as const satisfies readonly SpyContentCategory[];

const packs = [
  {
    id: "heroes",
    categoryId: "characters",
    enabled: true,
    words: [
      { id: "shared", name: "Общее слово" },
      { id: "hero", name: "Герой" },
    ],
  },
  {
    id: "villains",
    categoryId: "characters",
    enabled: true,
    words: [
      { id: "shared", name: "Общее слово" },
      { id: "villain", name: "Злодей" },
    ],
  },
  {
    id: "pets",
    categoryId: "animals",
    enabled: true,
    words: [{ id: "cat", name: "Кошка" }],
  },
  {
    id: "future-pack",
    categoryId: "characters",
    enabled: false,
    words: [],
  },
  {
    id: "disabled-category-pack",
    categoryId: "disabled",
    enabled: true,
    words: [{ id: "unused", name: "Не используется" }],
  },
] as const satisfies readonly SpyContentPackSource[];

function createRegistry() {
  return createSpyContentRegistry({ categories, packs });
}

describe("Spy content registry", () => {
  test("combines words from several selected packs and removes duplicates", () => {
    const registry = createRegistry();

    expect(registry.getWordIds("characters", ["heroes", "villains"])).toEqual([
      "shared",
      "hero",
      "villain",
    ]);
  });

  test("does not duplicate words when the same pack id is passed twice", () => {
    const registry = createRegistry();

    expect(registry.getWordIds("characters", ["heroes", "heroes"])).toEqual([
      "shared",
      "hero",
    ]);
  });

  test("rejects an unknown category", () => {
    const registry = createRegistry();

    expect(() => registry.getWordIds("missing", ["heroes"])).toThrow(
      "Unknown Spy category",
    );
  });

  test("rejects a disabled category", () => {
    const registry = createRegistry();

    expect(() =>
      registry.getWordIds("disabled", ["disabled-category-pack"]),
    ).toThrow('Spy category "disabled" is disabled');
  });

  test("requires at least one selected pack", () => {
    const registry = createRegistry();

    expect(() => registry.getWordIds("characters", [])).toThrow(
      "At least one Spy pack must be selected",
    );
  });

  test("rejects an unknown pack", () => {
    const registry = createRegistry();

    expect(() => registry.getWordIds("characters", ["missing"])).toThrow(
      "Unknown Spy pack",
    );
  });

  test("rejects a pack from another category", () => {
    const registry = createRegistry();

    expect(() => registry.getWordIds("characters", ["pets"])).toThrow(
      'Spy pack "pets" does not belong to category "characters"',
    );
  });

  test("rejects a disabled pack", () => {
    const registry = createRegistry();

    expect(() =>
      registry.getWordIds("characters", ["future-pack"]),
    ).toThrow('Spy pack "future-pack" is disabled');
  });
});
