import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { colors } from "@/theme/colors";

export type StatisticsTab = "players" | "history";

type StatisticsTabsProps = {
  value: StatisticsTab;
  playersLabel: string;
  historyLabel: string;
  swipeProgress: SharedValue<number>;
  onValueChange: (value: StatisticsTab) => void;
};

const WIDTH = 289;
const HEIGHT = 37;
const OPTION_WIDTH = WIDTH / 2;

export function StatisticsTabs({
  value,
  playersLabel,
  historyLabel,
  swipeProgress,
  onValueChange,
}: StatisticsTabsProps) {
  const { playSelection } = useAppHaptics();

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeProgress.value * OPTION_WIDTH }],
  }));

  const playersTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.surface, colors.textSecondary],
    ),
  }));

  const historyTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.textSecondary, colors.surface],
    ),
  }));

  const handlePress = (nextValue: StatisticsTab) => {
    if (nextValue === value) {
      return;
    }

    playSelection();
    onValueChange(nextValue);
  };

  return (
    <Squircle
      style={styles.container}
      cornerRadius={14}
      fillColor={colors.secondary3}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <Squircle
          style={StyleSheet.absoluteFill}
          cornerRadius={14}
          fillColor={colors.primary}
        >
          <View />
        </Squircle>
      </Animated.View>

      <View style={styles.options}>
        <Pressable
          style={styles.option}
          onPress={() => handlePress("players")}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === "players" }}
        >
          <Animated.Text style={[styles.label, playersTextStyle]}>
            {playersLabel}
          </Animated.Text>
        </Pressable>

        <Pressable
          style={styles.option}
          onPress={() => handlePress("history")}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === "history" }}
        >
          <Animated.Text style={[styles.label, historyTextStyle]}>
            {historyLabel}
          </Animated.Text>
        </Pressable>
      </View>
    </Squircle>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: WIDTH,
    height: HEIGHT,
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: OPTION_WIDTH,
    height: HEIGHT,
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
  label: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
  },
});
