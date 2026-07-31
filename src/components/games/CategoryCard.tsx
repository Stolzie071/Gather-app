import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ArrowIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { colors } from "@/theme/colors";

type CategoryCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

export function CategoryCard({
  icon,
  title,
  description,
  onPress,
}: CategoryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 75 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={styles.pressable}
    >
      <Animated.View style={[styles.shadow, animatedStyle]}>
        <Squircle
          style={styles.card}
          cornerRadius={20}
          fillColor={colors.surface}
        >
          <Squircle
            style={styles.icon}
            cornerRadius={16}
            fillColor={colors.secondary3}
          >
            {icon}
          </Squircle>

          <View style={styles.information}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>

          <ArrowIcon
            width={9}
            height={17}
            color={colors.textPrimary}
            style={styles.arrow}
          />
        </Squircle>
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
    height: 96,
    paddingHorizontal: 22,

    flexDirection: "row",
    alignItems: "center",
    gap: 22,

    overflow: "hidden",
  },

  icon: {
    width: 64,
    height: 64,

    alignItems: "center",
    justifyContent: "center",
  },

  information: {
    flex: 1,
    paddingRight: 35,
    gap: 2,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },

  description: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 19,
  },

  arrow: {
    position: "absolute",
    top: 39.5,
    right: 22,
  },
});
