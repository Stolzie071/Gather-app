import type { SpySession } from "@/games/spy/types";

const MILLISECONDS_IN_SECOND = 1_000;
const MILLISECONDS_IN_MINUTE = 60_000;

export type SpyTimerState =
  | {
      kind: "disabled";
      progress: 1;
      remainingSeconds: null;
    }
  | {
      kind: "running";
      progress: number;
      remainingSeconds: number;
    }
  | {
      kind: "expired";
      progress: 1;
      remainingSeconds: 0;
    };

export function getSpyTimerState(
  session: SpySession,
  nowMilliseconds: number,
): SpyTimerState {
  if (!session.draft.timerEnabled) {
    return {
      kind: "disabled",
      progress: 1,
      remainingSeconds: null,
    };
  }

  const totalMilliseconds = Math.max(
    MILLISECONDS_IN_SECOND,
    session.draft.timerMinutes * MILLISECONDS_IN_MINUTE,
  );
  const endsAtMilliseconds = session.endsAt
    ? Date.parse(session.endsAt)
    : Number.NaN;
  const remainingMilliseconds = Number.isFinite(endsAtMilliseconds)
    ? Math.max(0, endsAtMilliseconds - nowMilliseconds)
    : 0;

  if (remainingMilliseconds <= 0 || session.phase === "timeExpired") {
    return {
      kind: "expired",
      progress: 1,
      remainingSeconds: 0,
    };
  }

  return {
    kind: "running",
    progress: Math.min(1, remainingMilliseconds / totalMilliseconds),
    remainingSeconds: Math.ceil(
      remainingMilliseconds / MILLISECONDS_IN_SECOND,
    ),
  };
}

export function formatSpyTimerSeconds(totalSeconds: number) {
  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
