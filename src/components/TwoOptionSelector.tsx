import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";

export type TwoOptionValue = "left" | "right";

type TwoOptionSelectorProps = {
  value: TwoOptionValue;
  leftLabel: string;
  rightLabel: string;
  onValueChange: (value: TwoOptionValue) => void;
  compact?: boolean;
  disabled?: boolean;
};

const TOUCH_HEIGHT = 48;

const SELECTOR_SIZES = {
  regular: {
    width: 116,
    visualHeight: 40,
    cornerRadius: 12,
    fontSize: 16,
  },
  compact: {
    width: 104,
    visualHeight: 36,
    cornerRadius: 10,
    fontSize: 14,
  },
};

export function TwoOptionSelector({
  value,
  leftLabel,
  rightLabel,
  onValueChange,
  compact = false,
  disabled = false,
}: TwoOptionSelectorProps) {
  const size = compact ? SELECTOR_SIZES.compact : SELECTOR_SIZES.regular;
  const verticalInset = (TOUCH_HEIGHT - size.visualHeight) / 2;
  const optionWidth = size.width / 2;
  const selectedProgress = useSharedValue(value === "right" ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(value === "right" ? 1 : 0, {
      duration: 130,
    });
  }, [selectedProgress, value]);

  const animatedSelectedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectedProgress.value * optionWidth }],
    borderTopLeftRadius: interpolate(
      selectedProgress.value,
      [0, 1],
      [size.cornerRadius, 0],
    ),
    borderBottomLeftRadius: interpolate(
      selectedProgress.value,
      [0, 1],
      [size.cornerRadius, 0],
    ),
    borderTopRightRadius: interpolate(
      selectedProgress.value,
      [0, 1],
      [0, size.cornerRadius],
    ),
    borderBottomRightRadius: interpolate(
      selectedProgress.value,
      [0, 1],
      [0, size.cornerRadius],
    ),
  }));

  const animatedLeftTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [colors.surface, colors.secondary],
    ),
  }));

  const animatedRightTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [colors.secondary, colors.surface],
    ),
  }));

  return (
    <View
      style={[
        styles.container,
        { width: size.width, height: TOUCH_HEIGHT },
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.outline,
          {
            top: verticalInset,
            height: size.visualHeight,
            borderRadius: size.cornerRadius,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.selectedBackground,
          {
            top: verticalInset,
            width: optionWidth,
            height: size.visualHeight,
          },
          animatedSelectedStyle,
        ]}
      />

      <View style={styles.options}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel={leftLabel}
          accessibilityState={{ checked: value === "left", disabled }}
          disabled={disabled}
          onPress={() => onValueChange("left")}
          style={styles.option}
        >
          <Animated.Text
            style={[
              styles.text,
              { fontSize: size.fontSize },
              animatedLeftTextStyle,
            ]}
          >
            {leftLabel}
          </Animated.Text>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityLabel={rightLabel}
          accessibilityState={{ checked: value === "right", disabled }}
          disabled={disabled}
          onPress={() => onValueChange("right")}
          style={styles.option}
        >
          <Animated.Text
            style={[
              styles.text,
              { fontSize: size.fontSize },
              animatedRightTextStyle,
            ]}
          >
            {rightLabel}
          </Animated.Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  disabled: {
    opacity: 0.45,
  },
  outline: {
    position: "absolute",
    right: 0,
    left: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary3,
  },
  options: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBackground: {
    position: "absolute",
    left: 0,
    backgroundColor: colors.primary,
  },
  text: {
    zIndex: 1,
    fontFamily: "Nunito_600SemiBold",
  },
});
