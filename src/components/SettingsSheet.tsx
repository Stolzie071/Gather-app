import { Pressable, StyleSheet, View, Dimensions } from "react-native";
import { colors } from "../theme/colors";
import { useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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
});
