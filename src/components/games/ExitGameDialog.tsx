import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

type DialogButtonProps = {
  children: ReactNode;
  onPress: () => void;
};

function DialogButton({ children, onPress }: DialogButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
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
      <Animated.View style={[styles.buttonAnimated, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

type ExitGameDialogProps = {
  visible: boolean;
  onStay: () => void;
  onExit: () => void;
  compact?: boolean;
  title?: string;
  message?: string;
  stayLabel?: string;
  exitLabel?: string;
};

export function ExitGameDialog({
  visible,
  onStay,
  onExit,
  compact = false,
  title,
  message,
  stayLabel,
  exitLabel,
}: ExitGameDialogProps) {
  const { t } = useLocalization();
  const { width: screenWidth } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const visibilityProgress = useSharedValue(0);
  const onStayRef = useRef(onStay);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.5,
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      {
        translateY: interpolate(visibilityProgress.value, [0, 1], [10, 0]),
      },
      {
        scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]),
      },
    ],
  }));

  const finishHiding = useCallback(() => {
    setRendered(false);
  }, []);

  useEffect(() => {
    onStayRef.current = onStay;
  }, [onStay]);

  useEffect(() => {
    if (visible) {
      setRendered(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    visibilityProgress.value = withTiming(
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
  }, [finishHiding, rendered, visibilityProgress, visible]);

  if (!rendered) {
    return null;
  }

  const dialogWidth = Math.min(screenWidth - 32, 360);
  const resolvedTitle = title ?? t("exitGameDialog.title");
  const resolvedMessage = message ?? t("exitGameDialog.message");
  const resolvedStayLabel = stayLabel ?? t("exitGameDialog.stay");
  const resolvedExitLabel = exitLabel ?? t("exitGameDialog.exit");

  return (
    <View
      accessibilityRole="alert"
      pointerEvents={visible ? "auto" : "none"}
      style={styles.overlay}
    >
      <Pressable
        accessibilityLabel={resolvedStayLabel}
        onPress={() => onStayRef.current()}
        style={StyleSheet.absoluteFillObject}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[
          styles.shadow,
          compact && styles.shadowCompact,
          { width: dialogWidth },
          dialogStyle,
        ]}
      >
        <Squircle
          style={[styles.dialog, compact && styles.dialogCompact]}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <AlertIcon width={63} height={63} />

          <Text style={styles.title}>{resolvedTitle}</Text>
          <Text style={styles.message}>{resolvedMessage}</Text>

          <View style={[styles.buttons, compact && styles.buttonsCompact]}>
            <DialogButton onPress={onStay}>
              <Squircle
                style={styles.button}
                cornerRadius={8}
                fillColor={colors.secondary3}
                strokeColor={colors.secondary4}
                strokeWidth={1}
              >
                <Text style={styles.stayLabel}>{resolvedStayLabel}</Text>
              </Squircle>
            </DialogButton>

            <DialogButton onPress={onExit}>
              <Squircle
                style={styles.button}
                cornerRadius={8}
                fillColor={colors.primary}
              >
                <Text style={styles.exitLabel}>{resolvedExitLabel}</Text>
              </Squircle>
            </DialogButton>
          </View>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  shadow: {
    height: 260,
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

  shadowCompact: {
    height: "auto",
  },

  dialog: {
    width: "100%",
    height: "100%",
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },

  dialogCompact: {
    height: "auto",
  },

  title: {
    marginTop: 14,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    lineHeight: 30,
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

  buttons: {
    position: "absolute",
    right: 16,
    bottom: 16,
    left: 16,
    height: 44,
    flexDirection: "row",
    gap: 16,
  },

  buttonsCompact: {
    position: "relative",
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    marginTop: 10,
  },

  buttonPressable: {
    flex: 1,
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

  stayLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  exitLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
