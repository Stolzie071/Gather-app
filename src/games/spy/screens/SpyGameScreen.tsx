import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { colors } from "@/theme/colors";

import {
  BackButton,
  FavoriteButton,
  GameRulesButton,
  GameStartButton,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { PlayersIcon, TimeIcon } from "@assets/icons";
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
import { SpyMainDice } from "@assets/Spy_game";
import { Squircle } from "@/components/Squircle";
import type { RootStackParamList } from "@/navigation/types";
import { useFavorites } from "@/favorites/FavoritesProvider";
import { useLocalization } from "@/localization/LocalizationProvider";
import { useAppHaptics } from "@/haptics/useAppHaptics";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const GAME_AREA_TOP = 0;
const COMPACT_GAME_AREA_TOP = -60;

type SpyGameScreenProps = BlankStackScreenProps<RootStackParamList, "SpyGame">;

export function SpyGameScreen({ navigation }: SpyGameScreenProps) {
  const { t } = useLocalization();
  const { playPrimaryAction, playSuccess } = useAppHaptics();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const gameAreaTop = isCompactScreen ? COMPACT_GAME_AREA_TOP : GAME_AREA_TOP;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isRulesToastVisible, setIsRulesToastVisible] = useState(false);
  const rulesToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const spyIsFavorite = isFavorite("spy");
  const gameDescription = isCompactScreen
    ? t("spyGame.description").replace("\n", " ")
    : t("spyGame.description");

  const handleOpenSettings = () => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  };

  const handleStartGame = useCallback(() => {
    playSuccess();
    navigation.navigate("SpySetup");
  }, [navigation, playSuccess]);

  const handleRulesPress = useCallback(() => {
    playPrimaryAction();
    setIsRulesToastVisible(true);

    if (rulesToastTimerRef.current) {
      clearTimeout(rulesToastTimerRef.current);
    }

    rulesToastTimerRef.current = setTimeout(() => {
      setIsRulesToastVisible(false);
      rulesToastTimerRef.current = null;
    }, 2_000);
  }, [playPrimaryAction]);

  useEffect(
    () => () => {
      if (rulesToastTimerRef.current) {
        clearTimeout(rulesToastTimerRef.current);
      }
    },
    [],
  );

  return (
    <LinearGradient
      colors={["#B393ED", "#BD9FF3"]}
      locations={[0.21, 0.55]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        pointerEvents="box-none"
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <WaveLeftTop pointerEvents="none" style={styles.waveLeftTop} />
        <WaveRightDown pointerEvents="none" style={styles.waveRightDown} />

        <Star1
          pointerEvents="none"
          width={12}
          height={12}
          style={styles.starLeft}
        />
        <Star2
          pointerEvents="none"
          width={9}
          height={9}
          style={styles.starTopRight}
        />
        <Star3
          pointerEvents="none"
          width={9}
          height={9}
          style={styles.starRight}
        />

        <View
          pointerEvents="box-none"
          style={[
            styles.gameArea,
            {
              top: gameAreaTop,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.gameVisuals}>
            <SpyMainDice width={188} height={176} style={styles.spyDice} />

            <Image
              source={GameFrontWaveShadow}
              resizeMode="stretch"
              style={styles.frontWave}
            />
            <View
              style={[
                styles.contentBackgroundExtension,
                {
                  height: Math.max(
                    screenHeight / sceneScale - DESIGN_HEIGHT - gameAreaTop + 2,
                    0,
                  ),
                },
              ]}
            />
            <GameFrontWave width={460} height={713} style={styles.frontWave} />

            {!isCompactScreen && (
              <GameBottomWave
                width={422}
                height={67}
                style={[
                  styles.bottomWave,
                  {
                    top: screenHeight / sceneScale - 59 - gameAreaTop,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.waveContent}>
            <View
              pointerEvents="none"
              style={[
                styles.gameInfo,
                isCompactScreen && styles.gameInfoCompact,
              ]}
            >
              <Text
                style={[
                  styles.gameTitle,
                  isCompactScreen && styles.gameTitleCompact,
                ]}
              >
                {t("gameList.games.spy.title")}
              </Text>

              <View style={styles.gameDetails}>
                <Squircle
                  style={styles.detailItem}
                  cornerRadius={10}
                  fillColor={colors.secondary3}
                >
                  <PlayersIcon width={27} height={27} />
                  <Text style={styles.detailText}>
                    {t("gameList.games.spy.players")}
                  </Text>
                </Squircle>

                <Squircle
                  style={styles.detailItem}
                  cornerRadius={10}
                  fillColor={colors.secondary3}
                >
                  <TimeIcon width={27} height={27} />
                  <Text style={styles.detailText}>
                    {t("gameList.games.spy.duration")}
                  </Text>
                </Squircle>
              </View>

              <Text style={styles.gameDescription}>{gameDescription}</Text>
            </View>

            <View
              style={[
                styles.buttonsBlock,
                isCompactScreen && styles.buttonsBlockCompact,
              ]}
            >
              <GameStartButton
                text={t("spyGame.start")}
                onPress={handleStartGame}
                style={[
                  styles.startButton,
                  isCompactScreen && styles.startButtonCompact,
                ]}
              />

              <GameRulesButton onPress={handleRulesPress} />
            </View>
          </View>
        </View>
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

      <View style={[styles.rightButtons, { top: insets.top + 16 }]}>
        <SettingsButton
          onPress={handleOpenSettings}
          compact={isCompactScreen}
        />
        <FavoriteButton
          active={spyIsFavorite}
          onPress={() => toggleFavorite("spy")}
          compact={isCompactScreen}
        />
      </View>

      {isRulesToastVisible && (
        <Animated.View
          entering={FadeInUp.duration(160)}
          exiting={FadeOutDown.duration(140)}
          pointerEvents="none"
          style={styles.rulesToastPosition}
        >
          <Squircle
            style={styles.rulesToast}
            cornerRadius={16}
            fillColor="rgba(254, 254, 253, 0.96)"
          >
            <Text style={styles.rulesToastText}>
              {t("gameScreen.rules.comingSoon")}
            </Text>
          </Squircle>
        </Animated.View>
      )}

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
    overflow: "hidden",
  },

  contentBackgroundExtension: {
    position: "absolute",
    top: DESIGN_HEIGHT - 2,
    right: 0,
    left: 0,
    backgroundColor: colors.background,
  },

  rightButtons: {
    position: "absolute",
    right: 16,
    gap: 16,
  },

  rulesToastPosition: {
    position: "absolute",
    top: "48%",
    right: 24,
    left: 24,
    zIndex: 20,
    alignItems: "center",
  },

  rulesToast: {
    minWidth: 232,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "rgba(254, 254, 253, 0.96)",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 8,
        spreadDistance: 0,
        color: "rgba(47, 37, 86, 0.22)",
      },
    ],
  },

  rulesToastText: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },

  designScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",

    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,

    transformOrigin: "center top",
  },

  gameArea: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },

  gameVisuals: {
    ...StyleSheet.absoluteFillObject,
  },

  waveContent: {
    position: "absolute",
    top: 317,
    left: 16,
    width: 370,
  },

  gameInfo: {
    alignSelf: "center",
    width: 360,

    alignItems: "center",
    gap: 16,
  },

  gameInfoCompact: {
    width: 340,
  },

  gameTitle: {
    width: "100%",

    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 48,
    lineHeight: 65,
    textAlign: "center",
  },

  gameTitleCompact: {
    fontSize: 36,
    lineHeight: 42,
  },

  gameDetails: {
    width: "100%",
    height: 44,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  detailItem: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  detailText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },

  gameDescription: {
    width: "100%",

    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },

  buttonsBlock: {
    width: "100%",
    marginTop: 36,
    gap: 16,
  },

  buttonsBlockCompact: {
    marginTop: 22,
  },

  startButton: {
    width: "100%",
    height: 95,
  },

  startButtonCompact: {
    height: 80,
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
    top: 142,
    left: 116,
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
