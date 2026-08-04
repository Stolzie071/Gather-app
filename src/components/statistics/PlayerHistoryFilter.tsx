import { memo, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ArrowIcon, PlayersIcon } from "@assets/icons";
import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import type { Player } from "@/players/types";
import { colors } from "@/theme/colors";

type PlayerHistoryFilterProps = {
  players: readonly Player[];
  selectedPlayerId: string | null;
  allPlayersLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (playerId: string | null) => void;
};

export const PlayerHistoryFilter = memo(function PlayerHistoryFilter({
  players,
  selectedPlayerId,
  allPlayersLabel,
  open,
  onOpenChange,
  onSelect,
}: PlayerHistoryFilterProps) {
  const { playSelection } = useAppHaptics();
  const scale = useSharedValue(1);
  const openProgress = useSharedValue(open ? 1 : 0);
  const selectedPlayer = players.find(({ id }) => id === selectedPlayerId);

  useEffect(() => {
    openProgress.value = withTiming(open ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, openProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 - 180 * openProgress.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          playSelection();
          onOpenChange(!open);
        }}
        onPressIn={() => {
          scale.value = withTiming(0.985, { duration: 70 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {
            damping: 18,
            stiffness: 320,
            mass: 0.7,
          });
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={selectedPlayer?.name ?? allPlayersLabel}
      >
        <Animated.View style={animatedStyle}>
          <Squircle
            style={styles.button}
            cornerRadius={20}
            fillColor={colors.surface}
            strokeColor={colors.secondary3}
            strokeWidth={1.5}
          >
            <View style={styles.buttonContent}>
              {selectedPlayer ? (
                <PlayerAvatarView avatar={selectedPlayer.avatar} size={24} />
              ) : (
                <PlayersIcon
                  width={20}
                  height={20}
                  color={colors.textPrimary}
                />
              )}

              <Text style={styles.buttonLabel} numberOfLines={1}>
                {selectedPlayer?.name ?? allPlayersLabel}
              </Text>
            </View>

            <Animated.View
              style={[styles.arrow, arrowAnimatedStyle]}
            >
              <ArrowIcon
                width={7}
                height={14}
                color={colors.textSecondary}
              />
            </Animated.View>
          </Squircle>
        </Animated.View>
      </Pressable>

      {open && (
        <Animated.View
          entering={FadeInDown.duration(180).easing(Easing.out(Easing.cubic))}
          exiting={FadeOutUp.duration(120).easing(Easing.in(Easing.cubic))}
          style={styles.menuShadow}
        >
          <Squircle
            style={styles.menu}
            cornerRadius={18}
            fillColor={colors.surface}
            strokeColor={colors.secondary3}
            strokeWidth={1.5}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.menuContent}
            >
              <Pressable
                onPress={() => {
                  playSelection();
                  onSelect(null);
                  onOpenChange(false);
                }}
                style={[
                  styles.menuItem,
                  selectedPlayerId === null && styles.menuItemSelected,
                ]}
              >
                <PlayersIcon
                  width={20}
                  height={20}
                  color={colors.textPrimary}
                />
                <Text style={styles.menuItemLabel}>{allPlayersLabel}</Text>
              </Pressable>

              {players.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => {
                    playSelection();
                    onSelect(player.id);
                    onOpenChange(false);
                  }}
                  style={[
                    styles.menuItem,
                    player.id === selectedPlayerId && styles.menuItemSelected,
                  ]}
                >
                  <PlayerAvatarView avatar={player.avatar} size={28} />
                  <Text style={styles.menuItemLabel} numberOfLines={1}>
                    {player.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Squircle>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 16,
    left: 16,
    zIndex: 20,
  },
  button: {
    width: "100%",
    height: 48,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  buttonLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
  arrow: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuShadow: {
    marginTop: 6,
    borderRadius: 18,
    shadowColor: "#2A1849",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  menu: {
    width: "100%",
    maxHeight: 258,
  },
  menuContent: {
    paddingVertical: 6,
  },
  menuItem: {
    height: 42,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemSelected: {
    backgroundColor: colors.secondary3,
  },
  menuItemLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
});
