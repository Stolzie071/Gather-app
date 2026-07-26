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
  compact?: boolean;
};

export function Button({
  text,
  onPress,
  variant = "primary",
  icon,
  rightIcon,
  compact = false,
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
      style={styles.pressable}
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
      <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
        <View
          style={[styles.shadow, compact && styles.shadowCompact]}
        >
          <Squircle
            style={[styles.button, compact && styles.buttonCompact]}
            cornerRadius={compact ? 18 : 20}
            fillColor={fillColor}
          >
            <View
              style={[
                styles.leftContent,
                compact && styles.leftContentCompact,
              ]}
            >
              {icon}

              <Text
                style={[styles.text, compact && styles.textCompact, textColor]}
                numberOfLines={1}
              >
                {text}
              </Text>
            </View>

            <View
              style={[
                styles.arrowContainer,
                compact && styles.arrowContainerCompact,
              ]}
            >
              {rightIcon}
            </View>
          </Squircle>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 78,
    paddingHorizontal: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonCompact: {
    height: 64,
    paddingHorizontal: 24,
  },

  pressable: {
    width: "100%",
  },

  buttonWrapper: {
    width: "100%",
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexShrink: 1,
  },

  leftContentCompact: {
    gap: 12,
  },

  text: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    flexShrink: 1,
  },

  textCompact: {
    fontSize: 20,
  },

  primaryText: {
    color: colors.surface,
  },

  secondaryText: {
    color: colors.textPrimary,
  },

  shadow: {
    width: "100%",
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

  shadowCompact: {
    borderRadius: 18,
  },

  arrowContainer: {
    width: 10,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  arrowContainerCompact: {
    width: 9,
    height: 18,
  },
});
