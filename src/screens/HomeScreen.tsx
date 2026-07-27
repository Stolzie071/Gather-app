import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  Image,
  useWindowDimensions,
} from "react-native";

import {
  Button,
  SettingsButton,
  SettingsSheet,
  SubTitle,
  Title,
} from "@/components";

import { ArrowIcon, CupIcon, DiceIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

import {
  Dice_decor,
  Dice_guy,
  FrontWave,
  FrontWaveShadow,
  Hand,
  PlantsLeftBot,
  PlantsRightBot,
  Star1,
  Star2,
  Star3,
  Star4,
  TitleDecor,
  TitleDecor2,
  WaveLeftTop,
  WaveRightDown,
} from "@assets/Decorate";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

const WAVE_WIDTH = 499;
const WAVE_SIDE_OVERFLOW = 48;
const DESIGN_HEIGHT = 874;
const COMPACT_MAX_HEIGHT = 700;
const COMPACT_MAX_WIDTH = 350;
const COMPACT_WAVE_OFFSET = 16;
const COMPACT_BUTTON_SIDE_MARGIN = 40;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const waveScale = (screenWidth + WAVE_SIDE_OVERFLOW * 2) / WAVE_WIDTH;
  const verticalScale = Math.min(screenHeight / DESIGN_HEIGHT, 1);
  const isCompactScreen =
    screenHeight < COMPACT_MAX_HEIGHT || screenWidth < COMPACT_MAX_WIDTH;
  const buttonIconSize = isCompactScreen ? 30 : 36;
  const arrowWidth = isCompactScreen ? 11 : 13;
  const arrowHeight = isCompactScreen ? 20 : 23;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: 370 * verticalScale }]}>
      <View style={styles.background}>
        <WaveLeftTop style={styles.Wave_left_top} />
        <WaveRightDown style={styles.Wave_right_down} />
        <Star1 style={styles.Star_1} />
        <Star2 style={styles.Star_2} />
        <Star3 style={styles.Star_3} />
        <Star4 style={styles.Star_4} />
        <View
          style={[
            styles.waveScene,
            {
              top:
                264 * verticalScale -
                (isCompactScreen ? COMPACT_WAVE_OFFSET : 0),
              transform: [{ scale: waveScale }],
            },
          ]}
        >
          <Dice_guy style={styles.Dice_guy} />
          <Dice_decor style={styles.Dice_decor} />
          <Image
            source={FrontWaveShadow}
            style={styles.frontWaveShadow}
            resizeMode="stretch"
          />
          <FrontWave width="100%" height="100%" style={styles.frontWave} />
          <Hand style={styles.Hand} />
        </View>
        {!isCompactScreen && (
          <>
            <PlantsLeftBot style={styles.plantsLeft} />
            <PlantsRightBot style={styles.plantsRight} />
          </>
        )}
      </View>

      <View
        style={[
          styles.mainContent,
          { gap: isCompactScreen ? 28 : 45 * verticalScale },
        ]}
      >
        <View style={styles.titleBlock}>
          <View style={styles.logoScene}>
            <TitleDecor2 style={styles.titleDecorLeft} />
            <Title text="Gather" compact={isCompactScreen} />
            <TitleDecor style={styles.titleDecorRight} />
          </View>

          <SubTitle text="Вечер станет интереснее" />
        </View>

        <View
          style={[
            styles.buttonsBlock,
            isCompactScreen && styles.buttonsBlockCompact,
            isCompactScreen && {
              width: screenWidth - COMPACT_BUTTON_SIDE_MARGIN * 2,
            },
          ]}
        >
          <Button
            text="Играть"
            onPress={() => {}}
            compact={isCompactScreen}
            icon={<DiceIcon width={buttonIconSize} height={buttonIconSize} />}
            rightIcon={
              <ArrowIcon
                width={arrowWidth}
                height={arrowHeight}
                color={colors.surface}
              />
            }
          />
          <Button
            text="Статистика"
            onPress={() => {}}
            variant="secondary"
            compact={isCompactScreen}
            icon={<CupIcon width={buttonIconSize} height={buttonIconSize} />}
            rightIcon={
              <ArrowIcon
                width={arrowWidth}
                height={arrowHeight}
                color={colors.textPrimary}
              />
            }
          />
        </View>
      </View>

      <Text style={[styles.version, { bottom: insets.bottom + 2 }]}>v.0.1</Text>
      <SettingsButton
        onPress={() => setIsSettingsOpen(true)}
        compact={isCompactScreen}
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 20,
        }}
      />

      <SettingsSheet
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 20,
  },

  titleBlock: {
    alignItems: "center",
  },

  buttonsBlock: {
    gap: 16,
    width: "100%",
    maxWidth: 320,
  },

  buttonsBlockCompact: {
    gap: 12,
  },

  mainContent: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },

  version: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textSecondary,
    opacity: 0.45,
  },

  frontWave: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  plantsLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
  },

  plantsRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },

  Wave_left_top: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  Wave_right_down: {
    position: "absolute",
    top: 220,
    right: -3,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#B393ED",
  },

  Dice_guy: {
    position: "absolute",
    left: 131,
    top: -64,
  },

  Hand: {
    position: "absolute",
    left: 304,
    top: 70,
  },

  waveScene: {
    position: "absolute",
    alignSelf: "center",
    width: 499,
    height: 775,
    transformOrigin: "center top",
  },

  Star_1: {
    position: "absolute",
    top: 167,
    left: 35,
  },
  Star_2: {
    position: "absolute",
    top: 141,
    right: 33,
  },
  Star_3: {
    position: "absolute",
    top: 196,
    right: 47,
  },

  Star_4: {
    position: "absolute",
    top: 104,
    right: 108,
  },

  titleDecorLeft: {
    transform: [{ translateY: -2 }, { rotate: "-6deg" }],
  },

  titleDecorRight: {
    transform: [{ translateY: -16 }, { rotate: "-8deg" }],
  },

  logoScene: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  Dice_decor: {
    position: "absolute",
    left: 171,
    top: -70,
    transform: [{ rotate: "-12deg" }],
  },

  frontWaveShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
