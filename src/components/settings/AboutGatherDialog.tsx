import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { InfoIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

type AboutGatherDialogProps = {
  visible: boolean;
  onClose: () => void;
};

export function AboutGatherDialog({
  visible,
  onClose,
}: AboutGatherDialogProps) {
  const { t } = useLocalization();
  const { playPrimaryAction } = useAppHaptics();
  const { width: screenWidth } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const wasVisible = useRef(false);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [12, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.97, 1]) },
    ],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const finishHiding = useCallback(() => setRendered(false), []);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setRendered(true);
    }

    wasVisible.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    progress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: visible ? 200 : 150,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && !visible) {
          runOnJS(finishHiding)();
        }
      },
    );
  }, [finishHiding, progress, rendered, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      pointerEvents={visible ? "auto" : "none"}
      style={styles.overlay}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.shadow,
          { width: Math.min(screenWidth - 32, 360) },
          dialogStyle,
        ]}
      >
        <Squircle
          style={styles.dialog}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <InfoIcon width={56} height={56} />

          <Text style={styles.title}>{t("settings.about.title")}</Text>
          <Text style={styles.message}>{t("settings.about.description")}</Text>
          <Text style={styles.version}>{t("settings.about.version")}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.about.close")}
            onPress={() => {
              playPrimaryAction();
              onClose();
            }}
            onPressIn={() => {
              buttonScale.value = withTiming(0.97, { duration: 70 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, {
                damping: 18,
                stiffness: 320,
                mass: 0.7,
              });
            }}
            style={styles.buttonPressable}
          >
            <Animated.View style={[styles.buttonAnimated, buttonStyle]}>
              <Squircle
                style={styles.button}
                cornerRadius={10}
                fillColor={colors.primary}
              >
                <Text style={styles.buttonLabel}>
                  {t("settings.about.close")}
                </Text>
              </Squircle>
            </Animated.View>
          </Pressable>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 500,
    elevation: 500,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  shadow: {
    borderRadius: 20,
    backgroundColor: colors.background,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 8,
        spreadDistance: 0,
        color: "rgba(0, 0, 0, 0.35)",
      },
    ],
  },
  dialog: {
    width: "100%",
    padding: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  title: {
    marginTop: 12,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  version: {
    marginTop: 10,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
  buttonPressable: {
    width: "100%",
    height: 46,
    marginTop: 18,
  },
  buttonAnimated: {
    width: "100%",
    height: "100%",
  },
  button: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
