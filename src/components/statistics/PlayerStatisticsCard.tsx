import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { StatsCupIcon as RankCupIcon } from "@assets/Decorate/StatsScreen";
import { ArrowIcon } from "@assets/icons";
import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import type { PlayerStatistics } from "@/statistics/types";
import { colors } from "@/theme/colors";

type PlayerStatisticsCardProps = {
  statistics: PlayerStatistics;
  gamesLabel: string;
  winsLabel: string;
  winRateLabel: string;
  onPress: () => void;
};

const RANK_COLORS = ["#FED42D", "#B9BAC2", "#F19A6B"] as const;

export const PlayerStatisticsCard = memo(function PlayerStatisticsCard({
  statistics,
  gamesLabel,
  winsLabel,
  winRateLabel,
  onPress,
}: PlayerStatisticsCardProps) {
  const { playPrimaryAction } = useAppHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        playPrimaryAction();
        onPress();
      }}
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
      accessibilityRole="button"
      accessibilityLabel={statistics.player.name}
    >
      <Animated.View style={animatedStyle}>
        <Squircle
          style={styles.card}
          cornerRadius={20}
          fillColor={colors.surface}
          strokeColor={colors.secondary3}
          strokeWidth={1.5}
        >
          <View style={styles.avatarArea}>
            <PlayerAvatarView avatar={statistics.player.avatar} size={48} />

            {statistics.rank && (
              <Squircle
                style={styles.rankBadge}
                cornerRadius={5}
                fillColor={colors.surface}
                strokeColor={colors.secondary3}
                strokeWidth={1}
              >
                <RankCupIcon
                  width={14}
                  height={14}
                  color={RANK_COLORS[statistics.rank - 1]}
                />
              </Squircle>
            )}
          </View>

          <View style={styles.information}>
            <Text style={styles.name} numberOfLines={1}>
              {statistics.player.name}
            </Text>
            <Text
              style={styles.details}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {gamesLabel}  •  {winsLabel}  •  {winRateLabel}
            </Text>
          </View>

          <ArrowIcon
            width={7}
            height={14}
            color={colors.textSecondary}
          />
        </Squircle>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 74,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarArea: {
    position: "relative",
    width: 55,
    height: 54,
    justifyContent: "flex-end",
  },
  rankBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  information: {
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
    marginRight: 10,
    justifyContent: "center",
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },
  details: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
});
