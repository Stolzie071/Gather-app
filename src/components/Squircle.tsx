import type { ReactNode } from "react";
import { SquircleView } from "react-native-figma-squircle";
import type { StyleProp, ViewStyle } from "react-native";

type SquircleProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  cornerRadius: number;
  fillColor: string;
};

export function Squircle({
  children,
  style,
  cornerRadius,
  fillColor,
}: SquircleProps) {
  return (
    <SquircleView
      style={style}
      squircleParams={{
        cornerRadius,
        cornerSmoothing: 0.6,
        fillColor,
      }}
    >
      {children}
    </SquircleView>
  );
}
