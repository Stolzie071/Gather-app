import { memo, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { StatsCupIcon } from "@assets/Decorate/StatsScreen";
import { ArrowIcon } from "@assets/icons";
import { PlayerAvatarView } from "@/components/players/PlayerAvatarView";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import type { PlayerAvatar } from "@/players/types";
import { colors } from "@/theme/colors";

export type HistoryParticipant = {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  isWinner: boolean;
};

export type HistorySecretWordSummary = {
  label: string;
  categoryLabel: string;
  wordName: string;
};

type HistoryGameCardProps = {
  gameName: string;
  dateLabel: string;
  timeLabel: string;
  playersLabel: string;
  peacefulLabel: string;
  spiesLabel: string;
  winnerLabel: string;
  secretWord?: HistorySecretWordSummary;
  peacefulPlayers: readonly HistoryParticipant[];
  spyPlayers: readonly HistoryParticipant[];
  expanded: boolean;
  onToggle: () => void;
};

const HEADER_HEIGHT = 94;
const DETAILS_TOP_OVERLAP = 49;
const DETAILS_BASE_HEIGHT = 101;
const DETAILS_ROW_HEIGHT = 33;
const SECRET_WORD_HEIGHT = 64;
const SECRET_WORD_GAP = 12;

function ParticipantRow({
  participant,
  winnerLabel,
}: {
  participant: HistoryParticipant;
  winnerLabel: string;
}) {
  return (
    <View
      style={styles.participantRow}
      accessibilityLabel={
        participant.isWinner
          ? `${participant.name}, ${winnerLabel}`
          : participant.name
      }
    >
      <View style={styles.participantIdentity}>
        <PlayerAvatarView avatar={participant.avatar} size={25} />
        <Text
          style={[
            styles.participantName,
            participant.isWinner && styles.winnerName,
          ]}
          numberOfLines={1}
        >
          {participant.name}
        </Text>
      </View>

      {participant.isWinner && (
        <View style={styles.winnerBadge}>
          <StatsCupIcon width={12} height={12} color="#169C2C" />
        </View>
      )}
    </View>
  );
}

export const HistoryGameCard = memo(function HistoryGameCard({
  gameName,
  dateLabel,
  timeLabel,
  playersLabel,
  peacefulLabel,
  spiesLabel,
  winnerLabel,
  secretWord,
  peacefulPlayers,
  spyPlayers,
  expanded,
  onToggle,
}: HistoryGameCardProps) {
  const { playPrimaryAction } = useAppHaptics();
  const pressScale = useSharedValue(1);
  const expansionProgress = useSharedValue(expanded ? 1 : 0);
  const [detailsMounted, setDetailsMounted] = useState(expanded);
  const rowCount = Math.max(peacefulPlayers.length, spyPlayers.length, 1);
  const detailsHeight =
    DETAILS_BASE_HEIGHT +
    rowCount * DETAILS_ROW_HEIGHT +
    (secretWord ? SECRET_WORD_HEIGHT + SECRET_WORD_GAP : 0);

  useEffect(() => {
    if (expanded) {
      setDetailsMounted(true);
      expansionProgress.value = withTiming(1, { duration: 220 });
      return;
    }

    expansionProgress.value = withTiming(0, { duration: 220 });

    if (!detailsMounted) {
      return;
    }

    const unmountTimer = setTimeout(() => {
      setDetailsMounted(false);
    }, 230);

    return () => clearTimeout(unmountTimer);
  }, [detailsMounted, expanded, expansionProgress]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const detailsAnimatedStyle = useAnimatedStyle(() => ({
    height: detailsHeight * expansionProgress.value,
    marginTop: -DETAILS_TOP_OVERLAP * expansionProgress.value,
    opacity: expansionProgress.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${90 - 180 * expansionProgress.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.headerPressable}
        onPress={() => {
          playPrimaryAction();
          onToggle();
        }}
        onPressIn={() => {
          pressScale.value = withTiming(0.985, { duration: 70 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, {
            damping: 18,
            stiffness: 320,
            mass: 0.7,
          });
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={gameName}
      >
        <Animated.View style={[styles.headerLayer, headerAnimatedStyle]}>
          <Squircle
            style={styles.header}
            cornerRadius={20}
            fillColor={colors.surface}
            strokeColor={colors.secondary3}
            strokeWidth={1.5}
          >
            <View style={styles.headerInformation}>
              <Text style={styles.gameName}>{gameName}</Text>

              <View style={styles.dateRow}>
                <Text style={styles.metadata}>{dateLabel}</Text>
                <View style={styles.metadataDot} />
                <Text style={styles.metadata}>{timeLabel}</Text>
              </View>

              <Text style={styles.metadata}>{playersLabel}</Text>
            </View>

            <Animated.View style={[styles.arrow, arrowAnimatedStyle]}>
              <ArrowIcon
                width={7}
                height={14}
                color={colors.textSecondary}
              />
            </Animated.View>
          </Squircle>
        </Animated.View>
      </Pressable>

      {detailsMounted && (
        <Animated.View
          pointerEvents={expanded ? "auto" : "none"}
          style={[styles.detailsClip, detailsAnimatedStyle]}
        >
          <Squircle
            style={[styles.details, { height: detailsHeight }]}
            cornerRadius={20}
            fillColor={colors.secondary3}
            strokeColor={colors.secondary3}
            strokeWidth={1.5}
          >
            <View style={styles.detailsContent}>
              {secretWord && (
                <View style={styles.secretWordSummary}>
                  <View style={styles.secretWordText}>
                    <Text style={styles.secretWordLabel}>
                      {secretWord.label}
                    </Text>
                    <Text style={styles.secretWordName} numberOfLines={2}>
                      {secretWord.wordName}
                    </Text>
                  </View>

                  <View style={styles.secretWordCategory}>
                    <Text style={styles.secretWordCategoryLabel}>
                      {secretWord.categoryLabel}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.participantColumns}>
                <View style={styles.detailsColumn}>
                  <Text style={styles.columnTitle}>{peacefulLabel}</Text>
                  <View style={styles.participantsList}>
                    {peacefulPlayers.map((participant) => (
                      <ParticipantRow
                        key={participant.id}
                        participant={participant}
                        winnerLabel={winnerLabel}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsColumn}>
                  <Text style={styles.columnTitle}>{spiesLabel}</Text>
                  <View style={styles.participantsList}>
                    {spyPlayers.map((participant) => (
                      <ParticipantRow
                        key={participant.id}
                        participant={participant}
                        winnerLabel={winnerLabel}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </Squircle>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerLayer: {
    zIndex: 2,
  },
  headerPressable: {
    position: "relative",
    zIndex: 2,
  },
  header: {
    width: "100%",
    height: HEADER_HEIGHT,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInformation: {
    gap: 4,
  },
  gameName: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metadata: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  metadataDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  arrow: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsClip: {
    overflow: "hidden",
  },
  details: {
    width: "100%",
    paddingTop: 65,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  detailsContent: {
    flex: 1,
    gap: SECRET_WORD_GAP,
  },
  secretWordSummary: {
    height: SECRET_WORD_HEIGHT,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.secondary4,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background,
  },
  secretWordText: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  secretWordLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  secretWordName: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    lineHeight: 19,
  },
  secretWordCategory: {
    minHeight: 24,
    maxWidth: 112,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary4,
  },
  secretWordCategoryLabel: {
    color: colors.primary,
    fontFamily: "Nunito_700Bold",
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  participantColumns: {
    flexDirection: "row",
  },
  detailsColumn: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  columnTitle: {
    color: colors.textSecondary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    lineHeight: 16,
  },
  participantsList: {
    gap: 8,
  },
  participantRow: {
    height: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantName: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  winnerName: {
    color: "#169C2C",
  },
  winnerBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(125, 200, 137, 0.7)",
    backgroundColor: "rgba(236, 248, 238, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: 12,
    backgroundColor: colors.secondary4,
  },
});
