import { createSpySession } from "../createSpySession";
import type { SpyDraft } from "@/games/spy/types";

const draft: SpyDraft = {
  categoryId: "locations",
  packIds: ["entertainment"],
  playerIds: ["gosha", "anton", "katya"],
  spyCount: 1,
  spiesKnowEachOther: false,
  timerEnabled: true,
  timerMinutes: 6,
};

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

describe("createSpySession", () => {
  test("distributes the spy role across every selected player", () => {
    const random = createSeededRandom(123_456);
    const spyCounts = new Map(draft.playerIds.map((playerId) => [playerId, 0]));

    for (let index = 0; index < 3_000; index += 1) {
      const session = createSpySession({
        draft,
        availableWordIds: ["cinema", "theater", "circus"],
        random,
        now: new Date("2026-08-25T12:00:00.000Z"),
      });
      const spyId = session.spyIds[0];

      if (spyId) {
        spyCounts.set(spyId, (spyCounts.get(spyId) ?? 0) + 1);
      }
    }

    for (const count of spyCounts.values()) {
      expect(count).toBeGreaterThan(900);
      expect(count).toBeLessThan(1_100);
    }
  });

  test("keeps reveal order and spy ids unique", () => {
    const session = createSpySession({
      draft: { ...draft, spyCount: 2 },
      availableWordIds: ["cinema"],
      random: createSeededRandom(7),
    });

    expect(new Set(session.revealOrder).size).toBe(draft.playerIds.length);
    expect(new Set(session.spyIds).size).toBe(2);
    expect(session.spyIds.every((playerId) => draft.playerIds.includes(playerId)))
      .toBe(true);
  });
});
