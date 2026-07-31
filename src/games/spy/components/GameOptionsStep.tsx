import { memo, useState, type ReactNode } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ArrowIcon, PlayersIcon, TimeIcon } from "@assets/icons";
import {
  AnimatedSwitch,
  NumberStepper,
  SetupStepNavigation,
} from "@/components";
import { Squircle } from "@/components/Squircle";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
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
const OPTION_IDS = ["players", "spies", "timer"] as const;

type OptionId = (typeof OPTION_IDS)[number];

type OptionPanelProps = {
  height: number;
  children: ReactNode;
};

function OptionPanel({ height, children }: OptionPanelProps) {
  return (
    <View style={[styles.panelShadow, { height }]}>
      <Squircle
        style={styles.panel}
        cornerRadius={20}
        fillColor={colors.surface}
      >
        {children}
      </Squircle>
    </View>
  );
}

type GameOptionsStepProps = {
  top: number;
  sceneScale: number;
  bottomInset: number;
  playerCount: number;
  spyCount: number;
  timerMinutes: number;
  timerDisabled: boolean;
  onPlayersPress: () => void;
  onSpyCountChange: (value: number) => void;
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
  timerMinutes,
  timerDisabled,
  onPlayersPress,
  onSpyCountChange,
  onTimerMinutesChange,
  onTimerDisabledChange,
  onBack,
  onNext,
}: GameOptionsStepProps) {
  const { language, t } = useLocalization();
  const [headingHeight, setHeadingHeight] = useState(PAGE_HEADING_HEIGHT);
  const playersButtonScale = useSharedValue(1);
  const hasEnoughPlayers = playerCount >= 3;
  const maximumSpyCount = Math.max(1, playerCount - 1);
  const playerCountForm = getCountForm(playerCount, language);
  const playersButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playersButtonScale.value }],
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
                  {t(
                    `spySetup.options.playerCount.${playerCountForm}`,
                    { count: playerCount },
                  )}
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
      return (
        <OptionPanel height={130}>
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
        </OptionPanel>
      );
    }

    return (
      <OptionPanel height={180}>
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

        <Text style={styles.timerHint}>{t("spySetup.options.timerHint")}</Text>
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

  panelShadow: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.surface,
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

  panel: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    overflow: "hidden",
  },

  panelTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
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
    position: "absolute",
    top: 45,
    right: 0,
    left: 0,
  },

  hint: {
    position: "absolute",
    right: 16,
    bottom: 12,
    left: 16,
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
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
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
