import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { PlayerAvatar } from "@/players/types";
import { getPlayerPhotoUri } from "@/storage/playerPhotoStorage";
import { colors } from "@/theme/colors";

const MAX_SCALE = 5;
const SAVED_TOAST_DURATION = 1800;

function clamp(value: number, maximum: number) {
  "worklet";
  return Math.max(-maximum, Math.min(maximum, value));
}

type DetailMenuActionProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

function DetailMenuAction({
  label,
  disabled = false,
  onPress,
}: DetailMenuActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={styles.menuActionPressable}
    >
      {({ pressed }) => (
        <Squircle
          style={[styles.menuAction, disabled && styles.menuActionDisabled]}
          cornerRadius={10}
          fillColor={pressed ? colors.secondary3 : colors.surface}
        >
          <Text style={styles.menuActionLabel}>{label}</Text>
        </Squircle>
      )}
    </Pressable>
  );
}

type PlayerAvatarDetailViewerProps = {
  visible: boolean;
  avatar: PlayerAvatar;
  editable: boolean;
  onClose: () => void;
  onReplace: () => void;
};

export function PlayerAvatarDetailViewer({
  visible,
  avatar,
  editable,
  onClose,
  onReplace,
}: PlayerAvatarDetailViewerProps) {
  const { t } = useLocalization();
  const { playTopAction, playSuccess } = useAppHaptics();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureStartScale = useSharedValue(1);
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const onCloseRef = useRef(onClose);
  const savedToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageSize = Math.min(screenWidth, 520);
  const hasMenuActions = editable || avatar.type === "photo";

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!visible) {
      setIsSavedToastVisible(false);

      if (savedToastTimerRef.current) {
        clearTimeout(savedToastTimerRef.current);
        savedToastTimerRef.current = null;
      }

      return;
    }

    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    setMenuOpen(false);
  }, [avatar, scale, translateX, translateY, visible]);

  useEffect(
    () => () => {
      if (savedToastTimerRef.current) {
        clearTimeout(savedToastTimerRef.current);
      }
    },
    [],
  );

  const showSavedToast = useCallback(() => {
    if (savedToastTimerRef.current) {
      clearTimeout(savedToastTimerRef.current);
    }

    setIsSavedToastVisible(true);
    savedToastTimerRef.current = setTimeout(() => {
      setIsSavedToastVisible(false);
      savedToastTimerRef.current = null;
    }, SAVED_TOAST_DURATION);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (menuOpen) {
          setMenuOpen(false);
        } else {
          onCloseRef.current();
        }

        return true;
      },
    );

    return () => subscription.remove();
  }, [menuOpen, visible]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onBegin(() => {
          gestureStartX.value = translateX.value;
          gestureStartY.value = translateY.value;
        })
        .onUpdate((event) => {
          const maximum = (imageSize * (scale.value - 1)) / 2;

          translateX.value = clamp(
            gestureStartX.value + event.translationX,
            maximum,
          );
          translateY.value = clamp(
            gestureStartY.value + event.translationY,
            maximum,
          );
        }),
    [gestureStartX, gestureStartY, imageSize, scale, translateX, translateY],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onBegin(() => {
          gestureStartScale.value = scale.value;
          gestureStartX.value = translateX.value;
          gestureStartY.value = translateY.value;
        })
        .onUpdate((event) => {
          const nextScale = Math.max(
            1,
            Math.min(MAX_SCALE, gestureStartScale.value * event.scale),
          );
          const maximum = (imageSize * (nextScale - 1)) / 2;

          scale.value = nextScale;
          translateX.value = clamp(gestureStartX.value, maximum);
          translateY.value = clamp(gestureStartY.value, maximum);
        }),
    [
      gestureStartScale,
      gestureStartX,
      gestureStartY,
      imageSize,
      scale,
      translateX,
      translateY,
    ],
  );

  const imageGesture = useMemo(
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

  const handleSavePhoto = useCallback(async () => {
    if (avatar.type !== "photo" || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        Alert.alert(
          t("statistics.playerDetails.avatar.save.permissionTitle"),
          t("statistics.playerDetails.avatar.save.permissionMessage"),
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(
        getPlayerPhotoUri(avatar.fileName),
      );
      playSuccess();
      setMenuOpen(false);
      showSavedToast();
    } catch (error: unknown) {
      console.warn("Failed to save player photo to the media library", error);
      Alert.alert(
        t("statistics.playerDetails.avatar.save.errorTitle"),
        t("statistics.playerDetails.avatar.save.errorMessage"),
      );
    } finally {
      setIsSaving(false);
    }
  }, [avatar, isSaving, playSuccess, showSavedToast, t]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={styles.container}
    >
      <GestureDetector gesture={imageGesture}>
        <View
          style={[
            styles.imageViewport,
            {
              width: imageSize,
              height: imageSize,
              top: (screenHeight - imageSize) / 2,
            },
          ]}
        >
          <Animated.View
            style={[styles.imageTransform, { width: imageSize, height: imageSize }, imageStyle]}
          >
            {avatar.type === "photo" ? (
              <Image
                source={{ uri: getPlayerPhotoUri(avatar.fileName) }}
                resizeMode="cover"
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <PlayerAvatarView avatar={avatar} size={imageSize} />
            )}
          </Animated.View>
        </View>
      </GestureDetector>

      {menuOpen && (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View style={[styles.header, { top: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("statistics.playerDetails.avatar.closeDetail")}
          onPress={onClose}
          style={styles.roundButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </Pressable>

        {hasMenuActions && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("statistics.playerDetails.avatar.openMenu")}
            onPress={() => {
              playTopAction();
              setMenuOpen((current) => !current);
            }}
            style={styles.roundButton}
          >
            <View pointerEvents="none" style={styles.menuDots}>
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </View>
          </Pressable>
        )}
      </View>

      {menuOpen && (
        <Animated.View
          entering={FadeInDown.duration(160)}
          exiting={FadeOutUp.duration(120)}
          style={[styles.menuPosition, { top: insets.top + 68 }]}
        >
          <Squircle
            style={styles.menu}
            cornerRadius={14}
            fillColor={colors.surface}
            strokeColor={colors.secondary4}
            strokeWidth={1}
          >
            {avatar.type === "photo" && (
              <DetailMenuAction
                disabled={isSaving}
                label={t("statistics.playerDetails.avatar.saveToGallery")}
                onPress={() => void handleSavePhoto()}
              />
            )}

            {avatar.type === "photo" && editable && (
              <View style={styles.menuDivider} />
            )}

            {editable && (
              <DetailMenuAction
                label={t("statistics.playerDetails.avatar.replace")}
                onPress={() => {
                  setMenuOpen(false);
                  onReplace();
                }}
              />
            )}
          </Squircle>
        </Animated.View>
      )}

      {!isSavedToastVisible && (
        <Text
          pointerEvents="none"
          style={[styles.hint, { bottom: Math.max(insets.bottom + 20, 28) }]}
        >
          {t("statistics.playerDetails.avatar.zoomHint")}
        </Text>
      )}

      {isSavedToastVisible && (
        <Animated.View
          entering={FadeInUp.duration(160)}
          exiting={FadeOutDown.duration(140)}
          pointerEvents="none"
          style={[
            styles.savedToastPosition,
            { bottom: Math.max(insets.bottom + 20, 28) },
          ]}
        >
          <Squircle
            style={styles.savedToast}
            cornerRadius={16}
            fillColor="rgba(254, 254, 253, 0.96)"
          >
            <Text style={styles.savedToastLabel}>
              {t("statistics.playerDetails.avatar.save.savedToast")}
            </Text>
          </Squircle>
        </Animated.View>
      )}

      <StatusBar style="light" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    overflow: "hidden",
    backgroundColor: "#171220",
  },
  imageViewport: {
    position: "absolute",
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  imageTransform: {
    position: "absolute",
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(254, 254, 253, 0.94)",
  },
  closeIcon: {
    marginTop: -2,
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 34,
    lineHeight: 38,
  },
  menuDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textPrimary,
  },
  menuPosition: {
    position: "absolute",
    right: 16,
    width: 220,
  },
  menu: {
    width: "100%",
    overflow: "hidden",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 8,
        spreadDistance: 0,
        color: "rgba(0, 0, 0, 0.25)",
      },
    ],
  },
  menuActionPressable: {
    width: "100%",
  },
  menuAction: {
    width: "100%",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "flex-start",
  },
  menuActionDisabled: {
    opacity: 0.55,
  },
  menuActionLabel: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    lineHeight: 22,
    includeFontPadding: false,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: colors.secondary4,
  },
  savedToastPosition: {
    position: "absolute",
    right: 24,
    left: 24,
    alignItems: "center",
  },
  savedToast: {
    minWidth: 112,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 8,
        spreadDistance: 0,
        color: "rgba(0, 0, 0, 0.28)",
      },
    ],
  },
  savedToastLabel: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    lineHeight: 21,
  },
  hint: {
    position: "absolute",
    left: 24,
    right: 24,
    color: "rgba(254, 254, 253, 0.7)",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
