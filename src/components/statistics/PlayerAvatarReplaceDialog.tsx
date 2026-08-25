import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

type ReplaceActionProps = {
  children: ReactNode;
  primary?: boolean;
  onPress: () => void;
};

function ReplaceAction({
  children,
  primary = false,
  onPress,
}: ReplaceActionProps) {
  const { playTopAction } = useAppHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        playTopAction();
        onPress();
      }}
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
      style={styles.actionPressable}
    >
      <Animated.View style={[styles.actionAnimated, animatedStyle]}>
        <Squircle
          style={styles.action}
          cornerRadius={10}
          fillColor={primary ? colors.primary : colors.secondary3}
          strokeColor={primary ? undefined : colors.secondary4}
          strokeWidth={primary ? undefined : 1}
        >
          <Text
            style={
              primary ? styles.primaryActionLabel : styles.actionLabel
            }
          >
            {children}
          </Text>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type PlayerAvatarReplaceDialogProps = {
  visible: boolean;
  width: number;
  onPresets: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onCancel: () => void;
};

export function PlayerAvatarReplaceDialog({
  visible,
  width,
  onPresets,
  onCamera,
  onGallery,
  onCancel,
}: PlayerAvatarReplaceDialogProps) {
  const { t } = useLocalization();
  const [rendered, setRendered] = useState(visible);
  const visibilityProgress = useSharedValue(0);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const finishHiding = useCallback(() => {
    setRendered(false);
  }, []);

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
        duration: visible ? 210 : 150,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && !visible) {
          runOnJS(finishHiding)();
        }
      },
    );
  }, [finishHiding, rendered, visibilityProgress, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onCancelRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.32,
  }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      {
        translateY: interpolate(visibilityProgress.value, [0, 1], [12, 0]),
      },
      { scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  if (!rendered && !visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable onPress={onCancel} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      <Animated.View style={[styles.dialogShadow, { width }, dialogStyle]}>
        <Squircle
          style={styles.dialog}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <Text style={styles.title}>
            {t("statistics.playerDetails.avatar.replaceDialog.title")}
          </Text>
          <Text style={styles.subtitle}>
            {t("statistics.playerDetails.avatar.replaceDialog.subtitle")}
          </Text>

          <View style={styles.actions}>
            <ReplaceAction primary onPress={onPresets}>
              {t("statistics.playerDetails.avatar.replaceDialog.presets")}
            </ReplaceAction>
            <ReplaceAction onPress={onCamera}>
              {t("playerSelection.photo.camera")}
            </ReplaceAction>
            <ReplaceAction onPress={onGallery}>
              {t("playerSelection.photo.gallery")}
            </ReplaceAction>
            <ReplaceAction onPress={onCancel}>
              {t("playerSelection.photo.cancel")}
            </ReplaceAction>
          </View>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  dialogShadow: {
    height: 336,
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
    height: "100%",
    padding: 20,
    overflow: "hidden",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  actions: {
    marginTop: 20,
    gap: 8,
  },
  actionPressable: {
    width: "100%",
    height: 48,
  },
  actionAnimated: {
    width: "100%",
    height: "100%",
  },
  action: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryActionLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
