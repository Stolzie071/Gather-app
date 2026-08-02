import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme/colors";

type SelectionIndicatorProps = {
  selected: boolean;
  size?: number;
  borderColor?: string;
  selectedBackgroundColor?: string;
  selectedCheckColor?: string;
};

export function SelectionIndicator({
  selected,
  size = 20,
  borderColor = colors.primary,
  selectedBackgroundColor = colors.primary,
  selectedCheckColor = colors.surface,
}: SelectionIndicatorProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor: selected
            ? selectedBackgroundColor
            : colors.surface,
        },
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
            stroke={selectedCheckColor}
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
    alignItems: "center",
    justifyContent: "center",
  },
});
