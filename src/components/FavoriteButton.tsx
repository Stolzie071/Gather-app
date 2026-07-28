import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { FavoriteFillIcon, FavoriteOutlineIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

type FavoriteButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  active?: boolean;
};

export function FavoriteButton({
  onPress,
  style,
  compact = false,
  active = false,
}: FavoriteButtonProps) {
  const scale = useSharedValue(1);
  const Icon = active ? FavoriteFillIcon : FavoriteOutlineIcon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={style}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 70 });
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
        <Icon
          width={compact ? 19 : 20}
          height={compact ? 26 : 28}
          color={colors.secondary2}
        />
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

    elevation: 6,
    shadowColor: colors.primary,

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
