import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SpyGameOverLineLeft,
  SpyGameOverLineRight,
  SpyMainBackgroundDecor,
} from "@assets/Spy_game";
import { SpySummaryButtonDecor } from "@assets/Spy_game/4_step";
import {
  BackButton,
  ExitGameDialog,
  GameStartButton,
  PlayerAvatarView,
  SelectionIndicator,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { Squircle } from "@/components/Squircle";
import { createSpyGameHistoryEntry } from "@/games/spy/logic/createSpyGameHistoryEntry";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { usePlayers } from "@/players/PlayersProvider";
import type { PlayerAvatar } from "@/players/types";
import { appendGameHistoryEntry } from "@/storage/gameHistoryStorage";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

const DESIGN_WIDTH = 402;
const PANEL_TOP = 250;

type ResultPlayer = {
  id: string;
  name: string;
  isSpy: boolean;
  avatar: PlayerAvatar;
};

type WinnerRowProps = {
  player: ResultPlayer;
  selected: boolean;
  spyLabel: string;
  onToggle: (playerId: string) => void;
};

function WinnerRow({
  player,
  selected,
  spyLabel,
  onToggle,
}: WinnerRowProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={player.name}
      onPress={() => onToggle(player.id)}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={styles.rowPressable}
    >
      <Animated.View
        style={[
          styles.rowShadow,
          selected && styles.rowShadowSelected,
          animatedStyle,
        ]}
      >
        <Squircle
          style={styles.row}
          cornerRadius={16}
          fillColor={selected ? colors.secondary3 : colors.surface}
          strokeColor={selected ? colors.primary : undefined}
          strokeWidth={selected ? 1 : undefined}
        >
          <PlayerAvatarView avatar={player.avatar} size={48} />

          <View style={styles.rowText}>
            <Text style={styles.playerName}>{player.name}</Text>

            {player.isSpy && (
              <Squircle
                style={styles.spyBadge}
                cornerRadius={5}
                fillColor={colors.secondary4}
              >
                <Text style={styles.spyBadgeText}>{spyLabel}</Text>
              </Squircle>
            )}
          </View>

            <SelectionIndicator
              selected={selected}
              size={28}
            />
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type SpyResultsScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpyResults"
>;

export function SpyResultsScreen({ navigation }: SpyResultsScreenProps) {
  const { t } = useLocalization();
  const { players } = usePlayers();
  const { activeSession, clearSession, updateSession } = useSpySession();
  const { playCompletion, playSelection } = useAppHaptics();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const isSavingResultRef = useRef(false);
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const sceneHeight = screenHeight / sceneScale;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const panelBottom = insets.bottom / sceneScale + 18;
  const panelHeight = Math.max(360, sceneHeight - PANEL_TOP - panelBottom);
  const resultPlayers = useMemo<ResultPlayer[]>(() => {
    if (!activeSession) {
      return [];
    }

    const playersById = new Map(
      players.map((player) => [player.id, player]),
    );
    const spyIds = new Set(activeSession.spyIds);

    return activeSession.revealOrder
      .map((playerId) => playersById.get(playerId))
      .filter((player) => player !== undefined)
      .map((player) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        isSpy: spyIds.has(player.id),
      }));
  }, [activeSession, players]);
  const selectedWinnerIds = useMemo(
    () => new Set(activeSession?.winnerIds ?? []),
    [activeSession?.winnerIds],
  );

  const handleRequestExit = useCallback(() => {
    if (isSavingResultRef.current) {
      return;
    }

    setIsExitDialogOpen(true);
  }, []);

  const handleExitGame = useCallback(() => {
    if (isSavingResultRef.current) {
      return;
    }

    clearSession();
    navigation.popTo("SpyGame");
  }, [clearSession, navigation]);

  const handleOpenSettings = useCallback(() => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  }, []);

  const handleToggleWinner = useCallback((playerId: string) => {
    playSelection();
    updateSession((session) => {
      if (!session.draft.playerIds.includes(playerId)) {
        return session;
      }

      const nextIds = new Set(session.winnerIds);

      if (nextIds.has(playerId)) {
        nextIds.delete(playerId);
      } else {
        nextIds.add(playerId);
      }

      return {
        ...session,
        winnerIds: [...nextIds],
      };
    });
  }, [playSelection, updateSession]);

  const handleDone = useCallback(async () => {
    if (
      !activeSession ||
      activeSession.winnerIds.length === 0 ||
      isSavingResultRef.current
    ) {
      return;
    }

    isSavingResultRef.current = true;
    setIsSavingResult(true);

    try {
      const historyEntry = createSpyGameHistoryEntry(activeSession);

      await appendGameHistoryEntry(historyEntry);
      playCompletion();
      clearSession();
      navigation.popTo("SpyGame");
    } catch (error: unknown) {
      console.warn("Failed to save completed Spy game", error);
      isSavingResultRef.current = false;
      setIsSavingResult(false);
    }
  }, [activeSession, clearSession, navigation, playCompletion]);

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

  const renderPlayer: ListRenderItem<ResultPlayer> = useCallback(
    ({ item }) => (
      <WinnerRow
        player={item}
        selected={selectedWinnerIds.has(item.id)}
        spyLabel={t("spyResults.spy")}
        onToggle={handleToggleWinner}
      />
    ),
    [handleToggleWinner, selectedWinnerIds, t],
  );

  return (
    <View style={styles.container}>
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
          style={[styles.backgroundDecor, { height: sceneHeight }]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.heading,
            { top: insets.top / sceneScale + 70 },
          ]}
        >
          <Text style={styles.title}>{t("spyResults.title")}</Text>
          <Text style={styles.subtitle}>{t("spyResults.subtitle")}</Text>
        </View>

        <SpyGameOverLineLeft
          pointerEvents="none"
          width={265}
          height={75}
          style={styles.lineLeft}
        />
        <SpyGameOverLineRight
          pointerEvents="none"
          width={201}
          height={55}
          style={styles.lineRight}
        />

        <View style={[styles.panelShadow, { height: panelHeight }]}>
          <Squircle
            style={styles.panel}
            cornerRadius={28}
            fillColor={colors.background}
          >
            <FlatList
              data={resultPlayers}
              renderItem={renderPlayer}
              keyExtractor={(player) => player.id}
              style={styles.playerList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              overScrollMode="always"
            />

            <LinearGradient
              pointerEvents="none"
              colors={[colors.background, "rgba(248, 244, 253, 0)"]}
              style={styles.topListFade}
            />

            <LinearGradient
              pointerEvents="none"
              colors={["rgba(248, 244, 253, 0)", colors.background]}
              style={styles.bottomListFade}
            />

            <GameStartButton
              text={t("spyResults.done")}
              onPress={handleDone}
              disabled={selectedWinnerIds.size === 0 || isSavingResult}
              style={styles.doneButton}
              textStyle={styles.doneButtonText}
              cornerRadius={10}
              leftDecoration={
                <SpySummaryButtonDecor
                  pointerEvents="none"
                  width={12}
                  height={29}
                  style={styles.buttonDecorLeft}
                />
              }
              rightDecoration={
                <SpySummaryButtonDecor
                  pointerEvents="none"
                  width={12}
                  height={29}
                />
              }
            />
          </Squircle>
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
  },

  heading: {
    position: "absolute",
    right: 28,
    left: 28,
    alignItems: "center",
  },

  title: {
    color: colors.surface,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    color: colors.surface,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },

  lineLeft: {
    position: "absolute",
    top: 206,
    left: -52,
    zIndex: 2,
  },

  lineRight: {
    position: "absolute",
    top: 207,
    right: -32,
  },

  panelShadow: {
    position: "absolute",
    top: PANEL_TOP,
    left: 42,
    width: 318,
    borderRadius: 28,
    backgroundColor: colors.background,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 12,
        spreadDistance: 0,
        color: "rgba(47, 37, 86, 0.28)",
      },
    ],
  },

  panel: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },

  listContent: {
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  playerList: {
    position: "absolute",
    top: 10,
    right: 0,
    bottom: 96,
    left: 0,
  },

  topListFade: {
    position: "absolute",
    top: 10,
    right: 16,
    left: 16,
    height: 8,
  },

  bottomListFade: {
    position: "absolute",
    right: 0,
    bottom: 96,
    left: 0,
    height: 16,
  },

  rowPressable: {
    width: "100%",
    height: 74,
    marginBottom: 8,
  },

  rowShadow: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: colors.surface,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 1,
        blurRadius: 5,
        spreadDistance: 0,
        color: "rgba(47, 37, 86, 0.18)",
      },
    ],
  },

  rowShadowSelected: {
    backgroundColor: colors.secondary3,
  },

  row: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },

  rowText: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  playerName: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    lineHeight: 25,
  },

  spyBadge: {
    height: 20,
    marginTop: 2,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  spyBadgeText: {
    color: colors.primary,
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    lineHeight: 15,
  },

  doneButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    left: 16,
    height: 64,
  },

  doneButtonText: {
    fontSize: 22,
    lineHeight: 30,
  },

  buttonDecorLeft: {
    transform: [{ rotate: "180deg" }],
  },
});
