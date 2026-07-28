import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { FavoritesIcon, TabDiceIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

const INDICATOR_WIDTH = 46;
const AnimatedTabDiceIcon = Animated.createAnimatedComponent(TabDiceIcon);
const AnimatedFavoritesIcon = Animated.createAnimatedComponent(FavoritesIcon);

export type GameListTab = "all" | "favorites";

type TabLayout = {
  x: number;
  width: number;
};

type GameListTabsProps = {
  activeTab: GameListTab;
  allLabel: string;
  favoritesLabel: string;
  bottomInset: number;
  swipeProgress: SharedValue<number>;
  onTabChange: (tab: GameListTab) => void;
};

export function GameListTabs({
  activeTab,
  allLabel,
  favoritesLabel,
  bottomInset,
  swipeProgress,
  onTabChange,
}: GameListTabsProps) {
  const allIsActive = activeTab === "all";
  const favoritesIsActive = activeTab === "favorites";
  const [tabLayouts, setTabLayouts] = useState<
    Partial<Record<GameListTab, TabLayout>>
  >({});

  const allIndicatorX = tabLayouts.all
    ? tabLayouts.all.x + tabLayouts.all.width / 2 - INDICATOR_WIDTH / 2
    : 0;
  const favoritesIndicatorX = tabLayouts.favorites
    ? tabLayouts.favorites.x +
      tabLayouts.favorites.width / 2 -
      INDICATOR_WIDTH / 2
    : 0;
  const indicatorReady = Boolean(tabLayouts.all && tabLayouts.favorites);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          allIndicatorX +
          (favoritesIndicatorX - allIndicatorX) * swipeProgress.value,
      },
    ],
  }), [allIndicatorX, favoritesIndicatorX]);

  const allLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.textPrimary, colors.textSecondary],
    ),
  }));

  const favoritesLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.textSecondary, colors.textPrimary],
    ),
  }));

  const allIconProps = useAnimatedProps(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.textPrimary, colors.textSecondary],
    ),
  }));

  const favoritesIconProps = useAnimatedProps(() => ({
    color: interpolateColor(
      swipeProgress.value,
      [0, 1],
      [colors.textSecondary, colors.textPrimary],
    ),
  }));

  const handleTabLayout =
    (tab: GameListTab) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;

      setTabLayouts((currentLayouts) => ({
        ...currentLayouts,
        [tab]: { x, width },
      }));
    };

  return (
    <View
      style={[
        styles.container,
        {
          height: 59 + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          indicatorStyle,
          !indicatorReady && styles.indicatorHidden,
        ]}
      />

      <Pressable
        style={styles.tab}
        onPress={() => onTabChange("all")}
        onLayout={handleTabLayout("all")}
        accessibilityRole="tab"
        accessibilityState={{ selected: allIsActive }}
      >
        <AnimatedTabDiceIcon
          width={16}
          height={19}
          animatedProps={allIconProps}
        />

        <Animated.Text style={[styles.label, allLabelStyle]}>
          {allLabel}
        </Animated.Text>
      </Pressable>

      <Pressable
        style={styles.tab}
        onPress={() => onTabChange("favorites")}
        onLayout={handleTabLayout("favorites")}
        accessibilityRole="tab"
        accessibilityState={{ selected: favoritesIsActive }}
      >
        <AnimatedFavoritesIcon
          width={14}
          height={19}
          animatedProps={favoritesIconProps}
        />

        <Animated.Text style={[styles.label, favoritesLabelStyle]}>
          {favoritesLabel}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 60,

    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    backgroundColor: colors.secondary3,

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  tab: {
    position: "relative",
    height: 59,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  indicator: {
    position: "absolute",
    top: 0,

    width: INDICATOR_WIDTH,
    height: 3,

    backgroundColor: colors.textPrimary,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  indicatorHidden: {
    opacity: 0,
  },

  label: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },

});
