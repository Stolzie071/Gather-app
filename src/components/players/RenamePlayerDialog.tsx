import {
  BackHandler,
  Keyboard,
  type KeyboardEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
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

import { DuplicatePlayerAlert } from "@/components/players/DuplicatePlayerAlert";
import { Squircle } from "@/components/Squircle";
import { useLocalization } from "@/localization/LocalizationProvider";
import { normalizePlayerName } from "@/players/playerUtils";
import { colors } from "@/theme/colors";

const DESIGN_DIALOG_HEIGHT = 226;
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
        scale.value = withTiming(0.97, {
          duration: 70,
        });
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
        style={[
          styles.buttonAnimated,
          disabled && styles.buttonDisabled,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type RenamePlayerDialogProps = {
  visible: boolean;
  playerName: string;
  isNameTaken?: (name: string) => boolean;
  onClose: () => void;
  onRename: (name: string) => void;
};

export function RenamePlayerDialog({
  visible,
  playerName,
  isNameTaken,
  onClose,
  onRename,
}: RenamePlayerDialogProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const dialogWidth = Math.min(370, screenWidth - 32);

  const [name, setName] = useState(playerName);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const [isDuplicateAlertOpen, setIsDuplicateAlertOpen] = useState(false);
  const [rendered, setRendered] = useState(visible);

  const wasVisible = useRef(false);
  const visibilityProgress = useSharedValue(0);
  const renameDialogOpacity = useSharedValue(1);
  const keyboardOffset = useSharedValue(0);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.42,
  }));

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * renameDialogOpacity.value,
    transform: [
      {
        translateY:
          interpolate(visibilityProgress.value, [0, 1], [10, 0]) -
          keyboardOffset.value,
      },
      {
        scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]),
      },
    ],
  }));

  const finishHiding = useCallback(() => {
    setRendered(false);
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleDuplicateCancel = useCallback(() => {
    setIsDuplicateAlertOpen(false);
  }, []);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;

    if (justOpened) {
      setName(playerName);
      setDuplicateName(null);
      setIsDuplicateAlertOpen(false);
      setRendered(true);
    }

    wasVisible.current = visible;
  }, [playerName, visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    visibilityProgress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: visible ? 210 : 160,
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
    renameDialogOpacity.value = withTiming(isDuplicateAlertOpen ? 0 : 1, {
      duration: isDuplicateAlertOpen ? 100 : 120,
      easing: Easing.out(Easing.cubic),
    });
  }, [isDuplicateAlertOpen, renameDialogOpacity]);

  useEffect(() => {
    if (!visible) {
      keyboardOffset.value = 0;
      return;
    }

    const dialogHeight = Math.min(
      DESIGN_DIALOG_HEIGHT,
      screenHeight - insets.top - insets.bottom - 32,
    );

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
  }, [
    insets.bottom,
    insets.top,
    keyboardOffset,
    screenHeight,
    visible,
  ]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isDuplicateAlertOpen) {
          handleDuplicateCancel();
        } else {
          handleClose();
        }

        return true;
      },
    );

    return () => subscription.remove();
  }, [handleClose, handleDuplicateCancel, isDuplicateAlertOpen, visible]);

  if (!rendered) {
    return null;
  }

  const normalizedName = normalizePlayerName(name);
  const renameDisabled =
    normalizedName.length === 0 ||
    normalizedName === normalizePlayerName(playerName);

  const handleRename = () => {
    if (renameDisabled) {
      return;
    }

    Keyboard.dismiss();

    if (isNameTaken?.(normalizedName)) {
      setDuplicateName(normalizedName);
      setIsDuplicateAlertOpen(true);
      return;
    }

    onRename(normalizedName);
  };

  const handleDuplicateRename = () => {
    if (!duplicateName) {
      return;
    }

    setIsDuplicateAlertOpen(false);
    onRename(duplicateName);
  };

  const handleDuplicateHidden = () => {
    setDuplicateName(null);
  };

  return (
    <View style={styles.overlay} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.overlayBackground,
          overlayAnimatedStyle,
        ]}
      />

      <Pressable
        style={StyleSheet.absoluteFillObject}
        disabled={isDuplicateAlertOpen}
        onPress={handleClose}
      />

      <Animated.View
        style={[styles.shadow, dialogAnimatedStyle]}
        pointerEvents={isDuplicateAlertOpen ? "none" : "auto"}
      >
        <Squircle
          style={styles.dialog}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <Text style={styles.title}>
            {t("statistics.playerDetails.renameDialog.title")}
          </Text>

          <Text style={styles.label}>
            {t("statistics.playerDetails.renameDialog.playerName")}
          </Text>

          <Squircle
            style={styles.inputContainer}
            cornerRadius={10}
            fillColor={colors.surface}
            strokeColor={colors.secondary4}
            strokeWidth={1}
          >
            <TextInput
              value={name}
              placeholder={t(
                "statistics.playerDetails.renameDialog.namePlaceholder",
              )}
              placeholderTextColor={colors.textSecondary}
              editable={!isDuplicateAlertOpen}
              onChangeText={setName}
              autoFocus
              maxLength={24}
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleRename}
              style={styles.input}
            />
          </Squircle>

          <View style={styles.buttons}>
            <DialogButton
              disabled={isDuplicateAlertOpen}
              onPress={handleClose}
            >
              <Squircle
                style={styles.button}
                cornerRadius={8}
                fillColor={colors.secondary3}
                strokeColor={colors.secondary4}
                strokeWidth={1}
              >
                <Text style={styles.cancelLabel}>
                  {t("statistics.playerDetails.renameDialog.cancel")}
                </Text>
              </Squircle>
            </DialogButton>

            <DialogButton
              disabled={renameDisabled || isDuplicateAlertOpen}
              onPress={handleRename}
            >
              <Squircle
                style={styles.button}
                cornerRadius={8}
                fillColor={colors.primary}
              >
                <Text style={styles.renameLabel}>
                  {t("statistics.playerDetails.renameDialog.confirm")}
                </Text>
              </Squircle>
            </DialogButton>
          </View>
        </Squircle>
      </Animated.View>

      <DuplicatePlayerAlert
        visible={isDuplicateAlertOpen}
        playerName={duplicateName ?? ""}
        width={dialogWidth}
        confirmLabel={t("statistics.playerDetails.renameDialog.confirm")}
        onCancel={handleDuplicateCancel}
        onConfirm={handleDuplicateRename}
        onHidden={handleDuplicateHidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    elevation: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayBackground: {
    backgroundColor: "#000000",
  },

  shadow: {
    width: "92%",
    maxWidth: 370,
    borderRadius: 20,
    backgroundColor: colors.background,
  },

  dialog: {
    width: "100%",
    padding: 16,
    overflow: "hidden",
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
  },

  label: {
    marginTop: 22,
    marginBottom: 8,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
  },

  inputContainer: {
    width: "100%",
    height: 48,
    overflow: "hidden",
  },

  input: {
    flex: 1,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
  },

  buttons: {
    width: "100%",
    height: 44,
    marginTop: 24,
    flexDirection: "row",
    gap: 16,
  },

  buttonPressable: {
    flex: 1,
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
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
  },

  renameLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
  },
});
