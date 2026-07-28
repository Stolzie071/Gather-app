import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet } from "react-native";

import { BackIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type BackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function BackButton({
  onPress,
  style,
  compact = false,
}: BackButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onPress={onPress}
      style={style}
      hitSlop={8}
      onPressIn={() => {
        scale.value = withTiming(0.92, {
          duration: 70,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 350,
        });
      }}
    >
      <Animated.View
        style={[
          styles.container,
          compact && styles.containerCompact,
          animatedStyle,
        ]}
      >
        <BackIcon width={compact ? 26 : 30} height={compact ? 16 : 20} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  containerCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
