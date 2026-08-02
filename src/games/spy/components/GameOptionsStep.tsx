import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AlertIcon, ArrowIcon, PlayersIcon, TimeIcon } from "@assets/icons";
import {
  AnimatedSwitch,
  NumberStepper,
  SetupStepNavigation,
  TwoOptionSelector,
} from "@/components";
import { Squircle } from "@/components/Squircle";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import { getSpySetupRecommendation } from "@/games/spy/logic/getSpySetupRecommendation";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const PAGE_HEADING_HEIGHT = 53;
const HEADING_GAP = 16;
const CARD_SHADOW_SPACE = 6;
const TOP_LIST_FADE_HEIGHT = 8;
const BOTTOM_LIST_FADE_HEIGHT = 16;
const NAVIGATION_HEIGHT = 48;
const NAVIGATION_BOTTOM_SPACE = 16;
const LIST_TO_NAVIGATION_GAP = 16;
const RECOMMENDATION_ANIMATION_DURATION = 300;
const OPTION_IDS = ["players", "spies", "timer"] as const;

type OptionId = (typeof OPTION_IDS)[number];

type OptionPanelProps = {
  height: number;
  children: ReactNode;
  initialSurfaceScaleY?: number;
  surfaceAnimatedStyle?: StyleProp<ViewStyle>;
  containerAnimatedStyle?: StyleProp<ViewStyle>;
};

function OptionPanel({
  height,
  children,
  initialSurfaceScaleY = 1,
  surfaceAnimatedStyle,
  containerAnimatedStyle,
}: OptionPanelProps) {
  return (
    <Animated.View
      style={[styles.panelContainer, { height }, containerAnimatedStyle]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.panelSurfaceShadow,
          { height, transform: [{ scaleY: initialSurfaceScaleY }] },
          surfaceAnimatedStyle,
        ]}
      >
        <Squircle
          style={styles.panelSurface}
          cornerRadius={20}
          fillColor={colors.surface}
        >
          {null}
        </Squircle>
      </Animated.View>

      <View style={[styles.panelContent, { height }]}>{children}</View>
    </Animated.View>
  );
}

type RecommendationBannerProps = {
  children: ReactNode;
  revealProgress: SharedValue<number>;
};

function RecommendationBanner({
  children,
  revealProgress,
}: RecommendationBannerProps) {
  const revealStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -42 * (1 - revealProgress.value),
      },
    ],
  }));

  return (
    <View pointerEvents="none" style={styles.recommendationViewport}>
      <Animated.View style={[styles.recommendationBanner, revealStyle]}>
        <AlertIcon
          width={25}
          height={25}
          color={colors.secondary4}
          style={styles.recommendationIcon}
        />
        <Text style={styles.recommendationText}>{children}</Text>
      </Animated.View>
    </View>
  );
}

