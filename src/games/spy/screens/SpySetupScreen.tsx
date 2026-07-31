import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BlankStackScreenProps } from "react-native-screen-transitions/blank-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  SpySetupBackgroundDecor,
  SpySetupDice,
  SpySetupDiceHand,
  SpySetupWave,
  SpySetupWaveShadow,
} from "@assets/Spy_game";
import {
  BackButton,
  PlayerSelectionSheet,
  SettingsButton,
  SettingsSheet,
} from "@/components";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { createPlayerProfile } from "@/players/playerUtils";
import { usePlayers } from "@/players/PlayersProvider";
import type { CreatePlayerInput, Player } from "@/players/types";
import { colors } from "@/theme/colors";
import { CategoryStep } from "@/games/spy/components/CategoryStep";
import { PacksStep } from "@/games/spy/components/PacksStep";
import { GameOptionsStep } from "@/games/spy/components/GameOptionsStep";
import { SetupSummaryStep } from "@/games/spy/components/SetupSummaryStep";
import type { SpyCategoryId } from "@/games/spy/data/categories";
import {
  SPY_LOCATION_PACKS,
  type SpyLocationPackId,
} from "@/games/spy/data/packs";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const TOTAL_STEPS = 4;
const WAVE_TOP = 210;
const WAVE_LEFT = -29;
const SURFACE_EXTENSION_TOP = WAVE_TOP + 694;
const COMPACT_MAX_HEIGHT = 700;
const COMPACT_MAX_WIDTH = 350;
const COMPACT_GAME_AREA_OFFSET = -16;
const PAGE_CONTENT_TOP = 340;

type SetupStep = 1 | 2 | 3 | 4;

type ProgressSegmentProps = {
  segment: number;
  progress: SharedValue<number>;
};

