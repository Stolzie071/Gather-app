import type { ScreenTransitionConfig } from "react-native-screen-transitions";
import { Easing, interpolate } from "react-native-reanimated";

const openTransition = {
  duration: 360,
  easing: Easing.out(Easing.cubic),
};

const closeTransition = {
  duration: 320,
  easing: Easing.out(Easing.cubic),
};

export const iosPageTransition: ScreenTransitionConfig = {
  gestureEnabled: false,
  transitionSpec: {
    open: openTransition,
    close: closeTransition,
  },
  screenStyleInterpolator: ({ active, current, progress }) => {
    "worklet";

    const screenWidth = current.layouts.screen.width;

    return {
      content: {
        transform: [
          {
            translateX: interpolate(
              progress,
              [0, 1, 2],
              [screenWidth, 0, -screenWidth * 0.3],
              "clamp",
            ),
          },
        ],
      },
      backdrop: {
        backgroundColor: "#000000",
        opacity: interpolate(active.progress, [0, 1], [0, 0.08], "clamp"),
      },
    };
  },
};
