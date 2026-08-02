import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import type { ReactNode } from "react";
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
  textStyle?: StyleProp<TextStyle>;
  cornerRadius?: number;
  leftDecoration?: ReactNode;
  rightDecoration?: ReactNode;
  disabled?: boolean;
};

export function GameStartButton({
  text,
  onPress,
  style,
  textStyle,
  cornerRadius = 20,
  leftDecoration,
  rightDecoration,
  disabled = false,
}: GameStartButtonProps) {
  const scale = useSharedValue(1);
  const hasDecorations = Boolean(leftDecoration || rightDecoration);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
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
      accessibilityState={{ disabled }}
      style={style}
    >
      <Animated.View
        style={[
          styles.shadow,
          { borderRadius: cornerRadius },
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Squircle
          style={[
            styles.button,
            hasDecorations && styles.buttonWithDecorations,
          ]}
          cornerRadius={cornerRadius}
          fillColor={colors.primary}
        >
          {leftDecoration}
          <Text
            style={[
              styles.text,
              hasDecorations && styles.decoratedText,
              textStyle,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={!hasDecorations}
          >
            {text}
          </Text>
          {rightDecoration}
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: "100%",
    height: "100%",

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

  disabled: {
    opacity: 0.5,
  },

  button: {
    width: "100%",
    height: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  buttonWithDecorations: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    flexDirection: "row",
    gap: 16,
  },

  text: {
    width: "100%",
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    textAlign: "center",
  },

  decoratedText: {
    flex: 1,
    width: "auto",
  },
});
