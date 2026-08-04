import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ArrowIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

type NavigationButtonProps = {
  label: string;
  direction: "back" | "next";
  variant: "secondary" | "primary";
  disabled?: boolean;
  onPress: () => void;
};

function NavigationButton({
  label,
  direction,
  variant,
  disabled = false,
  onPress,
}: NavigationButtonProps) {
  const { playNextStep } = useAppHaptics();
  const scale = useSharedValue(1);
  const isPrimary = variant === "primary";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        playNextStep();
        onPress();
      }}
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
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.animatedButton,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Squircle
          style={styles.button}
          cornerRadius={14}
          fillColor={isPrimary ? colors.primary : colors.secondary3}
          strokeColor={isPrimary ? undefined : colors.secondary4}
          strokeWidth={isPrimary ? undefined : 1}
        >
          {direction === "back" && (
            <ArrowIcon
              width={7}
              height={13}
              color={colors.secondary}
              style={styles.backArrow}
            />
          )}

          <Text style={[styles.label, isPrimary && styles.primaryLabel]}>
            {label}
          </Text>

          {direction === "next" && (
            <ArrowIcon
              width={7}
              height={13}
              color={colors.surface}
            />
          )}
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type SetupStepNavigationProps = {
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
  bottomInset: number;
  onBack: () => void;
  onNext: () => void;
};

export function SetupStepNavigation({
  backLabel,
  nextLabel,
  nextDisabled = false,
  bottomInset,
  onBack,
  onNext,
}: SetupStepNavigationProps) {
  return (
    <View style={[styles.container, { bottom: bottomInset + 16 }]}>
      <NavigationButton
        label={backLabel}
        direction="back"
        variant="secondary"
        onPress={onBack}
      />
      <NavigationButton
        label={nextLabel}
        direction="next"
        variant="primary"
        disabled={nextDisabled}
        onPress={onNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    left: 16,
    height: 48,

    flexDirection: "row",
    gap: 8,
  },

  pressable: {
    flex: 1,
  },

  animatedButton: {
    width: "100%",
    height: "100%",
    elevation: 0,
    shadowOpacity: 0,
    boxShadow: [],
  },

  disabled: {
    opacity: 0.5,
  },

  button: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  label: {
    color: colors.secondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },

  primaryLabel: {
    color: colors.surface,
  },

  backArrow: {
    transform: [{ rotate: "180deg" }],
  },
});