function ProgressSegment({ segment, progress }: ProgressSegmentProps) {
  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: interpolate(
          progress.value,
          [segment - 1, segment],
          [0, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={styles.progressSegment}>
      <Animated.View style={[styles.progressSegmentFill, fillStyle]} />
    </View>
  );
}

type SpySetupScreenProps = BlankStackScreenProps<
  RootStackParamList,
  "SpySetup"
>;

export function SpySetupScreen({ navigation }: SpySetupScreenProps) {
  const { t } = useLocalization();
  const {
    players: savedPlayers,
    isPlayersLoaded,
    commitPlayers,
  } = usePlayers();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isPlayerSelectionOpen, setIsPlayerSelectionOpen] = useState(false);
  const [hasOpenedPlayerSelection, setHasOpenedPlayerSelection] =
    useState(false);
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [renderedSteps, setRenderedSteps] = useState<ReadonlySet<SetupStep>>(
    () => new Set([1]),
  );
  const [selectedPackIds, setSelectedPackIds] = useState<
    Set<SpyLocationPackId>
  >(() => new Set());
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<
    readonly string[]
  >([]);
  const [temporaryPlayers, setTemporaryPlayers] = useState<readonly Player[]>(
    [],
  );
  const [spyCount, setSpyCount] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const stepProgress = useSharedValue(1);

  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen =
    screenHeight < COMPACT_MAX_HEIGHT || screenWidth < COMPACT_MAX_WIDTH;
  const gameAreaOffset = isCompactScreen ? COMPACT_GAME_AREA_OFFSET : 0;
  const pageContentTop = PAGE_CONTENT_TOP + gameAreaOffset;
  const playerCount = selectedPlayerIds.length;
  const availablePlayers = useMemo(
    () => [...savedPlayers, ...temporaryPlayers],
    [savedPlayers, temporaryPlayers],
  );
  const selectedPackTitles = useMemo(
    () =>
      SPY_LOCATION_PACKS.filter(({ id }) => selectedPackIds.has(id)).map(
        ({ id }) => t(`spySetup.packs.items.${id}`),
      ),
    [selectedPackIds, t],
  );
  const stepsTrackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(stepProgress.value - 1) * screenWidth }],
  }));

  const finishStepTransition = useCallback((step: SetupStep) => {
    setRenderedSteps(new Set([step]));
  }, []);

  const moveToStep = useCallback(
    (step: SetupStep) => {
      if (step === currentStep) {
        return;
      }

      const firstStep = Math.min(currentStep, step);
      const lastStep = Math.max(currentStep, step);
      const transitionSteps = new Set<SetupStep>();

      for (
        let transitionStep = firstStep;
        transitionStep <= lastStep;
        transitionStep += 1
      ) {
        transitionSteps.add(transitionStep as SetupStep);
      }

      setRenderedSteps(transitionSteps);
      setCurrentStep(step);

      requestAnimationFrame(() => {
        stepProgress.value = withTiming(
          step,
          {
            duration: 320,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(finishStepTransition)(step);
            }
          },
        );
      });
    },
    [currentStep, finishStepTransition, stepProgress],
  );

  const handleOpenSettings = useCallback(() => {
    setHasOpenedSettings(true);
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSettingsHidden = useCallback(() => {
    setHasOpenedSettings(false);
  }, []);

  const handleOpenPlayerSelection = useCallback(() => {
    setHasOpenedPlayerSelection(true);
    setIsPlayerSelectionOpen(true);
  }, []);

  const handleClosePlayerSelection = useCallback(() => {
    setIsPlayerSelectionOpen(false);
  }, []);

  const handlePlayerSelectionHidden = useCallback(() => {
    setHasOpenedPlayerSelection(false);
  }, []);

  const handleCategoryPress = useCallback(
    (categoryId: SpyCategoryId) => {
      if (categoryId === "locations") {
        moveToStep(2);
      }
    },
    [moveToStep],
  );

  const handlePackPress = useCallback((packId: SpyLocationPackId) => {
    setSelectedPackIds((currentPackIds) => {
      const nextPackIds = new Set(currentPackIds);

      if (nextPackIds.has(packId)) {
        nextPackIds.delete(packId);
      } else {
        nextPackIds.add(packId);
      }

      return nextPackIds;
    });
  }, []);

  const handleCreateTemporaryPlayer = useCallback(
    (input: CreatePlayerInput) => {
      const player = createPlayerProfile(input);

      setTemporaryPlayers((currentPlayers) => [...currentPlayers, player]);

      return player;
    },
    [],
  );

  const handlePacksBack = useCallback(() => moveToStep(1), [moveToStep]);
  const handlePacksNext = useCallback(() => moveToStep(3), [moveToStep]);
  const handleOptionsBack = useCallback(() => moveToStep(2), [moveToStep]);
  const handleOptionsNext = useCallback(() => {
    commitPlayers(temporaryPlayers);
    setTemporaryPlayers([]);
    moveToStep(4);
  }, [commitPlayers, moveToStep, temporaryPlayers]);
  const handleEditCategory = useCallback(() => moveToStep(1), [moveToStep]);
  const handleEditPacks = useCallback(() => moveToStep(2), [moveToStep]);
  const handleEditOptions = useCallback(() => moveToStep(3), [moveToStep]);
  const handleStart = useCallback(() => {}, []);
  const handleScreenBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const maximumSpyCount = Math.max(1, playerCount - 1);

    setSpyCount((currentSpyCount) =>
      Math.min(currentSpyCount, maximumSpyCount),
    );
  }, [playerCount]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isSettingsOpen || currentStep === 1) {
          return false;
        }

        moveToStep((currentStep - 1) as SetupStep);
        return true;
      },
    );

    return () => subscription.remove();
  }, [currentStep, isSettingsOpen, moveToStep]);

  return (
    <View style={styles.container}>
      <View
        pointerEvents="none"
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
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

        <View
          style={[
            styles.gameArea,
            {
              top: gameAreaOffset,
              opacity: currentStep === 4 ? 0 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(47, 37, 86, 0)", "rgba(47, 37, 86, 0.34)"]}
            locations={[0, 1]}
            style={styles.waveReadabilityGradient}
          />

          <SpySetupDice width={190} height={132} style={styles.dice} />

          <Image
            source={SpySetupWaveShadow}
            resizeMode="stretch"
            style={styles.wave}
          />

          <View
            style={[
              styles.surfaceExtension,
              {
                height: Math.max(
                  screenHeight / sceneScale -
                    SURFACE_EXTENSION_TOP -
                    gameAreaOffset +
                    2,
                  0,
                ),
              },
            ]}
          />

          <SpySetupWave width={460} height={713} style={styles.wave} />
          <SpySetupDiceHand width={17} height={12} style={styles.diceHand} />
        </View>
      </View>

      <Animated.View
        style={[
          styles.stepsTrack,
          { width: screenWidth * TOTAL_STEPS },
          stepsTrackStyle,
        ]}
      >
        <View
          pointerEvents={currentStep === 1 ? "auto" : "none"}
          style={[styles.stepPage, { width: screenWidth }]}
        >
          {renderedSteps.has(1) && (
            <CategoryStep
              top={pageContentTop}
              sceneScale={sceneScale}
              bottomInset={insets.bottom}
              onCategoryPress={handleCategoryPress}
            />
          )}
        </View>

        <View
          pointerEvents={currentStep === 2 ? "auto" : "none"}
          style={[styles.stepPage, { width: screenWidth }]}
        >
          {renderedSteps.has(2) && (
            <PacksStep
              top={pageContentTop}
              sceneScale={sceneScale}
              bottomInset={insets.bottom}
              selectedPackIds={selectedPackIds}
              onPackPress={handlePackPress}
              onBack={handlePacksBack}
              onNext={handlePacksNext}
            />
          )}
        </View>

        <View
          pointerEvents={currentStep === 3 ? "auto" : "none"}
          style={[styles.stepPage, { width: screenWidth }]}
        >
          {renderedSteps.has(3) && (
            <GameOptionsStep
              top={pageContentTop}
              sceneScale={sceneScale}
              bottomInset={insets.bottom}
              playerCount={playerCount}
              spyCount={spyCount}
              timerMinutes={timerMinutes}
              timerDisabled={timerDisabled}
              onPlayersPress={handleOpenPlayerSelection}
              onSpyCountChange={setSpyCount}
              onTimerMinutesChange={setTimerMinutes}
              onTimerDisabledChange={setTimerDisabled}
              onBack={handleOptionsBack}
              onNext={handleOptionsNext}
            />
          )}
        </View>

        <View
          pointerEvents={currentStep === 4 ? "auto" : "none"}
          style={[styles.stepPage, { width: screenWidth }]}
        >
          {renderedSteps.has(4) && (
            <SetupSummaryStep
              sceneScale={sceneScale}
              categoryTitle={t("spySetup.category.locations.title")}
              selectedPackTitles={selectedPackTitles}
              playerCount={playerCount}
              spyCount={spyCount}
              timerMinutes={timerMinutes}
              timerDisabled={timerDisabled}
              onEditCategory={handleEditCategory}
              onEditPacks={handleEditPacks}
              onEditOptions={handleEditOptions}
              onStart={handleStart}
            />
          )}
        </View>
      </Animated.View>

      <View
        pointerEvents="none"
        style={[styles.header, { top: insets.top + 50 }]}
      >
        <Text
          style={[
            styles.headerTitle,
            isCompactScreen && styles.headerTitleCompact,
          ]}
        >
          {t("spySetup.title")}
        </Text>
        <Text style={styles.stepText}>
          {t("spySetup.step", { current: currentStep, total: TOTAL_STEPS })}
        </Text>

        <View style={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <ProgressSegment
              key={index}
              segment={index + 1}
              progress={stepProgress}
            />
          ))}
        </View>
      </View>

      <BackButton
        onPress={handleScreenBack}
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
          onClose={handleCloseSettings}
          onHidden={handleSettingsHidden}
          compact={isCompactScreen}
        />
      )}

      {hasOpenedPlayerSelection && (
        <PlayerSelectionSheet
          visible={isPlayerSelectionOpen}
          players={availablePlayers}
          selectedPlayerIds={selectedPlayerIds}
          minimumPlayers={3}
          maximumPlayers={12}
          isLoading={!isPlayersLoaded}
          onClose={handleClosePlayerSelection}
          onHidden={handlePlayerSelectionHidden}
          onConfirm={setSelectedPlayerIds}
          onCreatePlayer={handleCreateTemporaryPlayer}
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

  stepsTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,

    flexDirection: "row",
  },

  stepPage: {
    height: "100%",
  },

  topReadabilityGradient: {
    position: "absolute",
    top: 0,
    left: 0,

    width: DESIGN_WIDTH,
    height: 245,
  },

  gameArea: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },

  waveReadabilityGradient: {
    position: "absolute",
    top: 160,
    left: 0,

    width: DESIGN_WIDTH,
    height: 210,
  },

  dice: {
    position: "absolute",
    top: 196,
    left: 170,
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
    top: SURFACE_EXTENSION_TOP,
    right: 0,
    left: 0,
    backgroundColor: colors.background,
  },

  diceHand: {
    position: "absolute",
    top: 318,
    left: 313,
  },

  header: {
    position: "absolute",
    left: 72,
    right: 72,

    alignItems: "center",
  },

  headerTitle: {
    color: colors.surface,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
  },

  headerTitleCompact: {
    fontSize: 20,
    lineHeight: 27,
  },

  stepText: {
    marginTop: 2,

    color: colors.surface,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },

  progress: {
    marginTop: 10,

    flexDirection: "row",
    gap: 7,
  },

  progressSegment: {
    overflow: "hidden",

    width: 34,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(254, 254, 253, 0.38)",
  },

  progressSegmentFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,
    backgroundColor: colors.surface,
    transformOrigin: "left center",
  },
});
