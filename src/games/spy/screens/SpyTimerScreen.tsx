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
  GameStartButton,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { SpyTimerDial } from "@/games/spy/components/SpyTimerDial";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const TIMER_TOTAL_SECONDS = 10 * 60;
const TIMER_REMAINING_SECONDS = 9 * 60 + 26;
const TIMER_PROGRESS = TIMER_REMAINING_SECONDS / TIMER_TOTAL_SECONDS;

type SpyTimerScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpyTimer"
>;

export function SpyTimerScreen({ navigation }: SpyTimerScreenProps) {
  const { t } = useLocalization();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
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
    navigation.popTo("SpyGame");
  }, [navigation]);

  const handleOpenSettings = useCallback(() => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  }, []);

  const handleFinish = useCallback(() => undefined, []);

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

        handleExitGame();
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleExitGame, isFocused, isSettingsOpen]);

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
          <SpyTimerDial
            label="09:26"
            progress={TIMER_PROGRESS}
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
      dialSize,
      diceHeight,
      diceWidth,
      finishLabel,
      handleFinish,
      isCompactScreen,
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
        onPress={handleExitGame}
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
