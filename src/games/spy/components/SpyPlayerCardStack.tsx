import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SpyCardRoleIllustration, SpyCardStar } from "@assets/Spy_game";
import { ClickIcon } from "@assets/icons";
import { GameStartButton } from "@/components";
import { Squircle } from "@/components/Squircle";
import type { SpyWordPresentation } from "@/games/spy/content/types";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

const REVEAL_DURATION = 320;
const PASS_EXIT_DURATION = 260;
const NEXT_CARD_ENTRY_DURATION = 300;
const CARD_EXIT_X = -420;
const CARD_EXIT_Y = 55;
const CARD_EXIT_ROTATION = -20;
const NEXT_CARD_ENTRY_X = 380;
const NEXT_CARD_ENTRY_Y = 35;
const NEXT_CARD_ENTRY_ROTATION = 12;

type CardOrnamentProps = {
  style?: StyleProp<ViewStyle>;
};

function CardOrnament({ style }: CardOrnamentProps) {
  return (
    <View pointerEvents="none" style={[styles.ornament, style]}>
      <View style={styles.ornamentLine} />
      <SpyCardStar width={15} height={15} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

function preventIntraWordWrap(value: string) {
  return value.replace(/\S(?=\S)/g, "$&\u2060");
}

type SpyPlayerCardStackProps = {
  categoryId: string;
  playerName: string;
  wordName: string;
  wordImage?: ImageSourcePropType;
  presentation: SpyWordPresentation;
  revealType: "word" | "spy";
  spyKnowledge?: {
    mode: "otherSpies" | "nonSpies";
    names: readonly string[];
  };
  revealed: boolean;
  showReadyCard: boolean;
  onReveal: () => void;
  onPassPhone: () => boolean;
  onStartGame: () => void;
  compact?: boolean;
};

type CardPhase =
  | "closed"
  | "revealing"
  | "revealed"
  | "passing"
  | "waitingForNext"
  | "entering"
  | "ready";

type RenderedPlayer = {
  name: string;
  revealType: "word" | "spy";
};

export const SpyPlayerCardStack = memo(function SpyPlayerCardStack({
  categoryId,
  playerName,
  wordName,
  wordImage,
  presentation,
  revealType,
  spyKnowledge,
  revealed,
  showReadyCard,
  onReveal,
  onPassPhone,
  onStartGame,
  compact = false,
}: SpyPlayerCardStackProps) {
  const { t } = useLocalization();
  const { playPrimaryAction, playSetupStart } = useAppHaptics();
  const [phase, setPhase] = useState<CardPhase>(
    revealed ? "revealed" : "closed",
  );
  const [renderedPlayer, setRenderedPlayer] = useState<RenderedPlayer>(() => ({
    name: playerName,
    revealType,
  }));
  const revealProgress = useSharedValue(revealed ? 1 : 0);
  const passProgress = useSharedValue(0);
  const nextCardEntryProgress = useSharedValue(1);
  const animationFrameRef = useRef<number | null>(null);
  const isClosedLayerVisible =
    phase === "closed" || phase === "revealing" || phase === "entering";
  const isRevealedLayerVisible =
    phase === "closed" ||
    phase === "revealing" ||
    phase === "revealed" ||
    phase === "passing";
  const isSpy = renderedPlayer.revealType === "spy";
  const categoryRevealTranslationKey = `spyReveal.categories.${categoryId}`;

  const closedCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          interpolate(revealProgress.value, [0, 1], [0, CARD_EXIT_X]) +
          interpolate(
            nextCardEntryProgress.value,
            [0, 1],
            [NEXT_CARD_ENTRY_X, 0],
          ),
      },
      {
        translateY:
          interpolate(revealProgress.value, [0, 1], [0, CARD_EXIT_Y]) +
          interpolate(
            nextCardEntryProgress.value,
            [0, 1],
            [NEXT_CARD_ENTRY_Y, 0],
          ),
      },
      {
        rotate: `${
          interpolate(revealProgress.value, [0, 1], [0, CARD_EXIT_ROTATION]) +
          interpolate(
            nextCardEntryProgress.value,
            [0, 1],
            [NEXT_CARD_ENTRY_ROTATION, 0],
          )
        }deg`,
      },
    ],
  }));

  const revealedCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(passProgress.value, [0, 0.98, 1], [1, 1, 0]),
    transform: [
      {
        translateX: interpolate(passProgress.value, [0, 1], [0, CARD_EXIT_X]),
      },
      {
        translateY: interpolate(passProgress.value, [0, 1], [0, CARD_EXIT_Y]),
      },
      {
        rotate: `${interpolate(
          passProgress.value,
          [0, 1],
          [0, CARD_EXIT_ROTATION],
        )}deg`,
      },
    ],
  }));

  const finishReveal = useCallback(() => {
    onReveal();
    setPhase("revealed");
  }, [onReveal]);

  const handleReveal = useCallback(() => {
    if (phase !== "closed") {
      return;
    }

    playPrimaryAction();
    passProgress.value = 0;
    setPhase("revealing");
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      revealProgress.value = withTiming(
        1,
        {
          duration: REVEAL_DURATION,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishReveal)();
          }
        },
      );
    });
  }, [finishReveal, passProgress, phase, playPrimaryAction, revealProgress]);

  const finishNextCardEntry = useCallback(() => {
    setPhase("closed");
  }, []);

  const finishPassExit = useCallback(() => {
    const hasNextPlayer = onPassPhone();
    setPhase(hasNextPlayer ? "waitingForNext" : "ready");
  }, [onPassPhone]);

  const handlePassPhone = useCallback(() => {
    if (phase !== "revealed") {
      return;
    }

    playPrimaryAction();
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setPhase("passing");
    passProgress.value = 0;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      passProgress.value = withTiming(
        1,
        {
          duration: PASS_EXIT_DURATION,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishPassExit)();
          }
        },
      );
    });
  }, [finishPassExit, passProgress, phase, playPrimaryAction]);

  const handleStartGame = useCallback(() => {
    playSetupStart();
    onStartGame();
  }, [onStartGame, playSetupStart]);

  useEffect(() => {
    if (phase !== "waitingForNext") {
      return;
    }

    revealProgress.value = 0;
    passProgress.value = 0;
    nextCardEntryProgress.value = 0;
    setRenderedPlayer({ name: playerName, revealType });

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setPhase("entering");
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;
        nextCardEntryProgress.value = withTiming(
          1,
          {
            duration: NEXT_CARD_ENTRY_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(finishNextCardEntry)();
            }
          },
        );
      });
    });
  }, [
    finishNextCardEntry,
    nextCardEntryProgress,
    passProgress,
    phase,
    playerName,
    revealProgress,
    revealType,
  ]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cancelAnimation(revealProgress);
      cancelAnimation(passProgress);
      cancelAnimation(nextCardEntryProgress);
    };
  }, [nextCardEntryProgress, passProgress, revealProgress]);

  return (
    <View style={[styles.stack, compact && styles.stackCompact]}>
      <View pointerEvents="none" style={styles.stackShadow} />
      <View style={[styles.backCard, styles.thirdCard]} />
      <View style={[styles.backCard, styles.secondCard]} />

      {showReadyCard && (
        <View style={[styles.frontCardLayer, styles.readyCardLayer]}>
          <View style={styles.frontCardSurface}>
            <Squircle
              style={styles.frontCard}
              cornerRadius={28}
              fillColor={colors.background}
            >
              <CardOrnament style={styles.readyTopOrnament} />
              <Text style={styles.readyTitle}>
                {t("spyReveal.allRolesReceived")}
              </Text>
              <CardOrnament style={styles.readyBottomOrnament} />
              <Text style={styles.readyInstruction}>
                {t("spyReveal.readyInstruction")}
              </Text>
              <GameStartButton
                text={t("spyReveal.startGame")}
                onPress={handleStartGame}
                style={styles.readyStartButton}
                textStyle={styles.passButtonText}
                cornerRadius={10}
              />
            </Squircle>
          </View>
        </View>
      )}

      <Animated.View
        style={[
          styles.frontCardLayer,
          styles.revealedCardLayer,
          !isRevealedLayerVisible && styles.hiddenCardLayer,
          revealedCardAnimatedStyle,
        ]}
      >
        <View style={styles.frontCardSurface}>
          <Squircle
            style={styles.frontCard}
            cornerRadius={28}
            fillColor={colors.background}
          >
            <View style={styles.revealedContent}>
              <View
                style={[
                  isSpy ? styles.roleMainContent : styles.wordMainContent,
                  presentation === "text" &&
                    !isSpy &&
                    styles.textWordMainContent,
                ]}
              >
                <CardOrnament />

                <Squircle
                  style={[styles.wordLabel, isSpy && styles.roleLabel]}
                  cornerRadius={10}
                  fillColor={colors.secondary4}
                >
                  <Text style={styles.wordLabelText}>
                    {t(
                      isSpy
                        ? "spyReveal.roleLabel"
                        : `${categoryRevealTranslationKey}.wordLabel`,
                    )}
                  </Text>
                </Squircle>

                {(isSpy || presentation === "image") && (
                  <Text
                    style={[styles.wordTitle, isSpy && styles.roleTitle]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {isSpy ? t("spyReveal.spyRoleName") : wordName}
                  </Text>
                )}

                {isSpy ? (
                  <Image
                    source={SpyCardRoleIllustration}
                    resizeMode="contain"
                    style={styles.roleIllustration}
                  />
                ) : presentation === "image" && wordImage ? (
                  <Image
                    source={wordImage}
                    resizeMode="cover"
                    style={styles.wordImage}
                  />
                ) : (
                  <View style={styles.textWordArea}>
                    <Text
                      style={styles.textWordName}
                      numberOfLines={4}
                      adjustsFontSizeToFit
                      minimumFontScale={0.45}
                      android_hyphenationFrequency="none"
                      textBreakStrategy="simple"
                      accessibilityLabel={wordName}
                    >
                      {preventIntraWordWrap(wordName)}
                    </Text>
                  </View>
                )}

                {isSpy && spyKnowledge && spyKnowledge.names.length > 0 && (
                  <View style={styles.otherSpiesBlock}>
                    <Text style={styles.otherSpiesLabel}>
                      {t(
                        spyKnowledge.mode === "nonSpies"
                          ? "spyReveal.allPlayersAreSpiesExcept"
                          : "spyReveal.otherSpies",
                      )}
                    </Text>
                    <View style={styles.otherSpiesPill}>
                      <Text
                        style={styles.otherSpiesNames}
                        numberOfLines={3}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {spyKnowledge.names.join(", ")}
                      </Text>
                    </View>
                  </View>
                )}

                <CardOrnament
                  style={[
                    isSpy && styles.roleBottomOrnament,
                    isSpy &&
                      (!spyKnowledge || spyKnowledge.names.length === 0) &&
                      styles.roleBottomOrnamentWithoutKnowledge,
                  ]}
                />
              </View>

              <View style={styles.revealedBottomContent}>
                <View style={styles.warningArea}>
                  <Text style={styles.wordWarning}>
                    {t(
                      `${categoryRevealTranslationKey}.${
                        isSpy ? "spyWarning" : "wordWarning"
                      }`,
                    )}
                  </Text>
                </View>
                <GameStartButton
                  text={t("spyReveal.passPhone")}
                  onPress={handlePassPhone}
                  style={styles.passButton}
                  textStyle={styles.passButtonText}
                  cornerRadius={10}
                />
              </View>
            </View>
          </Squircle>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={phase === "closed" ? "auto" : "none"}
        style={[
          styles.frontCardLayer,
          styles.closedCardLayer,
          !isClosedLayerVisible && styles.hiddenCardLayer,
          closedCardAnimatedStyle,
        ]}
      >
        <View style={styles.frontCardSurface}>
          <Squircle
            style={styles.frontCard}
            cornerRadius={28}
            fillColor={colors.background}
          >
            <CardOrnament style={[styles.hiddenOrnament, styles.topOrnament]} />
            <Text
              style={styles.playerName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.55}
            >
              {renderedPlayer.name}
            </Text>
            <CardOrnament
              style={[styles.hiddenOrnament, styles.bottomOrnament]}
            />
            <Text style={styles.instruction}>
              {t(`${categoryRevealTranslationKey}.instruction`, {
                name: renderedPlayer.name,
              })}
            </Text>
            <ClickIcon
              pointerEvents="none"
              width={57}
              height={81}
              style={styles.clickIcon}
            />
          </Squircle>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("spyReveal.revealCard", {
            name: renderedPlayer.name,
          })}
          disabled={phase !== "closed"}
          onPress={handleReveal}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  stack: { width: 340, height: 590 },
  stackCompact: { transform: [{ scale: 0.9 }] },
  stackShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: "rgba(248, 244, 253, 0.01)",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 12,
        spreadDistance: 0,
        color: "rgba(47, 37, 86, 0.32)",
      },
    ],
  },
  backCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  secondCard: { backgroundColor: "#DECFF7", transform: [{ rotate: "-4deg" }] },
  thirdCard: { backgroundColor: "#CEBCED", transform: [{ rotate: "5deg" }] },
  frontCardLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  revealedCardLayer: { zIndex: 2 },
  closedCardLayer: { zIndex: 3 },
  readyCardLayer: { zIndex: 1 },
  hiddenCardLayer: { display: "none" },
  frontCardSurface: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: colors.background,
  },
  frontCard: { width: "100%", height: "100%", overflow: "hidden" },
  ornament: { flexDirection: "row", alignItems: "center", gap: 10 },
  hiddenOrnament: { position: "absolute", left: 64.5 },
  topOrnament: { top: 94 },
  bottomOrnament: { top: 215 },
  ornamentLine: {
    width: 88,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.secondary4,
  },
  playerName: {
    position: "absolute",
    top: 129,
    right: 24,
    left: 24,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 48,
    lineHeight: 65,
    textAlign: "center",
  },
  instruction: {
    position: "absolute",
    top: 292,
    right: 35,
    left: 35,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
  },
  clickIcon: { position: "absolute", top: 400, left: 141.5 },
  revealedContent: { flex: 1, paddingTop: 28, alignItems: "center" },
  wordMainContent: { alignItems: "center", gap: 18 },
  roleMainContent: { alignItems: "center", marginTop: -4 },
  wordLabel: {
    height: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  wordLabelText: {
    color: colors.primary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  roleLabel: { marginTop: 18 },
  wordTitle: {
    width: 300,
    height: 55,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 40,
    lineHeight: 55,
    textAlign: "center",
    textAlignVertical: "center",
  },
  roleTitle: { marginTop: 8 },
  wordImage: { width: 270, height: 214, borderRadius: 20, overflow: "hidden" },
  textWordArea: {
    width: 286,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textWordName: {
    width: "100%",
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 42,
    lineHeight: 50,
    textAlign: "center",
    textAlignVertical: "center",
  },
  roleIllustration: { width: 247, height: 149, marginTop: 12 },
  roleBottomOrnament: { marginTop: 12 },
  roleBottomOrnamentWithoutKnowledge: { marginTop: 32 },
  revealedBottomContent: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  warningArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  otherSpiesBlock: { width: 290, marginTop: 10, alignItems: "center", gap: 4 },
  otherSpiesLabel: {
    color: "#FB8585",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  otherSpiesPill: {
    minHeight: 28,
    maxWidth: 290,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDC7C7",
  },
  otherSpiesNames: {
    color: "#ED1818",
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  wordWarning: {
    width: 276,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  passButton: { width: "100%", height: 50 },
  passButtonText: { fontSize: 18, lineHeight: 25 },
  readyTopOrnament: { position: "absolute", top: 122, left: 64.5 },
  readyTitle: {
    position: "absolute",
    top: 161,
    right: 28,
    left: 28,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 32,
    lineHeight: 44,
    textAlign: "center",
  },
  readyBottomOrnament: { position: "absolute", top: 274, left: 64.5 },
  readyInstruction: {
    position: "absolute",
    top: 350,
    right: 38,
    left: 38,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
  },
  readyStartButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    left: 20,
    height: 50,
  },
  textWordMainContent: {
    paddingTop: 32,
    gap: 32,
  },
});
