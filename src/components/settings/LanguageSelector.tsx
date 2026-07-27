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

export type Language = "ru" | "en";

type LanguageSelectorProps = {
  value: Language;
  onValueChange: (language: Language) => void;
  compact?: boolean;
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

export function LanguageSelector({
  value,
  onValueChange,
  compact = false,
}: LanguageSelectorProps) {
  const size = compact ? SELECTOR_SIZES.compact : SELECTOR_SIZES.regular;

  const verticalInset = (TOUCH_HEIGHT - size.visualHeight) / 2;
  const optionWidth = size.width / 2;
  const selectedProgress = useSharedValue(value === "en" ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(value === "en" ? 1 : 0, {
      duration: 130,
    });
  }, [value, selectedProgress]);

  const animatedSelectedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: selectedProgress.value * optionWidth,
        },
      ],
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
    };
  });

  const animatedRussianTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [colors.surface, colors.secondary],
      ),
    };
  });

  const animatedEnglishTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [colors.secondary, colors.surface],
      ),
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: size.width,
          height: TOUCH_HEIGHT,
        },
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
        <Pressable style={styles.option} onPress={() => onValueChange("ru")}>
          <Animated.Text
            style={[
              styles.text,
              {
                fontSize: size.fontSize,
              },
              animatedRussianTextStyle,
            ]}
          >
            Рус
          </Animated.Text>
        </Pressable>

        <Pressable style={styles.option} onPress={() => onValueChange("en")}>
          <Animated.Text
            style={[
              styles.text,
              {
                fontSize: size.fontSize,
              },
              animatedEnglishTextStyle,
            ]}
          >
            Eng
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

  outline: {
    position: "absolute",
    left: 0,
    right: 0,

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
