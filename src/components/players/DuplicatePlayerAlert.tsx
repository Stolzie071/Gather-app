import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

const ALERT_HEIGHT = 244;

type AlertButtonProps = {
  children: ReactNode;
  onPress: () => void;
};

function AlertButton({ children, onPress }: AlertButtonProps) {
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

type DuplicatePlayerAlertProps = {
  visible: boolean;
  playerName: string;
  width: number;
  onCancel: () => void;
  onCreateNew: () => void;
  onHidden?: () => void;
};

export function DuplicatePlayerAlert({
  visible,
  playerName,
  width,
  onCancel,
  onCreateNew,
  onHidden,
}: DuplicatePlayerAlertProps) {
  const { t } = useLocalization();
  const [rendered, setRendered] = useState(visible);
  const onHiddenRef = useRef(onHidden);
  const visibilityProgress = useSharedValue(0);

  const alertStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      {
        translateY: interpolate(
          visibilityProgress.value,
          [0, 1],
          [10, 0],
        ),
      },
      {
        scale: interpolate(
          visibilityProgress.value,
          [0, 1],
          [0.97, 1],
        ),
      },
    ],
  }));

  const finishHiding = useCallback(() => {
    setRendered(false);
    onHiddenRef.current?.();
  }, []);

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

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
        duration: visible ? 210 : 160,
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

  return (
    <View
      accessibilityRole="alert"
      style={styles.positioner}
      pointerEvents={visible ? "box-none" : "none"}
    >
      <Animated.View
        style={[
          styles.shadow,
          { width, height: ALERT_HEIGHT },
          alertStyle,
        ]}
      >
        <Squircle
          style={styles.alert}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <View style={styles.content}>
            <AlertIcon width={63} height={63} />

            <Text style={styles.title}>
              {t("playerSelection.duplicateAlert.title")}
            </Text>

            <View style={styles.message}>
              <Text style={styles.messageLine} numberOfLines={1}>
                {t("playerSelection.duplicateAlert.existingPlayer", {
                  name: playerName,
                })}
              </Text>
              <Text style={styles.messageLine}>
                {t("playerSelection.duplicateAlert.chooseAction")}
              </Text>
            </View>

            <View style={styles.buttons}>
              <AlertButton onPress={onCancel}>
                <Squircle
                  style={styles.button}
                  cornerRadius={8}
                  fillColor={colors.secondary3}
                  strokeColor={colors.secondary4}
                  strokeWidth={1}
                >
                  <Text style={styles.cancelLabel}>
                    {t("playerSelection.duplicateAlert.cancel")}
                  </Text>
                </Squircle>
              </AlertButton>

              <AlertButton onPress={onCreateNew}>
                <Squircle
                  style={styles.button}
                  cornerRadius={8}
                  fillColor={colors.primary}
                >
                  <Text style={styles.createLabel}>
                    {t("playerSelection.duplicateAlert.createNew")}
                  </Text>
                </Squircle>
              </AlertButton>
            </View>
          </View>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    elevation: 1,
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
    height: "100%",
    overflow: "hidden",
  },

  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },

  title: {
    marginTop: 16,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
  },

  message: {
    width: "100%",
    height: 32,
    marginTop: 16,
    alignItems: "center",
  },

  messageLine: {
    maxWidth: "100%",
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },

  buttons: {
    width: "100%",
    height: 44,
    marginTop: 16,
    flexDirection: "row",
    gap: 22,
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

  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  createLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
