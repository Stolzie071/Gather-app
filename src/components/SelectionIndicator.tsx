import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme/colors";

type SelectionIndicatorProps = {
  selected: boolean;
  size?: number;
};

export function SelectionIndicator({
  selected,
  size = 20,
}: SelectionIndicatorProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.circleSelected,
      ]}
    >
      {selected && (
        <Svg
          width={size * 0.45}
          height={size * 0.36}
          viewBox="0 0 10 8"
          fill="none"
        >
          <Path
            d="M1 4L4 7L9 1"
            stroke={colors.surface}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1.5,
    borderColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,
  },

  circleSelected: {
    backgroundColor: colors.primary,
  },
});
