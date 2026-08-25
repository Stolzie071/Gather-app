import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ArrowIcon, PlayersIcon, TimeIcon } from "@assets/icons";

import { Squircle } from "@/components/Squircle";
import { colors } from "@/theme/colors";
import { useAppHaptics } from "@/haptics/useAppHaptics";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type GameCardProps = {
  title: string;
  players: string;
  duration: string;
  illustration: ReactNode;
  onPress?: () => void;
  comingSoonLabel?: string;
};

export function GameCard({
  title,
  players,
  duration,
  illustration,
  onPress,
  comingSoonLabel,
}: GameCardProps) {
  const { playPrimaryAction } = useAppHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        if (!onPress) {
          return;
        }

        playPrimaryAction();
        onPress();
      }}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      onPressIn={() => {
        if (!onPress) {
          return;
        }

        scale.value = withTiming(0.97, {
          duration: 75,
        });
      }}
      onPressOut={() => {
        if (!onPress) {
          return;
        }

        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
    >
      <Animated.View style={[styles.shadow, animatedStyle]}>
        <View
          style={[styles.cardVisual, !onPress && styles.cardVisualDisabled]}
        >
          <Squircle
            style={styles.card}
            cornerRadius={20}
            fillColor={colors.surface}
          >
            <View style={styles.illustration}>{illustration}</View>

            <View style={styles.information}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>

              <View style={styles.detailRow}>
                <PlayersIcon width={14} height={14} />

                <Text style={styles.detailText}>{players}</Text>
              </View>

              <View style={styles.detailRow}>
                <TimeIcon width={14} height={14} />

                <Text style={styles.detailText}>{duration}</Text>
              </View>
            </View>

            <ArrowIcon
              width={9}
              height={17}
              color={colors.textPrimary}
              style={styles.arrow}
            />
          </Squircle>
        </View>

        {comingSoonLabel ? (
          <View pointerEvents="none" style={styles.comingSoonOverlay}>
            <View pointerEvents="none" style={styles.comingSoonStamp}>
              <Text style={styles.comingSoonText}>{comingSoonLabel}</Text>
            </View>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },

  shadow: {
    width: "100%",
    height: 80,
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

  card: {
    width: "100%",
    height: 80,
    paddingHorizontal: 25,

    flexDirection: "row",
    alignItems: "center",
    gap: 25,

    overflow: "hidden",
  },

  illustration: {
    width: 96,
    height: 87,

    alignItems: "center",
    justifyContent: "center",
  },

  information: {
    width: 126,
    gap: 2,
  },

  title: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: colors.textPrimary,
  },

  detailRow: {
    height: 19,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailText: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textSecondary,
  },

  arrow: {
    position: "absolute",
    top: 31.5,
    right: 20,
  },

  cardVisual: {
    width: "100%",
    height: "100%",
  },

  cardVisualDisabled: {
    opacity: 0.38,
  },

  comingSoonOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    alignItems: "center",
    justifyContent: "center",
  },

  comingSoonStamp: {
    paddingVertical: 5,
    paddingHorizontal: 16,

    backgroundColor: "rgba(239, 233, 248, 0.3)",
    borderWidth: 2.5,
    borderColor: colors.primary,
    borderRadius: 7,

    transform: [{ rotate: "-12deg" }],
  },

  comingSoonText: {
    color: colors.primary,
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    lineHeight: 21,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
});
