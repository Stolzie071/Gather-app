import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";

type StepperButtonProps = {
  operation: "decrease" | "increase";
  disabled: boolean;
  onPress: () => void;
};

function StepperButton({
  operation,
  disabled,
  onPress,
}: StepperButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={operation}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 350,
        });
      }}
    >
      <Animated.View
        style={[styles.button, disabled && styles.buttonDisabled, animatedStyle]}
      >
        <View style={styles.horizontalLine} />
        {operation === "increase" && <View style={styles.verticalLine} />}
      </Animated.View>
    </Pressable>
  );
}

type NumberStepperProps = {
  value: number;
  suffix?: string;
  minimum: number;
  maximum: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function NumberStepper({
  value,
  suffix,
  minimum,
  maximum,
  disabled = false,
  onDecrease,
  onIncrease,
}: NumberStepperProps) {
  return (
    <View style={styles.container}>
      <StepperButton
        operation="decrease"
        disabled={disabled || value <= minimum}
        onPress={onDecrease}
      />

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>

      <StepperButton
        operation="increase"
        disabled={disabled || value >= maximum}
        onPress={onIncrease}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  button: {
    width: 44,
    height: 44,
    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.secondary3,
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  horizontalLine: {
    position: "absolute",
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textPrimary,
  },

  verticalLine: {
    position: "absolute",
    width: 3,
    height: 20,
    borderRadius: 1.5,
    backgroundColor: colors.textPrimary,
  },

  valueContainer: {
    minWidth: 48,

    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
  },

  value: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    lineHeight: 40,
  },

  suffix: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
