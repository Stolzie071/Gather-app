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

type SpyPlayerCardStackProps = {
  playerName: string;
  locationName: string;
  locationImage: ImageSourcePropType;
  revealType: "location" | "spy";
  revealed: boolean;
  showReadyCard: boolean;
  onReveal: () => void;
  onPassPhone: () => boolean;
  onStartGame: () => void;
};

export const SpyPlayerCardStack = memo(function SpyPlayerCardStack({
  playerName,
  locationName,
  locationImage,
  revealType,
  revealed,
  showReadyCard,
  onReveal,
  onPassPhone,
  onStartGame,
}: SpyPlayerCardStackProps) {
  const { t } = useLocalization();
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [showClosedCard, setShowClosedCard] = useState(!revealed);
  const [isRevealedCardPrepared, setIsRevealedCardPrepared] = useState(true);
  const revealProgress = useSharedValue(revealed ? 1 : 0);
  const passProgress = useSharedValue(0);
  const nextCardEntryProgress = useSharedValue(1);
  const animationFrameRef = useRef<number | null>(null);

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
        rotate: `${interpolate(
          revealProgress.value,
          [0, 1],
          [0, CARD_EXIT_ROTATION],
        ) + interpolate(
          nextCardEntryProgress.value,
          [0, 1],
          [NEXT_CARD_ENTRY_ROTATION, 0],
        )}deg`,
      },
    ],
  }));

  const revealedCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(passProgress.value, [0, 0.98, 1], [1, 1, 0]),
    transform: [
      {
        translateX: interpolate(
          passProgress.value,
          [0, 1],
          [0, CARD_EXIT_X],
        ),
      },
      {
        translateY: interpolate(
          passProgress.value,
          [0, 1],
          [0, CARD_EXIT_Y],
        ),
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
    setShowClosedCard(false);
    setIsRevealing(false);
  }, [onReveal]);

  const handleReveal = useCallback(() => {
    if (revealed || isRevealing || isPassing) {
      return;
    }

    passProgress.value = 0;
    setIsRevealing(true);
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
  }, [
    finishReveal,
    isPassing,
    isRevealing,
    passProgress,
    revealProgress,
    revealed,
  ]);

  const finishNextCardEntry = useCallback(() => {
    passProgress.value = 0;
    setIsRevealedCardPrepared(true);
    setIsPassing(false);
  }, [passProgress]);

  const finishPassExit = useCallback(() => {
    setIsRevealedCardPrepared(false);
    const hasNextPlayer = onPassPhone();

    revealProgress.value = 0;
    setShowClosedCard(false);
    setIsRevealing(false);

    if (!hasNextPlayer) {
      setIsPassing(false);
      return;
    }

    nextCardEntryProgress.value = 0;
    setShowClosedCard(true);

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
  }, [
    finishNextCardEntry,
    nextCardEntryProgress,
    onPassPhone,
    revealProgress,
  ]);

  const handlePassPhone = useCallback(() => {
    if (isPassing) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsPassing(true);
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
  }, [finishPassExit, isPassing, passProgress]);

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
    <View style={styles.stack}>
      <View style={[styles.backCard, styles.thirdCard]} />
      <View style={[styles.backCard, styles.secondCard]} />

      {showReadyCard && (
        <View style={[styles.frontCardLayer, styles.readyCardLayer]}>
          <View style={styles.frontCardShadow}>
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
                onPress={onStartGame}
                style={styles.readyStartButton}
                textStyle={styles.passButtonText}
                cornerRadius={10}
              />
            </Squircle>
          </View>
        </View>
      )}

      {(isRevealedCardPrepared || revealed || isRevealing) && (
        <Animated.View
          style={[
            styles.frontCardLayer,
            styles.revealedCardLayer,
            revealedCardAnimatedStyle,
          ]}
        >
          <View style={styles.frontCardShadow}>
            <Squircle
              style={styles.frontCard}
              cornerRadius={28}
              fillColor={colors.background}
            >
              {revealType === "spy" ? (
                <View style={styles.revealedContent}>
                  <View style={styles.roleMainContent}>
                    <CardOrnament />

                    <Squircle
                      style={[styles.locationLabel, styles.roleLabel]}
                      cornerRadius={10}
                      fillColor={colors.secondary4}
                    >
                      <Text style={styles.locationLabelText}>
                        {t("spyReveal.roleLabel")}
                      </Text>
                    </Squircle>

                    <Text
                      style={[styles.locationTitle, styles.roleTitle]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.55}
                    >
                      {t("spyReveal.spyRoleName")}
                    </Text>

                    <SpyCardRoleIllustration
                      pointerEvents="none"
                      width={247}
                      height={179}
                      style={styles.roleIllustration}
                    />

                    <CardOrnament style={styles.roleBottomOrnament} />
                  </View>

                  <View
                    style={[
                      styles.revealedBottomContent,
                      styles.roleBottomContent,
                    ]}
                  >
                    <Text style={styles.locationWarning}>
                      {t("spyReveal.spyWarning")}
                    </Text>

                    <GameStartButton
                      text={t("spyReveal.passPhone")}
                      onPress={handlePassPhone}
                      style={styles.passButton}
                      textStyle={styles.passButtonText}
                      cornerRadius={10}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.revealedContent}>
                  <View style={styles.revealedMainContent}>
                    <CardOrnament />

                    <Squircle
                      style={styles.locationLabel}
                      cornerRadius={10}
                      fillColor={colors.secondary4}
                    >
                      <Text style={styles.locationLabelText}>
                        {t("spyReveal.locationLabel")}
                      </Text>
                    </Squircle>

                    <Text
                      style={styles.locationTitle}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.55}
                    >
                      {locationName}
                    </Text>

                    <Image
                      source={locationImage}
                      resizeMode="cover"
                      style={styles.locationImage}
                    />

                    <CardOrnament />
                  </View>

                  <View style={styles.revealedBottomContent}>
                    <Text style={styles.locationWarning}>
                      {t("spyReveal.locationWarning")}
                    </Text>

                    <GameStartButton
                      text={t("spyReveal.passPhone")}
                      onPress={handlePassPhone}
                      style={styles.passButton}
                      textStyle={styles.passButtonText}
                      cornerRadius={10}
                    />
                  </View>
                </View>
              )}
            </Squircle>
          </View>
        </Animated.View>
      )}

      {showClosedCard && (
        <Animated.View
          style={[
            styles.frontCardLayer,
            styles.closedCardLayer,
            closedCardAnimatedStyle,
          ]}
        >
          <View style={styles.frontCardShadow}>
            <Squircle
              style={styles.frontCard}
              cornerRadius={28}
              fillColor={colors.background}
            >
              <CardOrnament
                style={[styles.hiddenOrnament, styles.topOrnament]}
              />

              <Text
                style={styles.playerName}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.55}
              >
                {playerName}
              </Text>

              <CardOrnament
                style={[styles.hiddenOrnament, styles.bottomOrnament]}
              />

              <Text style={styles.instruction}>
                {t("spyReveal.instruction", { name: playerName })}
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
              name: playerName,
            })}
            disabled={isRevealing || isPassing}
            onPress={handleReveal}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    width: 340,
    height: 590,
  },

  backCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },

  secondCard: {
    backgroundColor: "#DECFF7",
    transform: [{ rotate: "-4deg" }],
  },

  thirdCard: {
    backgroundColor: "#CEBCED",
    transform: [{ rotate: "5deg" }],
  },

  frontCardLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  revealedCardLayer: {
    zIndex: 2,
  },

  closedCardLayer: {
    zIndex: 3,
  },

  readyCardLayer: {
    zIndex: 1,
  },

  frontCardShadow: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: colors.background,
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

  frontCard: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },

  ornament: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  hiddenOrnament: {
    position: "absolute",
    left: 64.5,
  },

  topOrnament: {
    top: 94,
  },

  bottomOrnament: {
    top: 215,
  },

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

  clickIcon: {
    position: "absolute",
    top: 400,
    left: 141.5,
  },

  revealedContent: {
    flex: 1,
    paddingTop: 28,
    alignItems: "center",
  },

  revealedMainContent: {
    alignItems: "center",
    gap: 18,
  },

  roleMainContent: {
    alignItems: "center",
    marginTop: 27,
  },

  locationLabel: {
    height: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  locationLabelText: {
    color: colors.primary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  roleLabel: {
    marginTop: 18,
  },

  locationTitle: {
    width: 300,
    height: 55,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 40,
    lineHeight: 55,
    textAlign: "center",
    textAlignVertical: "center",
  },

  roleTitle: {
    marginTop: 18,
  },

  locationImage: {
    width: 270,
    height: 214,
    borderRadius: 20,
    overflow: "hidden",
  },

  roleIllustration: {
    marginTop: 12,
  },

  roleBottomOrnament: {
    marginTop: 12,
  },

  revealedBottomContent: {
    position: "absolute",
    right: 20,
    bottom: 20,
    left: 20,
    alignItems: "center",
    gap: 16,
  },

  roleBottomContent: {
    gap: 26,
  },

  locationWarning: {
    width: 276,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },

  passButton: {
    width: "100%",
    height: 50,
  },

  passButtonText: {
    fontSize: 18,
    lineHeight: 25,
  },

  readyTopOrnament: {
    position: "absolute",
    top: 122,
    left: 64.5,
  },

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

  readyBottomOrnament: {
    position: "absolute",
    top: 274,
    left: 64.5,
  },

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
});
