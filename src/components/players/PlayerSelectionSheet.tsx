import {
  BackHandler,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AvatarIcon } from "@assets/icons";
import { AddPlayerDialog } from "@/components/players/AddPlayerDialog";
import { SearchBar } from "@/components/SearchBar";
import { SelectionIndicator } from "@/components/SelectionIndicator";
import { Squircle } from "@/components/Squircle";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import { getComparablePlayerName } from "@/players/playerUtils";
import type { CreatePlayerInput, Player } from "@/players/types";
import { colors } from "@/theme/colors";

const DESIGN_WINDOW_WIDTH = 370;
const DESIGN_WINDOW_HEIGHT = 641;

type PlayerCardProps = {
  player: Player;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function PlayerCard({
  player,
  selected,
  disabled,
  onPress,
}: PlayerCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={player.name}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={styles.playerPressable}
    >
      <Animated.View
        style={[
          styles.playerShadow,
          selected && styles.playerShadowSelected,
          disabled && styles.playerDisabled,
          animatedStyle,
        ]}
      >
        <Squircle
          style={styles.playerCard}
          cornerRadius={12}
          fillColor={selected ? colors.secondary3 : colors.surface}
          strokeColor={selected ? colors.primary : undefined}
          strokeWidth={selected ? 1 : undefined}
        >
          <View style={styles.playerInformation}>
            <AvatarIcon width={42} height={42} />
            <Text style={styles.playerName} numberOfLines={1}>
              {player.name}
            </Text>
          </View>

          <SelectionIndicator selected={selected} size={27} />
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type AnimatedButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

function AnimatedButton({
  children,
  disabled = false,
  onPress,
  containerStyle,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={[styles.actionPressable, containerStyle]}
    >
      <Animated.View
        style={[
          styles.actionAnimated,
          disabled && styles.actionDisabled,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type PlayerSelectionSheetProps = {
  visible: boolean;
  players: readonly Player[];
  selectedPlayerIds: readonly string[];
  minimumPlayers: number;
  maximumPlayers: number;
  isLoading?: boolean;
  onClose: () => void;
  onHidden?: () => void;
  onConfirm: (playerIds: readonly string[]) => void;
  onCreatePlayer: (input: CreatePlayerInput) => Player;
};

export function PlayerSelectionSheet({
  visible,
  players,
  selectedPlayerIds,
  minimumPlayers,
  maximumPlayers,
  isLoading = false,
  onClose,
  onHidden,
  onConfirm,
  onCreatePlayer,
}: PlayerSelectionSheetProps) {
  const { language, t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [draftPlayerIds, setDraftPlayerIds] = useState<readonly string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [hasOpenedAddDialog, setHasOpenedAddDialog] = useState(false);
  const wasVisible = useRef(false);
  const visibilityProgress = useSharedValue(0);

  const windowWidth = Math.min(DESIGN_WINDOW_WIDTH, screenWidth - 32);
  const windowHeight = Math.min(
    DESIGN_WINDOW_HEIGHT,
    screenHeight - insets.top - insets.bottom - 32,
  );
  const selectedIdSet = useMemo(
    () => new Set(draftPlayerIds),
    [draftPlayerIds],
  );
  const normalizedQuery = getComparablePlayerName(searchQuery);
  const filteredPlayers = useMemo(() => {
    if (!normalizedQuery) {
      return players;
    }

    return players.filter((player) =>
      getComparablePlayerName(player.name).includes(normalizedQuery),
    );
  }, [normalizedQuery, players]);
  const hasMinimumPlayers = draftPlayerIds.length >= minimumPlayers;
  const selectionLimitReached = draftPlayerIds.length >= maximumPlayers;
  const countForm = getCountForm(draftPlayerIds.length, language);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.5,
  }));
  const windowStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      { translateY: interpolate(visibilityProgress.value, [0, 1], [14, 0]) },
      { scale: interpolate(visibilityProgress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setIsAddDialogOpen(false);
    onClose();
  }, [onClose]);

  const handleConfirm = () => {
    if (!hasMinimumPlayers) {
      return;
    }

    Keyboard.dismiss();
    onConfirm(draftPlayerIds);
    onClose();
  };

  const handlePlayerPress = (playerId: string) => {
    setDraftPlayerIds((currentIds) => {
      if (currentIds.includes(playerId)) {
        return currentIds.filter((id) => id !== playerId);
      }

      if (currentIds.length >= maximumPlayers) {
        return currentIds;
      }

      return [...currentIds, playerId];
    });
  };

  const handleAddPlayer = (name: string) => {
    const player = onCreatePlayer({
      name,
      avatar: { type: "default" },
    });

    setDraftPlayerIds((currentIds) =>
      currentIds.length < maximumPlayers
        ? [...currentIds, player.id]
        : currentIds,
    );
    setSearchQuery("");
    setIsAddDialogOpen(false);
  };

  const isPlayerNameTaken = useCallback(
    (name: string) => {
      const comparableName = getComparablePlayerName(name);

      return players.some(
        (player) => getComparablePlayerName(player.name) === comparableName,
      );
    },
    [players],
  );

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    const visibilityChanged = visible !== wasVisible.current;

    if (justOpened) {
      const availablePlayerIds = new Set(players.map(({ id }) => id));

      setDraftPlayerIds(
        selectedPlayerIds.filter((id) => availablePlayerIds.has(id)),
      );
      setSearchQuery("");
    }

    if (visibilityChanged) {
      visibilityProgress.value = withTiming(
        visible ? 1 : 0,
        {
          duration: visible ? 220 : 170,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished && !visible && onHidden) {
            runOnJS(onHidden)();
          }
        },
      );
    }

    wasVisible.current = visible;
  }, [
    onHidden,
    players,
    selectedPlayerIds,
    visibilityProgress,
    visible,
  ]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isAddDialogOpen) {
          Keyboard.dismiss();
          setIsAddDialogOpen(false);
          return true;
        }

        handleClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleClose, isAddDialogOpen, visible]);

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={styles.container}
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
      </Animated.View>

      <View pointerEvents="box-none" style={styles.windowPositioner}>
        <Animated.View
          style={[
            { width: windowWidth, height: windowHeight },
            windowStyle,
          ]}
        >
          <Squircle
            style={styles.window}
            cornerRadius={20}
            fillColor={colors.background}
          >
            <Text style={styles.title}>{t("playerSelection.title")}</Text>

            <SearchBar
              value={searchQuery}
              placeholder={t("playerSelection.searchPlaceholder")}
              onChangeText={setSearchQuery}
              cornerRadius={12}
              strokeWidth={1.5}
              style={styles.search}
            />

            <Text style={styles.selectedCount}>
              {t(`playerSelection.selectedCount.${countForm}`, {
                count: draftPlayerIds.length,
              })}
            </Text>

            <FlatList
              data={filteredPlayers}
              keyExtractor={(player) => player.id}
              renderItem={({ item }) => {
                const selected = selectedIdSet.has(item.id);

                return (
                  <PlayerCard
                    player={item}
                    selected={selected}
                    disabled={!selected && selectionLimitReached}
                    onPress={() => handlePlayerPress(item.id)}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>
                    {t(
                      isLoading
                        ? "playerSelection.loading"
                        : normalizedQuery
                          ? "playerSelection.emptySearch"
                          : "playerSelection.emptyPlayers",
                    )}
                  </Text>
                </View>
              }
              style={styles.list}
              contentContainerStyle={[
                styles.listContent,
                filteredPlayers.length === 0 && styles.emptyListContent,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            <AnimatedButton
              disabled={isLoading}
              onPress={() => {
                Keyboard.dismiss();
                setHasOpenedAddDialog(true);
                setIsAddDialogOpen(true);
              }}
            >
              <View style={styles.addButton}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addLabel}>
                  {t("playerSelection.addPlayer")}
                </Text>
              </View>
            </AnimatedButton>

            <View style={styles.footer}>
              <AnimatedButton
                onPress={handleClose}
                containerStyle={styles.footerAction}
              >
                <Squircle
                  style={styles.footerButton}
                  cornerRadius={10}
                  fillColor={colors.secondary3}
                  strokeColor={colors.secondary4}
                  strokeWidth={1}
                >
                  <Text style={styles.closeLabel}>
                    {t("playerSelection.close")}
                  </Text>
                </Squircle>
              </AnimatedButton>

              <AnimatedButton
                disabled={!hasMinimumPlayers}
                onPress={handleConfirm}
                containerStyle={styles.footerAction}
              >
                <Squircle
                  style={styles.footerButton}
                  cornerRadius={10}
                  fillColor={colors.primary}
                >
                  <Text style={styles.confirmLabel}>
                    {t("playerSelection.done")}
                  </Text>
                </Squircle>
              </AnimatedButton>
            </View>
          </Squircle>
        </Animated.View>
      </View>

      {hasOpenedAddDialog && (
        <AddPlayerDialog
          visible={visible && isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onHidden={() => setHasOpenedAddDialog(false)}
          onAdd={handleAddPlayer}
          isNameTaken={isPlayerNameTaken}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },

  windowPositioner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  window: {
    flex: 1,
    width: "100%",
    padding: 16,
    overflow: "hidden",
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  search: {
    height: 44,
    marginTop: 16,
  },

  selectedCount: {
    marginTop: 16,
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    lineHeight: 17,
  },

  list: {
    flex: 1,
    marginTop: 12,
    marginHorizontal: -4,
  },

  listContent: {
    padding: 4,
    gap: 8,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyList: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },

  playerPressable: {
    width: "100%",
  },

  playerShadow: {
    width: "100%",
    height: 58,
    borderRadius: 12,
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

  playerShadowSelected: {
    backgroundColor: colors.secondary3,
  },

  playerDisabled: {
    opacity: 0.55,
  },

  playerCard: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  playerInformation: {
    flex: 1,
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  playerName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },

  actionPressable: {
    width: "100%",
  },

  actionAnimated: {
    width: "100%",
  },

  footerAction: {
    flex: 1,
    width: "auto",
    height: "100%",
  },

  actionDisabled: {
    opacity: 0.5,
  },

  addButton: {
    width: "100%",
    height: 48,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: colors.secondary3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  addIcon: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 26,
    lineHeight: 28,
  },

  addLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  footer: {
    height: 49,
    marginTop: 11,
    flexDirection: "row",
    gap: 8,
  },

  footerButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  closeLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  confirmLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
