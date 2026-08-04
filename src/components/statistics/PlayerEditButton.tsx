import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SpySummaryPenIcon } from "@assets/Spy_game/4_step";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { colors } from "@/theme/colors";

type PlayerEditButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  accessibilityLabel: string;
};

export function PlayerEditButton({
  onPress,
  style,
  compact = false,
  accessibilityLabel,
}: PlayerEditButtonProps) {
  const { playTopAction } = useAppHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        playTopAction();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 350 });
      }}
      hitSlop={8}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.button,
          compact && styles.buttonCompact,
          animatedStyle,
        ]}
      >
        <SpySummaryPenIcon
          width={compact ? 22 : 24}
          height={compact ? 22 : 24}
          color={colors.secondary2}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 10,
        spreadDistance: 3,
        color: "rgba(158, 124, 228, 0.25)",
      },
    ],
  },
  buttonCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
