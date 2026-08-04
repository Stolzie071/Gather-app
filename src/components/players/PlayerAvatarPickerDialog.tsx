import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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

import { Squircle } from "@/components/Squircle";
import { useLocalization } from "@/localization/LocalizationProvider";
import {
  FEMALE_AVATAR_PRESET_IDS,
  getPlayerAvatarPresetPreview,
  MALE_AVATAR_PRESET_IDS,
} from "@/players/avatarPresets";
import type { PlayerAvatarPresetId } from "@/players/types";
import { colors } from "@/theme/colors";

const MAX_DIALOG_WIDTH = 370;
const MAX_DIALOG_HEIGHT = 610;
const AVATAR_OPTION_SIZE = 54;
const AVATAR_SIZE = 48;
const GRID_GAP = 10;

type AvatarGridProps = {
  ids: readonly PlayerAvatarPresetId[];
  selectedId: PlayerAvatarPresetId;
  gridWidth: number;
  onSelect: (id: PlayerAvatarPresetId) => void;
};

type PickerAvatarOptionProps = {
  id: PlayerAvatarPresetId;
  selected: boolean;
  onPress: () => void;
};

function PickerAvatarOption({
  id,
  selected,
  onPress,
}: PickerAvatarOptionProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="radio"
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
      style={styles.avatarPressable}
    >
      <Animated.View
        style={[
          styles.avatarOption,
          selected && styles.avatarOptionSelected,
          animatedStyle,
        ]}
      >
        <Image
          source={getPlayerAvatarPresetPreview(id)}
          resizeMode="contain"
          style={styles.avatarImage}
        />
      </Animated.View>
    </Pressable>
  );
}

function AvatarGrid({ ids, selectedId, gridWidth, onSelect }: AvatarGridProps) {
  return (
    <View style={[styles.avatarGrid, { width: gridWidth }]}>
      {ids.map((id) => (
        <PickerAvatarOption
          key={id}
          id={id}
          selected={id === selectedId}
          onPress={() => onSelect(id)}
        />
      ))}
    </View>
  );
}

type PlayerAvatarPickerDialogProps = {
  visible: boolean;
  selectedId: PlayerAvatarPresetId;
  onCancel: () => void;
  onSelect: (id: PlayerAvatarPresetId) => void;
};

export function PlayerAvatarPickerDialog({
  visible,
  selectedId,
  onCancel,
  onSelect,
}: PlayerAvatarPickerDialogProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const [pendingId, setPendingId] = useState(selectedId);
  const onCancelRef = useRef(onCancel);
  const wasVisible = useRef(false);
  const visibilityProgress = useSharedValue(0);

  const dialogWidth = Math.min(MAX_DIALOG_WIDTH, screenWidth - 32);
  const dialogHeight = Math.min(
    MAX_DIALOG_HEIGHT,
    screenHeight - insets.top - insets.bottom - 32,
  );
  const columnCount = dialogWidth < 340 ? 4 : 5;
  const gridWidth =
    columnCount * AVATAR_OPTION_SIZE + (columnCount - 1) * GRID_GAP;

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.36,
  }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      {
        translateY: interpolate(visibilityProgress.value, [0, 1], [12, 0]),
      },
      { scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  const finishHiding = useCallback(() => {
    setRendered(false);
  }, []);

  const handleConfirm = useCallback(() => {
    onSelect(pendingId);
  }, [onSelect, pendingId]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;

    if (justOpened) {
      setPendingId(selectedId);
      setRendered(true);
    }

    wasVisible.current = visible;
  }, [selectedId, visible]);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    visibilityProgress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: visible ? 210 : 150,
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
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onCancelRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [visible]);

  if (!rendered) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable onPress={onCancel} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      <Animated.View
        style={[
          styles.dialogShadow,
          { width: dialogWidth, height: dialogHeight },
          dialogStyle,
        ]}
      >
        <Squircle
          style={styles.dialog}
          cornerRadius={20}
          fillColor={colors.background}
        >
          <Text style={styles.title}>
            {t("playerSelection.avatarPicker.title")}
          </Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>
              {t("playerSelection.avatarPicker.male")}
            </Text>
            <AvatarGrid
              ids={MALE_AVATAR_PRESET_IDS}
              selectedId={pendingId}
              gridWidth={gridWidth}
              onSelect={setPendingId}
            />

            <Text style={[styles.sectionTitle, styles.spacedSectionTitle]}>
              {t("playerSelection.avatarPicker.female")}
            </Text>
            <AvatarGrid
              ids={FEMALE_AVATAR_PRESET_IDS}
              selectedId={pendingId}
              gridWidth={gridWidth}
              onSelect={setPendingId}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.footerAction}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionAnimated,
                    pressed && styles.actionPressed,
                  ]}
                >
                  <Squircle
                    style={styles.actionButton}
                    cornerRadius={10}
                    fillColor={colors.secondary3}
                    strokeColor={colors.secondary4}
                    strokeWidth={1}
                  >
                    <Text style={styles.cancelLabel}>
                      {t("playerSelection.avatarPicker.cancel")}
                    </Text>
                  </Squircle>
                </View>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleConfirm}
              style={styles.footerAction}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionAnimated,
                    pressed && styles.actionPressed,
                  ]}
                >
                <Squircle
                    style={styles.actionButton}
                  cornerRadius={10}
                  fillColor={colors.primary}
                >
                  <Text style={styles.confirmLabel}>
                    {t("playerSelection.avatarPicker.select")}
                  </Text>
                </Squircle>
                </View>
              )}
            </Pressable>
          </View>
        </Squircle>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  dialogShadow: {
    borderRadius: 20,
    backgroundColor: colors.background,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 8,
        spreadDistance: 0,
        color: "rgba(0, 0, 0, 0.35)",
      },
    ],
  },

  dialog: {
    width: "100%",
    height: "100%",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: "hidden",
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  list: {
    flex: 1,
    marginTop: 16,
  },

  listContent: {
    paddingBottom: 16,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },

  spacedSectionTitle: {
    marginTop: 18,
  },

  avatarGrid: {
    marginTop: 10,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },

  avatarOption: {
    width: AVATAR_OPTION_SIZE,
    height: AVATAR_OPTION_SIZE,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: AVATAR_OPTION_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPressable: {
    width: AVATAR_OPTION_SIZE,
    height: AVATAR_OPTION_SIZE,
  },

  avatarOptionSelected: {
    borderColor: colors.primary,
  },

  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },

  footer: {
    width: "100%",
    height: 50,
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },

  footerAction: {
    flex: 1,
  },

  actionAnimated: {
    width: "100%",
    height: "100%",
  },

  actionPressed: {
    transform: [{ scale: 0.98 }],
  },

  actionButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  confirmLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    lineHeight: 23,
  },

  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    lineHeight: 23,
  },
});
