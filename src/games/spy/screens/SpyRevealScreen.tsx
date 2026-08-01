import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpyMainBackgroundDecor } from "@assets/Spy_game";
import { BackButton, SettingsButton, SettingsSheet } from "@/components";
import { SpyPlayerCardStack } from "@/games/spy/components/SpyPlayerCardStack";
import { SPY_LOCATIONS } from "@/games/spy/data/locations";
import type { RootStackParamList } from "@/navigation/types";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const DEMO_LOCATION = SPY_LOCATIONS[0];
const DEMO_PLAYERS = [
  { name: "Катя", revealType: "location" },
  { name: "Артём", revealType: "spy" },
] as const;

type SpyRevealScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpyReveal"
>;

export function SpyRevealScreen({ navigation }: SpyRevealScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [showReadyCard, setShowReadyCard] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const currentPlayer = DEMO_PLAYERS[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === DEMO_PLAYERS.length - 1;

  const handleExitGame = useCallback(() => {
    navigation.popTo("SpyGame");
  }, [navigation]);

  const handleOpenSettings = useCallback(() => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  }, []);

  const handlePassPhone = useCallback(() => {
    if (currentPlayerIndex === DEMO_PLAYERS.length - 1) {
      setIsCardRevealed(false);
      return false;
    }

    setIsCardRevealed(false);
    setCurrentPlayerIndex((currentIndex) => currentIndex + 1);
    return true;
  }, [currentPlayerIndex]);

  const handleStartGame = useCallback(() => {
    navigation.navigate("SpyTimer");
  }, [navigation]);

  const handleRevealCard = useCallback(() => {
    setIsCardRevealed(true);

    if (isLastPlayer) {
      setShowReadyCard(true);
    }
  }, [isLastPlayer]);

  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      navigation.preload("SpyTimer");
    }, 500);

    return () => clearTimeout(preloadTimer);
  }, [navigation]);

  useEffect(() => {
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
  }, [handleExitGame, isSettingsOpen]);

  return (
    <View style={styles.container}>
      <View
        pointerEvents="box-none"
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <Image
          source={SpyMainBackgroundDecor}
          resizeMode="stretch"
          style={styles.backgroundDecor}
        />

        <View
          style={[styles.cardPosition, { height: screenHeight / sceneScale }]}
        >
          <SpyPlayerCardStack
            playerName={currentPlayer.name}
            locationName={DEMO_LOCATION.name}
            locationImage={DEMO_LOCATION.image}
            revealType={currentPlayer.revealType}
            revealed={isCardRevealed}
            showReadyCard={showReadyCard}
            onReveal={handleRevealCard}
            onPassPhone={handlePassPhone}
            onStartGame={handleStartGame}
          />
        </View>
      </View>

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
    height: DESIGN_HEIGHT,
    transformOrigin: "center top",
  },

  backgroundDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  },

  cardPosition: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DESIGN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: 20 }],
  },
});
