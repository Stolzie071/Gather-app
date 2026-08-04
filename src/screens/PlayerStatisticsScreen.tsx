import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
} from "react-native-reanimated";

import {
  PlayerStatsWave,
  PlayerStatsWaveShadow,
} from "@assets/Decorate/StatsScreen";
import { SpyMainBackgroundDecor } from "@assets/Spy_game";
import {
  BackButton,
  ExitGameDialog,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import {
  PlayerDistributionCard,
  PlayerActionsSheet,
  PlayerEditButton,
  PlayerGameStatisticsSection,
  PlayerOverviewCard,
  type PlayerGameStatRow,
} from "@/components/statistics";
import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { useGameHistory } from "@/history/GameHistoryProvider";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { usePlayers } from "@/players/PlayersProvider";
import {
  calculatePlayerDetailStatistics,
} from "@/statistics/calculatePlayerDetailStatistics";
import {
  DEV_STATISTICS_HISTORY,
  DEV_STATISTICS_PLAYER,
} from "@/statistics/devPlayerStatisticsFixture";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const WAVE_TOP = 180;
const WAVE_LEFT = -29;
const CONTENT_TOP = 279;
const CONTENT_BOTTOM_SPACE = 20;
const COMPACT_MAX_HEIGHT = 700;
const COMPACT_MAX_WIDTH = 350;
const CONTENT_REVEAL_DELAY = 320;

type PlayerStatisticsScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "PlayerStatistics"
>;

type GameSectionId = "spy" | "alias" | "mafia";

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function PlayerStatisticsScreen({
  navigation,
  route,
}: PlayerStatisticsScreenProps) {
  const { language, t } = useLocalization();
  const { players, isPlayersLoaded, deletePlayer } = usePlayers();
  const { history, isHistoryLoaded, refreshHistory } = useGameHistory();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [expandedGameId, setExpandedGameId] =
    useState<GameSectionId | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isPlayerActionsOpen, setIsPlayerActionsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEntranceReady, setIsEntranceReady] = useState(false);

  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen =
    screenHeight < COMPACT_MAX_HEIGHT || screenWidth < COMPACT_MAX_WIDTH;
  const contentTop = CONTENT_TOP * sceneScale;
  const isDevStatisticsPlayer =
    __DEV__ && route.params.playerId === DEV_STATISTICS_PLAYER.id;
  const player = isDevStatisticsPlayer
    ? DEV_STATISTICS_PLAYER
    : players.find((item) => item.id === route.params.playerId);
  const playerHistory = isDevStatisticsPlayer
    ? DEV_STATISTICS_HISTORY
    : history;
  const statistics = useMemo(
    () =>
      player
        ? calculatePlayerDetailStatistics(player, playerHistory)
        : null,
    [player, playerHistory],
  );

  const prepareEntrance = useCallback(() => {
    setIsEntranceReady(false);

    const revealTimer = setTimeout(() => {
      setIsEntranceReady(true);
    }, CONTENT_REVEAL_DELAY);

    return () => clearTimeout(revealTimer);
  }, []);

  useFocusEffect(prepareEntrance);

  const lastGameLabel = useMemo(() => {
    const completedAt = statistics?.lastGame?.completedAt;

    if (!completedAt) {
      return "";
    }

    const date = new Date(completedAt);

    if (!Number.isFinite(date.getTime())) {
      return "";
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const locale = language === "ru" ? "ru-RU" : "en-US";
    const time = date.toLocaleTimeString(
      language === "ru" ? "ru-RU" : "en-GB",
      { hour: "2-digit", minute: "2-digit" },
    );
    let dateLabel: string;

    if (isSameDay(date, now)) {
      dateLabel = t("statistics.history.today");
    } else if (isSameDay(date, yesterday)) {
      dateLabel = t("statistics.history.yesterday");
    } else {
      const dateWithoutYear = date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
      });

      dateLabel =
        date.getFullYear() === now.getFullYear()
          ? dateWithoutYear
          : language === "ru"
            ? `${dateWithoutYear} ${date.getFullYear()}г.`
            : `${dateWithoutYear}, ${date.getFullYear()}`;
    }

    return `${dateLabel} ${time}`;
  }, [language, statistics?.lastGame?.completedAt, t]);

  const distributionLabels = useMemo(() => {
    if (!statistics) {
      return {};
    }

    return Object.fromEntries(
      statistics.distribution.map((item) => [
        item.id,
        item.isOther
          ? t("statistics.playerDetails.otherGames")
          : t(`gameList.games.${item.id}.title`),
      ]),
    );
  }, [statistics, t]);

  const sectionRows = useMemo(() => {
    if (!statistics) {
      return null;
    }

    const totalLabel = t("statistics.playerDetails.gameStats.total");
    const countByGameId = new Map(
      statistics.distribution.map((item) => [item.id, item.count]),
    );

    return {
      spy: [
        { label: totalLabel, value: statistics.spy.gamesPlayed },
        {
          label: t("statistics.playerDetails.gameStats.asSpy"),
          value: statistics.spy.gamesAsSpy,
        },
        {
          label: t("statistics.playerDetails.gameStats.spyWins"),
          value: statistics.spy.winsAsSpy,
        },
        {
          label: t("statistics.playerDetails.gameStats.civilianWins"),
          value: statistics.spy.winsAsCivilian,
        },
      ] satisfies PlayerGameStatRow[],
      alias: [
        { label: totalLabel, value: countByGameId.get("alias") ?? 0 },
      ] satisfies PlayerGameStatRow[],
      mafia: [
        { label: totalLabel, value: countByGameId.get("mafia") ?? 0 },
      ] satisfies PlayerGameStatRow[],
    };
  }, [statistics, t]);

  const handleOpenSettings = () => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

  const handleSettingsHidden = () => {
    setHasOpenedSettings(false);
    void refreshHistory();
  };

  const toggleSection = (gameId: GameSectionId) => {
    setExpandedGameId((currentGameId) =>
      currentGameId === gameId ? null : gameId,
    );
  };

  const handleRequestPlayerDeletion = () => {
    setIsPlayerActionsOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmPlayerDeletion = () => {
    if (!player || isDevStatisticsPlayer) {
      setIsDeleteDialogOpen(false);
      return;
    }

    deletePlayer(player.id);
    setIsDeleteDialogOpen(false);
    navigation.goBack();
  };

  const isLoading = !isPlayersLoaded || !isHistoryLoaded;
  const isContentReady = !isLoading && isEntranceReady;

  return (
    <View style={styles.container}>
      <View
        pointerEvents="none"
        style={[
          styles.designScene,
          { transform: [{ scale: sceneScale }] },
        ]}
      >
        <Image
          source={SpyMainBackgroundDecor}
          resizeMode="stretch"
          style={styles.backgroundDecor}
        />

        <Image
          source={PlayerStatsWaveShadow}
          resizeMode="stretch"
          style={styles.wave}
        />
        <View style={styles.surfaceExtension} />
        <PlayerStatsWave width={460} height={778} style={styles.wave} />

        {isContentReady && player && (
          <>
            <Animated.View
              entering={FadeInDown.duration(260).easing(
                Easing.out(Easing.cubic),
              )}
              style={styles.avatarFrame}
            >
              <PlayerAvatarView avatar={player.avatar} size={113} />
            </Animated.View>
            <Animated.Text
              entering={FadeInDown.delay(45)
                .duration(240)
                .easing(Easing.out(Easing.cubic))}
              style={styles.playerName}
              numberOfLines={1}
            >
              {player.name}
            </Animated.Text>
          </>
        )}
      </View>

      {!isContentReady && (
        <Animated.View
          entering={FadeIn.delay(90).duration(140)}
          exiting={FadeOut.duration(100)}
          style={[styles.loadingState, { top: contentTop + 70 }]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </Animated.View>
      )}

      {isContentReady && !statistics && (
        <View style={[styles.loadingState, { top: contentTop + 70 }]}>
          <Text style={styles.notFoundText}>
            {t("statistics.playerDetails.playerNotFound")}
          </Text>
        </View>
      )}

      {isContentReady && statistics && sectionRows && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[styles.scroll, { top: contentTop }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + CONTENT_BOTTOM_SPACE },
          ]}
        >
          <Animated.View
            entering={FadeInLeft.duration(260).easing(
              Easing.out(Easing.cubic),
            )}
          >
            <PlayerDistributionCard
              statistics={statistics}
              labels={distributionLabels}
              gamesLabel={t(
                `statistics.counts.parties.${getCountForm(
                  statistics.gamesPlayed,
                  language,
                )}`,
                { count: statistics.gamesPlayed },
              )
                .replace(String(statistics.gamesPlayed), "")
                .trim()}
              compact={isCompactScreen}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInLeft.delay(55)
              .duration(260)
              .easing(Easing.out(Easing.cubic))}
          >
            <PlayerOverviewCard
              statistics={statistics}
              lastGameLabel={lastGameLabel}
              labels={{
                wins: t("statistics.playerDetails.wins"),
                winRate: t("statistics.playerDetails.winRate"),
                gamesPlayed: t("statistics.playerDetails.gamesPlayed"),
                lastGame: t("statistics.playerDetails.lastGame"),
                noGames: t("statistics.playerDetails.noGames"),
                victory: t("statistics.playerDetails.victory"),
                defeat: t("statistics.playerDetails.defeat"),
              }}
            />
          </Animated.View>

          <View style={styles.sections}>
            <Animated.View
              entering={FadeInLeft.delay(110)
                .duration(240)
                .easing(Easing.out(Easing.cubic))}
            >
              <PlayerGameStatisticsSection
                title={t("gameList.games.spy.title")}
                expanded={expandedGameId === "spy"}
                rows={sectionRows.spy}
                onPress={() => toggleSection("spy")}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInLeft.delay(155)
                .duration(240)
                .easing(Easing.out(Easing.cubic))}
            >
              <PlayerGameStatisticsSection
                title={t("gameList.games.alias.title")}
                expanded={expandedGameId === "alias"}
                rows={sectionRows.alias}
                onPress={() => toggleSection("alias")}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInLeft.delay(200)
                .duration(240)
                .easing(Easing.out(Easing.cubic))}
            >
              <PlayerGameStatisticsSection
                title={t("gameList.games.mafia.title")}
                expanded={expandedGameId === "mafia"}
                rows={sectionRows.mafia}
                onPress={() => toggleSection("mafia")}
              />
            </Animated.View>
          </View>
        </ScrollView>
      )}

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

      <PlayerEditButton
        onPress={() => setIsPlayerActionsOpen(true)}
        compact={isCompactScreen}
        accessibilityLabel={t("statistics.playerDetails.editPlayer")}
        style={{
          position: "absolute",
          top: insets.top + (isCompactScreen ? 72 : 76),
          right: 16,
        }}
      />

      <PlayerActionsSheet
        visible={isPlayerActionsOpen}
        closeLabel={t("statistics.playerDetails.closeActions")}
        renameLabel={t("statistics.playerDetails.renamePlayer")}
        deleteLabel={t("statistics.playerDetails.deletePlayer")}
        onClose={() => setIsPlayerActionsOpen(false)}
        onRename={() => undefined}
        onDelete={handleRequestPlayerDeletion}
      />

      <ExitGameDialog
        visible={isDeleteDialogOpen}
        compact={isCompactScreen}
        title={t("statistics.playerDetails.deleteDialog.title")}
        message={t("statistics.playerDetails.deleteDialog.message", {
          name: player?.name ?? "",
        })}
        stayLabel={t("statistics.playerDetails.deleteDialog.cancel")}
        exitLabel={t("statistics.playerDetails.deleteDialog.confirm")}
        confirmColor="#E42437"
        onStay={() => setIsDeleteDialogOpen(false)}
        onExit={handleConfirmPlayerDeletion}
      />

      {hasOpenedSettings && (
        <SettingsSheet
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onHidden={handleSettingsHidden}
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
  wave: {
    position: "absolute",
    top: WAVE_TOP,
    left: WAVE_LEFT,
    width: 460,
    height: 778,
  },
  surfaceExtension: {
    position: "absolute",
    top: WAVE_TOP + 750,
    left: 0,
    right: 0,
    height: 600,
    backgroundColor: colors.background,
  },
  avatarFrame: {
    position: "absolute",
    top: 99,
    left: (DESIGN_WIDTH - 123) / 2,
    width: 123,
    height: 123,
    borderRadius: 61.5,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 5,
    borderColor: colors.secondary3,
  },
  playerName: {
    position: "absolute",
    top: 232,
    left: 82,
    right: 82,
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },
  scroll: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sections: {
    gap: 10,
  },
  loadingState: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
  },
});
