import {
  Pressable,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import SettingsIcon from "../../assets/icons/Settings_but.svg";
import { colors } from "../theme/colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type SettingsButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SettingsButton({ onPress, style }: SettingsButtonProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={style}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 70 });
        rotate.value = withTiming(12, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 350,
        });

        rotate.value = withSpring(0, {
          damping: 18,
          stiffness: 350,
        });
      }}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <SettingsIcon width={30} height={30} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 28,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: colors.surface,

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
});
