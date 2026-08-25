import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  StatsHeroDice,
  StatsWave,
  StatsWaveShadow,
} from "@assets/Decorate/StatsScreen";
import { SpySetupBackgroundDecor } from "@assets/Spy_game";
import {
  BackButton,
  SearchBar,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import {
  HistoryStatisticsView,
  PlayerStatisticsCard,
  StatisticsSummary,
  StatisticsTabs,
  type StatisticsTab,
} from "@/components/statistics";
import { useGameHistory } from "@/history/GameHistoryProvider";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { usePlayers } from "@/players/PlayersProvider";
import { calculateStatistics } from "@/statistics/calculateStatistics";
import {
  DEV_STATISTICS_HISTORY,
  DEV_STATISTICS_PLAYER,
} from "@/statistics/devPlayerStatisticsFixture";
import type { PlayerStatistics } from "@/statistics/types";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const WAVE_TOP = 273;
const WAVE_LEFT = -29;
const HERO_DICE_WIDTH = 183;
const HERO_DICE_HEIGHT = 194;
const CONTENT_TOP = 324;
const TABS_HEIGHT = 37;
const CONTENT_GAP = 12;
const PAGE_TOP_OFFSET = TABS_HEIGHT + CONTENT_GAP;
const PLAYER_LIST_TOP = 143;
const TOP_LIST_FADE_HEIGHT = 8;
const BOTTOM_LIST_FADE_HEIGHT = 16;
const LIST_BOTTOM_SPACE = 16;
const COMPACT_MAX_HEIGHT = 700;
const COMPACT_MAX_WIDTH = 350;
const COMPACT_SURFACE_OFFSET = -120;
const CONTENT_REVEAL_DELAY = 370;

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll("ё", "е");
}

type StatisticsScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "Statistics"
>;

