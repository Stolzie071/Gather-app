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
import { useState } from "react";
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
import { SpyDice } from "@assets/GamesSections";
import type { RootStackParamList } from "@/navigation/types";
import { useFavorites } from "@/favorites/FavoritesProvider";
import { useLocalization } from "@/localization/LocalizationProvider";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const GAME_AREA_TOP = 0;
const COMPACT_GAME_AREA_TOP = -60;

type SpyGameScreenProps = BlankStackScreenProps<RootStackParamList, "SpyGame">;

export function SpyGameScreen({ navigation }: SpyGameScreenProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen = screenHeight < 700 || screenWidth < 350;
  const gameAreaTop = isCompactScreen ? COMPACT_GAME_AREA_TOP : GAME_AREA_TOP;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const spyIsFavorite = isFavorite("spy");
  const gameDescription = isCompactScreen
    ? t("spyGame.description").replace("\n", " ")
    : t("spyGame.description");

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
            <SpyDice width={174} height={158} style={styles.spyDice} />

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
                <View style={[styles.detailItem, styles.playersDetail]}>
                  <PlayersIcon width={24} height={24} />
                  <Text style={styles.detailText}>
                    {t("gameList.games.spy.players")}
                  </Text>
                </View>

                <View style={styles.detailsDivider} />

                <View style={[styles.detailItem, styles.durationDetail]}>
                  <TimeIcon width={24} height={24} />
                  <Text style={styles.detailText}>
                    {t("gameList.games.spy.duration")}
                  </Text>
                </View>
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
                onPress={() => {}}
                style={[
                  styles.startButton,
                  isCompactScreen && styles.startButtonCompact,
                ]}
              />

              <GameRulesButton />
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
    width: 303,

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
    height: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  playersDetail: {
    justifyContent: "flex-end",
  },

  durationDetail: {
    justifyContent: "flex-start",
  },

  detailText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },

  detailsDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.secondary3,
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
