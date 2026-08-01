import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  type KeyboardEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AvatarIcon, CameraIcon } from "@assets/icons";
import { DuplicatePlayerAlert } from "@/components/players/DuplicatePlayerAlert";
import { PlayerPhotoCropper } from "@/components/players/PlayerPhotoCropper";
import { PlayerPhotoSourceDialog } from "@/components/players/PlayerPhotoSourceDialog";
import { Squircle } from "@/components/Squircle";
import { useLocalization } from "@/localization/LocalizationProvider";
import { normalizePlayerName } from "@/players/playerUtils";
import type { CreatePlayerInput } from "@/players/types";
import {
  createStoredPlayerPhoto,
  type PlayerPhotoSource,
} from "@/storage/playerPhotoStorage";
import { colors } from "@/theme/colors";

const DESIGN_DIALOG_WIDTH = 370;
const DESIGN_DIALOG_HEIGHT = 344;
const AVATAR_PLACEHOLDER_COUNT = 7;
const KEYBOARD_GAP = 12;

type DialogButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
};

function DialogButton({
  children,
  disabled = false,
  onPress,
}: DialogButtonProps) {
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
      style={styles.footerAction}
    >
      <Animated.View
        style={[
          styles.footerAnimated,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type AvatarOptionProps = {
  selected: boolean;
  accessibilityLabel: string;
  children: ReactNode;
  onPress?: () => void;
};

function AvatarOption({
  selected,
  accessibilityLabel,
  children,
  onPress,
}: AvatarOptionProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
    >
      <Animated.View
        style={[
          styles.avatarOption,
          selected && styles.avatarOptionSelected,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type AddPlayerDialogProps = {
  visible: boolean;
  onClose: () => void;
  onHidden?: () => void;
  onAdd: (input: CreatePlayerInput) => void;
  isNameTaken?: (name: string) => boolean;
};

export function AddPlayerDialog({
  visible,
  onClose,
  onHidden,
  onAdd,
  isNameTaken,
}: AddPlayerDialogProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [name, setName] = useState("");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<PlayerPhotoSource | null>(
    null,
  );
  const [cropSource, setCropSource] = useState<PlayerPhotoSource | null>(null);
  const [isPhotoSourceOpen, setIsPhotoSourceOpen] = useState(false);
  const [isPhotoBusy, setIsPhotoBusy] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const [isDuplicateAlertOpen, setIsDuplicateAlertOpen] = useState(false);
  const wasVisible = useRef(false);
  const onHiddenRef = useRef(onHidden);
  const visibilityProgress = useSharedValue(0);
  const addDialogOpacity = useSharedValue(1);
  const keyboardOffset = useSharedValue(0);

  const normalizedName = normalizePlayerName(name);
  const addDisabled = normalizedName.length === 0 || isPhotoBusy;
  const dialogWidth = Math.min(DESIGN_DIALOG_WIDTH, screenWidth - 32);
  const dialogHeight = Math.min(
    DESIGN_DIALOG_HEIGHT,
    screenHeight - insets.top - insets.bottom - 32,
  );

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.42,
  }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * addDialogOpacity.value,
    transform: [
      {
        translateY:
          interpolate(visibilityProgress.value, [0, 1], [12, 0]) -
          keyboardOffset.value,
      },
      { scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  const notifyHidden = useCallback(() => {
    onHiddenRef.current?.();
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setIsPhotoSourceOpen(false);
    setDuplicateName(null);
    onClose();
  }, [onClose]);

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

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      handlePickerResult(result);
    } catch (error: unknown) {
      console.warn("Failed to take player photo", error);
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      handlePickerResult(result);
    } catch (error: unknown) {
      console.warn("Failed to choose player photo", error);
      showPhotoError();
    } finally {
      setIsPhotoBusy(false);
    }
  }, [handlePickerResult, showPhotoError, t]);

  const handlePhotoPress = useCallback(() => {
    if (isPhotoBusy) {
      return;
    }

    Keyboard.dismiss();
    setIsPhotoSourceOpen(true);
  }, [isPhotoBusy]);

  const handleCameraSource = useCallback(() => {
    setIsPhotoSourceOpen(false);
    void handleTakePhoto();
  }, [handleTakePhoto]);

  const handleGallerySource = useCallback(() => {
    setIsPhotoSourceOpen(false);
    void handleChoosePhoto();
  }, [handleChoosePhoto]);

  const submitPlayer = useCallback(
    async (playerName: string) => {
      try {
        setIsPhotoBusy(true);

        const avatar = selectedPhoto
          ? await createStoredPlayerPhoto(selectedPhoto)
          : { type: "default" as const };

        onAdd({ name: playerName, avatar });
      } catch (error: unknown) {
        console.warn("Failed to save player photo", error);
        showPhotoError();
      } finally {
        setIsPhotoBusy(false);
      }
    },
    [onAdd, selectedPhoto, showPhotoError],
  );

  const handleAdd = useCallback(() => {
    if (addDisabled) {
      return;
    }

    Keyboard.dismiss();

    if (isNameTaken?.(normalizedName)) {
      setDuplicateName(normalizedName);
      setIsDuplicateAlertOpen(true);
      return;
    }

    void submitPlayer(normalizedName);
  }, [addDisabled, isNameTaken, normalizedName, submitPlayer]);

  const handleDuplicateCancel = useCallback(() => {
    setIsDuplicateAlertOpen(false);
  }, []);

  const handleCreateDuplicate = useCallback(() => {
    if (!duplicateName || isPhotoBusy) {
      return;
    }

    setIsDuplicateAlertOpen(false);
    void submitPlayer(duplicateName);
  }, [duplicateName, isPhotoBusy, submitPlayer]);

  const handleDuplicateHidden = useCallback(() => {
    setDuplicateName(null);
  }, []);

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

  useEffect(() => {
    addDialogOpacity.value = withTiming(isDuplicateAlertOpen ? 0 : 1, {
      duration: isDuplicateAlertOpen ? 100 : 120,
      easing: Easing.out(Easing.cubic),
    });
  }, [addDialogOpacity, isDuplicateAlertOpen]);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    const visibilityChanged = visible !== wasVisible.current;

    if (justOpened) {
      setName("");
      setSelectedAvatarIndex(0);
      setSelectedPhoto(null);
      setCropSource(null);
      setIsPhotoSourceOpen(false);
      setIsPhotoBusy(false);
      setDuplicateName(null);
      setIsDuplicateAlertOpen(false);
    }

    if (visibilityChanged) {
      visibilityProgress.value = withTiming(
        visible ? 1 : 0,
        {
          duration: visible ? 210 : 160,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished && !visible) {
            runOnJS(notifyHidden)();
          }
        },
      );
    }

    wasVisible.current = visible;
  }, [notifyHidden, visibilityProgress, visible]);

  useEffect(() => {
    if (!visible) {
      keyboardOffset.value = 0;
      return;
    }

    const handleKeyboardShow = (event: KeyboardEvent) => {
      const dialogTop = (screenHeight - dialogHeight) / 2;
      const dialogBottom = dialogTop + dialogHeight;
      const requestedOffset = Math.max(
        0,
        dialogBottom - event.endCoordinates.screenY + KEYBOARD_GAP,
      );
      const maximumOffset = Math.max(0, dialogTop - insets.top - KEYBOARD_GAP);
      const duration = event.duration > 0 ? event.duration : 220;

      keyboardOffset.value = withTiming(
        Math.min(requestedOffset, maximumOffset),
        { duration },
      );
    };

    const handleKeyboardHide = (event: KeyboardEvent) => {
      const duration = event.duration > 0 ? event.duration : 180;

      keyboardOffset.value = withTiming(0, { duration });
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      handleKeyboardHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [dialogHeight, insets.top, keyboardOffset, screenHeight, visible]);

  useEffect(() => {
    if (!visible || !duplicateName) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleDuplicateCancel();
        return true;
      },
    );

    return () => subscription.remove();
  }, [duplicateName, handleDuplicateCancel, visible]);

  return (
    <View pointerEvents={visible ? "auto" : "none"} style={styles.container}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={duplicateName ? handleDuplicateCancel : handleClose}
        />
      </Animated.View>

      <View pointerEvents="box-none" style={styles.dialogPositioner}>
        <Animated.View
          pointerEvents={duplicateName ? "none" : "auto"}
          style={[{ width: dialogWidth, height: dialogHeight }, dialogStyle]}
        >
          <Squircle
            style={styles.dialog}
            cornerRadius={20}
            fillColor={colors.background}
          >
            <View style={styles.content}>
              <Text style={styles.title}>
                {t("playerSelection.addDialog.title")}
              </Text>

              <Text style={styles.sectionLabel}>
                {t("playerSelection.addDialog.chooseAvatar")}
              </Text>

              <ScrollView
                horizontal
                style={styles.avatarScroll}
                contentContainerStyle={styles.avatarList}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <AvatarOption
                  selected={selectedPhoto !== null}
                  accessibilityLabel={t(
                    "playerSelection.addDialog.choosePhoto",
                  )}
                  onPress={handlePhotoPress}
                >
                  {selectedPhoto ? (
                    <Image
                      source={{ uri: selectedPhoto.uri }}
                      resizeMode="cover"
                      style={styles.selectedPhoto}
                    />
                  ) : (
                    <View style={styles.cameraOption}>
                      <CameraIcon width={19} height={16} />
                    </View>
                  )}
                </AvatarOption>

                {Array.from(
                  { length: AVATAR_PLACEHOLDER_COUNT },
                  (_, index) => (
                    <AvatarOption
                      key={index}
                      selected={
                        selectedPhoto === null && selectedAvatarIndex === index
                      }
                      accessibilityLabel={t(
                        "playerSelection.addDialog.defaultAvatar",
                      )}
                      onPress={() => {
                        setSelectedPhoto(null);
                        setSelectedAvatarIndex(index);
                      }}
                    >
                      <AvatarIcon width={42} height={42} />
                    </AvatarOption>
                  ),
                )}
              </ScrollView>

              <Text style={styles.nameLabel}>
                {t("playerSelection.addDialog.playerName")}
              </Text>

              <Squircle
                style={styles.nameField}
                cornerRadius={12}
                fillColor={colors.surface}
                strokeColor={colors.primary}
                strokeWidth={1.5}
              >
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={handleAdd}
                  placeholder={t("playerSelection.addDialog.namePlaceholder")}
                  placeholderTextColor="rgba(111, 108, 164, 0.65)"
                  style={styles.nameInput}
                  autoCorrect={false}
                  autoCapitalize="words"
                  enterKeyHint="done"
                  maxLength={32}
                />
              </Squircle>

              <View style={styles.footer}>
                <DialogButton disabled={isPhotoBusy} onPress={handleClose}>
                  <Squircle
                    style={styles.footerButton}
                    cornerRadius={10}
                    fillColor={colors.secondary3}
                    strokeColor={colors.secondary4}
                    strokeWidth={1}
                  >
                    <Text style={styles.cancelLabel}>
                      {t("playerSelection.addDialog.cancel")}
                    </Text>
                  </Squircle>
                </DialogButton>

                <DialogButton disabled={addDisabled} onPress={handleAdd}>
                  <Squircle
                    style={styles.footerButton}
                    cornerRadius={10}
                    fillColor={colors.primary}
                  >
                    <Text style={styles.addLabel}>
                      {t("playerSelection.addDialog.add")}
                    </Text>
                  </Squircle>
                </DialogButton>
              </View>
            </View>
          </Squircle>
        </Animated.View>

        <DuplicatePlayerAlert
          visible={visible && isDuplicateAlertOpen}
          playerName={duplicateName ?? ""}
          width={dialogWidth}
          onCancel={handleDuplicateCancel}
          onCreateNew={handleCreateDuplicate}
          onHidden={handleDuplicateHidden}
          busy={isPhotoBusy}
        />

        <PlayerPhotoSourceDialog
          visible={visible && isPhotoSourceOpen}
          width={dialogWidth}
          onCamera={handleCameraSource}
          onGallery={handleGallerySource}
          onCancel={() => setIsPhotoSourceOpen(false)}
        />

        {cropSource && (
          <PlayerPhotoCropper
            source={cropSource}
            onCancel={() => setCropSource(null)}
            onConfirm={(croppedPhoto) => {
              setSelectedPhoto(croppedPhoto);
              setCropSource(null);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  dialogPositioner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  dialog: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  sectionLabel: {
    marginTop: 24,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },

  avatarList: {
    paddingHorizontal: 1.5,
    paddingVertical: 2,
    gap: 8,
  },

  avatarOption: {
    width: 49,
    height: 49,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 24.5,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarOptionSelected: {
    borderColor: colors.primary,
  },

  cameraOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary3,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedPhoto: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  nameLabel: {
    marginTop: 16,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },

  nameField: {
    width: "100%",
    height: 59,
    marginTop: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    overflow: "hidden",
  },

  nameInput: {
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
  },

  footer: {
    height: 49,
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },

  footerAction: {
    flex: 1,
  },

  footerAnimated: {
    width: "100%",
    height: "100%",
  },

  footerButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  disabled: {
    opacity: 0.5,
  },

  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  addLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  avatarScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 53,
    marginTop: 8,
  },
});
