import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SpyMainBackgroundDecor,
  SpyTimerDice,
  SpyTimerWave,
  SpyTimerWaveShadow,
} from "@assets/Spy_game";
import {
  BackButton,
  ExitGameDialog,
  GameStartButton,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { SpyTimerDisplay } from "@/games/spy/components/SpyTimerDisplay";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
type SpyTimerScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpyTimer"
>;

export function SpyTimerScreen({ navigation }: SpyTimerScreenProps) {
  const { t } = useLocalization();
  const { activeSession, clearSession, updateSession } = useSpySession();
  const { playPrimaryAction } = useAppHaptics();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const sceneHeight = screenHeight / sceneScale;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const dialSize = isCompactScreen ? 270 : 310;
  const diceWidth = isCompactScreen ? 85 : 98;
  const diceHeight = isCompactScreen ? 96 : 111;
  const timerTop = isCompactScreen ? 190 : 300;
  const waveTop = sceneHeight - 245;
  const buttonBottom = insets.bottom / sceneScale + 16;

  const handleExitGame = useCallback(() => {
    clearSession();
    navigation.popTo("SpyGame");
  }, [clearSession, navigation]);

  const handleRequestExit = useCallback(() => {
    setIsExitDialogOpen(true);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  }, []);

  const handleFinish = useCallback(() => {
    playPrimaryAction();
    updateSession((session) => ({
      ...session,
      phase: "results",
    }));
    navigation.replace("SpyResults");
  }, [navigation, playPrimaryAction, updateSession]);

  useEffect(() => {
    if (!activeSession && isFocused) {
      navigation.popTo("SpyGame");
    }
  }, [activeSession, isFocused, navigation]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isSettingsOpen) {
          return false;
        }

        if (isExitDialogOpen) {
          setIsExitDialogOpen(false);
          return true;
        }

        handleRequestExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleRequestExit, isExitDialogOpen, isFocused, isSettingsOpen]);

  const finishLabel = t("spyTimer.finish");
  const timerScene = useMemo(
    () => (
      <View
        pointerEvents="box-none"
        style={[
          styles.designScene,
          {
            height: sceneHeight,
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <Image
          source={SpyMainBackgroundDecor}
          resizeMode="stretch"
          style={styles.backgroundDecor}
        />

        <View style={[styles.timerComposition, { top: timerTop }]}>
          <SpyTimerDisplay
            session={activeSession}
            focused={isFocused}
            size={dialSize}
          />

          <SpyTimerDice
            pointerEvents="none"
            width={diceWidth}
            height={diceHeight}
            style={[
              styles.timerDice,
              {
                top: -(diceHeight - 38),
                left: (DESIGN_WIDTH - diceWidth) / 2,
              },
            ]}
          />
        </View>

        <View
          pointerEvents="none"
          style={[styles.bottomSurface, { top: sceneHeight - 150 }]}
        />

        <Image
          source={SpyTimerWaveShadow}
          resizeMode="stretch"
          style={[styles.timerWave, { top: waveTop }]}
        />
        <SpyTimerWave
          pointerEvents="none"
          width={506}
          height={285}
          style={[styles.timerWave, { top: waveTop }]}
        />

        <GameStartButton
          text={finishLabel}
          onPress={handleFinish}
          style={[
            styles.finishButton,
            isCompactScreen && styles.finishButtonCompact,
            { bottom: buttonBottom },
          ]}
          textStyle={styles.finishButtonText}
          cornerRadius={16}
        />
      </View>
    ),
    [
      buttonBottom,
      activeSession,
      dialSize,
      diceHeight,
      diceWidth,
      finishLabel,
      handleFinish,
      isCompactScreen,
      isFocused,
      sceneHeight,
      sceneScale,
      timerTop,
      waveTop,
    ],
  );

  return (
    <View style={styles.container}>
      {timerScene}

      <BackButton
        onPress={handleRequestExit}
        hapticFeedback={false}
        compact={isCompactScreen}
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 16,
        }}
      />

      <SettingsButton
        onPress={handleOpenSettings}
        compact={isCompactScreen}
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 16,
        }}
      />

      {hasOpenedSettings && (
        <SettingsSheet
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onHidden={() => setHasOpenedSettings(false)}
          compact={isCompactScreen}
        />
      )}

      <ExitGameDialog
        visible={isExitDialogOpen}
        onStay={() => setIsExitDialogOpen(false)}
        onExit={handleExitGame}
        compact={isCompactScreen}
      />

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#B697EF",
  },

  designScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: DESIGN_WIDTH,
    transformOrigin: "center top",
  },

  backgroundDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  },

  timerComposition: {
    position: "absolute",
    left: 0,
    width: DESIGN_WIDTH,
    alignItems: "center",
  },

  timerDice: {
    position: "absolute",
  },

  bottomSurface: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
  },

  timerWave: {
    position: "absolute",
    left: -52,
    width: 506,
    height: 285,
    pointerEvents: "none",
  },

  finishButton: {
    position: "absolute",
    left: 18,
    width: 366,
    height: 80,
  },

  finishButtonCompact: {
    left: 24,
    width: 354,
    height: 64,
  },

  finishButtonText: {
    fontSize: 24,
    lineHeight: 33,
  },
});
