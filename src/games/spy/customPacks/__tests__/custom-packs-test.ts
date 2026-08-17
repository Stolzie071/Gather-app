import {
  createCustomSpyPack,
  createCustomSpyPackSource,
  updateCustomSpyPack,
} from "../customPackUtils";
import { SPY_CONTENT_CATEGORIES } from "../../content/categories";
import { createSpyContentRegistry } from "../../content/registry";

describe("custom Spy packs", () => {
  test("normalizes the pack and removes duplicate or empty words", () => {
    const pack = createCustomSpyPack({
      name: "  Наш   набор  ",
      words: [" Первое ", "", "первое", "Второе слово"],
    });

    expect(pack.name).toBe("Наш набор");
    expect(pack.words.map(({ name }) => name)).toEqual([
      "Первое",
      "Второе слово",
    ]);
  });

  test("preserves ids of unchanged words while editing", () => {
    const pack = createCustomSpyPack({
      name: "Набор",
      words: ["Первое", "Второе"],
    });
    const updatedPack = updateCustomSpyPack(pack, {
      name: "Новый набор",
      words: ["Второе", "Третье"],
    });

    expect(updatedPack.words[0].id).toBe(pack.words[1].id);
    expect(updatedPack.words[1].id).not.toBe(pack.words[0].id);
  });

  test("feeds several selected custom packs into the regular registry", () => {
    const firstPack = createCustomSpyPack({
      name: "Первый",
      words: ["Альфа", "Общее"],
    });
    const secondPack = createCustomSpyPack({
      name: "Второй",
      words: ["Бета", "Общее"],
    });
    const registry = createSpyContentRegistry({
      categories: SPY_CONTENT_CATEGORIES,
      packs: [
        createCustomSpyPackSource(firstPack),
        createCustomSpyPackSource(secondPack),
      ],
    });

    expect(
      registry.getWordIds("mySets", [firstPack.id, secondPack.id]),
    ).toHaveLength(4);
  });
});
