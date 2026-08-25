import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  BackHandler,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../theme/colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import {
  ArrowIcon,
  VibrationIcon,
  LanguageIcon,
  LockIcon,
  InfoIcon,
  SupportIcon,
  PrivacyIcon,
  DonationIcon,
  RateIcon,
} from "@assets/icons";

import { AnimatedSwitch } from "@/components/AnimatedSwitch";
import { AboutGatherDialog } from "@/components/settings/AboutGatherDialog";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useLocalization } from "@/localization/LocalizationProvider";
import { usePlayers } from "@/players/PlayersProvider";
import { useSettings } from "@/settings/SettingsProvider";
import {
  clearGameHistory,
  loadGameHistory,
} from "@/storage/gameHistoryStorage";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onHidden?: () => void;
  compact: boolean;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HIDDEN_POSITION = SCREEN_HEIGHT + 10;

type HapticTest = {
  titleKey: string;
  run: () => Promise<void>;
};

const COMMON_HAPTIC_TESTS: HapticTest[] = [
  {
    titleKey: "settings.hapticTests.selection",
    run: () => Haptics.selectionAsync(),
  },
  {
    titleKey: "settings.hapticTests.impactLight",
    run: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  },
  {
    titleKey: "settings.hapticTests.impactMedium",
    run: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  },
  {
    titleKey: "settings.hapticTests.impactHeavy",
    run: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  },
  {
    titleKey: "settings.hapticTests.impactSoft",
    run: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  },
  {
    titleKey: "settings.hapticTests.impactRigid",
    run: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  },
  {
    titleKey: "settings.hapticTests.notificationSuccess",
    run: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  },
  {
    titleKey: "settings.hapticTests.notificationWarning",
    run: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  },
  {
    titleKey: "settings.hapticTests.notificationError",
    run: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  },
];

const ANDROID_HAPTIC_TESTS: HapticTest[] = [
  {
    titleKey: "settings.hapticTests.androidConfirm",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm),
  },
  {
    titleKey: "settings.hapticTests.androidReject",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject),
  },
  {
    titleKey: "settings.hapticTests.androidToggleOn",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_On),
  },
  {
    titleKey: "settings.hapticTests.androidToggleOff",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_Off),
  },
  {
    titleKey: "settings.hapticTests.androidSegmentTick",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick),
  },
  {
    titleKey: "settings.hapticTests.androidClockTick",
    run: () =>
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick),
  },
];

function DeveloperSlashIcon() {
  return (
    <View style={styles.developerIcon}>
      <Text style={styles.developerIconText}>/</Text>
    </View>
  );
}

