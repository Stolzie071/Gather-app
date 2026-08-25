import {
  ActivityIndicator,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  FlatList,
} from "react-native";

import {
  GameListFrontWave,
  GameListFrontWaveShadow,
  HeroDice,
  HeroHands,
} from "@assets/Decorate/GameListScreen";
import { Star1, Star2, Star3, Star4 } from "@assets/Decorate/MainScreen";
import { games, type Game } from "@/data/games";

import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackButton,
  type GameListTab,
  GameListTabs,
  SearchBar,
  SettingsButton,
  SettingsSheet,
  GameCard,
} from "@/components";
import type { RootStackParamList } from "@/navigation/types";
import { useFavorites } from "@/favorites/FavoritesProvider";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import { LinearGradient } from "expo-linear-gradient";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const SURFACE_TOP = 169;
const CARD_SHADOW_SPACE = 6;
const TOP_LIST_FADE_HEIGHT = 8;
const BOTTOM_LIST_FADE_HEIGHT = 16;
const TABS_HEIGHT = 59;
const CONTENT_REVEAL_DELAY = 370;
function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll("ё", "е");
}

function filterGames(gameList: Game[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return gameList;
  }

  return gameList.filter((game) =>
    game.searchTerms.some((term) =>
      normalizeSearchValue(term).includes(normalizedQuery),
    ),
  );
}

type GameListScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "GameList"
>;

