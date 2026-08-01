import { useCallback, useEffect, useRef, useState } from "react";
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
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

type SourceButtonProps = {
  label: string;
  variant: "primary" | "secondary";
  onPress: () => void;
};

function SourceButton({ label, variant, onPress }: SourceButtonProps) {
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
        <Squircle
          style={styles.button}
          cornerRadius={10}
          fillColor={variant === "primary" ? colors.primary : colors.secondary3}
          strokeColor={variant === "secondary" ? colors.secondary4 : undefined}
          strokeWidth={variant === "secondary" ? 1 : undefined}
        >
          <Text
            style={
              variant === "primary"
                ? styles.primaryButtonLabel
                : styles.secondaryButtonLabel
            }
          >
            {label}
          </Text>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type PlayerPhotoSourceDialogProps = {
  visible: boolean;
  width: number;
  onCamera: () => void;
  onGallery: () => void;
  onCancel: () => void;
};

export function PlayerPhotoSourceDialog({
  visible,
  width,
  onCamera,
  onGallery,
  onCancel,
}: PlayerPhotoSourceDialogProps) {
  const { t } = useLocalization();
  const [rendered, setRendered] = useState(visible);
  const onCancelRef = useRef(onCancel);
  const visibilityProgress = useSharedValue(0);

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

  const finishHiding = useCallback(() => {
    setRendered(false);
  }, []);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

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

  if (!rendered) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("playerSelection.photo.cancel")}
          onPress={onCancel}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <Animated.View style={[styles.dialogShadow, { width }, dialogStyle]}>
        <Squircle
          style={styles.dialog}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <Text style={styles.title}>
            {t("playerSelection.photo.sourceTitle")}
          </Text>
          <Text style={styles.subtitle}>
            {t("playerSelection.photo.sourceMessage")}
          </Text>

          <View style={styles.actions}>
            <SourceButton
              label={t("playerSelection.photo.camera")}
              variant="primary"
              onPress={onCamera}
            />
            <SourceButton
              label={t("playerSelection.photo.gallery")}
              variant="secondary"
              onPress={onGallery}
            />
            <SourceButton
              label={t("playerSelection.photo.cancel")}
              variant="secondary"
              onPress={onCancel}
            />
          </View>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  dialogShadow: {
    height: 286,
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

  buttonPressable: {
    width: "100%",
    height: 48,
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

  primaryButtonLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  secondaryButtonLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
