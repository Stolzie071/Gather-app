import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";
import { Squircle } from "@/components/Squircle";

type GameStartButtonProps = {
  text: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GameStartButton({
  text,
  onPress,
  style,
}: GameStartButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
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
      accessibilityRole="button"
      style={style}
    >
      <Animated.View style={[styles.shadow, animatedStyle]}>
        <Squircle
          style={styles.button}
          cornerRadius={20}
          fillColor={colors.primary}
        >
          <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
            {text}
          </Text>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: "100%",
    height: "100%",
    borderRadius: 20,

    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 15,
        spreadDistance: 0,
        color: "rgba(158, 124, 228, 0.4)",
      },
    ],
  },

  button: {
    width: "100%",
    height: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    width: "100%",
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    textAlign: "center",
  },
});
