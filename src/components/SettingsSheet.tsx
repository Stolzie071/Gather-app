import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { colors } from "../theme/colors";
import { useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import {
  DarkthemeIcon,
  SoundsIcon,
  MusicIcon,
  VibrationIcon,
  LanguageIcon,
  LockIcon,
  InfoIcon,
  SupportIcon,
  PrivacyIcon,
  DonationIcon,
  RateIcon,
} from "@assets/icons";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HIDDEN_POSITION = SCREEN_HEIGHT + 10;

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const translateY = useSharedValue(HIDDEN_POSITION);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const progress = 1 - translateY.value / HIDDEN_POSITION;

    return {
      opacity: progress * 0.55,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withTiming(HIDDEN_POSITION, {
          duration: 600,
        });

        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: 300,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0);
    } else {
      translateY.value = withTiming(HIDDEN_POSITION);
    }
  }, [visible, translateY]);

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, animatedStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Настройки</Text>

          <SettingsSection>
            <SettingsRow
              icon={<DarkthemeIcon width={28} height={28} />}
              title="Тёмная тема"
            />
          </SettingsSection>

          <SettingsSection title="Звук">
            <SettingsRow
              icon={<SoundsIcon width={28} height={28} />}
              title="Звуки"
              showDivider
            />
            <SettingsRow
              icon={<MusicIcon width={28} height={28} />}
              title="Музыка"
              showDivider
            />
            <SettingsRow
              icon={<VibrationIcon width={28} height={28} />}
              title="Тактильная отдача"
            />
          </SettingsSection>
          <SettingsSection title="Приложение">
            <SettingsRow
              icon={<LanguageIcon width={28} height={28} />}
              title="Язык"
              showDivider
            />
            <SettingsRow
              icon={<LockIcon width={28} height={28} />}
              title="Не выключать экран"
            />
          </SettingsSection>
          <SettingsSection title="Информация">
            <SettingsRow
              icon={<InfoIcon width={28} height={28} />}
              title="О Gather"
              showDivider
            />
            <SettingsRow
              icon={<SupportIcon width={28} height={28} />}
              title="Обратная связь"
              showDivider
            />
            <SettingsRow
              icon={<PrivacyIcon width={28} height={28} />}
              title="Политика конфиденциальности"
              showDivider
            />
            <SettingsRow
              icon={<RateIcon width={28} height={28} />}
              title="Оценить приложение"
              showDivider
            />
            <SettingsRow
              icon={<DonationIcon width={28} height={28} />}
              title="Поддержать разработчика"
            />
          </SettingsSection>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 101,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    zIndex: 0,
  },

  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,

    height: "87%",

    backgroundColor: colors.background,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
    elevation: 1,
  },
  handle: {
    width: 72,
    height: 5,

    borderRadius: 10,

    backgroundColor: colors.textSecondary,
    opacity: 0.4,

    alignSelf: "center",

    marginTop: 13,
  },

  dragArea: {
    height: 48,
    justifyContent: "flex-start",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_900Black",
    fontSize: 32,
    lineHeight: 42,
    textAlign: "center",
    marginBottom: 18,
  },
});
