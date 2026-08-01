import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  BackHandler,
} from "react-native";
import { colors } from "../theme/colors";
import { useCallback, useEffect, useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import {
  ArrowIcon,
  DarkthemeIcon,
  SoundsIcon,
  MusicIcon,
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
import { AppSlider } from "@/components/AppSlider";

import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useLocalization } from "@/localization/LocalizationProvider";
import { usePlayers } from "@/players/PlayersProvider";
import { useSettings } from "@/settings/SettingsProvider";

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

  const translateY = useSharedValue(HIDDEN_POSITION);
  const onHiddenRef = useRef(onHidden);
  const notifyHidden = useCallback(() => {
    onHiddenRef.current?.();
  }, []);

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

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
        onClose();
        return true;
      },
    );

    return () => backSubscription.remove();
  }, [visible, onClose]);

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

          <SettingsSection>
            <SettingsRow
              icon={<DarkthemeIcon width={36} height={36} />}
              title={t("settings.darkTheme")}
              rightContent={
                <AnimatedSwitch
                  value={settings.darkThemeEnabled}
                  onValueChange={(value) =>
                    updateSetting("darkThemeEnabled", value)
                  }
                  compact={compact}
                />
              }
            />
          </SettingsSection>

          <SettingsSection title={t("settings.sections.sound")}>
            <SettingsRow
              icon={<SoundsIcon width={36} height={36} />}
              title={t("settings.items.sounds")}
              showDivider
              rightContent={
                <AppSlider
                  value={settings.soundVolume}
                  onValueChange={(value) =>
                    updateSetting("soundVolume", value)
                  }
                  compact={compact}
                />
              }
            />
            <SettingsRow
              icon={<MusicIcon width={36} height={36} />}
              title={t("settings.items.music")}
              showDivider
              rightContent={
                <AppSlider
                  value={settings.musicVolume}
                  onValueChange={(value) =>
                    updateSetting("musicVolume", value)
                  }
                  compact={compact}
                />
              }
            />
            <SettingsRow
              icon={<VibrationIcon width={36} height={36} />}
              title={t("settings.items.hapticFeedback")}
              rightContent={
                <AnimatedSwitch
                  value={settings.hapticsEnabled}
                  onValueChange={(value) =>
                    updateSetting("hapticsEnabled", value)
                  }
                  compact={compact}
                />
              }
            />
          </SettingsSection>
          <SettingsSection title={t("settings.sections.application")}>
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
                onPress={clearPlayerPhotos}
              />
            </SettingsSection>
          )}
        </ScrollView>
      </Animated.View>
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
