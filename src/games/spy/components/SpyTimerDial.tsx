import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type SpyTimerDialProps = {
  label: string;
  progress: number;
  size?: number;
};

const STROKE_WIDTH = 8;
const OUTLINE_WIDTH = 4;

export const SpyTimerDial = memo(function SpyTimerDial({
  label,
  progress,
  size = 310,
}: SpyTimerDialProps) {
  const center = size / 2;
  const dialSize = size - OUTLINE_WIDTH * 2;
  const dialCenter = dialSize / 2;
  const normalizedProgress = Math.min(1, Math.max(0, progress));
  const firstHalfRotation = -180 + Math.min(normalizedProgress, 0.5) * 360;
  const secondHalfRotation =
    -180 + Math.max(0, normalizedProgress - 0.5) * 360;
  const innerSize = dialSize - STROKE_WIDTH * 2;
  const progressRadius = dialCenter - STROKE_WIDTH / 2;
  const progressEndAngle = -90 + normalizedProgress * 360;
  const progressEndAngleRadians = (progressEndAngle * Math.PI) / 180;
  const progressCapSize = STROKE_WIDTH;
  const progressEndCapLeft =
    dialCenter + Math.cos(progressEndAngleRadians) * progressRadius -
    progressCapSize / 2;
  const progressEndCapTop =
    dialCenter + Math.sin(progressEndAngleRadians) * progressRadius -
    progressCapSize / 2;

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
          <View
            style={[
              styles.progressHalf,
              styles.rightProgressHalf,
              {
                width: dialCenter,
                height: dialSize,
                borderTopRightRadius: dialCenter,
                borderBottomRightRadius: dialCenter,
                transform: [{ rotate: `${firstHalfRotation}deg` }],
              },
            ]}
          />
        </View>

        {normalizedProgress > 0.5 && (
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
            <View
              style={[
                styles.progressHalf,
                styles.leftProgressHalf,
                {
                  width: dialCenter,
                  height: dialSize,
                  borderTopLeftRadius: dialCenter,
                  borderBottomLeftRadius: dialCenter,
                  transform: [{ rotate: `${secondHalfRotation}deg` }],
                },
              ]}
            />
          </View>
        )}

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
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.progressCap,
                {
                  top: progressEndCapTop,
                  left: progressEndCapLeft,
                  width: progressCapSize,
                  height: progressCapSize,
                  borderRadius: progressCapSize / 2,
                },
              ]}
            />
          </>
        )}

        <Text
          style={[styles.label, { fontSize: size * 0.22 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
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
});