export function GameListScreen({ navigation }: GameListScreenProps) {
  const { t } = useLocalization();
  const { favoriteGameIds } = useFavorites();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const sceneScale = screenWidth / DESIGN_WIDTH;
  const topListFadeHeight = TOP_LIST_FADE_HEIGHT * sceneScale;
  const bottomListFadeHeight = BOTTOM_LIST_FADE_HEIGHT * sceneScale;
  const listTop = (349 - CARD_SHADOW_SPACE) * sceneScale - topListFadeHeight;
  const listBottom = insets.bottom + TABS_HEIGHT;

  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<GameListTab>("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [isHorizontalSwipeActive, setIsHorizontalSwipeActive] = useState(false);
  const rasterizationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const swipeProgress = useSharedValue(0);
  const swipeStartProgress = useSharedValue(0);
  const filteredGames = useMemo(
    () => filterGames(games, searchQuery),
    [searchQuery],
  );
  const filteredFavoriteGames = useMemo(
    () =>
      filterGames(
        games.filter((game) => favoriteGameIds.has(game.id)),
        searchQuery,
      ),
    [favoriteGameIds, searchQuery],
  );

  const listsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -swipeProgress.value * screenWidth }],
  }));

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIsContentReady(true);
    }, CONTENT_REVEAL_DELAY);

    return () => clearTimeout(revealTimer);
  }, []);

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
    (tab: GameListTab) => {
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

  const handleTabChange = (tab: GameListTab) => {
    swipeProgress.value = withTiming(
      tab === "all" ? 0 : 1,
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

  const handleOpenSettings = () => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

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
                  targetProgress === 0 ? "all" : "favorites",
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

  const renderGameCard = useCallback(
    ({ item, index }: { item: Game; index: number }) => {
      const Illustration = item.Illustration;

      return (
        <Animated.View
          entering={FadeInLeft.duration(220)
            .delay(80 + Math.min(index, 7) * 45)
            .easing(Easing.out(Easing.cubic))}
        >
          <GameCard
            title={t(item.titleKey)}
            players={t(item.playersKey)}
            duration={t(item.durationKey)}
            illustration={<Illustration width={96} height={86} opacity={0.5} />}
            onPress={
              item.available
                ? () => navigation.navigate(item.route)
                : undefined
            }
            comingSoonLabel={
              item.available ? undefined : t("gameList.comingSoon")
            }
          />
        </Animated.View>
      );
    },
    [navigation, t],
  );

  return (
    <LinearGradient
      colors={["#8B62E2", "#C09EFF"]}
      locations={[0, 0.55]}
      start={{ x: 0, y: 0.34 }}
      end={{ x: 1, y: 0.66 }}
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
        <Star2 width={15} height={15} style={styles.starTopLeft} />
        <Star3 width={9} height={9} style={styles.starTop} />
        <Star4 width={9} height={9} style={styles.starLeft} />
        <Star1 width={12} height={12} style={styles.starRight} />

        <HeroDice width={146} height={128} style={styles.heroDice} />

        <View style={styles.surfaceScene}>
          <Image
            source={GameListFrontWaveShadow}
            style={styles.waveAsset}
            resizeMode="stretch"
          />

          <GameListFrontWave
            width={465}
            height={836}
            style={styles.waveAsset}
          />
          <View style={styles.headingBlock}>
            <Text
              style={styles.title}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {t("gameList.title")}
            </Text>

            <Text style={styles.subtitle}>{t("gameList.subtitle")}</Text>
          </View>
        </View>

        <HeroHands width={131} height={90} style={styles.heroHands} />
      </View>
      <View
        pointerEvents="box-none"
        style={[
          styles.contentScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
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
            entering={FadeInDown.duration(220).easing(Easing.out(Easing.cubic))}
            style={styles.searchBar}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("gameList.searchPlaceholder")}
              style={styles.searchBarFill}
            />
          </Animated.View>
        )}
      </View>
      <GestureDetector gesture={pagePanGesture}>
        <Animated.View
          renderToHardwareTextureAndroid={isHorizontalSwipeActive}
          shouldRasterizeIOS={isHorizontalSwipeActive}
          style={[
            styles.listsTrack,
            {
              width: screenWidth * 2,
              top: listTop,
              bottom: listBottom,
            },
            listsAnimatedStyle,
          ]}
        >
          <View
            pointerEvents={activeTab === "all" ? "auto" : "none"}
            style={{ width: screenWidth }}
          >
            <FlatList
              data={isContentReady ? filteredGames : []}
              keyExtractor={(item) => item.id}
              renderItem={renderGameCard}
              ListEmptyComponent={
                isContentReady ? (
                  <Animated.View
                    entering={FadeIn.duration(180)}
                    style={styles.emptyListAnimation}
                  >
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyListText}>
                        {t("gameList.emptySearch")}
                      </Text>
                    </View>
                  </Animated.View>
                ) : null
              }
              style={[
                styles.gameList,
                {
                  top: 0,
                  left: (16 - CARD_SHADOW_SPACE) * sceneScale,
                  right: (16 - CARD_SHADOW_SPACE) * sceneScale,
                  bottom: 0,
                },
              ]}
              contentContainerStyle={[
                styles.gameListContent,
                {
                  paddingTop:
                    topListFadeHeight + CARD_SHADOW_SPACE * sceneScale,
                  paddingBottom: bottomListFadeHeight,
                  paddingHorizontal: CARD_SHADOW_SPACE * sceneScale,
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          </View>

          <View
            pointerEvents={activeTab === "favorites" ? "auto" : "none"}
            style={{ width: screenWidth }}
          >
            <FlatList
              data={isContentReady ? filteredFavoriteGames : []}
              keyExtractor={(item) => item.id}
              renderItem={renderGameCard}
              ListEmptyComponent={
                isContentReady ? (
                  <Animated.View
                    entering={FadeIn.duration(180)}
                    style={styles.emptyListAnimation}
                  >
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyListText}>
                        {searchQuery.trim()
                          ? t("gameList.emptySearch")
                          : t("gameList.emptyFavorites")}
                      </Text>
                      {!searchQuery.trim() && (
                        <Text style={styles.emptyFavoritesFace}>:(</Text>
                      )}
                    </View>
                  </Animated.View>
                ) : null
              }
              style={[
                styles.gameList,
                {
                  top: 0,
                  left: (16 - CARD_SHADOW_SPACE) * sceneScale,
                  right: (16 - CARD_SHADOW_SPACE) * sceneScale,
                  bottom: 0,
                },
              ]}
              contentContainerStyle={[
                styles.gameListContent,
                {
                  paddingTop:
                    topListFadeHeight + CARD_SHADOW_SPACE * sceneScale,
                  paddingBottom: bottomListFadeHeight,
                  paddingHorizontal: CARD_SHADOW_SPACE * sceneScale,
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(248, 244, 253, 0)"]}
        style={[
          styles.topListFade,
          {
            top: listTop,
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

      <GameListTabs
        activeTab={activeTab}
        allLabel={t("gameList.tabs.all")}
        favoritesLabel={t("gameList.tabs.favorites")}
        bottomInset={insets.bottom}
        swipeProgress={swipeProgress}
        onTabChange={handleTabChange}
      />

      {hasOpenedSettings && (
        <SettingsSheet
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onHidden={() => setHasOpenedSettings(false)}
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
    justifyContent: "center",
    overflow: "hidden",
  },
  surfaceScene: {
    position: "absolute",
    top: SURFACE_TOP,
    left: 0,

    width: DESIGN_WIDTH,
    height: 757,
  },

  waveAsset: {
    position: "absolute",
    top: -42,
    left: -31,
    width: 465,
    height: 836,
  },
  designScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",

    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,

    transformOrigin: "center top",
  },
  heroDice: {
    position: "absolute",
    top: 115,
    left: 196.5,
  },

  heroHands: {
    position: "absolute",
    top: 150.5,
    left: 190.5,
  },

  starTopLeft: {
    position: "absolute",
    top: 100,
    left: 100,
    opacity: 0.55,
    transform: [{ rotate: "-10deg" }],
  },

  starTop: {
    position: "absolute",
    top: 78,
    left: 177,
    opacity: 0.75,
  },

  starLeft: {
    position: "absolute",
    top: 146,
    left: 130,
    opacity: 0.4,
  },

  starRight: {
    position: "absolute",
    top: 146,
    left: 355,
    opacity: 0.8,
    transform: [{ rotate: "12deg" }],
  },

  headingBlock: {
    position: "absolute",
    top: 18,
    left: 30,

    gap: 9,
  },

  title: {
    width: 140,
    minHeight: 56,

    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: colors.textPrimary,
  },

  subtitle: {
    width: 300,

    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textSecondary,
  },
  contentScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",

    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,

    transformOrigin: "center top",
  },

  searchBar: {
    position: "absolute",
    top: 289,
    left: 16,
    width: 370,
  },
  searchBarFill: {
    width: "100%",
  },
  loadingState: {
    position: "absolute",
    top: 304,
    right: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  gameList: {
    position: "absolute",
  },

  listsTrack: {
    position: "absolute",
    left: 0,

    flexDirection: "row",
  },

  gameListContent: {
    flexGrow: 1,
    gap: 16,
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

  emptyListAnimation: {
    flex: 1,
  },

  emptyList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    opacity: 0.7,
  },

  emptyListText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: colors.textSecondary,
    textAlign: "center",
  },

  emptyFavoritesFace: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Nunito_700Bold",
    color: colors.textSecondary,
  },
});
