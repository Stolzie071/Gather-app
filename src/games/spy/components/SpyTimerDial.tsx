import { memo, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme/colors";

type SpyTimerDialProps = {
  label: string;
  message?: string;
  progress: number;
  progressColor?: string;
  size?: number;
};

const STROKE_WIDTH = 8;
const OUTLINE_WIDTH = 4;

export const SpyTimerDial = memo(function SpyTimerDial({
  label,
  message,
  progress,
  progressColor = colors.primary,
  size = 310,
}: SpyTimerDialProps) {
  const center = size / 2;
  const dialSize = size - OUTLINE_WIDTH * 2;
  const dialCenter = dialSize / 2;
  const normalizedProgress = Math.min(1, Math.max(0, progress));
  const innerSize = dialSize - STROKE_WIDTH * 2;
  const progressRadius = dialCenter - STROKE_WIDTH / 2;
  const progressCapSize = STROKE_WIDTH;
  const animatedProgress = useSharedValue(normalizedProgress);
  const previousProgress = useRef(normalizedProgress);

  useEffect(() => {
    const isReset = normalizedProgress > previousProgress.current;

    animatedProgress.value = withTiming(normalizedProgress, {
      duration: isReset ? 250 : 1_000,
      easing: Easing.linear,
    });
    previousProgress.current = normalizedProgress;
  }, [animatedProgress, normalizedProgress]);

  const firstHalfAnimatedStyle = useAnimatedStyle(() => {
    const rotation = -180 + Math.min(animatedProgress.value, 0.5) * 360;

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const secondHalfAnimatedStyle = useAnimatedStyle(() => {
    const rotation =
      -180 + Math.max(0, animatedProgress.value - 0.5) * 360;

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const progressEndCapAnimatedStyle = useAnimatedStyle(() => {
    const progressEndAngle = -90 + animatedProgress.value * 360;
    const progressEndAngleRadians = (progressEndAngle * Math.PI) / 180;

    return {
      left:
        dialCenter +
        Math.cos(progressEndAngleRadians) * progressRadius -
        progressCapSize / 2,
      top:
        dialCenter +
        Math.sin(progressEndAngleRadians) * progressRadius -
        progressCapSize / 2,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: center,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.flatShadow,
          {
            borderRadius: center - 8,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.outline,
          {
            borderRadius: center,
          },
        ]}
      />

      <View
        style={[
          styles.dial,
          {
            top: OUTLINE_WIDTH,
            right: OUTLINE_WIDTH,
            bottom: OUTLINE_WIDTH,
            left: OUTLINE_WIDTH,
            borderRadius: dialCenter,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.progressClip,
            styles.rightProgressClip,
            {
              width: dialCenter,
              height: dialSize,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressHalf,
              styles.rightProgressHalf,
              firstHalfAnimatedStyle,
              {
                width: dialCenter,
                height: dialSize,
                borderTopRightRadius: dialCenter,
                borderBottomRightRadius: dialCenter,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.progressClip,
            styles.leftProgressClip,
            {
              width: dialCenter,
              height: dialSize,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressHalf,
              styles.leftProgressHalf,
              secondHalfAnimatedStyle,
              {
                width: dialCenter,
                height: dialSize,
                borderTopLeftRadius: dialCenter,
                borderBottomLeftRadius: dialCenter,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        />

        {normalizedProgress > 0 && (
          <>
            <View
              pointerEvents="none"
              style={[
                styles.progressCap,
                {
                  top: 0,
                  left: dialCenter - progressCapSize / 2,
                  width: progressCapSize,
                  height: progressCapSize,
                  borderRadius: progressCapSize / 2,
                  backgroundColor: progressColor,
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.progressCap,
                progressEndCapAnimatedStyle,
                {
                  width: progressCapSize,
                  height: progressCapSize,
                  borderRadius: progressCapSize / 2,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </>
        )}

        {message ? (
          <View style={[styles.statusText, { width: size * 0.7 }]}>
            <Text
              style={[
                styles.statusTitle,
                {
                  fontSize: size * 0.09,
                  lineHeight: size * 0.12,
                },
              ]}
            >
              {label}
            </Text>
            <Text
              style={[
                styles.statusMessage,
                {
                  fontSize: size * 0.046,
                  lineHeight: size * 0.064,
                },
              ]}
            >
              {message}
            </Text>
          </View>
        ) : (
          <Text
            style={[styles.label, { fontSize: size * 0.22 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  flatShadow: {
    position: "absolute",
    top: 14,
    right: 8,
    bottom: -2,
    left: 8,
    backgroundColor: "rgba(47, 37, 86, 0.14)",
  },

  outline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },

  dial: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.secondary4,
  },

  progressClip: {
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },

  rightProgressClip: {
    right: 0,
  },

  leftProgressClip: {
    left: 0,
  },

  progressHalf: {
    position: "absolute",
    top: 0,
    backgroundColor: colors.primary,
  },

  progressCap: {
    position: "absolute",
    backgroundColor: colors.primary,
  },

  rightProgressHalf: {
    left: 0,
    transformOrigin: "left center",
  },

  leftProgressHalf: {
    right: 0,
    transformOrigin: "right center",
  },

  innerCircle: {
    position: "absolute",
    backgroundColor: colors.surface,
  },

  label: {
    position: "absolute",
    right: 24,
    left: 24,
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    textAlign: "center",
  },

  statusText: {
    alignItems: "center",
    gap: 8,
  },

  statusTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    textAlign: "center",
  },

  statusMessage: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
});
