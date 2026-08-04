import { useCallback, useEffect, useMemo } from "react";
import {
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Squircle } from "@/components/Squircle";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { PlayerPhotoSource } from "@/storage/playerPhotoStorage";
import { colors } from "@/theme/colors";

const MAX_SCALE = 4;

function clampTranslation(value: number, maximum: number) {
  "worklet";
  return Math.max(-maximum, Math.min(maximum, value));
}

type PlayerPhotoCropperProps = {
  source: PlayerPhotoSource;
  onCancel: () => void;
  onConfirm: (source: PlayerPhotoSource) => void;
};

export function PlayerPhotoCropper({
  source,
  onCancel,
  onConfirm,
}: PlayerPhotoCropperProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureStartScale = useSharedValue(1);
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const gestureFocalX = useSharedValue(0);
  const gestureFocalY = useSharedValue(0);
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const headerTopGap = isCompactScreen ? 12 : 60;

  const cropSize = Math.max(
    200,
    Math.min(
      screenWidth - 32,
      screenHeight - insets.top - insets.bottom - 220,
      370,
    ),
  );
  const sourceAspect =
    source.width > 0 && source.height > 0 ? source.width / source.height : 1;
  const baseImageWidth = sourceAspect >= 1 ? cropSize * sourceAspect : cropSize;
  const baseImageHeight =
    sourceAspect >= 1 ? cropSize : cropSize / sourceAspect;

  useEffect(() => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  }, [scale, source.uri, translateX, translateY]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onCancel();
        return true;
      },
    );

    return () => subscription.remove();
  }, [onCancel]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onBegin(() => {
          gestureStartX.value = translateX.value;
          gestureStartY.value = translateY.value;
        })
        .onUpdate((event) => {
          const maximumX = Math.max(
            0,
            (baseImageWidth * scale.value - cropSize) / 2,
          );
          const maximumY = Math.max(
            0,
            (baseImageHeight * scale.value - cropSize) / 2,
          );

          translateX.value = clampTranslation(
            gestureStartX.value + event.translationX,
            maximumX,
          );
          translateY.value = clampTranslation(
            gestureStartY.value + event.translationY,
            maximumY,
          );
        }),
    [
      baseImageHeight,
      baseImageWidth,
      cropSize,
      gestureStartX,
      gestureStartY,
      scale,
      translateX,
      translateY,
    ],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart((event) => {
          gestureStartScale.value = scale.value;
          gestureStartX.value = translateX.value;
          gestureStartY.value = translateY.value;
          gestureFocalX.value = event.focalX - cropSize / 2;
          gestureFocalY.value = event.focalY - cropSize / 2;
        })
        .onUpdate((event) => {
          const nextScale = Math.max(
            1,
            Math.min(MAX_SCALE, gestureStartScale.value * event.scale),
          );
          const scaleRatio = nextScale / gestureStartScale.value;
          const requestedX =
            gestureFocalX.value +
            (gestureStartX.value - gestureFocalX.value) * scaleRatio;
          const requestedY =
            gestureFocalY.value +
            (gestureStartY.value - gestureFocalY.value) * scaleRatio;
          const maximumX = Math.max(
            0,
            (baseImageWidth * nextScale - cropSize) / 2,
          );
          const maximumY = Math.max(
            0,
            (baseImageHeight * nextScale - cropSize) / 2,
          );

          scale.value = nextScale;
          translateX.value = clampTranslation(requestedX, maximumX);
          translateY.value = clampTranslation(requestedY, maximumY);
        }),
    [
      baseImageHeight,
      baseImageWidth,
      cropSize,
      gestureFocalX,
      gestureFocalY,
      gestureStartScale,
      gestureStartX,
      gestureStartY,
      scale,
      translateX,
      translateY,
    ],
  );

  const cropGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture],
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleConfirm = useCallback(() => {
    if (source.width <= 0 || source.height <= 0) {
      onConfirm(source);
      return;
    }

    const displayedWidth = baseImageWidth * scale.value;
    const displayedHeight = baseImageHeight * scale.value;
    const pixelsPerPointX = source.width / displayedWidth;
    const pixelsPerPointY = source.height / displayedHeight;
    const cropWidth = Math.min(source.width, cropSize * pixelsPerPointX);
    const cropHeight = Math.min(source.height, cropSize * pixelsPerPointY);
    const imageLeft = (cropSize - displayedWidth) / 2 + translateX.value;
    const imageTop = (cropSize - displayedHeight) / 2 + translateY.value;
    const originX = Math.max(
      0,
      Math.min(source.width - cropWidth, -imageLeft * pixelsPerPointX),
    );
    const originY = Math.max(
      0,
      Math.min(source.height - cropHeight, -imageTop * pixelsPerPointY),
    );

    onConfirm({
      ...source,
      crop: {
        originX,
        originY,
        width: cropWidth,
        height: cropHeight,
      },
    });
  }, [
    baseImageHeight,
    baseImageWidth,
    cropSize,
    onConfirm,
    scale,
    source,
    translateX,
    translateY,
  ]);

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + headerTopGap }]}>
        <Text style={styles.title}>{t("playerSelection.crop.title")}</Text>
        <Text style={styles.subtitle}>
          {t("playerSelection.crop.subtitle")}
        </Text>
      </View>

      <View style={styles.cropArea}>
        <GestureDetector gesture={cropGesture}>
          <View
            style={[styles.viewport, { width: cropSize, height: cropSize }]}
          >
            <View
              style={[
                styles.circularClip,
                { borderRadius: cropSize / 2 },
              ]}
            >
              <Animated.View
                style={[
                  styles.imagePosition,
                  {
                    width: baseImageWidth,
                    height: baseImageHeight,
                    left: (cropSize - baseImageWidth) / 2,
                    top: (cropSize - baseImageHeight) / 2,
                  },
                  imageStyle,
                ]}
              >
                <Image
                  source={{ uri: source.uri }}
                  resizeMode="cover"
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>

            <Svg
              pointerEvents="none"
              width={cropSize}
              height={cropSize}
              style={StyleSheet.absoluteFillObject}
            >
              <Circle
                cx={cropSize / 2}
                cy={cropSize / 2}
                r={cropSize / 2 - 1.5}
                fill="none"
                stroke={colors.primary}
                strokeWidth={3}
              />
            </Svg>
          </View>
        </GestureDetector>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(16, insets.bottom + 8) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.footerAction}
        >
          <Squircle
            style={styles.footerButton}
            cornerRadius={12}
            fillColor={colors.secondary3}
            strokeColor={colors.secondary4}
            strokeWidth={1}
          >
            <Text style={styles.cancelLabel}>
              {t("playerSelection.crop.cancel")}
            </Text>
          </Squircle>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleConfirm}
          style={styles.footerAction}
        >
          <Squircle
            style={styles.footerButton}
            cornerRadius={12}
            fillColor={colors.primary}
          >
            <Text style={styles.confirmLabel}>
              {t("playerSelection.crop.confirm")}
            </Text>
          </Squircle>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
    backgroundColor: "#171220",
  },

  header: {
    paddingHorizontal: 24,
    alignItems: "center",
  },

  title: {
    color: colors.surface,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 4,
    color: "rgba(254, 254, 253, 0.72)",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },

  cropArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  viewport: {
    position: "relative",
  },

  circularClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#000000",
  },

  imagePosition: {
    position: "absolute",
  },

  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },

  footerAction: {
    flex: 1,
    height: 52,
  },

  footerButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    lineHeight: 23,
  },

  confirmLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    lineHeight: 23,
  },
});