export function SettingsSheet({
  visible,
  onClose,
  onHidden,
  compact,
}: SettingsSheetProps) {
  const { language, setLanguage, t } = useLocalization();
  const { settings, updateSetting } = useSettings();
  const { clearPlayers, clearPlayerPhotos } = usePlayers();
  const [savedGameCount, setSavedGameCount] = useState(0);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const translateY = useSharedValue(HIDDEN_POSITION);
  const onHiddenRef = useRef(onHidden);
  const notifyHidden = useCallback(() => {
    onHiddenRef.current?.();
  }, []);

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

  useEffect(() => {
    if (!visible || !__DEV__) {
      return;
    }

    let isActive = true;

    loadGameHistory()
      .then((history) => {
        if (isActive) {
          setSavedGameCount(history.length);
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to load game history", error);
      });

    return () => {
      isActive = false;
    };
  }, [visible]);

  const handleClearGameHistory = useCallback(() => {
    clearGameHistory()
      .then(() => setSavedGameCount(0))
      .catch((error: unknown) => {
        console.warn("Failed to clear game history", error);
      });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const progress = 1 - translateY.value / HIDDEN_POSITION;

    return {
      opacity: progress * 0.55,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withTiming(HIDDEN_POSITION, {
          duration: 600,
        });

        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: 300,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0);
    } else {
      translateY.value = withTiming(
        HIDDEN_POSITION,
        undefined,
        (finished) => {
          if (finished) {
            runOnJS(notifyHidden)();
          }
        },
      );
    }
  }, [notifyHidden, translateY, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isAboutOpen) {
          setIsAboutOpen(false);
          return true;
        }

        onClose();
        return true;
      },
    );

    return () => backSubscription.remove();
  }, [isAboutOpen, visible, onClose]);

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, animatedStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("settings.title")}</Text>

          <SettingsSection title={t("settings.sections.application")}>
            <SettingsRow
              icon={<VibrationIcon width={36} height={36} />}
              title={t("settings.items.hapticFeedback")}
              showDivider
              rightContent={
                <AnimatedSwitch
                  value={settings.hapticsEnabled}
                  forceHaptic
                  onValueChange={(value) =>
                    updateSetting("hapticsEnabled", value)
                  }
                  compact={compact}
                />
              }
            />
            <SettingsRow
              icon={<LanguageIcon width={36} height={36} />}
              title={t("settings.items.language")}
              showDivider
              rightContent={
                <LanguageSelector
                  value={language}
                  onValueChange={setLanguage}
                  compact={compact}
                />
              }
            />
            <SettingsRow
              icon={<LockIcon width={36} height={36} />}
              title={t("settings.items.keepAwake")}
              rightContent={
                <AnimatedSwitch
                  value={settings.keepAwakeEnabled}
                  onValueChange={(value) =>
                    updateSetting("keepAwakeEnabled", value)
                  }
                  compact={compact}
                />
              }
            />
          </SettingsSection>
          <SettingsSection title={t("settings.sections.information")}>
            <SettingsRow
              icon={<InfoIcon width={36} height={36} />}
              title={t("settings.items.about")}
              showDivider
              onPress={() => setIsAboutOpen(true)}
              pressedShape="top"
              rightContent={
                <ArrowIcon
                  width={8}
                  height={14}
                  color={colors.textSecondary}
                  opacity={0.6}
                  style={styles.infoArrow}
                />
              }
            />
            <SettingsRow
              icon={<SupportIcon width={36} height={36} />}
              title={t("settings.items.feedback")}
              showDivider
              disabled
              rightContent={
                <ArrowIcon
                  width={8}
                  height={14}
                  color={colors.textSecondary}
                  opacity={0.6}
                  style={styles.infoArrow}
                />
              }
            />
            <SettingsRow
              icon={<PrivacyIcon width={36} height={36} />}
              title={t("settings.items.privacyPolicy")}
              showDivider
              disabled
              rightContent={
                <ArrowIcon
                  width={8}
                  height={14}
                  color={colors.textSecondary}
                  opacity={0.6}
                  style={styles.infoArrow}
                />
              }
            />
            <SettingsRow
              icon={<RateIcon width={36} height={36} />}
              title={t("settings.items.rateApp")}
              showDivider
              disabled
              rightContent={
                <ArrowIcon
                  width={8}
                  height={14}
                  color={colors.textSecondary}
                  opacity={0.6}
                  style={styles.infoArrow}
                />
              }
            />
            <SettingsRow
              icon={<DonationIcon width={36} height={36} />}
              title={t("settings.items.supportDeveloper")}
              disabled
              rightContent={
                <ArrowIcon
                  width={8}
                  height={14}
                  color={colors.textSecondary}
                  opacity={0.6}
                  style={styles.infoArrow}
                />
              }
            />
          </SettingsSection>
          {__DEV__ && (
            <>
              <SettingsSection title={t("settings.sections.developer")}>
                <SettingsRow
                  icon={<DeveloperSlashIcon />}
                  title={t("settings.items.clearPlayers")}
                  showDivider
                  onPress={clearPlayers}
                />
                <SettingsRow
                  icon={<DeveloperSlashIcon />}
                  title={t("settings.items.clearPhotos")}
                  showDivider
                  onPress={clearPlayerPhotos}
                />
                <SettingsRow
                  icon={<DeveloperSlashIcon />}
                  title={t("settings.items.savedGames", {
                    count: savedGameCount,
                  })}
                  showDivider
                />
                <SettingsRow
                  icon={<DeveloperSlashIcon />}
                  title={t("settings.items.clearGameHistory")}
                  onPress={handleClearGameHistory}
                />
              </SettingsSection>

              <SettingsSection title={t("settings.sections.hapticTests")}>
                {[
                  ...COMMON_HAPTIC_TESTS,
                  ...(Platform.OS === "android" ? ANDROID_HAPTIC_TESTS : []),
                ].map((test, index, tests) => (
                  <SettingsRow
                    key={test.titleKey}
                    icon={<VibrationIcon width={36} height={36} />}
                    title={t(test.titleKey)}
                    showDivider={index < tests.length - 1}
                    onPress={() => void test.run()}
                  />
                ))}
              </SettingsSection>
            </>
          )}
        </ScrollView>
      </Animated.View>

      <AboutGatherDialog
        visible={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 101,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    zIndex: 0,
  },

  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,

    height: "87%",

    backgroundColor: colors.background,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
    elevation: 1,
  },
  handle: {
    width: 72,
    height: 5,

    borderRadius: 10,

    backgroundColor: colors.textSecondary,
    opacity: 0.4,

    alignSelf: "center",

    marginTop: 13,
  },

  dragArea: {
    height: 48,
    justifyContent: "flex-start",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    fontSize: 32,
    lineHeight: 42,
    textAlign: "center",
    marginBottom: 18,
  },
  infoArrow: {
    marginRight: 4,
  },
  developerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary3,
  },
  developerIconText: {
    color: colors.primary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 29,
  },
});
