import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
} from "react-native-reanimated";

import {
  HistoryGameCard,
  type HistoryParticipant,
} from "@/components/statistics/HistoryGameCard";
import { PlayerHistoryFilter } from "@/components/statistics/PlayerHistoryFilter";
import type { GameHistoryEntry } from "@/history/types";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { Player } from "@/players/types";
import { colors } from "@/theme/colors";

type HistoryStatisticsViewProps = {
  history: readonly GameHistoryEntry[];
  players: readonly Player[];
  isLoading: boolean;
  listBottom: number;
  topFadeHeight: number;
  bottomFadeHeight: number;
};

const FILTER_HEIGHT = 48;
const FILTER_TO_LIST_GAP = 12;

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function HistoryStatisticsView({
  history,
  players,
  isLoading,
  listBottom,
  topFadeHeight,
  bottomFadeHeight,
}: HistoryStatisticsViewProps) {
  const { language, t } = useLocalization();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const playersWithHistory = useMemo(() => {
    const historyPlayerIds = new Set(
      history.flatMap((entry) => entry.playerIds),
    );

    return players
      .filter(({ id }) => historyPlayerIds.has(id))
      .slice()
      .sort((first, second) =>
        first.name.localeCompare(second.name, language),
      );
  }, [history, language, players]);

  const filteredHistory = useMemo(
    () =>
      history
        .filter(
          (entry) =>
            selectedPlayerId === null ||
            entry.playerIds.includes(selectedPlayerId),
        )
        .slice()
        .sort(
          (first, second) =>
            Date.parse(second.completedAt) - Date.parse(first.completedAt),
        ),
    [history, selectedPlayerId],
  );

  const formatDate = useCallback(
    (completedAt: string) => {
      const date = new Date(completedAt);
      const now = new Date();

      if (!Number.isFinite(date.getTime())) {
        return "";
      }

      if (isSameDay(date, now)) {
        return t("statistics.history.today");
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      if (isSameDay(date, yesterday)) {
        return t("statistics.history.yesterday");
      }

      const locale = language === "ru" ? "ru-RU" : "en-US";
      const dateWithoutYear = date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
      });

      if (date.getFullYear() === now.getFullYear()) {
        return dateWithoutYear;
      }

      return language === "ru"
        ? `${dateWithoutYear} ${date.getFullYear()}г.`
        : `${dateWithoutYear}, ${date.getFullYear()}`;
    },
    [language, t],
  );

  const formatTime = useCallback(
    (completedAt: string) => {
      const date = new Date(completedAt);

      if (!Number.isFinite(date.getTime())) {
        return "";
      }

      return date.toLocaleTimeString(language === "ru" ? "ru-RU" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [language],
  );

  const formatPlayersCount = useCallback(
    (count: number) =>
      t(`statistics.counts.players.${getCountForm(count, language)}`, {
        count,
      }),
    [language, t],
  );

  const resolveParticipant = useCallback(
    (entry: GameHistoryEntry, playerId: string): HistoryParticipant => {
      const player = playersById.get(playerId);

      return {
        id: playerId,
        name: player?.name ?? t("statistics.history.deletedPlayer"),
        avatar: player?.avatar ?? { type: "default" },
        isWinner: entry.winnerIds.includes(playerId),
      };
    },
    [playersById, t],
  );

  const renderHistoryEntry = useCallback(
    ({ item, index }: { item: GameHistoryEntry; index: number }) => {
      const spyIdSet = new Set(item.spyIds);
      const peacefulPlayers = item.playerIds
        .filter((playerId) => !spyIdSet.has(playerId))
        .map((playerId) => resolveParticipant(item, playerId));
      const spyPlayers = item.playerIds
        .filter((playerId) => spyIdSet.has(playerId))
        .map((playerId) => resolveParticipant(item, playerId));

      return (
        <Animated.View
          entering={FadeInLeft.duration(220)
            .delay(80 + Math.min(index, 7) * 45)
            .easing(Easing.out(Easing.cubic))}
        >
          <HistoryGameCard
            gameName={t(`gameList.games.${item.gameId}.title`)}
            dateLabel={formatDate(item.completedAt)}
            timeLabel={formatTime(item.completedAt)}
            playersLabel={formatPlayersCount(item.playerIds.length)}
            peacefulLabel={t("statistics.history.peaceful")}
            spiesLabel={t("statistics.history.spies")}
            winnerLabel={t("statistics.history.winner")}
            peacefulPlayers={peacefulPlayers}
            spyPlayers={spyPlayers}
            expanded={expandedGameId === item.id}
            onToggle={() =>
              setExpandedGameId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        </Animated.View>
      );
    },
    [
      expandedGameId,
      formatDate,
      formatPlayersCount,
      formatTime,
      resolveParticipant,
      t,
    ],
  );

  const listTop = FILTER_HEIGHT + FILTER_TO_LIST_GAP - topFadeHeight;

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : filteredHistory}
        keyExtractor={(entry) => entry.id}
        renderItem={renderHistoryEntry}
        extraData={expandedGameId}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        style={[
          styles.list,
          {
            top: listTop,
            bottom: listBottom,
          },
        ]}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: topFadeHeight,
            paddingBottom: bottomFadeHeight,
          },
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <Animated.View
              entering={FadeIn.duration(180)}
              style={styles.emptyState}
            >
              <Text style={styles.emptyText}>
                {selectedPlayerId
                  ? t("statistics.history.emptyFilter")
                  : t("statistics.history.empty")}
              </Text>
            </Animated.View>
          ) : null
        }
      />

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(248, 244, 253, 0)"]}
        style={[
          styles.topFade,
          {
            top: listTop,
            height: topFadeHeight,
          },
        ]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(248, 244, 253, 0)", colors.background]}
        style={[
          styles.bottomFade,
          {
            bottom: listBottom,
            height: bottomFadeHeight,
          },
        ]}
      />

      {isFilterOpen && (
        <Pressable
          onPress={() => setIsFilterOpen(false)}
          style={styles.filterBackdrop}
          accessibilityRole="button"
          accessibilityLabel={t("statistics.history.closeFilter")}
        />
      )}

      <PlayerHistoryFilter
        players={playersWithHistory}
        selectedPlayerId={selectedPlayerId}
        allPlayersLabel={t("statistics.history.allPlayers")}
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onSelect={(playerId) => {
          setSelectedPlayerId(playerId);
          setExpandedGameId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  list: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  listContent: {
    gap: 6,
  },
  topFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
  bottomFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
  emptyState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "rgba(111, 108, 164, 0.7)",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  filterBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
