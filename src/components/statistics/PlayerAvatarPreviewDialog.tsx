import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { PlayerAvatarPickerDialog } from "@/components/players/PlayerAvatarPickerDialog";
import { PlayerPhotoCropper } from "@/components/players/PlayerPhotoCropper";
import { PlayerAvatarDetailViewer } from "@/components/statistics/PlayerAvatarDetailViewer";
import { PlayerAvatarReplaceDialog } from "@/components/statistics/PlayerAvatarReplaceDialog";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { DEFAULT_PLAYER_AVATAR_ID } from "@/players/avatarPresets";
import type {
  PlayerAvatar,
  PlayerAvatarPresetId,
} from "@/players/types";
import type { PlayerPhotoSource } from "@/storage/playerPhotoStorage";
import { colors } from "@/theme/colors";

const SOURCE_FRAME_SIZE = 123;
const SOURCE_AVATAR_SIZE = 113;
const PREVIEW_MAX_SIZE = 280;

type PreviewButtonProps = {
  children: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function PreviewButton({
  children,
  destructive = false,
  disabled = false,
  onPress,
}: PreviewButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
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
      style={styles.buttonPressable}
    >
      <Animated.View
        style={[styles.buttonAnimated, disabled && styles.disabled, animatedStyle]}
      >
        <Squircle
          style={styles.button}
          cornerRadius={14}
          fillColor={destructive ? "#FDC7C7" : colors.secondary3}
          strokeColor={destructive ? "#ED1818" : colors.secondary4}
          strokeWidth={1}
        >
          <Text
            style={[
              styles.buttonLabel,
              destructive && styles.destructiveButtonLabel,
            ]}
          >
            {children}
          </Text>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type PlayerAvatarPreviewDialogProps = {
  visible: boolean;
  avatar: PlayerAvatar;
  sourceTop: number;
  sourceLeft: number;
  sourceSize: number;
  editable: boolean;
  onClose: () => void;
  onHidden?: () => void;
  onReplacePhoto: (source: PlayerPhotoSource) => Promise<void>;
  onReplacePreset: (avatarId: PlayerAvatarPresetId) => void;
  onDeletePhoto: () => void;
};

export function PlayerAvatarPreviewDialog({
  visible,
  avatar,
  sourceTop,
  sourceLeft,
  sourceSize,
  editable,
  onClose,
  onHidden,
  onReplacePhoto,
  onReplacePreset,
  onDeletePhoto,
}: PlayerAvatarPreviewDialogProps) {
  const { t } = useLocalization();
  const { playPrimaryAction, playTopAction } = useAppHaptics();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [cropSource, setCropSource] = useState<PlayerPhotoSource | null>(null);
  const [isPhotoBusy, setIsPhotoBusy] = useState(false);
  const visibilityProgress = useSharedValue(0);
  const onCloseRef = useRef(onClose);
  const onHiddenRef = useRef(onHidden);

  const previewSize = Math.min(PREVIEW_MAX_SIZE, screenWidth - 64);
  const targetLeft = (screenWidth - sourceSize) / 2;
  const targetCenterY = Math.min(screenHeight * 0.42, screenHeight - 250);
  const targetTop = targetCenterY - sourceSize / 2;
  const previewScale = previewSize / sourceSize;
  const actionTop = targetCenterY + previewSize / 2 + 24;
  const sourceAvatarSize = sourceSize * (SOURCE_AVATAR_SIZE / SOURCE_FRAME_SIZE);
  const sourceBorderWidth = sourceSize * (5 / SOURCE_FRAME_SIZE);

  useEffect(() => {
    onCloseRef.current = onClose;
    onHiddenRef.current = onHidden;
  }, [onClose, onHidden]);

  const finishHiding = useCallback(() => {
    setRendered(false);
    setIsDetailOpen(false);
    setIsReplaceDialogOpen(false);
    setIsAvatarPickerOpen(false);
    setCropSource(null);
    onHiddenRef.current?.();
  }, []);

  useEffect(() => {
    if (visible) {
      setRendered(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    visibilityProgress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: visible ? 300 : 230,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && !visible) {
          runOnJS(finishHiding)();
        }
      },
    );
  }, [finishHiding, rendered, visibilityProgress, visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (
          cropSource ||
          isDetailOpen ||
          isReplaceDialogOpen ||
          isAvatarPickerOpen
        ) {
          return false;
        }

        onCloseRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [
    cropSource,
    isAvatarPickerOpen,
    isDetailOpen,
    isReplaceDialogOpen,
    rendered,
  ]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.58,
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    left: interpolate(
      visibilityProgress.value,
      [0, 1],
      [sourceLeft, targetLeft],
    ),
    top: interpolate(
      visibilityProgress.value,
      [0, 1],
      [sourceTop, targetTop],
    ),
    transform: [
      {
        scale: interpolate(
          visibilityProgress.value,
          [0, 1],
          [1, previewScale],
        ),
      },
    ],
  }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(visibilityProgress.value, [0, 0.62, 1], [0, 0, 1]),
    transform: [
      {
        translateY: interpolate(
          visibilityProgress.value,
          [0, 1],
          [12, 0],
        ),
      },
    ],
  }));

  const showPhotoError = useCallback(() => {
    Alert.alert(
      t("playerSelection.photo.errorTitle"),
      t("playerSelection.photo.errorMessage"),
    );
  }, [t]);

  const handlePickerResult = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      setCropSource({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
    },
    [],
  );

  const handleTakePhoto = useCallback(async () => {
    try {
      setIsPhotoBusy(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t("playerSelection.photo.permissionTitle"),
          t("playerSelection.photo.cameraPermissionMessage"),
        );
        return;
      }

      handlePickerResult(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        }),
      );
    } catch (error: unknown) {
      console.warn("Failed to replace player photo from camera", error);
      showPhotoError();
    } finally {
      setIsPhotoBusy(false);
    }
  }, [handlePickerResult, showPhotoError, t]);

  const handleChoosePhoto = useCallback(async () => {
    try {
      setIsPhotoBusy(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t("playerSelection.photo.permissionTitle"),
          t("playerSelection.photo.libraryPermissionMessage"),
        );
        return;
      }

      handlePickerResult(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        }),
      );
    } catch (error: unknown) {
      console.warn("Failed to replace player photo from library", error);
      showPhotoError();
    } finally {
      setIsPhotoBusy(false);
    }
  }, [handlePickerResult, showPhotoError, t]);

  const handleCropConfirm = useCallback(
    async (source: PlayerPhotoSource) => {
      try {
        setIsPhotoBusy(true);
        await onReplacePhoto(source);
        setCropSource(null);
      } catch (error: unknown) {
        console.warn("Failed to save replacement player photo", error);
        showPhotoError();
      } finally {
        setIsPhotoBusy(false);
      }
    },
    [onReplacePhoto, showPhotoError],
  );

  if (!rendered && !visible) {
    return null;
  }

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={styles.container}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("statistics.playerDetails.avatar.close")}
        onPress={() => onCloseRef.current()}
        style={StyleSheet.absoluteFillObject}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[
          styles.avatarFrame,
          {
            width: sourceSize,
            height: sourceSize,
            borderRadius: sourceSize / 2,
            borderWidth: sourceBorderWidth,
          },
          avatarStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(
            avatar.type === "photo"
              ? "statistics.playerDetails.avatar.openDetail"
              : "statistics.playerDetails.avatar.editAvatar",
          )}
          onPress={() => {
            playTopAction();
            if (avatar.type === "photo") {
              setIsDetailOpen(true);
            } else {
              setIsReplaceDialogOpen(true);
            }
          }}
          style={styles.avatarPressable}
        >
          <PlayerAvatarView avatar={avatar} size={sourceAvatarSize} />
        </Pressable>
      </Animated.View>

      {editable && (
        <Animated.View
          style={[styles.actions, { top: actionTop }, actionsStyle]}
        >
          <PreviewButton
            disabled={isPhotoBusy}
            onPress={() => {
              playPrimaryAction();
              setIsReplaceDialogOpen(true);
            }}
          >
            {t("statistics.playerDetails.avatar.editAvatar")}
          </PreviewButton>

          {avatar.type === "photo" && (
            <PreviewButton
              destructive
              disabled={isPhotoBusy}
              onPress={() => {
                playPrimaryAction();
                onDeletePhoto();
              }}
            >
              {t("statistics.playerDetails.avatar.deletePhoto")}
            </PreviewButton>
          )}
        </Animated.View>
      )}

      <PlayerAvatarDetailViewer
        visible={visible && isDetailOpen}
        avatar={avatar}
        editable={editable}
        onClose={() => setIsDetailOpen(false)}
        onReplace={() => setIsReplaceDialogOpen(true)}
      />

      <PlayerAvatarReplaceDialog
        visible={visible && isReplaceDialogOpen}
        width={Math.min(370, screenWidth - 32)}
        onPresets={() => {
          setIsReplaceDialogOpen(false);
          setIsAvatarPickerOpen(true);
        }}
        onCamera={() => {
          setIsReplaceDialogOpen(false);
          void handleTakePhoto();
        }}
        onGallery={() => {
          setIsReplaceDialogOpen(false);
          void handleChoosePhoto();
        }}
        onCancel={() => setIsReplaceDialogOpen(false)}
      />

      <PlayerAvatarPickerDialog
        visible={visible && isAvatarPickerOpen}
        selectedId={
          avatar.type === "preset" ? avatar.id : DEFAULT_PLAYER_AVATAR_ID
        }
        onCancel={() => setIsAvatarPickerOpen(false)}
        onSelect={(avatarId) => {
          onReplacePreset(avatarId);
          setIsAvatarPickerOpen(false);
        }}
      />

      {cropSource && (
        <PlayerPhotoCropper
          source={cropSource}
          onCancel={() => setCropSource(null)}
          onConfirm={(source) => void handleCropConfirm(source)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  avatarFrame: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderColor: colors.secondary3,
  },
  avatarPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    position: "absolute",
    left: 16,
    right: 16,
    maxWidth: 370,
    alignSelf: "center",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonPressable: {
    width: 224,
    height: 52,
  },
  buttonAnimated: {
    width: "100%",
    height: "100%",
  },
  button: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonLabel: {
    color: colors.secondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  destructiveButtonLabel: {
    color: "#ED1818",
  },
  disabled: {
    opacity: 0.55,
  },
});
