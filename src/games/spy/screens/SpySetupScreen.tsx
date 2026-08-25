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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { MySetsCategoryIcon } from "@assets/Spy_game/icons";
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
import { deleteStoredPlayerPhoto } from "@/storage/playerPhotoStorage";
import { colors } from "@/theme/colors";
import { CategoryStep } from "@/games/spy/components/CategoryStep";
import {
  PacksStep,
  type SpyPackListItem,
} from "@/games/spy/components/PacksStep";
import { GameOptionsStep } from "@/games/spy/components/GameOptionsStep";
import { CustomPackEditorDialog } from "@/games/spy/components/CustomPackEditorDialog";
import { getSpySetupRecommendation } from "@/games/spy/logic/getSpySetupRecommendation";
import { SetupSummaryStep } from "@/games/spy/components/SetupSummaryStep";
import type { SpyCategoryId } from "@/games/spy/data/categories";
import { getSpyPackIllustration } from "@/games/spy/content/assets";
import { useSpyContent } from "@/games/spy/content/SpyContentProvider";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import { useAppHaptics } from "@/haptics/useAppHaptics";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;
const TOTAL_STEPS = 4;
const WAVE_TOP = 210;
const WAVE_LEFT = -29;
const SURFACE_EXTENSION_TOP = WAVE_TOP + 694;
const COMPACT_MAX_HEIGHT = 700;
const COMPACT_MAX_WIDTH = 350;
const COMPACT_GAME_AREA_OFFSET = -85;
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
  const { startSession } = useSpySession();
  const { playSetupStart } = useAppHaptics();
  const {
    registry: contentRegistry,
    createCustomPack,
    updateCustomPack,
    deleteCustomPack,
    getCustomPack,
  } = useSpyContent();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [isPlayerSelectionOpen, setIsPlayerSelectionOpen] = useState(false);
  const [hasOpenedPlayerSelection, setHasOpenedPlayerSelection] =
    useState(false);
  const [isCustomPackDialogOpen, setIsCustomPackDialogOpen] = useState(false);
  const [hasOpenedCustomPackDialog, setHasOpenedCustomPackDialog] =
    useState(false);
  const [editingCustomPackId, setEditingCustomPackId] = useState<string | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [renderedSteps, setRenderedSteps] = useState<ReadonlySet<SetupStep>>(
    () => new Set([1]),
  );
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<SpyCategoryId | null>(null);
  const [selectedPackIds, setSelectedPackIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<readonly string[]>(
    [],
  );
  const [temporaryPlayers, setTemporaryPlayers] = useState<readonly Player[]>(
    [],
  );
  const temporaryPlayersRef = useRef<readonly Player[]>([]);
  const [spyCount, setSpyCount] = useState(1);
  const [spiesKnowEachOther, setSpiesKnowEachOther] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false);
  const [recommendationsWereShown, setRecommendationsWereShown] =
    useState(false);
  const recommendationsWereShownRef = useRef(false);
  const selectedPlayerIdsRef = useRef<readonly string[]>([]);
  const stepProgress = useSharedValue(1);

  const sceneScale = screenWidth / DESIGN_WIDTH;
  const isCompactScreen =
    screenHeight < COMPACT_MAX_HEIGHT || screenWidth < COMPACT_MAX_WIDTH;
  const gameAreaOffset = isCompactScreen ? COMPACT_GAME_AREA_OFFSET : 0;
  const pageContentTop = PAGE_CONTENT_TOP + gameAreaOffset;
  const playerCount = selectedPlayerIds.length;
  const availablePlayers = useMemo(
    () => [...temporaryPlayers, ...savedPlayers],
    [savedPlayers, temporaryPlayers],
  );
  const availablePacks = useMemo(
    () =>
      selectedCategoryId
        ? contentRegistry.getPacksByCategory(selectedCategoryId)
        : [],
    [contentRegistry, selectedCategoryId],
  );
  const packListItems = useMemo<readonly SpyPackListItem[]>(
    () =>
      availablePacks.map((pack) => {
        const customPack = getCustomPack(pack.id);
        const Illustration = customPack
          ? MySetsCategoryIcon
          : getSpyPackIllustration(pack.illustrationKey);

        return {
          id: pack.id,
          title: customPack?.name,
          Illustration,
          wordCount: pack.wordIds.length,
          enabled: pack.enabled,
          isCustom: Boolean(customPack),
        };
      }),
    [availablePacks, getCustomPack],
  );
  const selectedPackTitles = useMemo(
    () =>
      availablePacks
        .filter(({ id }) => selectedPackIds.has(id))
        .map(
          ({ id }) =>
            getCustomPack(id)?.name ?? t(`spySetup.packs.items.${id}`),
        ),
    [availablePacks, getCustomPack, selectedPackIds, t],
  );
  const selectedCategoryTitle = selectedCategoryId
    ? t(`spySetup.category.${selectedCategoryId}.title`)
    : "";
  const editingCustomPack = editingCustomPackId
    ? getCustomPack(editingCustomPackId)
    : undefined;
  const stepsTrackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(stepProgress.value - 1) * screenWidth }],
  }));
  const gameAreaStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          stepProgress.value,
          [3, 4],
          [0, -DESIGN_WIDTH],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const waveGradientStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          stepProgress.value,
          [3, 3.55],
          [0, 210],
          Extrapolation.CLAMP,
        ),
      },
    ],
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

    requestAnimationFrame(() => {
      setIsPlayerSelectionOpen(true);
    });
  }, []);

  const handleClosePlayerSelection = useCallback(() => {
    setIsPlayerSelectionOpen(false);
  }, []);

  const handlePlayerSelectionHidden = useCallback(() => {
    if (
      selectedPlayerIdsRef.current.length >= 3 &&
      !recommendationsWereShownRef.current
    ) {
      recommendationsWereShownRef.current = true;
      setRecommendationsWereShown(true);
    }
  }, []);

  const handleConfirmPlayers = useCallback((playerIds: readonly string[]) => {
    selectedPlayerIdsRef.current = playerIds;
    setSelectedPlayerIds(playerIds);
  }, []);

  const handleCategoryPress = useCallback(
    (categoryId: SpyCategoryId) => {
      if (categoryId !== selectedCategoryId) {
        setSelectedPackIds(new Set());
      }

      setSelectedCategoryId(categoryId);
      moveToStep(2);
    },
    [moveToStep, selectedCategoryId],
  );

  const handlePackPress = useCallback((packId: string) => {
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

  const handleOpenCustomPackDialog = useCallback(() => {
    setEditingCustomPackId(null);
    setHasOpenedCustomPackDialog(true);

    requestAnimationFrame(() => {
      setIsCustomPackDialogOpen(true);
    });
  }, []);

  const handleEditCustomPack = useCallback((packId: string) => {
    setEditingCustomPackId(packId);
    setHasOpenedCustomPackDialog(true);

    requestAnimationFrame(() => {
      setIsCustomPackDialogOpen(true);
    });
  }, []);

  const handleCloseCustomPackDialog = useCallback(() => {
    setIsCustomPackDialogOpen(false);
  }, []);

  const handleCustomPackDialogHidden = useCallback(() => {
    setHasOpenedCustomPackDialog(false);
    setEditingCustomPackId(null);
  }, []);

  const handleSubmitCustomPack = useCallback(
    (input: Parameters<typeof createCustomPack>[0]) => {
      if (editingCustomPackId) {
        updateCustomPack(editingCustomPackId, input);
        return;
      }

      const pack = createCustomPack(input);

      setSelectedPackIds((currentPackIds) => {
        const nextPackIds = new Set(currentPackIds);
        nextPackIds.add(pack.id);
        return nextPackIds;
      });
    },
    [createCustomPack, editingCustomPackId, updateCustomPack],
  );

  const handleDeleteCustomPack = useCallback(
    (packId: string) => {
      deleteCustomPack(packId);
      setSelectedPackIds((currentPackIds) => {
        if (!currentPackIds.has(packId)) {
          return currentPackIds;
        }

        const nextPackIds = new Set(currentPackIds);
        nextPackIds.delete(packId);
        return nextPackIds;
      });
    },
    [deleteCustomPack],
  );

  const handleCreateTemporaryPlayer = useCallback(
    (input: CreatePlayerInput) => {
      const player = createPlayerProfile(input);

      setTemporaryPlayers((currentPlayers) => [player, ...currentPlayers]);

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
  const handleStart = useCallback(() => {
    if (!selectedCategoryId || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    setIsStarting(true);

    const packIds = [...selectedPackIds];
    const availableWordIds = contentRegistry.getWordIds(
      selectedCategoryId,
      packIds,
    );

    try {
      startSession({
        draft: {
          categoryId: selectedCategoryId,
          packIds,
          playerIds: selectedPlayerIds,
          spyCount,
          spiesKnowEachOther,
          timerEnabled: !timerDisabled,
          timerMinutes,
        },
        availableWordIds,
      });
      playSetupStart();
      navigation.replace("SpyReveal");
    } catch (error: unknown) {
      isStartingRef.current = false;
      setIsStarting(false);
      console.warn("Failed to create Spy session", error);
    }
  }, [
    navigation,
    playSetupStart,
    contentRegistry,
    selectedCategoryId,
    selectedPackIds,
    selectedPlayerIds,
    spyCount,
    spiesKnowEachOther,
    startSession,
    timerDisabled,
    timerMinutes,
  ]);
  const handleScreenBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    temporaryPlayersRef.current = temporaryPlayers;
  }, [temporaryPlayers]);

  useEffect(() => {
    if (currentStep < 2 || hasOpenedPlayerSelection) {
      return;
    }

    const preloadTimeout = setTimeout(() => {
      setHasOpenedPlayerSelection(true);
    }, 400);

    return () => clearTimeout(preloadTimeout);
  }, [currentStep, hasOpenedPlayerSelection]);

  useEffect(() => {
    return () => {
      temporaryPlayersRef.current.forEach((player) => {
        if (player.avatar.type === "photo") {
          try {
            deleteStoredPlayerPhoto(player.avatar.fileName);
          } catch (error: unknown) {
            console.warn("Failed to remove temporary player photo", error);
          }
        }
      });
    };
  }, []);

  useEffect(() => {
    const recommendation = getSpySetupRecommendation(playerCount);

    if (recommendation) {
      setSpyCount(recommendation.spyCount);
      setTimerMinutes(recommendation.timerMinutes);
      return;
    }

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
            height: Math.max(DESIGN_HEIGHT, screenHeight / sceneScale),
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

        <Animated.View
          style={[
            styles.gameArea,
            gameAreaStyle,
            {
              top: gameAreaOffset,
            },
          ]}
        >
          <Animated.View
            style={[styles.waveReadabilityGradient, waveGradientStyle]}
          >
            <LinearGradient
              colors={["rgba(47, 37, 86, 0)", "rgba(47, 37, 86, 0.34)"]}
              locations={[0, 1]}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          {!isCompactScreen && (
            <SpySetupDice width={190} height={132} style={styles.dice} />
          )}

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
          {!isCompactScreen && (
            <SpySetupDiceHand width={17} height={12} style={styles.diceHand} />
          )}
        </Animated.View>
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
          {renderedSteps.has(2) && selectedCategoryId && (
            <PacksStep
              top={pageContentTop}
              sceneScale={sceneScale}
              bottomInset={insets.bottom}
              categoryId={selectedCategoryId}
              packs={packListItems}
              selectedPackIds={selectedPackIds}
              onPackPress={handlePackPress}
              onCreatePack={handleOpenCustomPackDialog}
              onEditPack={handleEditCustomPack}
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
              spiesKnowEachOther={spiesKnowEachOther}
              timerMinutes={timerMinutes}
              timerDisabled={timerDisabled}
              recommendationsWereShown={recommendationsWereShown}
              onPlayersPress={handleOpenPlayerSelection}
              onSpyCountChange={setSpyCount}
              onSpiesKnowEachOtherChange={setSpiesKnowEachOther}
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
              compact={isCompactScreen}
              categoryTitle={selectedCategoryTitle}
              selectedPackTitles={selectedPackTitles}
              playerCount={playerCount}
              spyCount={spyCount}
              timerMinutes={timerMinutes}
              timerDisabled={timerDisabled}
              onEditCategory={handleEditCategory}
              onEditPacks={handleEditPacks}
              onEditOptions={handleEditOptions}
              onStart={handleStart}
              startDisabled={isStarting}
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
          onConfirm={handleConfirmPlayers}
          onCreatePlayer={handleCreateTemporaryPlayer}
        />
      )}

      {hasOpenedCustomPackDialog && (
        <CustomPackEditorDialog
          visible={isCustomPackDialogOpen}
          pack={editingCustomPack}
          onClose={handleCloseCustomPackDialog}
          onHidden={handleCustomPackDialogHidden}
          onSubmit={handleSubmitCustomPack}
          onDelete={handleDeleteCustomPack}
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
    overflow: "hidden",
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