type GameOptionsStepProps = {
  top: number;
  sceneScale: number;
  bottomInset: number;
  playerCount: number;
  spyCount: number;
  spiesKnowEachOther: boolean;
  timerMinutes: number;
  timerDisabled: boolean;
  recommendationsWereShown: boolean;
  onPlayersPress: () => void;
  onSpyCountChange: (value: number) => void;
  onSpiesKnowEachOtherChange: (value: boolean) => void;
  onTimerMinutesChange: (value: number) => void;
  onTimerDisabledChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

export const GameOptionsStep = memo(function GameOptionsStep({
  top,
  sceneScale,
  bottomInset,
  playerCount,
  spyCount,
  spiesKnowEachOther,
  timerMinutes,
  timerDisabled,
  recommendationsWereShown,
  onPlayersPress,
  onSpyCountChange,
  onSpiesKnowEachOtherChange,
  onTimerMinutesChange,
  onTimerDisabledChange,
  onBack,
  onNext,
}: GameOptionsStepProps) {
  const { language, t } = useLocalization();
  const [headingHeight, setHeadingHeight] = useState(PAGE_HEADING_HEIGHT);
  const recommendationsWereShownRef = useRef(recommendationsWereShown);
  const playersButtonScale = useSharedValue(1);
  const spiesRecommendationProgress = useSharedValue(
    recommendationsWereShown ? 1 : 0,
  );
  const timerRecommendationProgress = useSharedValue(
    recommendationsWereShown ? 1 : 0,
  );
  const hasEnoughPlayers = playerCount >= 3;
  const maximumSpyCount = Math.max(1, playerCount - 1);
  const playerCountForm = getCountForm(playerCount, language);
  const recommendation = getSpySetupRecommendation(playerCount);
  const recommendationShown = recommendationsWereShown && recommendation;
  const shouldAnimateRecommendation =
    Boolean(recommendationShown) && !recommendationsWereShownRef.current;
  const playersButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playersButtonScale.value }],
  }));
  const spiesBodyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: 42 * spiesRecommendationProgress.value,
      },
    ],
  }));
  const timerBodyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: 42 * timerRecommendationProgress.value,
      },
    ],
  }));
  const spiesSurfaceStyle = useAnimatedStyle(() => {
    const initialScale = 190 / 232;

    return {
      transform: [
        {
          scaleY:
            initialScale +
            (1 - initialScale) * spiesRecommendationProgress.value,
        },
      ],
    };
  });
  const timerSurfaceStyle = useAnimatedStyle(() => {
    const initialScale = 180 / 222;

    return {
      transform: [
        {
          scaleY:
            initialScale +
            (1 - initialScale) * timerRecommendationProgress.value,
        },
      ],
    };
  });
  const spiesHeightStyle = useAnimatedStyle(() => ({
    height: 190 + 42 * spiesRecommendationProgress.value,
  }));
  const timerHeightStyle = useAnimatedStyle(() => ({
    height: 180 + 42 * timerRecommendationProgress.value,
  }));
  const listTop =
    (top + headingHeight + HEADING_GAP - CARD_SHADOW_SPACE) * sceneScale;
  const listBottom =
    bottomInset +
    NAVIGATION_BOTTOM_SPACE +
    NAVIGATION_HEIGHT +
    LIST_TO_NAVIGATION_GAP;

  const handleHeadingLayout = (event: LayoutChangeEvent) => {
    setHeadingHeight(event.nativeEvent.layout.height);
  };

  useEffect(() => {
    if (
      !recommendation ||
      !recommendationsWereShown ||
      recommendationsWereShownRef.current
    ) {
      return;
    }

    recommendationsWereShownRef.current = true;
    spiesRecommendationProgress.value = 0;
    timerRecommendationProgress.value = 0;
    spiesRecommendationProgress.value = withTiming(1, {
      duration: RECOMMENDATION_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    timerRecommendationProgress.value = withDelay(
      RECOMMENDATION_ANIMATION_DURATION,
      withTiming(1, {
        duration: RECOMMENDATION_ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [
    recommendation,
    recommendationsWereShown,
    spiesRecommendationProgress,
    timerRecommendationProgress,
  ]);

  const renderOption = ({ item }: { item: OptionId }) => {
    if (item === "players") {
      return (
        <OptionPanel height={104}>
          <Text style={styles.panelTitle}>{t("spySetup.options.players")}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("spySetup.options.players")}
            onPress={onPlayersPress}
            onPressIn={() => {
              playersButtonScale.value = withTiming(0.97, { duration: 75 });
            }}
            onPressOut={() => {
              playersButtonScale.value = withSpring(1, {
                damping: 18,
                stiffness: 320,
                mass: 0.7,
              });
            }}
            style={styles.playersPressable}
          >
            <Animated.View
              style={[styles.playersButtonAnimated, playersButtonStyle]}
            >
              <Squircle
                style={styles.playersButton}
                cornerRadius={16}
                fillColor={colors.primary}
              >
                <PlayersIcon width={26} height={26} color={colors.surface} />
                <Text style={styles.playersText}>
                  {t(`spySetup.options.playerCount.${playerCountForm}`, {
                    count: playerCount,
                  })}
                </Text>
                <ArrowIcon
                  width={9}
                  height={17}
                  color={colors.surface}
                  style={styles.playersArrow}
                />
              </Squircle>
            </Animated.View>
          </Pressable>
        </OptionPanel>
      );
    }

    if (item === "spies") {
      const knowledgeDisabled = spyCount <= 1;

      return (
        <OptionPanel
          height={recommendationShown ? 232 : 190}
          initialSurfaceScaleY={shouldAnimateRecommendation ? 190 / 232 : 1}
          surfaceAnimatedStyle={
            recommendationShown ? spiesSurfaceStyle : undefined
          }
          containerAnimatedStyle={
            recommendationShown ? spiesHeightStyle : undefined
          }
        >
          {recommendationShown && (
            <RecommendationBanner
              revealProgress={spiesRecommendationProgress}
            >
              {t(
                `spySetup.options.spiesRecommendation.${getCountForm(
                  recommendationShown.spyCount,
                  language,
                )}`,
                { count: recommendationShown.spyCount },
              )}
            </RecommendationBanner>
          )}

          <Animated.View
            style={[styles.spiesPanelContent, spiesBodyStyle]}
          >
            <Text style={styles.panelTitle}>{t("spySetup.options.spies")}</Text>

            <View style={styles.spiesStepper}>
              <NumberStepper
                value={spyCount}
                minimum={1}
                maximum={maximumSpyCount}
                disabled={!hasEnoughPlayers}
                onDecrease={() => onSpyCountChange(spyCount - 1)}
                onIncrease={() => onSpyCountChange(spyCount + 1)}
              />
            </View>

            <Text style={styles.hint}>
              {hasEnoughPlayers
                ? t("spySetup.options.spiesHint", { max: maximumSpyCount })
                : t("spySetup.options.selectPlayersHint")}
            </Text>
            <View style={styles.timerDivider} />

            <View style={styles.timerToggleRow}>
              <View
                style={[
                  styles.timerToggleLabel,
                  knowledgeDisabled && styles.knowledgeDisabled,
                ]}
              >
                <View style={styles.timerIconBackground}>
                  <Text style={styles.knowledgeIconText}>?</Text>
                </View>
                <Text style={styles.timerToggleText}>
                  {t("spySetup.options.spiesKnowEachOther")}
                </Text>
              </View>

              <TwoOptionSelector
                value={spiesKnowEachOther ? "left" : "right"}
                leftLabel={t("spySetup.options.yes")}
                rightLabel={t("spySetup.options.no")}
                disabled={knowledgeDisabled}
                compact
                onValueChange={(value) =>
                  onSpiesKnowEachOtherChange(value === "left")
                }
              />
            </View>
          </Animated.View>
        </OptionPanel>
      );
    }

    return (
      <OptionPanel
        height={recommendationShown ? 222 : 180}
        initialSurfaceScaleY={shouldAnimateRecommendation ? 180 / 222 : 1}
        surfaceAnimatedStyle={
          recommendationShown ? timerSurfaceStyle : undefined
        }
        containerAnimatedStyle={
          recommendationShown ? timerHeightStyle : undefined
        }
      >
        {recommendationShown && (
          <RecommendationBanner revealProgress={timerRecommendationProgress}>
            {t("spySetup.options.timerRecommendation", {
              count: recommendationShown.timerMinutes,
            })}
          </RecommendationBanner>
        )}

        <Animated.View
          style={[styles.timerPanelContent, timerBodyStyle]}
        >
          <Text style={styles.panelTitle}>{t("spySetup.options.timer")}</Text>

          <View style={styles.timerStepper}>
            <NumberStepper
              value={timerMinutes}
              suffix={t("spySetup.options.minutesShort")}
              minimum={1}
              maximum={60}
              onDecrease={() => onTimerMinutesChange(timerMinutes - 1)}
              onIncrease={() => onTimerMinutesChange(timerMinutes + 1)}
            />
          </View>

          <Text style={styles.timerHint}>
            {t("spySetup.options.timerHint")}
          </Text>
          <View style={styles.timerDivider} />

          <View style={styles.timerToggleRow}>
            <View style={styles.timerToggleLabel}>
              <View style={styles.timerIconBackground}>
                <TimeIcon width={22} height={22} color={colors.secondary} />
              </View>
              <Text style={styles.timerToggleText}>
                {t("spySetup.options.noTimer")}
              </Text>
            </View>

            <AnimatedSwitch
              value={timerDisabled}
              onValueChange={onTimerDisabledChange}
              compact
            />
          </View>
        </Animated.View>
      </OptionPanel>
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View
        pointerEvents="none"
        style={[styles.headingScene, { transform: [{ scale: sceneScale }] }]}
      >
        <View
          style={[styles.pageHeading, { top }]}
          onLayout={handleHeadingLayout}
        >
          <Text style={styles.pageTitle}>{t("spySetup.options.title")}</Text>
          <Text style={styles.pageSubtitle}>
            {t("spySetup.options.subtitle")}
          </Text>
        </View>
      </View>

      <FlatList
        data={OPTION_IDS}
        keyExtractor={(item) => item}
        renderItem={renderOption}
        style={[
          styles.optionsList,
          {
            top: listTop,
            right: (16 - CARD_SHADOW_SPACE) * sceneScale,
            bottom: listBottom,
            left: (16 - CARD_SHADOW_SPACE) * sceneScale,
          },
        ]}
        contentContainerStyle={[
          styles.optionsListContent,
          {
            paddingTop: CARD_SHADOW_SPACE * sceneScale,
            paddingHorizontal: CARD_SHADOW_SPACE * sceneScale,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(248, 244, 253, 0)"]}
        style={[
          styles.topListFade,
          { top: listTop, height: TOP_LIST_FADE_HEIGHT * sceneScale },
        ]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(248, 244, 253, 0)", colors.background]}
        style={[
          styles.bottomListFade,
          { bottom: listBottom, height: BOTTOM_LIST_FADE_HEIGHT * sceneScale },
        ]}
      />

      <SetupStepNavigation
        backLabel={t("spySetup.navigation.back")}
        nextLabel={t("spySetup.navigation.next")}
        bottomInset={bottomInset}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!hasEnoughPlayers}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },

  headingScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: DESIGN_WIDTH,
    height: "100%",
    transformOrigin: "center top",
  },

  pageHeading: {
    position: "absolute",
    left: 16,
    width: 370,
    paddingHorizontal: 22,
  },

  pageTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
  },

  pageSubtitle: {
    marginTop: 1,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },

  optionsList: {
    position: "absolute",
  },

  optionsListContent: {
    gap: 16,
    paddingBottom: 16,
  },

  panelContainer: {
    width: "100%",
  },

  panelSurfaceShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    borderRadius: 20,
    backgroundColor: colors.surface,
    transformOrigin: "center top",
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 5,
        spreadDistance: 0,
        color: "rgba(118, 92, 172, 0.25)",
      },
    ],
  },

  panelSurface: {
    width: "100%",
    height: "100%",
  },

  panelContent: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  spiesPanelContent: {
    width: "100%",
    height: 176,
  },

  timerPanelContent: {
    width: "100%",
    height: 166,
  },

  panelTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },

  recommendationViewport: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 42,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  recommendationBanner: {
    height: 42,
    transform: [{ translateY: -42 }],
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.secondary3,
  },

  recommendationIcon: {
    transform: [{ rotate: "180deg" }],
  },

  recommendationText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    lineHeight: 17,
  },

  playersPressable: {
    width: "100%",
    height: 50,
    marginTop: 4,
  },

  playersButton: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  playersButtonAnimated: {
    width: "100%",
    height: "100%",
  },

  playersText: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  playersArrow: {
    position: "absolute",
    right: 18,
  },

  spiesStepper: {
    marginTop: 10,
  },

  hint: {
    marginTop: 7,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },

  timerStepper: {
    marginTop: 10,
  },

  timerHint: {
    marginTop: 7,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },

  timerDivider: {
    height: 1,
    marginTop: 9,
    backgroundColor: "#DCD6E9",
  },

  timerToggleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timerToggleLabel: {
    flex: 1,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  timerIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary3,
  },

  timerToggleText: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },

  knowledgeDisabled: {
    opacity: 0.45,
  },

  knowledgeIconText: {
    color: colors.secondary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    lineHeight: 30,
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
});
