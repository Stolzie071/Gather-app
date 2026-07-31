import { useEffect, useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";

const THUMB_INSET = 2;
const ANIMATION_DURATION = 160;

const SWITCH_SIZES = {
  regular: {
    trackWidth: 56,
    trackHeight: 28,
    thumbSize: 24,
  },

  compact: {
    trackWidth: 48,
    trackHeight: 24,
    thumbSize: 20,
  },
};

type AnimatedSwitchProps = {
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
  compact?: boolean;
};

export function AnimatedSwitch({
  value,
  onValueChange,
  compact = false,
}: AnimatedSwitchProps) {
  const size = compact ? SWITCH_SIZES.compact : SWITCH_SIZES.regular;

  const thumbTravelDistance =
    size.trackWidth - size.thumbSize - THUMB_INSET * 2;

  const thumbTranslateX = useSharedValue(value ? thumbTravelDistance : 0);
  const trackProgress = useSharedValue(value ? 1 : 0);
  const internallyRequestedValue = useRef<boolean | null>(null);
  const visualValue = useRef(value);

  useEffect(() => {
    visualValue.current = value;

    if (internallyRequestedValue.current === value) {
      internallyRequestedValue.current = null;
      return;
    }

    thumbTranslateX.value = withTiming(value ? thumbTravelDistance : 0, {
      duration: ANIMATION_DURATION,
    });
    trackProgress.value = withTiming(value ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [value, thumbTravelDistance, thumbTranslateX, trackProgress]);

  const handlePress = () => {
    const nextValue = !visualValue.current;
    visualValue.current = nextValue;
    internallyRequestedValue.current = nextValue;

    thumbTranslateX.value = withTiming(
      nextValue ? thumbTravelDistance : 0,
      { duration: ANIMATION_DURATION },
      (finished) => {
        if (finished) {
          runOnJS(onValueChange)(nextValue);
        }
      },
    );
    trackProgress.value = withTiming(nextValue ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  };

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: thumbTranslateX.value,
        },
      ],
    };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        trackProgress.value,
        [0, 1],
        ["#CFCDD9", colors.primary],
      ),
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.track,
        {
          width: size.trackWidth,
          height: size.trackHeight,
          borderRadius: size.trackHeight / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.trackBackground,
          {
            borderRadius: size.trackHeight / 2,
          },
          animatedTrackStyle,
        ]}
      />

      <Animated.View
        style={[
          styles.thumb,
          {
            left: THUMB_INSET,
            top: THUMB_INSET,
            width: size.thumbSize,
            height: size.thumbSize,
            borderRadius: size.thumbSize / 2,
          },
          animatedThumbStyle,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trackBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  track: {
    position: "relative",
  },

  thumb: {
    position: "absolute",
    backgroundColor: colors.surface,
  },
});
