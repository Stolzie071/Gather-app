import { Pressable, StyleSheet, Text, View } from "react-native";
import { Squircle } from "./Squircle";
import { colors } from "../theme/colors";
import type { ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type ButtonProps = {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon: ReactNode;
  rightIcon: ReactNode;
};

export function Button({
  text,
  onPress,
  variant = "primary",
  icon,
  rightIcon,
}: ButtonProps) {
  const fillColor = variant === "primary" ? colors.primary : colors.surface;
  const textColor =
    variant === "primary" ? styles.primaryText : styles.secondaryText;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.965, {
          duration: 70,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
    >
      <Animated.View style={animatedStyle}>
        <View style={styles.shadow}>
          <Squircle
            style={styles.button}
            cornerRadius={20}
            fillColor={fillColor}
          >
            <View style={styles.leftContent}>
              {icon}

              <Text style={[styles.text, textColor]}>{text}</Text>
            </View>

            <View style={styles.arrowContainer}>{rightIcon}</View>
          </Squircle>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 320,
    height: 78,
    paddingHorizontal: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  text: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },

  primaryText: {
    color: colors.surface,
  },

  secondaryText: {
    color: colors.textPrimary,
  },

  shadow: {
    borderRadius: 20,

    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 15,
        spreadDistance: 3,
        color: "rgba(158, 124, 228, 0.4)",
      },
    ],
  },

  arrowContainer: {
    width: 10,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
});
