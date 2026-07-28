import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

import { BackButton, SettingsButton, SettingsSheet } from "@/components";
import {
  GameBottomWave,
  GameFrontWave,
  GameFrontWaveShadow,
} from "@assets/Decorate/GameScreen";
import {
  Star1,
  Star2,
  Star3,
  WaveLeftTop,
  WaveRightDown,
} from "@assets/Decorate/MainScreen";
import { SpyDice } from "@assets/GamesSections";
import type { RootStackParamList } from "@/navigation/types";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

type SpyGameScreenProps = BlankStackScreenProps<RootStackParamList, "SpyGame">;

export function SpyGameScreen({ navigation }: SpyGameScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);

  const handleOpenSettings = () => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

  return (
    <LinearGradient
      colors={["#B393ED", "#BD9FF3"]}
      locations={[0.21, 0.55]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        pointerEvents="none"
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <WaveLeftTop style={styles.waveLeftTop} />
        <WaveRightDown style={styles.waveRightDown} />

        <Star1 width={12} height={12} style={styles.starLeft} />
        <Star2 width={9} height={9} style={styles.starTopRight} />
        <Star3 width={9} height={9} style={styles.starRight} />

        <SpyDice width={174} height={158} style={styles.spyDice} />

        <Image
          source={GameFrontWaveShadow}
          resizeMode="stretch"
          style={styles.frontWave}
        />
        <GameFrontWave width={460} height={713} style={styles.frontWave} />

        <GameBottomWave
          width={422}
          height={67}
          style={[
            styles.bottomWave,
            {
              top: screenHeight / sceneScale - 59,
            },
          ]}
        />
      </View>

      <BackButton
        onPress={() => navigation.goBack()}
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
          compact={isCompactScreen}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },

  designScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",

    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,

    transformOrigin: "center top",
  },

  waveLeftTop: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  waveRightDown: {
    position: "absolute",
    top: 220,
    right: -3,
  },

  starLeft: {
    position: "absolute",
    top: 169,
    left: 37,
    opacity: 0.8,
  },

  starTopRight: {
    position: "absolute",
    top: 104,
    right: 108,
    opacity: 0.75,
  },

  starRight: {
    position: "absolute",
    top: 201,
    right: 45,
    opacity: 0.45,
  },

  spyDice: {
    position: "absolute",
    top: 157,
    left: 114,
    transform: [{ rotate: "-10deg" }],
  },

  frontWave: {
    position: "absolute",
    top: 178,
    left: -26,

    width: 460,
    height: 713,
  },

  bottomWave: {
    position: "absolute",
    left: -10,
  },
});
