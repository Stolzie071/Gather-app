import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Image } from "react-native";
import { Title } from "../components/Title";
import { SubTitle } from "../components/Subtitle";
import { Button } from "../components/Button";
import { SettingsButton } from "../components/SettingsButton";
import FrontWave from "../../assets/Decorate/Front_wave.svg";
import DiceIcon from "../../assets/icons/mini_dice_1.svg";
import CupIcon from "../../assets/icons/Cup.svg";
import ArrowIcon from "../../assets/icons/Arrow.svg";
import { colors } from "../theme/colors";
import PlantsLeftBot from "../../assets/Decorate/plants_left_bot.svg";
import PlantsRightBot from "../../assets/Decorate/plants_right_bot.svg";
import Wave_left_top from "../../assets/Decorate/Wave_left_top.svg";
import Wave_right_down from "../../assets/Decorate/Wave_right_down.svg";
import Dice_guy from "../../assets/Decorate/dice_guy.svg";
import Hand from "../../assets/Decorate/hand.svg";
import Star_1 from "../../assets/Decorate/Star 1.svg";
import Star_2 from "../../assets/Decorate/Star 2.svg";
import Star_3 from "../../assets/Decorate/Star 3.svg";
import Star_4 from "../../assets/Decorate/Star 4.svg";
import Title_decor from "../../assets/Decorate/title_decor.svg";
import Title_decor_2 from "../../assets/Decorate/title_decor_2.svg";
import Dice_decor from "../../assets/Decorate/dice_decor.svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { SettingsSheet } from "../components/SettingsSheet";
import FrontWaveShadow from "../../assets/Decorate/Front_wave_shadow.png";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Wave_left_top style={styles.Wave_left_top} />
        <Wave_right_down style={styles.Wave_right_down} />
        <Star_1 style={styles.Star_1} />
        <Star_2 style={styles.Star_2} />
        <Star_3 style={styles.Star_3} />
        <Star_4 style={styles.Star_4} />
        <View style={styles.waveScene}>
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
        <PlantsLeftBot style={styles.plantsLeft} />
        <PlantsRightBot style={styles.plantsRight} />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.titleBlock}>
          <View style={styles.logoScene}>
            <Title_decor_2 style={styles.titleDecorLeft} />
            <Title text="Gather" />
            <Title_decor style={styles.titleDecorRight} />
          </View>

          <SubTitle text="Вечер станет интереснее" />
        </View>

        <View style={styles.buttonsBlock}>
          <Button
            text="Играть"
            onPress={() => {}}
            icon={<DiceIcon width={36} height={36} />}
            rightIcon={
              <ArrowIcon width={13} height={23} color={colors.surface} />
            }
          />
          <Button
            text="Статистика"
            onPress={() => {}}
            variant="secondary"
            icon={<CupIcon width={36} height={36} />}
            rightIcon={
              <ArrowIcon width={13} height={23} color={colors.textPrimary} />
            }
          />
        </View>
      </View>

      <Text style={[styles.version, { bottom: insets.bottom + 8 }]}>v.0.1</Text>
      <SettingsButton
        onPress={() => setIsSettingsOpen(true)}
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
    justifyContent: "space-between",
    paddingTop: 370,
    paddingBottom: 20,
  },

  titleBlock: {
    alignItems: "center",
  },

  buttonsBlock: {
    gap: 16,
    width: 320,
  },

  mainContent: {
    alignItems: "center",
    gap: 45,
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
    left: 110,
    top: -64,
  },

  Hand: {
    position: "absolute",
    left: 283,
    top: 70,
  },

  waveScene: {
    position: "absolute",
    alignSelf: "center",
    top: 264,
    width: 499,
    height: 775,
  },

  Star_1: {
    position: "absolute",
    top: 167,
    left: 35,
  },
  Star_2: {
    position: "absolute",
    top: 141,
    left: 354,
  },
  Star_3: {
    position: "absolute",
    top: 196,
    left: 356,
  },

  Star_4: {
    position: "absolute",
    top: 104,
    left: 285,
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
    left: 150,
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
