import type { SpyDraft, SpySession } from "@/games/spy/types";

type CreateSpySessionInput = {
  draft: SpyDraft;
  availableWordIds: readonly string[];
  random?: () => number;
  now?: Date;
};

function shuffle<T>(items: readonly T[], random: () => number) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function createSessionId(now: Date, random: () => number) {
  const timestamp = now.getTime().toString(36);
  const randomPart = random().toString(36).slice(2, 10);

  return `spy_${timestamp}_${randomPart}`;
}

export function createSpySession({
  draft,
  availableWordIds,
  random = Math.random,
  now = new Date(),
}: CreateSpySessionInput): SpySession {
  const uniquePlayerIds = [...new Set(draft.playerIds)];
  const uniqueWordIds = [...new Set(availableWordIds)];

  if (!draft.categoryId) {
    throw new Error("Spy game category is not selected");
  }

  if (draft.packIds.length === 0) {
    throw new Error("Spy game packs are not selected");
  }

  if (uniquePlayerIds.length < 3 || uniquePlayerIds.length > 12) {
    throw new Error("Spy game requires from 3 to 12 unique players");
  }

  if (draft.spyCount < 1 || draft.spyCount >= uniquePlayerIds.length) {
    throw new Error("Spy count must be between 1 and player count minus 1");
  }

  if (uniqueWordIds.length === 0) {
    throw new Error("Selected Spy game packs do not contain words");
  }

  const secretWordIndex = Math.floor(random() * uniqueWordIds.length);
  const revealOrder = shuffle(uniquePlayerIds, random);
  const spyIds = shuffle(uniquePlayerIds, random).slice(0, draft.spyCount);

  return {
    id: createSessionId(now, random),
    gameId: "spy",
    createdAt: now.toISOString(),
    startedAt: null,
    draft: {
      ...draft,
      packIds: [...draft.packIds],
      playerIds: uniquePlayerIds,
    },
    secretWordId: uniqueWordIds[secretWordIndex],
    spyIds,
    revealOrder,
    revealIndex: 0,
    currentCardRevealed: false,
    allRolesRevealed: false,
    phase: "revealing",
    endsAt: null,
    winnerIds: [],
  };
}
