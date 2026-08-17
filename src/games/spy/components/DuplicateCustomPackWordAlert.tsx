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

import { AlertIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

type DuplicateCustomPackWordAlertProps = {
  visible: boolean;
  word: string;
  onClose: () => void;
  onHidden?: () => void;
};

export function DuplicateCustomPackWordAlert({
  visible,
  word,
  onClose,
  onHidden,
}: DuplicateCustomPackWordAlertProps) {
  const { t } = useLocalization();
  const { playWarning } = useAppHaptics();
  const { width: screenWidth } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const wasVisible = useRef(false);
  const onHiddenRef = useRef(onHidden);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));
  const alertStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [10, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.97, 1]) },
    ],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const finishHiding = useCallback(() => {
    setRendered(false);
    onHiddenRef.current?.();
  }, []);

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      playWarning();
      setRendered(true);
    }

    wasVisible.current = visible;
  }, [playWarning, visible]);

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
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      <Animated.View
        style={[
          styles.shadow,
          { width: Math.min(screenWidth - 32, 340) },
          alertStyle,
        ]}
      >
        <Squircle
          style={styles.alert}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <AlertIcon width={63} height={63} />

          <Text style={styles.title}>
            {t("spySetup.customPackDialog.duplicateWord.title")}
          </Text>
          <Text style={styles.message}>
            {t("spySetup.customPackDialog.duplicateWord.message", { word })}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              "spySetup.customPackDialog.duplicateWord.ok",
            )}
            onPress={onClose}
            onPressIn={() => {
              scale.value = withTiming(0.97, { duration: 70 });
            }}
            onPressOut={() => {
              scale.value = withSpring(1, {
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
                cornerRadius={8}
                fillColor={colors.primary}
              >
                <Text style={styles.buttonLabel}>
                  {t("spySetup.customPackDialog.duplicateWord.ok")}
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
  alert: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  title: {
    marginTop: 14,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    lineHeight: 27,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  buttonPressable: {
    width: "100%",
    height: 44,
    marginTop: 16,
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
