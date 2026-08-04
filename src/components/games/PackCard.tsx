import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SelectionIndicator } from "@/components/SelectionIndicator";
import { Squircle } from "@/components/Squircle";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

type PackCardProps = {
  illustration: ReactNode;
  title: string;
  wordCountLabel: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function PackCard({
  illustration,
  title,
  wordCountLabel,
  selected,
  disabled = false,
  onPress,
}: PackCardProps) {
  const { playSelection } = useAppHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => {
        playSelection();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 75 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.shadow,
          selected && styles.shadowSelected,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Squircle
          style={styles.card}
          cornerRadius={20}
          fillColor={selected ? colors.secondary3 : colors.surface}
          strokeColor={selected ? colors.primary : undefined}
          strokeWidth={selected ? 1.5 : undefined}
        >
          <View pointerEvents="none" style={styles.illustration}>
            {illustration}
          </View>

          <View style={styles.information}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.wordCount} numberOfLines={1}>
              {wordCountLabel}
            </Text>
          </View>

          <View pointerEvents="none" style={styles.selection}>
            <SelectionIndicator selected={selected} />
          </View>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },

  shadow: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.surface,

    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 5,
        spreadDistance: 0,
        color: "rgba(118, 92, 172, 0.25)",
      },
    ],
  },

  shadowSelected: {
    backgroundColor: colors.secondary3,
  },

  disabled: {
    opacity: 0.45,
  },

  card: {
    width: "100%",
    height: 112,
    paddingLeft: 14,
    paddingRight: 22,

    flexDirection: "row",
    alignItems: "center",

    overflow: "hidden",
  },

  illustration: {
    width: 116,
    height: 84,

    alignItems: "center",
    justifyContent: "center",
  },

  information: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 32,
    gap: 2,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },

  wordCount: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
  },

  selection: {
    position: "absolute",
    top: 46,
    right: 22,
  },
});
