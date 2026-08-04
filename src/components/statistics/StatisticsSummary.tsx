import { StyleSheet, Text, View } from "react-native";

import { Squircle } from "@/components/Squircle";
import { colors } from "@/theme/colors";

type StatisticsSummaryProps = {
  popularPrefix: string;
  popularGameName: string | null;
  emptyLabel: string;
  gamesLabel: string;
  playersLabel: string;
};

export function StatisticsSummary({
  popularPrefix,
  popularGameName,
  emptyLabel,
  gamesLabel,
  playersLabel,
}: StatisticsSummaryProps) {
  return (
    <Squircle
      style={styles.container}
      cornerRadius={20}
      fillColor={colors.surface}
      strokeColor={colors.secondary3}
      strokeWidth={1.5}
    >
      <Text style={styles.popular} numberOfLines={1}>
        {popularGameName ? (
          <>
            {popularPrefix}
            <Text style={styles.popularGame}>{popularGameName}</Text>
          </>
        ) : (
          emptyLabel
        )}
      </Text>

      <View style={styles.divider} />

      <View style={styles.counters}>
        <Text style={styles.counter}>{gamesLabel}</Text>
        <View style={styles.dot} />
        <Text style={styles.counter}>{playersLabel}</Text>
      </View>
    </Squircle>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 75,
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
  },
  popular: {
    maxWidth: "92%",
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },
  popularGame: {
    color: colors.primary,
  },
  divider: {
    width: 152,
    height: 1,
    backgroundColor: colors.secondary4,
  },
  counters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  counter: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
});
