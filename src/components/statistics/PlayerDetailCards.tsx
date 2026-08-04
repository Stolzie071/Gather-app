import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  PlayerStatsPercentIcon,
  StatsCupIcon,
} from "@assets/Decorate/StatsScreen";
import { ArrowIcon, TabDiceIcon, TimeIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import type {
  PlayerDetailStatistics,
} from "@/statistics/calculatePlayerDetailStatistics";
import { colors } from "@/theme/colors";

const TOP_GAME_COLORS = [colors.primary, "#FFB51F", "#8FEE46"] as const;
const OTHER_GAME_COLOR = "#DFDEE5";

function getDistributionColor(index: number, isOther: boolean) {
  return isOther
    ? OTHER_GAME_COLOR
    : (TOP_GAME_COLORS[index] ?? colors.primary);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedDonutSegmentProps = {
  chartSize: number;
  radius: number;
  strokeWidth: number;
  circumference: number;
  startLength: number;
  segmentLength: number;
  gapLength: number;
  color: string;
  progress: SharedValue<number>;
};

function AnimatedDonutSegment({
  chartSize,
  radius,
  strokeWidth,
  circumference,
  startLength,
  segmentLength,
  gapLength,
  color,
  progress,
}: AnimatedDonutSegmentProps) {
  const isFullCircle = segmentLength >= circumference - 0.01 && gapLength === 0;
  const circleAnimatedProps = useAnimatedProps(() => {
    const travelledLength = progress.value * circumference;
    const visibleLength = Math.min(
      segmentLength,
      Math.max(0, travelledLength - startLength),
    );

    return {
      strokeDasharray: `${visibleLength} ${circumference}`,
    };
  });

  const pathAnimatedProps = useAnimatedProps(() => {
    const innerRadius = radius - strokeWidth / 2;
    const outerRadius = radius + strokeWidth / 2;
    const center = chartSize / 2;
    const halfGap = gapLength / 2;
    const travelledLength = progress.value * circumference;
    const visibleEndLength = Math.min(
      startLength + segmentLength,
      travelledLength,
    );
    const visibleStartLength = startLength;

    if (visibleEndLength <= visibleStartLength + 0.01) {
      return { d: "" };
    }

    const startBoundary = -Math.PI / 2 + visibleStartLength / radius;
    const endBoundary = -Math.PI / 2 + visibleEndLength / radius;
    const outerGapInset = Math.asin(halfGap / outerRadius);
    const innerGapInset = Math.asin(halfGap / innerRadius);
    const outerStartAngle = startBoundary + outerGapInset;
    const outerEndAngle = endBoundary - outerGapInset;
    const innerStartAngle = startBoundary + innerGapInset;
    const innerEndAngle = endBoundary - innerGapInset;
    const innerAngleSpan = innerEndAngle - innerStartAngle;

    if (innerAngleSpan <= 0.001) {
      return { d: "" };
    }

    const cornerRadius = Math.min(
      4,
      strokeWidth / 2,
      (innerAngleSpan * innerRadius) / 2.2,
    );
    const outerInset = cornerRadius / outerRadius;
    const innerInset = cornerRadius / innerRadius;
    const largeArcFlag =
      outerEndAngle - outerStartAngle - outerInset * 2 > Math.PI ? 1 : 0;
    const point = (pointRadius: number, angle: number) => ({
      x: center + Math.cos(angle) * pointRadius,
      y: center + Math.sin(angle) * pointRadius,
    });
    const startFaceAngle = (pointRadius: number) =>
      startBoundary + Math.asin(halfGap / pointRadius);
    const endFaceAngle = (pointRadius: number) =>
      endBoundary - Math.asin(halfGap / pointRadius);

    const outerStart = point(outerRadius, outerStartAngle + outerInset);
    const outerEnd = point(outerRadius, outerEndAngle - outerInset);
    const outerEndCorner = point(outerRadius, outerEndAngle);
    const outerEndCutRadius = outerRadius - cornerRadius;
    const outerEndCut = point(
      outerEndCutRadius,
      endFaceAngle(outerEndCutRadius),
    );
    const innerEndCutRadius = innerRadius + cornerRadius;
    const innerEndCut = point(
      innerEndCutRadius,
      endFaceAngle(innerEndCutRadius),
    );
    const innerEndCorner = point(innerRadius, innerEndAngle);
    const innerEnd = point(innerRadius, innerEndAngle - innerInset);
    const innerStart = point(innerRadius, innerStartAngle + innerInset);
    const innerStartCorner = point(innerRadius, innerStartAngle);
    const innerStartCutRadius = innerRadius + cornerRadius;
    const innerStartCut = point(
      innerStartCutRadius,
      startFaceAngle(innerStartCutRadius),
    );
    const outerStartCutRadius = outerRadius - cornerRadius;
    const outerStartCut = point(
      outerStartCutRadius,
      startFaceAngle(outerStartCutRadius),
    );
    const outerStartCorner = point(outerRadius, outerStartAngle);

    return {
      d: [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        `Q ${outerEndCorner.x} ${outerEndCorner.y} ${outerEndCut.x} ${outerEndCut.y}`,
        `L ${innerEndCut.x} ${innerEndCut.y}`,
        `Q ${innerEndCorner.x} ${innerEndCorner.y} ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        `Q ${innerStartCorner.x} ${innerStartCorner.y} ${innerStartCut.x} ${innerStartCut.y}`,
        `L ${outerStartCut.x} ${outerStartCut.y}`,
        `Q ${outerStartCorner.x} ${outerStartCorner.y} ${outerStart.x} ${outerStart.y}`,
        "Z",
      ].join(" "),
    };
  });

  if (!isFullCircle) {
    return <AnimatedPath animatedProps={pathAnimatedProps} fill={color} />;
  }

  return (
    <AnimatedCircle
      animatedProps={circleAnimatedProps}
      cx={chartSize / 2}
      cy={chartSize / 2}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      strokeDashoffset={-startLength}
      rotation={-90}
      originX={chartSize / 2}
      originY={chartSize / 2}
    />
  );
}

type DistributionLabels = Readonly<Record<string, string>>;

type PlayerDistributionCardProps = {
  statistics: PlayerDetailStatistics;
  labels: DistributionLabels;
  gamesLabel: string;
  compact?: boolean;
};

export function PlayerDistributionCard({
  statistics,
  labels,
  gamesLabel,
  compact = false,
}: PlayerDistributionCardProps) {
  const chartSize = compact ? 124 : 141;
  const strokeWidth = compact ? 21 : 24;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const visibleSegments = statistics.distribution.filter(
    (item) => item.count > 0,
  );
  const gapLength = visibleSegments.length > 1 ? 6 : 0;
  let cumulativeLength = 0;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, statistics.gamesPlayed]);

  return (
    <Squircle
      style={[styles.distributionCard, compact && styles.distributionCardCompact]}
      cornerRadius={14}
      fillColor={colors.surface}
      strokeColor={colors.secondary4}
      strokeWidth={1.5}
    >
      <View style={{ width: chartSize, height: chartSize }}>
        <Svg width={chartSize} height={chartSize}>
          <Circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke={colors.surface}
            strokeWidth={strokeWidth}
          />

          {visibleSegments.map((segment, index) => {
            const segmentLength =
              (segment.count / statistics.gamesPlayed) * circumference;
            const startLength = cumulativeLength;
            cumulativeLength += segmentLength;

            return (
              <AnimatedDonutSegment
                key={segment.id}
                chartSize={chartSize}
                radius={radius}
                strokeWidth={strokeWidth}
                circumference={circumference}
                startLength={startLength}
                segmentLength={segmentLength}
                gapLength={gapLength}
                color={getDistributionColor(index, segment.isOther)}
                progress={progress}
              />
            );
          })}

        </Svg>

        <View pointerEvents="none" style={styles.donutCenter}>
          <Text style={styles.donutValue}>{statistics.gamesPlayed}</Text>
          <Text style={styles.donutLabel}>{gamesLabel}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {statistics.distribution.map((item, index) => (
          <View key={item.id} style={styles.legendRow}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: getDistributionColor(
                    index,
                    item.isOther,
                  ),
                },
              ]}
            />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {labels[item.id]}
            </Text>
            <Text style={styles.legendValue}>{item.count}</Text>
          </View>
        ))}
      </View>
    </Squircle>
  );
}

type OverviewLabels = {
  wins: string;
  winRate: string;
  gamesPlayed: string;
  lastGame: string;
  noGames: string;
  victory: string;
  defeat: string;
};

type PlayerOverviewCardProps = {
  statistics: PlayerDetailStatistics;
  labels: OverviewLabels;
  lastGameLabel: string;
};

type OverviewItemProps = {
  icon: ReactNode;
  children: ReactNode;
};

function OverviewItem({ icon, children }: OverviewItemProps) {
  return (
    <Squircle
      style={styles.overviewItem}
      cornerRadius={12}
      fillColor={colors.surface}
      strokeColor={colors.secondary4}
      strokeWidth={1}
    >
      <Squircle
        style={styles.overviewIcon}
        cornerRadius={10}
        fillColor={colors.secondary3}
      >
        {icon}
      </Squircle>

      <View style={styles.overviewText}>{children}</View>
    </Squircle>
  );
}

export function PlayerOverviewCard({
  statistics,
  labels,
  lastGameLabel,
}: PlayerOverviewCardProps) {
  const lastGameWon = statistics.lastGame?.winnerIds.includes(
    statistics.player.id,
  );

  return (
    <Squircle
      style={styles.overviewCard}
      cornerRadius={14}
      fillColor={colors.surface}
      strokeColor={colors.secondary4}
      strokeWidth={1.5}
    >
      <View style={styles.overviewRow}>
        <OverviewItem
          icon={<StatsCupIcon width={27} height={27} color={colors.secondary} />}
        >
          <Text style={styles.overviewLabel}>{labels.wins}</Text>
          <Text style={styles.overviewValue}>{statistics.wins}</Text>
        </OverviewItem>

        <OverviewItem
          icon={<PlayerStatsPercentIcon width={27} height={27} />}
        >
          <Text style={styles.overviewLabel}>{labels.winRate}</Text>
          <Text style={styles.overviewValue}>{statistics.winRate}%</Text>
        </OverviewItem>
      </View>

      <View style={styles.overviewRow}>
        <OverviewItem
          icon={
            <TabDiceIcon
              width={24}
              height={27}
              color={colors.secondary}
            />
          }
        >
          <Text style={styles.overviewLabel}>{labels.gamesPlayed}</Text>
          <Text style={styles.overviewValue}>{statistics.gamesPlayed}</Text>
        </OverviewItem>

        <OverviewItem
          icon={<TimeIcon width={27} height={27} color={colors.secondary} />}
        >
          <Text style={styles.overviewLabel}>{labels.lastGame}</Text>
          <Text
            style={styles.lastGameValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {lastGameLabel || labels.noGames}
          </Text>
          {statistics.lastGame && (
            <View
              style={[
                styles.resultBadge,
                lastGameWon ? styles.winBadge : styles.lossBadge,
              ]}
            >
              <Text
                style={[
                  styles.resultBadgeText,
                  lastGameWon ? styles.winBadgeText : styles.lossBadgeText,
                ]}
              >
                {lastGameWon ? labels.victory : labels.defeat}
              </Text>
            </View>
          )}
        </OverviewItem>
      </View>
    </Squircle>
  );
}

export type PlayerGameStatRow = {
  label: string;
  value: number;
};

const GAME_SECTION_HEADER_HEIGHT = 44;
const GAME_SECTION_DETAILS_OVERLAP = 22;
const GAME_SECTION_DETAILS_CONTENT_PADDING = 16;
const GAME_SECTION_TABLE_HEIGHT = 88;
const GAME_SECTION_DETAILS_HEIGHT =
  GAME_SECTION_DETAILS_OVERLAP +
  GAME_SECTION_DETAILS_CONTENT_PADDING * 2 +
  GAME_SECTION_TABLE_HEIGHT;

type PlayerGameStatisticsSectionProps = {
  title: string;
  expanded: boolean;
  rows: readonly PlayerGameStatRow[];
  onPress: () => void;
};

export function PlayerGameStatisticsSection({
  title,
  expanded,
  rows,
  onPress,
}: PlayerGameStatisticsSectionProps) {
  const { playSelection } = useAppHaptics();
  const pressScale = useSharedValue(1);
  const expansionProgress = useSharedValue(expanded ? 1 : 0);
  const [detailsMounted, setDetailsMounted] = useState(expanded);
  const detailsHeight = GAME_SECTION_DETAILS_HEIGHT;

  useEffect(() => {
    if (expanded) {
      setDetailsMounted(true);
      expansionProgress.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    expansionProgress.value = withTiming(0, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
    });

    if (!detailsMounted) {
      return;
    }

    const unmountTimer = setTimeout(() => {
      setDetailsMounted(false);
    }, 200);

    return () => clearTimeout(unmountTimer);
  }, [detailsMounted, expanded, expansionProgress]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${90 - 180 * expansionProgress.value}deg` },
    ],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const detailsStyle = useAnimatedStyle(() => ({
    height: detailsHeight * expansionProgress.value,
    marginTop:
      -GAME_SECTION_DETAILS_OVERLAP * expansionProgress.value,
    opacity: expansionProgress.value,
  }));

  return (
    <View style={styles.gameSectionContainer}>
      <Pressable
        onPress={() => {
          playSelection();
          onPress();
        }}
        onPressIn={() => {
          pressScale.value = withTiming(0.99, { duration: 60 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, {
            damping: 20,
            stiffness: 340,
          });
        }}
        style={styles.gameSectionPressable}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Animated.View style={[styles.gameSectionHeaderLayer, pressStyle]}>
          <Squircle
            style={styles.gameSectionHeader}
            cornerRadius={10}
            fillColor={colors.surface}
            strokeColor={colors.secondary4}
            strokeWidth={1.5}
          >
            <Text style={styles.gameSectionTitle}>{title}</Text>
            <Animated.View style={arrowStyle}>
              <ArrowIcon
                width={8}
                height={15}
                color={colors.textSecondary}
              />
            </Animated.View>
          </Squircle>
        </Animated.View>
      </Pressable>

      {detailsMounted && rows.length > 0 && (
        <Animated.View
          pointerEvents={expanded ? "auto" : "none"}
          style={[styles.gameSectionDetailsClip, detailsStyle]}
        >
          <Squircle
            style={[styles.gameSectionDetails, { height: detailsHeight }]}
            cornerRadius={10}
            fillColor={colors.surface}
            strokeColor={colors.secondary4}
            strokeWidth={1.5}
          >
            <View style={styles.gameTable}>
              {rows.map((row, index) => (
                <View
                  key={row.label}
                  style={[
                    styles.gameTableRow,
                    index > 0 && styles.gameTableDivider,
                  ]}
                >
                  <Text
                    style={styles.gameTableLabel}
                    numberOfLines={2}
                  >
                    {row.label}
                  </Text>
                  <Text style={styles.gameTableValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </Squircle>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  distributionCard: {
    minHeight: 170,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
  },
  distributionCardCompact: {
    paddingHorizontal: 16,
    gap: 18,
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  donutValue: {
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    fontSize: 24,
    lineHeight: 27,
  },
  donutLabel: {
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    lineHeight: 17,
  },
  legend: {
    flex: 1,
    minWidth: 0,
    gap: 13,
  },
  legendRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  legendValue: {
    width: 24,
    color: colors.secondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "right",
  },
  overviewCard: {
    padding: 8,
    gap: 8,
  },
  overviewRow: {
    flexDirection: "row",
    gap: 8,
  },
  overviewItem: {
    flex: 1,
    minWidth: 0,
    height: 92,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  overviewIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  overviewText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 6,
  },
  overviewLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  overviewValue: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    lineHeight: 22,
  },
  lastGameValue: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    lineHeight: 12,
  },
  resultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 5,
  },
  winBadge: {
    backgroundColor: "#E3F8E7",
  },
  lossBadge: {
    backgroundColor: "#FDE4E4",
  },
  resultBadgeText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 9,
    lineHeight: 12,
  },
  winBadgeText: {
    color: "#34AD4A",
  },
  lossBadgeText: {
    color: "#D85A5A",
  },
  gameSectionContainer: {
    width: "100%",
  },
  gameSectionPressable: {
    position: "relative",
    zIndex: 2,
  },
  gameSectionHeaderLayer: {
    zIndex: 2,
  },
  gameSectionHeader: {
    width: "100%",
    height: GAME_SECTION_HEADER_HEIGHT,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gameSectionTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    lineHeight: 20,
  },
  gameTable: {
    width: "100%",
    height: GAME_SECTION_TABLE_HEIGHT,
    overflow: "hidden",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary4,
    backgroundColor: colors.surface,
    flexDirection: "row",
  },
  gameSectionDetailsClip: {
    overflow: "hidden",
  },
  gameSectionDetails: {
    width: "100%",
    paddingTop:
      GAME_SECTION_DETAILS_OVERLAP +
      GAME_SECTION_DETAILS_CONTENT_PADDING,
    paddingBottom: GAME_SECTION_DETAILS_CONTENT_PADDING,
    paddingHorizontal: 16,
  },
  gameTableRow: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  gameTableDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.secondary4,
  },
  gameTableLabel: {
    minHeight: 32,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    textAlignVertical: "center",
  },
  gameTableValue: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
  },
});