export function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const { language, t } = useLocalization();
  const { players, isPlayersLoaded } = usePlayers();
  const { history, isHistoryLoaded, refreshHistory } = useGameHistory();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<StatisticsTab>("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isEntranceReady, setIsEntranceReady] = useState(false);
  const [isHorizontalSwipeActive, setIsHorizontalSwipeActive] = useState(false);
  const rasterizationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const swipeProgress = useSharedValue(0);
  const swipeStartProgress = useSharedValue(0);

  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen =
    screenHeight < COMPACT_MAX_HEIGHT || screenWidth < COMPACT_MAX_WIDTH;
  const surfaceOffset = isCompactScreen ? COMPACT_SURFACE_OFFSET : 0;
  const contentTop = (CONTENT_TOP + surfaceOffset) * sceneScale;
  const pagesTop = contentTop + PAGE_TOP_OFFSET;
  const listBottom = insets.bottom + LIST_BOTTOM_SPACE;
  const topListFadeHeight = TOP_LIST_FADE_HEIGHT * sceneScale;
  const bottomListFadeHeight = BOTTOM_LIST_FADE_HEIGHT * sceneScale;
  const playerListTop = PLAYER_LIST_TOP - topListFadeHeight;

  const pagesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -swipeProgress.value * screenWidth }],
  }));

  const beginHorizontalRasterization = useCallback(() => {
    if (rasterizationTimerRef.current) {
      clearTimeout(rasterizationTimerRef.current);
      rasterizationTimerRef.current = null;
    }

    setIsHorizontalSwipeActive(true);
  }, []);

  const finishHorizontalRasterization = useCallback(() => {
    if (rasterizationTimerRef.current) {
      clearTimeout(rasterizationTimerRef.current);
    }

    rasterizationTimerRef.current = setTimeout(() => {
      setIsHorizontalSwipeActive(false);
      rasterizationTimerRef.current = null;
    }, 80);
  }, []);

  const completeHorizontalSwipe = useCallback(
    (tab: StatisticsTab) => {
      setActiveTab(tab);
      finishHorizontalRasterization();
    },
    [finishHorizontalRasterization],
  );

  useEffect(
    () => () => {
      if (rasterizationTimerRef.current) {
        clearTimeout(rasterizationTimerRef.current);
      }
    },
    [],
  );

  const pagePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          runOnJS(beginHorizontalRasterization)();
          swipeStartProgress.value = swipeProgress.value;
        })
        .onUpdate((event) => {
          const nextProgress =
            swipeStartProgress.value - event.translationX / screenWidth;

          swipeProgress.value = Math.min(1, Math.max(0, nextProgress));
        })
        .onEnd((event) => {
          const projectedProgress =
            swipeProgress.value - (event.velocityX / screenWidth) * 0.15;
          const targetProgress = projectedProgress >= 0.5 ? 1 : 0;

          swipeProgress.value = withTiming(
            targetProgress,
            {
              duration: 260,
              easing: Easing.out(Easing.cubic),
            },
            (finished) => {
              if (finished) {
                runOnJS(completeHorizontalSwipe)(
                  targetProgress === 0 ? "players" : "history",
                );
              }
            },
          );
        })
        .onFinalize((_event, success) => {
          if (!success) {
            runOnJS(finishHorizontalRasterization)();
          }
        }),
    [
      beginHorizontalRasterization,
      completeHorizontalSwipe,
      finishHorizontalRasterization,
      screenWidth,
      swipeProgress,
      swipeStartProgress,
    ],
  );

  const refreshHistoryOnFocus = useCallback(() => {
    let isActive = true;
    const revealTimer = setTimeout(() => {
      refreshHistory().finally(() => {
        if (isActive) {
          setIsEntranceReady(true);
        }
      });
    }, CONTENT_REVEAL_DELAY);

    return () => {
      isActive = false;
      clearTimeout(revealTimer);
    };
  }, [refreshHistory]);

  useFocusEffect(refreshHistoryOnFocus);

  const statistics = useMemo(() => {
    const storedStatistics = calculateStatistics(players, history);

    if (!__DEV__) {
      return storedStatistics;
    }

    const fixtureStatistics = calculateStatistics(
      [DEV_STATISTICS_PLAYER],
      DEV_STATISTICS_HISTORY,
    ).players[0];

    return fixtureStatistics
      ? {
          ...storedStatistics,
          players: [fixtureStatistics, ...storedStatistics.players],
        }
      : storedStatistics;
  }, [history, players]);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    if (!normalizedQuery) {
      return statistics.players;
    }

    return statistics.players.filter(({ player }) =>
      normalizeSearchValue(player.name).includes(normalizedQuery),
    );
  }, [searchQuery, statistics.players]);

  const formatCount = useCallback(
    (key: "parties" | "players" | "games" | "wins", count: number) =>
      t(`statistics.counts.${key}.${getCountForm(count, language)}`, {
        count,
      }),
    [language, t],
  );

  const renderPlayer = useCallback(
    ({ item, index }: { item: PlayerStatistics; index: number }) => (
      <Animated.View
        entering={FadeInLeft.duration(220)
          .delay(80 + Math.min(index, 7) * 45)
          .easing(Easing.out(Easing.cubic))}
      >
        <PlayerStatisticsCard
          statistics={item}
          gamesLabel={formatCount("games", item.gamesPlayed)}
          winsLabel={formatCount("wins", item.wins)}
          winRateLabel={t("statistics.counts.winRate", {
            count: item.winRate,
          })}
          onPress={() =>
            navigation.navigate("PlayerStatistics", {
              playerId: item.player.id,
            })
          }
        />
      </Animated.View>
    ),
    [formatCount, navigation, t],
  );

  const popularGameName = statistics.overview.mostPopularGameId
    ? t(`gameList.games.${statistics.overview.mostPopularGameId}.title`)
    : null;
  const isLoading = !isPlayersLoaded || !isHistoryLoaded;
  const isContentReady = !isLoading && isEntranceReady;
  const emptyPlayersLabel = searchQuery.trim()
    ? t("statistics.emptySearch")
    : t("statistics.emptyPlayers");

  const handleOpenSettings = () => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

  const handleTabChange = (tab: StatisticsTab) => {
    swipeProgress.value = withTiming(
      tab === "players" ? 0 : 1,
      {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setActiveTab)(tab);
        }
      },
    );
  };

  const handleSettingsHidden = () => {
    setHasOpenedSettings(false);
    void refreshHistory();
  };

  return (
    <View style={styles.container}>
      <View
        pointerEvents="none"
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
            height: Math.max(DESIGN_HEIGHT, screenHeight / sceneScale),
          },
        ]}
      >
        <SpySetupBackgroundDecor
          width={DESIGN_WIDTH}
          height={DESIGN_HEIGHT}
          style={styles.backgroundDecor}
        />

        <LinearGradient
          colors={["rgba(152, 128, 211, 0.8)", "rgba(47, 37, 86, 0)"]}
          locations={[0.2, 1]}
          style={styles.topReadabilityGradient}
        />

        {!isCompactScreen && (
          <StatsHeroDice
            width={HERO_DICE_WIDTH}
            height={HERO_DICE_HEIGHT}
            style={styles.heroDice}
          />
        )}

        <Image
          source={StatsWaveShadow}
          resizeMode="stretch"
          style={[styles.wave, { transform: [{ translateY: surfaceOffset }] }]}
        />

        <View
          style={[
            styles.surfaceExtension,
            { transform: [{ translateY: surfaceOffset }] },
          ]}
        />

        <StatsWave
          width={460}
          height={713}
          style={[styles.wave, { transform: [{ translateY: surfaceOffset }] }]}
        />
      </View>

      <View
        pointerEvents="none"
        style={[styles.header, { top: insets.top + 45 }]}
      >
        <Text
          style={[
            styles.headerTitle,
            isCompactScreen && styles.headerTitleCompact,
          ]}
        >
          {t("statistics.title")}
        </Text>
        <Text style={styles.headerSubtitle}>{t("statistics.subtitle")}</Text>
      </View>

      <View style={[styles.tabs, { top: contentTop }]}>
        <StatisticsTabs
          value={activeTab}
          playersLabel={t("statistics.tabs.players")}
          historyLabel={t("statistics.tabs.history")}
          swipeProgress={swipeProgress}
          onValueChange={handleTabChange}
        />
      </View>

      <GestureDetector gesture={pagePanGesture}>
        <Animated.View
          renderToHardwareTextureAndroid={isHorizontalSwipeActive}
          shouldRasterizeIOS={isHorizontalSwipeActive}
          style={[
            styles.pagesTrack,
            {
              top: pagesTop,
              width: screenWidth * 2,
            },
            pagesAnimatedStyle,
          ]}
        >
          <View
            pointerEvents={activeTab === "players" ? "auto" : "none"}
            style={[styles.page, { width: screenWidth }]}
          >
            {!isContentReady && (
              <Animated.View
                entering={FadeIn.delay(120).duration(140)}
                exiting={FadeOut.duration(100)}
                style={styles.loadingState}
              >
                <ActivityIndicator size="small" color={colors.primary} />
              </Animated.View>
            )}

            {isContentReady && (
              <Animated.View
                entering={FadeInDown.duration(220).easing(
                  Easing.out(Easing.cubic),
                )}
                style={styles.playerControls}
              >
                <StatisticsSummary
                  popularPrefix={t("statistics.summary.popular")}
                  popularGameName={popularGameName}
                  emptyLabel={t("statistics.summary.empty")}
                  gamesLabel={formatCount(
                    "parties",
                    statistics.overview.totalGames,
                  )}
                  playersLabel={formatCount(
                    "players",
                    statistics.overview.uniquePlayerCount,
                  )}
                />

                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t("statistics.searchPlaceholder")}
                  cornerRadius={20}
                  strokeWidth={1.5}
                />
              </Animated.View>
            )}

            <FlatList
              data={isContentReady ? filteredPlayers : []}
              keyExtractor={(item) => item.player.id}
              renderItem={renderPlayer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              style={[
                styles.list,
                {
                  top: playerListTop,
                  bottom: listBottom,
                },
              ]}
              contentContainerStyle={[
                styles.listContent,
                {
                  paddingTop: topListFadeHeight,
                  paddingBottom: bottomListFadeHeight,
                },
              ]}
              ListEmptyComponent={
                isContentReady ? (
                  <Animated.View
                    entering={FadeIn.duration(180)}
                    style={styles.emptyState}
                  >
                    <Text style={styles.placeholderText}>
                      {emptyPlayersLabel}
                    </Text>
                  </Animated.View>
                ) : null
              }
            />

            <LinearGradient
              pointerEvents="none"
              colors={[colors.background, "rgba(248, 244, 253, 0)"]}
              style={[
                styles.topListFade,
                {
                  top: playerListTop,
                  height: topListFadeHeight,
                },
              ]}
            />

            <LinearGradient
              pointerEvents="none"
              colors={["rgba(248, 244, 253, 0)", colors.background]}
              style={[
                styles.bottomListFade,
                {
                  bottom: listBottom,
                  height: bottomListFadeHeight,
                },
              ]}
            />
          </View>

          <View
            pointerEvents={activeTab === "history" ? "auto" : "none"}
            style={[styles.page, { width: screenWidth }]}
          >
            <HistoryStatisticsView
              history={history}
              players={players}
              isLoading={!isContentReady}
              listBottom={listBottom}
              topFadeHeight={topListFadeHeight}
              bottomFadeHeight={bottomListFadeHeight}
            />
          </View>
        </Animated.View>
      </GestureDetector>

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
  },
  topReadabilityGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DESIGN_WIDTH,
    height: 245,
  },
  heroDice: {
    position: "absolute",
    top: 148,
    left: (DESIGN_WIDTH - HERO_DICE_WIDTH) / 2,
  },
  wave: {
    position: "absolute",
    top: WAVE_TOP,
    left: WAVE_LEFT,
    width: 460,
    height: 713,
  },
  surfaceExtension: {
    position: "absolute",
    top: 967,
    right: 0,
    left: 0,
    height: 400,
    backgroundColor: colors.background,
  },
  header: {
    position: "absolute",
    left: 72,
    right: 72,
    alignItems: "center",
  },
  headerTitle: {
    color: colors.surface,
    fontFamily: "Nunito_900Black",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },
  headerTitleCompact: {
    fontSize: 22,
    lineHeight: 30,
  },
  headerSubtitle: {
    color: colors.surface,
    opacity: 0.8,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  tabs: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  pagesTrack: {
    position: "absolute",
    left: 0,
    bottom: 0,
    flexDirection: "row",
  },
  page: {
    position: "relative",
    height: "100%",
  },
  playerControls: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    alignItems: "center",
    gap: 12,
  },
  list: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  listContent: {
    gap: 6,
  },
  topListFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
  bottomListFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
  emptyState: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingState: {
    position: "absolute",
    top: 96,
    right: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "rgba(111, 108, 164, 0.7)",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    textAlign: "center",
  },
});
