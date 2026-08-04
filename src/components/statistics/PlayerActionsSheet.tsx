import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { PlayerStatsDeleteIcon } from "@assets/Decorate/StatsScreen";
import { SpySummaryPenIcon } from "@assets/Spy_game/4_step";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { colors } from "@/theme/colors";

const SHEET_HEIGHT = 132;

type PlayerActionsSheetProps = {
  visible: boolean;
  closeLabel: string;
  renameLabel: string;
  deleteLabel: string;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
};

type ActionButtonProps = {
  children: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
};

function ActionButton({
  children,
  accessibilityLabel,
  onPress,
}: ActionButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 330,
          mass: 0.7,
        });
      }}
      style={styles.actionPressable}
    >
      <Animated.View style={[styles.actionAnimated, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function PlayerActionsSheet({
  visible,
  closeLabel,
  renameLabel,
  deleteLabel,
  onClose,
  onRename,
  onDelete,
}: PlayerActionsSheetProps) {
  const insets = useSafeAreaInsets();
  const { playTopAction } = useAppHaptics();
  const [rendered, setRendered] = useState(visible);
  const visibilityProgress = useSharedValue(0);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
        duration: visible ? 260 : 190,
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
    if (!rendered) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onCloseRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [rendered]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.25,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          visibilityProgress.value,
          [0, 1],
          [SHEET_HEIGHT + insets.bottom + 24, 0],
        ),
      },
    ],
  }));

  if (!rendered) {
    return null;
  }

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={styles.overlay}
    >
      <Pressable
        accessibilityLabel={closeLabel}
        onPress={() => onCloseRef.current()}
        style={StyleSheet.absoluteFillObject}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[
          styles.sheetPosition,
          { bottom: Math.max(insets.bottom, 16) },
          sheetStyle,
        ]}
      >
        <Squircle
          style={styles.sheet}
          cornerRadius={20}
          fillColor={colors.surface}
          strokeColor={colors.secondary4}
          strokeWidth={1.5}
        >
          <ActionButton
            accessibilityLabel={renameLabel}
            onPress={() => {
              playTopAction();
              onRename();
            }}
          >
            <Squircle
              style={styles.action}
              cornerRadius={12}
              fillColor={colors.secondary3}
              strokeColor={colors.secondary4}
              strokeWidth={1}
            >
              <SpySummaryPenIcon
                width={18}
                height={18}
                color={colors.secondary}
              />
              <Text style={styles.renameLabel}>{renameLabel}</Text>
            </Squircle>
          </ActionButton>

          <ActionButton
            accessibilityLabel={deleteLabel}
            onPress={() => {
              onDelete();
            }}
          >
            <Squircle
              style={styles.action}
              cornerRadius={12}
              fillColor="#E42437"
            >
              <View style={styles.deleteIcon}>
                <PlayerStatsDeleteIcon width={19} height={19} />
              </View>
              <Text style={styles.deleteLabel}>{deleteLabel}</Text>
            </Squircle>
          </ActionButton>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  sheetPosition: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 370,
    height: SHEET_HEIGHT,
    padding: 16,
    gap: 16,
  },
  actionPressable: {
    flex: 1,
    width: "100%",
  },
  actionAnimated: {
    flex: 1,
    width: "100%",
  },
  action: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  renameLabel: {
    color: colors.secondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },
  deleteIcon: {
    width: 19,
    height: 19,
    transform: [{ rotate: "45deg" }],
  },
  deleteLabel: {
    color: colors.surface,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },
});
