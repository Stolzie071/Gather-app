export type SpySetupRecommendation = {
  spyCount: number;
  timerMinutes: number;
};

export function getSpySetupRecommendation(
  playerCount: number,
): SpySetupRecommendation | null {
  if (playerCount < 3) {
    return null;
  }

  if (playerCount <= 4) {
    return { spyCount: 1, timerMinutes: 6 };
  }

  if (playerCount <= 6) {
    return { spyCount: 1, timerMinutes: 7 };
  }

  if (playerCount <= 8) {
    return { spyCount: 1, timerMinutes: 8 };
  }

  if (playerCount <= 10) {
    return { spyCount: 2, timerMinutes: 9 };
  }

  return { spyCount: 2, timerMinutes: 10 };
}
