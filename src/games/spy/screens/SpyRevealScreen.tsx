import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpyMainBackgroundDecor } from "@assets/Spy_game";
import {
  BackButton,
  ExitGameDialog,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { getSpyWordImage } from "@/games/spy/content/assets";
import { useSpyContent } from "@/games/spy/content/SpyContentProvider";
import { SpyPlayerCardStack } from "@/games/spy/components/SpyPlayerCardStack";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import type { RootStackParamList } from "@/navigation/types";
import { usePlayers } from "@/players/PlayersProvider";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

type SpyRevealScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpyReveal"
>;

export function SpyRevealScreen({ navigation }: SpyRevealScreenProps) {
  const { registry: contentRegistry } = useSpyContent();
  const { players } = usePlayers();
  const { activeSession, clearSession, updateSession } = useSpySession();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [debugCardKey, setDebugCardKey] = useState(0);
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const currentPlayerId =
    activeSession?.revealOrder[activeSession.revealIndex] ?? "";
  const currentPlayer = useMemo(
    () => players.find(({ id }) => id === currentPlayerId),
    [currentPlayerId, players],
  );
  const currentCategory = activeSession
    ? contentRegistry.getCategory(activeSession.draft.categoryId)
    : undefined;
  const currentWord = activeSession
    ? contentRegistry.getWord(
        activeSession.draft.categoryId,
        activeSession.secretWordId,
      )
    : undefined;
  const currentWordImage = getSpyWordImage(currentWord?.imageKey);
  const isCurrentPlayerSpy =
    activeSession?.spyIds.includes(currentPlayerId) ?? false;
  const spyKnowledge = useMemo(() => {
    if (
      !activeSession?.draft.spiesKnowEachOther ||
      !isCurrentPlayerSpy
    ) {
      return undefined;
    }

    const playerNamesById = new Map(
      players.map((player) => [player.id, player.name]),
    );
    const showNonSpies = activeSession.spyIds.length >= 7;
    const shownPlayerIds = showNonSpies
      ? activeSession.draft.playerIds.filter(
          (playerId) => !activeSession.spyIds.includes(playerId),
        )
      : activeSession.spyIds.filter((spyId) => spyId !== currentPlayerId);

    const names = shownPlayerIds
      .map((spyId) => playerNamesById.get(spyId))
      .filter((name): name is string => Boolean(name));

    return {
      mode: showNonSpies ? ("nonSpies" as const) : ("otherSpies" as const),
      names,
    };
  }, [activeSession, currentPlayerId, isCurrentPlayerSpy, players]);
  const isLastPlayer = activeSession
    ? activeSession.revealIndex === activeSession.revealOrder.length - 1
    : false;
  const isCardRevealed = activeSession?.currentCardRevealed ?? false;
  const showReadyCard = activeSession?.allRolesRevealed ?? false;

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

  const handlePassPhone = useCallback(() => {
    if (!activeSession || isLastPlayer) {
      return false;
    }

    updateSession((session) => ({
      ...session,
      revealIndex: session.revealIndex + 1,
      currentCardRevealed: false,
    }));
    return true;
  }, [activeSession, isLastPlayer, updateSession]);

  const handleStartGame = useCallback(() => {
    const startedAt = new Date();

    updateSession((session) => ({
      ...session,
      phase: "playing",
      startedAt: startedAt.toISOString(),
      endsAt: session.draft.timerEnabled
        ? new Date(
            startedAt.getTime() + session.draft.timerMinutes * 60_000,
          ).toISOString()
        : null,
    }));
    navigation.replace("SpyTimer");
  }, [navigation, updateSession]);

  const handlePreviousCard = useCallback(() => {
    if (!activeSession || activeSession.revealIndex === 0) {
      return;
    }

    setDebugCardKey((currentKey) => currentKey + 1);
    updateSession((session) => ({
      ...session,
      revealIndex: Math.max(0, session.revealIndex - 1),
      currentCardRevealed: false,
      allRolesRevealed: false,
    }));
  }, [activeSession, updateSession]);

  const handleRevealCard = useCallback(() => {
    updateSession((session) => ({
      ...session,
      currentCardRevealed: true,
      allRolesRevealed: isLastPlayer,
    }));
  }, [isLastPlayer, updateSession]);

  useEffect(() => {
    if (!activeSession && navigation.isFocused()) {
      navigation.popTo("SpyGame");
    }
  }, [activeSession, navigation]);

  useEffect(() => {
    if (!activeSession || !currentCategory || !currentWord) {
      return;
    }

    if (currentCategory.presentation === "image" && !currentWordImage) {
      console.warn(
        `Missing image for Spy word "${currentWord.id}" in category "${currentCategory.id}"`,
      );
    }
  }, [activeSession, currentCategory, currentWord, currentWordImage]);

  useEffect(() => {
    if (!showReadyCard) {
      return;
    }

    const preloadTimer = setTimeout(() => {
      navigation.preload("SpyTimer");
    }, 100);

    return () => clearTimeout(preloadTimer);
  }, [navigation, showReadyCard]);

  useEffect(() => {
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
  }, [handleRequestExit, isExitDialogOpen, isSettingsOpen]);

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
          style={[
            styles.cardPosition,
            { height: screenHeight / sceneScale },
            isCompactScreen && styles.cardPositionCompact,
          ]}
        >
          {currentCategory && currentWord && (
            <SpyPlayerCardStack
              key={`${activeSession?.id ?? "empty"}-${debugCardKey}`}
              categoryId={currentCategory.id}
              playerName={currentPlayer?.name ?? ""}
              wordName={currentWord.name}
              wordImage={currentWordImage}
              presentation={currentCategory.presentation}
              revealType={isCurrentPlayerSpy ? "spy" : "word"}
              spyKnowledge={spyKnowledge}
              revealed={isCardRevealed}
              showReadyCard={showReadyCard}
              onReveal={handleRevealCard}
              onPassPhone={handlePassPhone}
              onStartGame={handleStartGame}
              compact={isCompactScreen}
            />
          )}
        </View>
      </View>

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

      {__DEV__ && (activeSession?.revealIndex ?? 0) > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Предыдущая карточка"
          onPress={handlePreviousCard}
          style={({ pressed }) => [
            styles.debugPreviousButton,
            { bottom: insets.bottom + 6 },
            pressed && styles.debugPreviousButtonPressed,
          ]}
        >
          <Text style={styles.debugPreviousButtonText}>
            Предыдущая карточка
          </Text>
        </Pressable>
      )}

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
  cardPositionCompact: {
    transform: [{ translateY: 35 }],
  },
  debugPreviousButton: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 20,
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(42, 24, 73, 0.78)",
  },
  debugPreviousButtonPressed: {
    backgroundColor: "rgba(158, 124, 228, 0.9)",
  },
  debugPreviousButtonText: {
    color: "#FFFFFF",
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    lineHeight: 16,
  },
});
