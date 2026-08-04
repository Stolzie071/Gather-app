import { memo, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

import { SpyTimerDial } from "@/games/spy/components/SpyTimerDial";
import {
  formatSpyTimerSeconds,
  getSpyTimerState,
} from "@/games/spy/logic/getSpyTimerState";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import type { SpySession } from "@/games/spy/types";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

const EXPIRED_PROGRESS_COLOR = "#FFD153";

type SpyTimerDisplayProps = {
  session: SpySession | null;
  focused: boolean;
  size: number;
};

export const SpyTimerDisplay = memo(function SpyTimerDisplay({
  session,
  focused,
  size,
}: SpyTimerDisplayProps) {
  const { t } = useLocalization();
  const { updateSession } = useSpySession();
  const { playTimerExpired } = useAppHaptics();
  const [nowMilliseconds, setNowMilliseconds] = useState(() => Date.now());
  const timerState = useMemo(
    () => (session ? getSpyTimerState(session, nowMilliseconds) : null),
    [nowMilliseconds, session],
  );

  useEffect(() => {
    if (
      !focused ||
      !session?.draft.timerEnabled ||
      session.phase !== "playing"
    ) {
      return;
    }

    const syncNow = () => setNowMilliseconds(Date.now());
    const interval = setInterval(syncNow, 1_000);
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          syncNow();
        }
      },
    );

    syncNow();

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [focused, session]);

  useEffect(() => {
    if (
      !session ||
      timerState?.kind !== "expired" ||
      session.phase !== "playing"
    ) {
      return;
    }

    playTimerExpired();
    updateSession((currentSession) =>
      currentSession.id === session.id
        ? {
            ...currentSession,
            phase: "timeExpired",
          }
        : currentSession,
    );
  }, [playTimerExpired, session, timerState?.kind, updateSession]);

  const label =
    timerState?.kind === "running"
      ? formatSpyTimerSeconds(timerState.remainingSeconds)
      : timerState?.kind === "expired"
        ? t("spyTimer.expiredTitle")
        : t("spyTimer.disabledTitle");
  const message =
    timerState?.kind === "expired"
      ? t("spyTimer.expiredMessage")
      : timerState?.kind === "disabled"
        ? t("spyTimer.disabledMessage")
        : undefined;

  return (
    <SpyTimerDial
      label={label}
      message={message}
      progress={timerState?.progress ?? 1}
      progressColor={
        timerState?.kind === "expired"
          ? EXPIRED_PROGRESS_COLOR
          : colors.primary
      }
      size={size}
    />
  );
});
