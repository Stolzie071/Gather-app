import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { RulesDice } from "@assets/Decorate/GameScreen";
import { RuleIcon } from "@assets/icons";
import { Squircle } from "@/components/Squircle";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

export function GameRulesButton() {
  const { t } = useLocalization();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {}}
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
      accessibilityLabel={t("gameScreen.rules.read")}
      style={styles.pressable}
    >
      <Animated.View style={[styles.shadow, animatedStyle]}>
        <Squircle
          style={styles.card}
          cornerRadius={20}
          fillColor={colors.surface}
        >
          <View style={styles.content}>
            <RulesDice width={105} height={116} />

            <View style={styles.textContent}>
              <View style={styles.copy}>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t("gameScreen.rules.title")}
                </Text>
                <Text style={styles.description}>
                  {t("gameScreen.rules.description")}
                </Text>
              </View>

              <View style={styles.readButton}>
                <RuleIcon width={24} height={18} />
                <Text style={styles.readText}>
                  {t("gameScreen.rules.read")}
                </Text>
              </View>
            </View>
          </View>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: 370,
    height: 150,
  },

  shadow: {
    width: "100%",
    height: "100%",
    borderRadius: 20,

    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 15,
        spreadDistance: 0,
        color: "rgba(158, 124, 228, 0.4)",
      },
    ],
  },

  card: {
    width: "100%",
    height: "100%",
  },

  content: {
    position: "absolute",
    top: 16,
    left: 23,

    flexDirection: "row",
    alignItems: "center",
    gap: 27,
  },

  textContent: {
    width: 198,
    height: 116,
    justifyContent: "space-between",
  },

  copy: {
    gap: 4,
  },

  title: {
    width: "100%",
    color: "#000000",
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },

  description: {
    width: 148,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },

  readButton: {
    width: "100%",
    height: 39,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    gap: 15,

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },

  readText: {
    color: colors.primary,
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    lineHeight: 18,
  },
});
