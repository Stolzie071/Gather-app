import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";

type AppSliderProps = {
  value: number;
  onValueChange: (nextValue: number) => void;
  compact?: boolean;
};

const SLIDER_SIZES = {
  regular: {
    width: 175,
    trackHeight: 6,
    thumbSize: 24,
  },

  compact: {
    width: 130,
    trackHeight: 5,
    thumbSize: 20,
  },
};

export function AppSlider({
  value,
  onValueChange,
  compact = false,
}: AppSliderProps) {
  const size = compact ? SLIDER_SIZES.compact : SLIDER_SIZES.regular;

  const thumbTravelDistance = size.width - size.thumbSize;
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = value;
  }, [value, progress]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      left: thumbTravelDistance * progress.value,
    };
  });

  const animatedFilledTrackStyle = useAnimatedStyle(() => {
    return {
      width: thumbTravelDistance * progress.value,
    };
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .failOffsetY([-10, 10])
    .onStart((event) => {
      const nextProgress = (event.x - size.thumbSize / 2) / thumbTravelDistance;

      progress.value = Math.min(Math.max(nextProgress, 0), 1);
    })
    .onUpdate((event) => {
      const nextProgress = (event.x - size.thumbSize / 2) / thumbTravelDistance;

      progress.value = Math.min(Math.max(nextProgress, 0), 1);
    })
    .onEnd(() => {
      runOnJS(onValueChange)(progress.value);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.container,
          {
            width: size.width,
            height: size.thumbSize,
          },
        ]}
      >
        <View
          style={[
            styles.track,
            {
              left: size.thumbSize / 2,
              right: size.thumbSize / 2,
              height: size.trackHeight,
              borderRadius: size.trackHeight / 2,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.filledTrack,
              {
                borderRadius: size.trackHeight / 2,
              },
              animatedFilledTrackStyle,
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.thumb,
            {
              width: size.thumbSize,
              height: size.thumbSize,
              borderRadius: size.thumbSize / 2,
            },
            animatedThumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
  },

  track: {
    position: "absolute",

    overflow: "hidden",
    backgroundColor: colors.secondary3,
  },

  filledTrack: {
    height: "100%",
    backgroundColor: colors.primary,
  },

  thumb: {
    position: "absolute",
    top: 0,

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.secondary3,

    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 6,
        spreadDistance: 0,
        color: "rgba(0, 0, 0, 0.18)",
      },
    ],
  },
});
