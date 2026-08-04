import { useCallback, useMemo } from "react";
import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

import { useSettings } from "@/settings/SettingsProvider";

function runHaptic(effect: Promise<void>) {
  effect.catch((error: unknown) => {
    console.warn("Failed to play haptic feedback", error);
  });
}

export function useAppHaptics() {
  const { settings } = useSettings();
  const enabled = settings.hapticsEnabled;

  const playSetupStart = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
    );
  }, [enabled]);

  const playSuccess = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Context_Click,
          )
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  }, [enabled]);

  const playWarning = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    );
  }, [enabled]);

  const playToggle = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_On)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  }, [enabled]);

  const playToggleState = useCallback(
    (nextValue: boolean, force = false) => {
      if (!enabled && !force) {
        return;
      }

      runHaptic(
        Platform.OS === "android"
          ? Haptics.performAndroidHapticsAsync(
              nextValue
                ? Haptics.AndroidHaptics.Toggle_On
                : Haptics.AndroidHaptics.Toggle_Off,
            )
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      );
    },
    [enabled],
  );

  const playNavigation = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  }, [enabled]);

  const playNextStep = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Segment_Tick,
          )
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  }, [enabled]);

  const playTopAction = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Context_Click,
          )
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  }, [enabled]);

  const playPrimaryAction = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Context_Click,
          )
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    );
  }, [enabled]);

  const playCompletion = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  }, [enabled]);

  const playSelection = useCallback(() => {
    if (!enabled) {
      return;
    }

    runHaptic(
      Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Segment_Tick,
          )
        : Haptics.selectionAsync(),
    );
  }, [enabled]);

  const playTimerExpired = useCallback(() => {
    if (!enabled) {
      return;
    }

    Vibration.cancel();
    Vibration.vibrate(2_000);
  }, [enabled]);

  return useMemo(
    () => ({
      playSetupStart,
      playSuccess,
      playWarning,
      playToggle,
      playToggleState,
      playSelection,
      playNavigation,
      playNextStep,
      playTopAction,
      playPrimaryAction,
      playCompletion,
      playTimerExpired,
    }),
    [
      playSelection,
      playCompletion,
      playNavigation,
      playNextStep,
      playTopAction,
      playPrimaryAction,
      playSetupStart,
      playSuccess,
      playTimerExpired,
      playToggle,
      playToggleState,
      playWarning,
    ],
  );
}
